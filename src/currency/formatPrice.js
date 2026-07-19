/**
 * Parse a numeric amount from price label strings.
 * Handles "CZK 2,911.20", "From CZK 2,911.20", "2 500 CZK", EU/US separators.
 * @param {string} raw
 * @returns {number | null}
 */
export function parseAmountNumber(raw) {
  if (raw == null) return null
  let s = String(raw).trim().replace(/\s/g, '')
  if (!s) return null

  if (s.includes(',') && s.includes('.')) {
    if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
      s = s.replace(/,/g, '')
    } else {
      s = s.replace(/\./g, '').replace(',', '.')
    }
  } else if (s.includes(',')) {
    const parts = s.split(',')
    if (parts.length === 2 && parts[1].length <= 2) {
      s = `${parts[0]}.${parts[1]}`
    } else {
      s = s.replace(/,/g, '')
    }
  }

  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

/**
 * Extract CZK amount from a canonical price string.
 * @param {string} priceString
 * @returns {{ amount: number, hasFrom: boolean } | null}
 */
export function parseCzkPrice(priceString) {
  if (typeof priceString === 'number' && Number.isFinite(priceString)) {
    return { amount: priceString, hasFrom: false }
  }
  if (!priceString || typeof priceString !== 'string') return null
  const trimmed = priceString.trim()
  if (!trimmed || trimmed === 'Price on request') return null
  if (/_{2,}/.test(trimmed)) return null

  const hasFrom = /^From\s+/i.test(trimmed)
  const withoutFrom = trimmed.replace(/^From\s+/i, '').trim()

  const match =
    withoutFrom.match(/CZK\s*([\d\s.,]+)/i) ||
    withoutFrom.match(/([\d\s.,]+)\s*CZK/i)
  if (!match) return null

  const amount = parseAmountNumber(match[1])
  if (amount == null) return null
  return { amount, hasFrom }
}

/** Alias: numeric CZK amount from product.price / priceFrom strings. */
export function parseCzkAmount(priceString) {
  const parsed = parseCzkPrice(priceString)
  return parsed ? parsed.amount : null
}

/**
 * Localized “Approx.” prefix for non-CZK display prices.
 * @param {string} [locale]
 */
export function approxPrefix(locale) {
  const lang = (locale || (typeof navigator !== 'undefined' ? navigator.language : 'en'))
    .toLowerCase()
    .slice(0, 2)

  const map = {
    cs: 'Přibližně ',
    sk: 'Približne ',
    de: 'Ca. ',
    fr: 'Env. ',
    es: 'Aprox. ',
    it: 'Circa ',
    pl: 'Ok. ',
    nl: 'Ca. ',
    sv: 'Ca ',
    no: 'Ca. ',
    da: 'Ca. ',
    ja: '約 ',
  }
  return map[lang] || 'Approx. '
}

/**
 * Convert CZK amount using rates keyed as units-of-currency per 1 CZK.
 * @param {number} czkAmount
 * @param {string} currency
 * @param {Record<string, number> | null} rates
 */
export function convertFromCzk(czkAmount, currency, rates) {
  if (currency === 'CZK') return czkAmount
  if (!rates || typeof rates[currency] !== 'number' || !(rates[currency] > 0)) {
    return null
  }
  return czkAmount * rates[currency]
}

/**
 * Format a canonical CZK price (string or number) for display in the visitor currency.
 * Does not mutate product data — display only.
 *
 * @param {string | number} priceCzk — e.g. "CZK 2,911.20", "From CZK 2,911.20", or 2911.2
 * @param {object} options
 * @param {string} options.currency
 * @param {Record<string, number> | null} options.rates
 * @param {string} [options.locale]
 * @returns {string}
 */
export function formatProductPrice(priceCzk, { currency, rates, locale } = {}) {
  if (priceCzk == null) return ''
  if (typeof priceCzk === 'string') {
    const trimmed = priceCzk.trim()
    if (!trimmed) return ''
    if (trimmed === 'Price on request') return trimmed
  }

  const parsed = parseCzkPrice(priceCzk)
  if (!parsed) {
    return typeof priceCzk === 'string' ? priceCzk.trim() : String(priceCzk)
  }

  const target = currency || 'CZK'
  const browserLocale =
    locale ||
    (typeof navigator !== 'undefined' ? navigator.language : undefined) ||
    'en'

  let amount = parsed.amount
  let displayCurrency = 'CZK'

  if (target !== 'CZK') {
    const converted = convertFromCzk(parsed.amount, target, rates)
    if (converted == null) {
      displayCurrency = 'CZK'
      amount = parsed.amount
    } else {
      displayCurrency = target
      amount = converted
    }
  }

  const zeroDecimal = displayCurrency === 'JPY'
  const formatted = new Intl.NumberFormat(browserLocale, {
    style: 'currency',
    currency: displayCurrency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(amount)

  const parts = []
  if (parsed.hasFrom) parts.push('From')
  if (displayCurrency !== 'CZK') parts.push(approxPrefix(browserLocale).trimEnd())
  parts.push(formatted)

  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** @deprecated Prefer formatProductPrice — same behaviour for CZK strings. */
export function formatPrice(priceString, options) {
  return formatProductPrice(priceString, options)
}

/**
 * Format a plain CZK amount (number) for display.
 */
export function formatCzkAmount(amount, options) {
  return formatProductPrice(Number(amount), options)
}
