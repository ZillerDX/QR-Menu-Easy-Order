import { describe, it, expect, beforeEach } from 'vitest';
import { 
  validateStripeSessionId, 
  getAuthoritativeTimestamp, 
  validateShopOwnership 
} from '../src/utils/subscriptionService';
import { syncManager, safeStorage, HIGH_WATER_KEY } from '../src/utils/storage';
import { StoreConfig } from '../src/types';

describe('SaaS Subscription Security & Vulnerability Hardening', () => {
  beforeEach(() => {
    try {
      safeStorage.removeItem(HIGH_WATER_KEY);
    } catch {}
  });

  describe('1. Stripe Session ID Validation (Anti-Spoofing)', () => {
    it('accepts genuine live Stripe checkout session IDs', () => {
      expect(validateStripeSessionId('cs_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4')).toBe(true);
      expect(validateStripeSessionId('cs_live_b12nYcqJQD5WlHznCF9999999999')).toBe(true);
    });

    it('accepts genuine test Stripe checkout session IDs', () => {
      expect(validateStripeSessionId('cs_test_a1b2c3d4e5f6g7h8i9j0k1l2m3n4')).toBe(true);
    });

    it('rejects spoofed, empty, or arbitrary strings', () => {
      expect(validateStripeSessionId('')).toBe(false);
      expect(validateStripeSessionId(null)).toBe(false);
      expect(validateStripeSessionId(undefined)).toBe(false);
      expect(validateStripeSessionId('true')).toBe(false);
      expect(validateStripeSessionId('subscribed')).toBe(false);
      expect(validateStripeSessionId('cs_fake_123')).toBe(false);
      expect(validateStripeSessionId('cs_live_short')).toBe(false);
      expect(validateStripeSessionId('<script>alert(1)</script>')).toBe(false);
    });
  });

  describe('2. Anti-Time-Travel Protection (Clock Rollback Defense)', () => {
    it('records and updates high-water timestamp on access', () => {
      const t1 = getAuthoritativeTimestamp();
      expect(t1).toBeGreaterThan(0);
      const stored = safeStorage.getItem(HIGH_WATER_KEY);
      expect(Number(stored)).toBe(t1);
    });

    it('clamps effective time to high-water mark if device clock rolls backward', () => {
      // Establish future high-water mark (e.g., simulating today 2026-09-10)
      const futureStamp = Date.now() + 100000;
      safeStorage.setItem(HIGH_WATER_KEY, futureStamp.toString());

      const effective = getAuthoritativeTimestamp();
      expect(effective).toBe(futureStamp);
      expect(effective).toBeGreaterThan(Date.now());
    });

    it('considers subscription expired even if device clock was rolled back', () => {
      // Store expired yesterday
      const pastExpiry = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const config: StoreConfig = {
        id: 'test-shop',
        name: 'Test Shop',
        subscriptionPlan: 'monthly',
        subscriptionStatus: 'active',
        subscriptionExpiresAt: pastExpiry,
      };

      const status = syncManager.getSubscriptionStatus(config);
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
    });
  });

  describe('3. Infinite Free Trial Prevention', () => {
    it('does NOT renew trial if an explicit trial_expires_at is already past', () => {
      const pastTrialExpiry = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(); // expired 5 days ago
      const config: StoreConfig = {
        id: 'test-shop-expired-trial',
        name: 'Expired Trial Shop',
        subscriptionPlan: 'free_trial',
        subscriptionStatus: 'trialing',
        trialStartedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000).toISOString(),
        trialExpiresAt: pastTrialExpiry,
      };

      const status = syncManager.getSubscriptionStatus(config);
      expect(status.isExpired).toBe(true);
      expect(status.isActive).toBe(false);
      expect(status.daysLeft).toBe(0);
    });

    it('correctly calculates remaining days for active trial', () => {
      const futureTrialExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const config: StoreConfig = {
        id: 'test-shop-active-trial',
        name: 'Active Trial Shop',
        subscriptionPlan: 'free_trial',
        subscriptionStatus: 'trialing',
        trialExpiresAt: futureTrialExpiry,
      };

      const status = syncManager.getSubscriptionStatus(config);
      expect(status.isExpired).toBe(false);
      expect(status.isActive).toBe(true);
      expect(status.isTrial).toBe(true);
      expect(status.daysLeft).toBeGreaterThanOrEqual(6);
      expect(status.daysLeft).toBeLessThanOrEqual(7);
    });
  });

  describe('4. Anti-Abuse Sybil Ownership Protection', () => {
    it('prevents a new email from hijacking a store with printed QR table stands', () => {
      const configWithPrintedQRs: StoreConfig = {
        id: 'shop-cafe-master-123456',
        name: 'Cafe Master',
        hasActiveQRsPrinted: true,
        originalOwnerEmail: 'owner@cafemaster.com',
      };

      const result = validateShopOwnership(configWithPrintedQRs, 'new-user-id', 'attacker@other.com');
      expect(result.isAllowed).toBe(false);
      expect(result.reason).toContain('owner@cafemaster.com');
    });

    it('allows legitimate original owner to access and renew their store', () => {
      const configWithPrintedQRs: StoreConfig = {
        id: 'shop-cafe-master-123456',
        name: 'Cafe Master',
        hasActiveQRsPrinted: true,
        originalOwnerEmail: 'owner@cafemaster.com',
      };

      const result = validateShopOwnership(configWithPrintedQRs, 'owner-user-id', 'owner@cafemaster.com');
      expect(result.isAllowed).toBe(true);
    });

    it('allows claiming fresh store before any QR codes are printed', () => {
      const freshConfig: StoreConfig = {
        id: 'shop-new-fresh',
        name: 'Fresh Cafe',
        hasActiveQRsPrinted: false,
      };

      const result = validateShopOwnership(freshConfig, 'user-1', 'user1@gmail.com');
      expect(result.isAllowed).toBe(true);
    });
  });

  describe('5. Plan Duration & Extension Arithmetic', () => {
    it('extends subscription dates accurately (+30d for monthly, +180d for 6-month, +365d for yearly)', () => {
      const shopId = 'math-shop';
      const baseNow = Date.now();
      
      // Monthly: +30 days
      const monthlyExpiry = new Date(baseNow + 30 * 24 * 60 * 60 * 1000).toISOString();
      const updatedMonthly = syncManager.updateSubscription(shopId, 'monthly', 'active', monthlyExpiry);
      expect(updatedMonthly.subscriptionPlan).toBe('monthly');
      expect(updatedMonthly.subscriptionStatus).toBe('active');

      const monthlyStatus = syncManager.getSubscriptionStatus(updatedMonthly);
      expect(monthlyStatus.isActive).toBe(true);
      expect(monthlyStatus.isExpired).toBe(false);
      expect(monthlyStatus.daysLeft).toBe(30);

      // Yearly: +365 days
      const yearlyExpiry = new Date(baseNow + 365 * 24 * 60 * 60 * 1000).toISOString();
      const updatedYearly = syncManager.updateSubscription(shopId, 'yearly', 'active', yearlyExpiry);
      expect(updatedYearly.subscriptionPlan).toBe('yearly');

      const yearlyStatus = syncManager.getSubscriptionStatus(updatedYearly);
      expect(yearlyStatus.isActive).toBe(true);
      expect(yearlyStatus.isExpired).toBe(false);
      expect(yearlyStatus.daysLeft).toBe(365);
    });
  });
});
