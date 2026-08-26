/**
 * PromptPay EMVCo QR Generator with CRC16-CCITT checksum
 */
function crc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    let x = ((crc >> 8) ^ data.charCodeAt(i)) & 0xff;
    x ^= x >> 4;
    crc = ((crc << 8) ^ (x << 12) ^ (x << 5) ^ x) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function formatTag(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export function generatePromptPayPayload(target: string, amount?: number): string {
  // Format mobile number or National ID
  const cleanTarget = target.replace(/[^0-9]/g, '');
  let subTag = '';
  
  if (cleanTarget.length === 10 && cleanTarget.startsWith('0')) {
    // Mobile number: convert 0812345678 -> 0066812345678
    const formattedMobile = '0066' + cleanTarget.substring(1);
    subTag = formatTag('01', formattedMobile);
  } else if (cleanTarget.length === 13) {
    // National ID
    subTag = formatTag('02', cleanTarget);
  } else {
    // Fallback: use mobile format
    const formattedMobile = '0066' + cleanTarget;
    subTag = formatTag('01', formattedMobile);
  }

  const aid = formatTag('00', 'A000000677010111');
  const merchantInfo = formatTag('29', aid + subTag);

  const payloadFormat = formatTag('00', '01');
  const pointOfInitiation = formatTag('01', amount ? '12' : '11');
  const countryCode = formatTag('58', 'TH');
  const currencyCode = formatTag('53', '764'); // THB
  
  let raw = payloadFormat + pointOfInitiation + merchantInfo + countryCode + currencyCode;

  if (amount && amount > 0) {
    const formattedAmount = amount.toFixed(2);
    raw += formatTag('54', formattedAmount);
  }

  raw += '6304';
  const checksum = crc16(raw);
  return raw + checksum;
}
