import { describe, it, expect } from 'vitest';
import { thaiBahtText, calculateVatBreakdown, formatTaxId } from '../src/utils/taxInvoice';

describe('Thai Tax Invoice & Baht Text Utilities', () => {
  it('converts numbers to standard Thai Baht text correctly', () => {
    expect(thaiBahtText(0)).toBe('ศูนย์บาทถ้วน');
    expect(thaiBahtText(100)).toBe('หนึ่งร้อยบาทถ้วน');
    expect(thaiBahtText(1000)).toBe('หนึ่งพันบาทถ้วน');
    expect(thaiBahtText(1250)).toBe('หนึ่งพันสองร้อยห้าสิบบาทถ้วน');
    expect(thaiBahtText(21)).toBe('ยี่สิบเอ็ดบาทถ้วน');
    expect(thaiBahtText(934.58)).toBe('เก้าร้อยสามสิบสี่บาทห้าสิบแปดสตางค์');
    expect(thaiBahtText(1000000)).toBe('หนึ่งล้านบาทถ้วน');
  });

  it('calculates 7% VAT and tax base correctly compliant with Thai Revenue Dept', () => {
    // 1,000 THB total VAT included
    const breakdown1 = calculateVatBreakdown(1000);
    expect(breakdown1.totalAmount).toBe(1000);
    expect(breakdown1.taxBase).toBe(934.58);
    expect(breakdown1.vatAmount).toBe(65.42);
    expect(breakdown1.taxBase + breakdown1.vatAmount).toBe(1000);
    expect(breakdown1.bahtText).toBe('หนึ่งพันบาทถ้วน');

    // 107 THB total => 100 tax base + 7 VAT
    const breakdown2 = calculateVatBreakdown(107);
    expect(breakdown2.taxBase).toBe(100);
    expect(breakdown2.vatAmount).toBe(7);
  });

  it('formats 13-digit Thai Tax ID with standard dashes', () => {
    expect(formatTaxId('0105566012345')).toBe('0-1055-66012-34-5');
    expect(formatTaxId('1234567890123')).toBe('1-2345-67890-12-3');
    expect(formatTaxId('')).toBe('-');
    expect(formatTaxId(undefined)).toBe('-');
  });
});
