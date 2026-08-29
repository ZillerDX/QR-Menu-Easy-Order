import { describe, it, expect } from 'vitest';
import { generatePromptPayPayload } from '../src/utils/promptpay';

describe('PromptPay EMVCo Payload Generator', () => {
  it('should generate valid payload for 10-digit mobile number with dashes', () => {
    const payload = generatePromptPayPayload('081-234-5678', 240);
    expect(payload).toContain('0066812345678');
    expect(payload).toContain('240.00');
    expect(payload.length).toBeGreaterThan(50);
  });

  it('should generate valid payload for 13-digit national ID', () => {
    const payload = generatePromptPayPayload('1234567890123', 150.5);
    expect(payload).toContain('1234567890123');
    expect(payload).toContain('150.50');
  });

  it('should generate payload without amount for open QR', () => {
    const payload = generatePromptPayPayload('0812345678');
    expect(payload).toContain('0066812345678');
    expect(payload).not.toContain('5406');
  });
});
