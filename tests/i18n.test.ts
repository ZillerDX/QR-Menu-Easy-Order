import { describe, it, expect } from 'vitest';
import { translations, t } from '../src/utils/i18n';

describe('i18n Translation Dictionary', () => {
  it('should have matching keys in both TH and EN', () => {
    const thKeys = Object.keys(translations.th);
    const enKeys = Object.keys(translations.en);

    const missingInEn = thKeys.filter((k) => !enKeys.includes(k));
    const missingInTh = enKeys.filter((k) => !thKeys.includes(k));

    expect(missingInEn, `Missing in EN: ${missingInEn.join(', ')}`).toEqual([]);
    expect(missingInTh, `Missing in TH: ${missingInTh.join(', ')}`).toEqual([]);
  });

  it('should translate correctly using t() helper', () => {
    expect(t('trackerStep1', 'th')).toBe('รับออเดอร์แล้ว');
    expect(t('trackerStep1', 'en')).toBe('Order Received');
  });
});
