/**
 * ISO 3166-1 alpha-2 country → display currency.
 * Eurozone and common non-euro mappings; unknown → EUR.
 */
const EUROZONE = new Set([
  'AD', // Andorra
  'AT', // Austria
  'BE', // Belgium
  'CY', // Cyprus
  'DE', // Germany
  'EE', // Estonia
  'ES', // Spain
  'FI', // Finland
  'FR', // France
  'GR', // Greece
  'IE', // Ireland
  'IT', // Italy
  'LT', // Lithuania
  'LU', // Luxembourg
  'LV', // Latvia
  'MC', // Monaco
  'ME', // Montenegro (euro user)
  'MT', // Malta
  'NL', // Netherlands
  'PT', // Portugal
  'SI', // Slovenia
  'SK', // Slovakia
  'SM', // San Marino
  'VA', // Vatican
  'XK', // Kosovo (euro user)
])

const COUNTRY_CURRENCY = {
  CZ: 'CZK',
  US: 'USD',
  GB: 'GBP', // GBP is a supported display currency
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  LI: 'CHF',
  PL: 'PLN',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  JP: 'JPY',
}

/**
 * @param {string | null | undefined} countryCode
 * @returns {string} ISO 4217 currency code
 */
export function countryToCurrency(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') return 'EUR'
  const cc = countryCode.trim().toUpperCase()
  if (cc === 'XX' || cc === 'T1') return 'EUR' // Cloudflare unknown / Tor
  if (COUNTRY_CURRENCY[cc]) return COUNTRY_CURRENCY[cc]
  if (EUROZONE.has(cc)) return 'EUR'
  return 'EUR'
}

/**
 * Best-effort country hint from navigator.language / languages (e.g. en-US → US).
 * @returns {string | null}
 */
export function countryFromNavigatorLanguage() {
  if (typeof navigator === 'undefined') return null
  const tags = [navigator.language, ...(navigator.languages || [])].filter(Boolean)
  for (const tag of tags) {
    const match = String(tag).match(/[-_]([A-Za-z]{2})$/)
    if (match) return match[1].toUpperCase()
  }
  return null
}
