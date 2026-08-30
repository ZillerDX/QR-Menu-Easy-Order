/**
 * Thai Tax Invoice Utilities & Helpers
 * Compliant with Thailand Revenue Department (ประมวลรัษฎากร มาตรา 86/4 & 86/6)
 */

/**
 * Converts a numeric amount into standard Thai Baht text (จำนวนเงินตัวอักษร)
 * e.g., 1000 => "หนึ่งพันบาทถ้วน"
 * e.g., 934.58 => "เก้าร้อยสามสิบสี่บาทห้าสิบแปดสตางค์"
 */
export function thaiBahtText(amount: number | string | undefined | null): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(num) || num === null || num === undefined) {
    return 'ศูนย์บาทถ้วน';
  }

  if (num === 0) {
    return 'ศูนย์บาทถ้วน';
  }

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  // Split into integer part and satang part (2 decimals)
  const fixed = absNum.toFixed(2);
  const [bahtPart, satangPart] = fixed.split('.');

  function convertChunk(numStr: string): string {
    let result = '';
    const len = numStr.length;

    for (let i = 0; i < len; i++) {
      const digit = parseInt(numStr[i], 10);
      const pos = len - i - 1;

      if (digit !== 0) {
        if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (pos === 0 && digit === 1 && len > 1 && numStr[len - 2] !== '0') {
          result += 'เอ็ด';
        } else {
          result += digits[digit] + positions[pos];
        }
      }
    }
    return result;
  }

  function convertInteger(numStr: string): string {
    if (numStr === '0' || !numStr) return '';
    let result = '';
    let remaining = numStr;

    // Handle groups of 6 digits (ล้าน)
    let chunks: string[] = [];
    while (remaining.length > 6) {
      chunks.unshift(remaining.slice(-6));
      remaining = remaining.slice(0, -6);
    }
    if (remaining.length > 0) {
      chunks.unshift(remaining);
    }

    chunks.forEach((chunk, index) => {
      const chunkText = convertChunk(chunk);
      const millionCount = chunks.length - index - 1;
      result += chunkText + (chunkText && millionCount > 0 ? 'ล้าน'.repeat(millionCount) : '');
    });

    return result;
  }

  const bahtText = convertInteger(bahtPart);
  const satangNum = parseInt(satangPart, 10);

  let result = (isNegative ? 'ลบ' : '') + (bahtText ? `${bahtText}บาท` : 'ศูนย์บาท');

  if (satangNum === 0) {
    result += 'ถ้วน';
  } else {
    const satangText = convertChunk(satangPart);
    result += `${satangText}สตางค์`;
  }

  return result;
}

/**
 * Calculates pre-VAT tax base and 7% VAT amount from total VAT-inclusive price
 */
export interface VatBreakdown {
  totalAmount: number;
  taxBase: number;
  vatAmount: number;
  vatRate: number;
  formattedTotal: string;
  formattedTaxBase: string;
  formattedVat: string;
  bahtText: string;
}

export function calculateVatBreakdown(totalAmount: number, vatRate: number = 0.07): VatBreakdown {
  const total = isNaN(totalAmount) || totalAmount < 0 ? 0 : totalAmount;
  
  // Thailand Revenue Dept formula: TaxBase = Total * 100 / 107
  const taxBase = Math.round((total * 100 / (100 + (vatRate * 100))) * 100) / 100;
  const vatAmount = Math.round((total - taxBase) * 100) / 100;

  return {
    totalAmount: total,
    taxBase,
    vatAmount,
    vatRate,
    formattedTotal: total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formattedTaxBase: taxBase.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formattedVat: vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    bahtText: thaiBahtText(total),
  };
}

/**
 * Formats a 13-digit Thai Tax ID with dashes for enhanced readability
 * e.g., 0105566012345 => 0-1055-66012-34-5
 */
export function formatTaxId(taxId?: string | null): string {
  if (!taxId) return '-';
  const clean = taxId.replace(/[^0-9]/g, '');
  if (clean.length === 13) {
    return `${clean[0]}-${clean.slice(1, 5)}-${clean.slice(5, 10)}-${clean.slice(10, 12)}-${clean[12]}`;
  }
  return taxId;
}
