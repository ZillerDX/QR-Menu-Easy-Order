import { supabase } from './supabaseClient';
import { syncManager, safeStorage, getAuthoritativeTimestamp } from './storage';
import { StoreConfig, SubscriptionPlan, SubscriptionStatus } from '../types';

export { getAuthoritativeTimestamp };

export interface VerificationResult {
  success: boolean;
  error?: string;
  message?: string;
  plan?: SubscriptionPlan;
  status?: SubscriptionStatus;
  expiresAt?: string;
}

/**
 * Validates Stripe Checkout Session ID format.
 * Genuine Stripe Checkout session IDs start with `cs_live_` (production) or `cs_test_` (testing)
 * followed by a long alphanumeric string.
 */
export function validateStripeSessionId(sessionId?: string | null): boolean {
  if (!sessionId || typeof sessionId !== 'string') return false;
  const trimmed = sessionId.trim();
  // Must match cs_live_ or cs_test_ followed by at least 15 alphanumeric/underscore characters
  return /^cs_(live|test)_[a-zA-Z0-9_]{15,}$/.test(trimmed);
}

/**
 * Verifies a Stripe Checkout Session with Supabase and activates the license idempotently.
 * Enforces:
 * 1. Format validation (rejects arbitrary strings like ?session_id=fake)
 * 2. Database anti-replay protection (prevents using the same session_id twice across any store)
 * 3. Atomic PostgreSQL transaction via activate_verified_subscription RPC
 * 4. Synchronization to local storage and Supabase store_config
 */
export async function verifyAndActivateStripeSession(params: {
  sessionId: string;
  shopId: string;
  planParam?: string | null;
}): Promise<VerificationResult> {
  const { sessionId, shopId, planParam } = params;

  // 1. Format Validation
  if (!validateStripeSessionId(sessionId)) {
    return {
      success: false,
      error: 'INVALID_SESSION_FORMAT',
      message: 'รหัสอ้างอิงการชำระเงินไม่ถูกต้อง หรือเป็นรหัสที่ถูกจำลองขึ้น (Invalid Stripe Session ID)',
    };
  }

  if (!shopId) {
    return {
      success: false,
      error: 'MISSING_SHOP_ID',
      message: 'ไม่พบรหัสร้านค้าสำหรับการเปิดใช้งาน (Missing Shop ID)',
    };
  }

  // Determine plan and duration
  const validPlan: SubscriptionPlan =
    planParam === 'yearly' || planParam === 'half_year' || planParam === 'monthly'
      ? planParam
      : 'monthly';

  const durationDays = validPlan === 'yearly' ? 365 : validPlan === 'half_year' ? 180 : 30;
  const amountTotal = validPlan === 'yearly' ? 3349 : validPlan === 'half_year' ? 1889 : 349;

  try {
    // 2. Call the transactional RPC in Supabase
    const { data, error } = await supabase.rpc('activate_verified_subscription', {
      p_shop_id: shopId,
      p_plan: validPlan,
      p_duration_days: durationDays,
      p_session_id: sessionId,
      p_amount_total: amountTotal,
      p_currency: 'thb',
    });

    if (error) {
      console.error('Supabase activate_verified_subscription error:', error);
      return {
        success: false,
        error: error.message,
        message: 'ไม่สามารถเปิดใช้งานแพ็กเกจบนระบบคลาวด์ได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
      };
    }

    if (!data?.success) {
      if (data?.error === 'SESSION_ALREADY_REDEEMED') {
        return {
          success: false,
          error: 'SESSION_ALREADY_REDEEMED',
          message: 'รหัสการชำระเงินนี้ถูกใช้งานและเปิดสิทธิ์ไปแล้ว ไม่สามารถใช้ซ้ำได้ (Session already redeemed)',
        };
      }

      return {
        success: false,
        error: data?.error || 'ACTIVATION_FAILED',
        message: data?.message || 'การเปิดใช้งานสิทธิ์ไม่สำเร็จ',
      };
    }

    // 3. Update local storeConfig cache
    const expiresAt = data.expires_at || new Date(Date.now() + durationDays * 86400000).toISOString();
    syncManager.updateSubscription(shopId, validPlan, 'active', expiresAt);

    return {
      success: true,
      plan: validPlan,
      status: 'active',
      expiresAt,
      message: '🎉 ยืนยันการชำระเงินและเปิดใช้งานแพ็กเกจเรียบร้อยแล้ว!',
    };
  } catch (err: any) {
    console.error('Unexpected error in verifyAndActivateStripeSession:', err);
    return {
      success: false,
      error: 'NETWORK_OR_SERVER_ERROR',
      message: err?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อเพื่อตรวจสอบการชำระเงิน',
    };
  }
}

/**
 * Checks if a store with printed QR codes can be claimed by a new user.
 * Anti-Abuse Sybil Guard: Prevents registering new accounts to reset trial on an already established shop.
 */
export function validateShopOwnership(
  config: StoreConfig,
  _currentUserId?: string,
  currentUserEmail?: string
): { isAllowed: boolean; reason?: string } {
  // If store has printed QRs and already has an original owner email recorded
  if (config.hasActiveQRsPrinted && config.originalOwnerEmail) {
    if (currentUserEmail && config.originalOwnerEmail.toLowerCase() !== currentUserEmail.toLowerCase()) {
      return {
        isAllowed: false,
        reason: `ร้านค้านี้ (${config.name}) มีการพิมพ์ป้าย QR Code ตั้งโต๊ะแล้วและผูกกับบัญชี ${config.originalOwnerEmail} เพื่อความปลอดภัย กรุณาเข้าสู่ระบบด้วยอีเมลเดิมเพื่อต่ออายุ`,
      };
    }
  }

  return { isAllowed: true };
}
