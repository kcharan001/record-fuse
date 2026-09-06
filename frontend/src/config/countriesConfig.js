/**
 * Country-Aware National ID Configuration Object for RecordFuse UI & Data Models.
 * Allows adding new countries cleanly through configuration without hardcoding UI logic.
 */

export const COUNTRIES_CONFIG = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    idLabel: 'Aadhaar Number',
    placeholder: 'XXXX-XXXX-1234',
    minLen: 4,
    maxLen: 16,
    formatHint: '12-digit numeric format or last 4 digits',
    regex: /^[0-9\s\-]{4,16}$/
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    idLabel: 'SSN',
    placeholder: 'XXX-XX-1234',
    minLen: 4,
    maxLen: 11,
    formatHint: '9-digit numeric format (XXX-XX-1234) or last 4',
    regex: /^[0-9\s\-]{4,11}$/
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    idLabel: 'National Insurance Number',
    placeholder: 'QQ 12 34 56 C',
    minLen: 4,
    maxLen: 13,
    formatHint: '2 letters, 6 numbers, 1 letter or last 4',
    regex: /^[A-Za-z0-9\s]{4,13}$/
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    idLabel: 'Social Insurance Number',
    placeholder: 'XXX-XXX-1234',
    minLen: 4,
    maxLen: 11,
    formatHint: '9-digit numeric format (XXX-XXX-XXX) or last 4',
    regex: /^[0-9\s\-]{4,11}$/
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    idLabel: 'Tax File Number',
    placeholder: 'XXX XXX 1234',
    minLen: 4,
    maxLen: 11,
    formatHint: '9-digit numeric format or last 4',
    regex: /^[0-9\s\-]{4,11}$/
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    idLabel: 'Steuer-ID',
    placeholder: '12 345 678 901',
    minLen: 4,
    maxLen: 14,
    formatHint: '11-digit numeric format or last 4',
    regex: /^[0-9\s\-]{4,14}$/
  },
  FR: {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    idLabel: 'National Identification Number',
    placeholder: '1 23 45 67 890 123',
    minLen: 4,
    maxLen: 18,
    formatHint: '13-15 digit format or last 4',
    regex: /^[0-9\s\-]{4,18}$/
  },
  JP: {
    code: 'JP',
    name: 'Japan',
    flag: '🇯🇵',
    idLabel: 'My Number',
    placeholder: 'XXXX-XXXX-1234',
    minLen: 4,
    maxLen: 14,
    formatHint: '12-digit numeric format or last 4',
    regex: /^[0-9\s\-]{4,14}$/
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    idLabel: 'NRIC / FIN',
    placeholder: 'S1234567A',
    minLen: 4,
    maxLen: 10,
    formatHint: 'Letter, 7 digits, letter or last 4',
    regex: /^[A-Za-z0-9\s]{4,10}$/
  },
  AE: {
    code: 'AE',
    name: 'UAE',
    flag: '🇦🇪',
    idLabel: 'Emirates ID',
    placeholder: '784-XXXX-XXXXXXX-X',
    minLen: 4,
    maxLen: 18,
    formatHint: '15-digit format (784-XXXX-...) or last 4',
    regex: /^[0-9\s\-]{4,18}$/
  }
};

export const COUNTRIES_LIST = Object.values(COUNTRIES_CONFIG);

export function getCountryConfig(code = 'IN') {
  return COUNTRIES_CONFIG[code?.toUpperCase()] || COUNTRIES_CONFIG.IN;
}

export function validateNationalIdFormat(countryCode, inputVal) {
  if (!inputVal || inputVal.trim() === '') return { isValid: false, message: 'Empty input' };
  const config = getCountryConfig(countryCode);
  const cleanVal = inputVal.trim();
  if (cleanVal.length < config.minLen) {
    return { isValid: false, message: `Minimum ${config.minLen} characters required` };
  }
  const isMatch = config.regex.test(cleanVal);
  return {
    isValid: isMatch,
    message: isMatch ? 'Format valid' : `Invalid format for ${config.name}`
  };
}

export function extractLast4Digits(inputVal) {
  if (!inputVal) return '0000';
  const digits = inputVal.replace(/[^A-Za-z0-9]/g, '');
  if (digits.length >= 4) {
    return digits.slice(-4).toUpperCase();
  }
  return digits.padStart(4, '0').toUpperCase();
}

export function formatMaskedNationalId(countryCode, last4) {
  const config = getCountryConfig(countryCode);
  const safeLast4 = last4 || '0000';
  return `****${safeLast4}`;
}
