/** Supported display currencies. CZK is canonical / stored. */
export const CURRENCIES = [
  { code: 'CZK', symbol: 'Kč', label: 'Czech Koruna' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
  { code: 'NZD', symbol: 'NZ$', label: 'New Zealand Dollar' },
  { code: 'CHF', symbol: 'CHF', label: 'Swiss Franc' },
  { code: 'PLN', symbol: 'zł', label: 'Polish Złoty' },
  { code: 'SEK', symbol: 'kr', label: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', label: 'Norwegian Krone' },
  { code: 'DKK', symbol: 'kr', label: 'Danish Krone' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
]

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code)

export const CURRENCY_BY_CODE = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
)

export const STORAGE_KEY = 'domsconcepts_currency'

export function isSupportedCurrency(code) {
  return typeof code === 'string' && CURRENCY_BY_CODE[code.toUpperCase()] != null
}

export function getCurrencyMeta(code) {
  return CURRENCY_BY_CODE[code] || CURRENCY_BY_CODE.USD
}
