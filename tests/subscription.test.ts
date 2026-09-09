import { describe, it, expect, beforeEach } from 'vitest';
import { syncManager } from '../src/utils/storage';
import { StoreConfig, SubscriptionPlan } from '../src/types';

describe('Subscription & Anti-Abuse QR Anchoring System', () => {
  const TEST_SHOP = 'test-subscription-shop';

  beforeEach(() => {
    syncManager.resetAll(TEST_SHOP);
  });

  it('provisions a 14-day free trial by default for unconfigured stores', () => {
    const mockConfig: StoreConfig = {
      id: TEST_SHOP,
      name: 'Test Store',
      nameEn: 'Test Store EN',
      tagline: 'Fresh Coffee',
      taglineEn: 'Fresh Coffee',
      promptpayNumber: '0812345678',
      promptpayName: 'Owner',
      openTime: '08:00 - 18:00',
      tableCount: 10,
    };

    const status = syncManager.getSubscriptionStatus(mockConfig);
    expect(status.plan).toBe('free_trial');
    expect(status.isTrial).toBe(true);
    expect(status.isActive).toBe(true);
    expect(status.isExpired).toBe(false);
    expect(status.daysLeft).toBe(14);
  });

  it('correctly calculates remaining days from trialExpiresAt', () => {
    const fiveDaysMs = 5 * 24 * 60 * 60 * 1000;
    const futureExpiry = new Date(Date.now() + fiveDaysMs).toISOString();

    const mockConfig: StoreConfig = {
      id: TEST_SHOP,
      name: 'Test Store',
      nameEn: 'Test Store EN',
      tagline: 'Tagline',
      taglineEn: 'Tagline',
      promptpayNumber: '',
      promptpayName: '',
      openTime: '08:00 - 20:00',
      tableCount: 5,
      subscriptionPlan: 'free_trial',
      subscriptionStatus: 'trialing',
      trialExpiresAt: futureExpiry,
    };

    const status = syncManager.getSubscriptionStatus(mockConfig);
    expect(status.isTrial).toBe(true);
    expect(status.isActive).toBe(true);
    expect(status.isExpired).toBe(false);
    expect(status.daysLeft).toBe(5);
  });

  it('detects expired trial when trialExpiresAt is in the past', () => {
    const pastExpiry = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(); // 1 day ago

    const mockConfig: StoreConfig = {
      id: TEST_SHOP,
      name: 'Expired Cafe',
      nameEn: 'Expired Cafe',
      tagline: '',
      taglineEn: '',
      promptpayNumber: '',
      promptpayName: '',
      openTime: '',
      tableCount: 10,
      subscriptionPlan: 'free_trial',
      subscriptionStatus: 'trialing',
      trialExpiresAt: pastExpiry,
    };

    const status = syncManager.getSubscriptionStatus(mockConfig);
    expect(status.isExpired).toBe(true);
    expect(status.isActive).toBe(false);
    expect(status.daysLeft).toBe(0);
    expect(status.status).toBe('expired');
  });

  it('updates subscription upon Stripe payment for Monthly (+30d), 6-Months (+180d), Yearly (+365d)', () => {
    const plans: { plan: SubscriptionPlan; days: number }[] = [
      { plan: 'monthly', days: 30 },
      { plan: 'half_year', days: 180 },
      { plan: 'yearly', days: 365 },
    ];

    for (const p of plans) {
      const futureExpiry = new Date(Date.now() + p.days * 24 * 60 * 60 * 1000).toISOString();
      const updatedConfig = syncManager.updateSubscription(
        TEST_SHOP,
        p.plan,
        'active',
        futureExpiry,
        'cus_test123',
        'sub_test123'
      );

      expect(updatedConfig.subscriptionPlan).toBe(p.plan);
      expect(updatedConfig.subscriptionStatus).toBe('active');
      expect(updatedConfig.subscriptionExpiresAt).toBe(futureExpiry);
      expect(updatedConfig.stripeCustomerId).toBe('cus_test123');

      const status = syncManager.getSubscriptionStatus(updatedConfig);
      expect(status.isActive).toBe(true);
      expect(status.isExpired).toBe(false);
      expect(status.isTrial).toBe(false);
      expect(status.daysLeft).toBeGreaterThanOrEqual(p.days - 1);
    }
  });

  it('anchors printed table QRs to Store ID and tracks QR printing state', () => {
    expect(syncManager.hasPrintedQRs(TEST_SHOP)).toBe(false);

    syncManager.markQRsPrinted(TEST_SHOP);

    expect(syncManager.hasPrintedQRs(TEST_SHOP)).toBe(true);
    const store = syncManager.getStoreConfig(TEST_SHOP);
    expect(store.hasActiveQRsPrinted).toBe(true);
  });
});
