/**
 * Parse a numeric amount from price label strings.
 * Handles "CZK 2,911.20", "From CZK 2,911.20", "2 500 CZK", "EUR 115", EU/US separators.
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
 * Normalize common currency symbols / aliases to ISO 4217.
 * @param {string} token
 * @returns {string | null}
 */
function normalizeCurrencyToken(token) {
  if (!token || typeof token !== 'string') return null
  const raw = token.trim()
  if (!raw) return null
  if (/^kč$/i.test(raw) || /^kc$/i.test(raw)) return 'CZK'
  if (raw === '€') return 'EUR'
  if (raw === '$') return 'USD'
  if (raw === '£') return 'GBP'
  if (raw === '¥') return 'JPY'
  const code = raw.toUpperCase()
  if (/^[A-Z]{3}$/.test(code)) return code
  return null
}

/**
 * Extract amount + source currency from a price label, number, or explicit parts.
 * Numbers without a currency code default to CZK (hardcoded catalogue canonical).
 *
 * @param {string | number | { amount?: number, currency?: string, hasFrom?: boolean } | null | undefined} priceInput
 * @param {{ defaultCurrency?: string }} [options]
 * @returns {{ amount: number, currency: string, hasFrom: boolean } | null}
 */
export function parsePrice(priceInput, { defaultCurrency = 'CZK' } = {}) {
  if (priceInput != null && typeof priceInput === 'object' && !Array.isArray(priceInput)) {
    const amount = Number(priceInput.amount)
    if (!Number.isFinite(amount)) return null
    const currency =
      normalizeCurrencyToken(priceInput.currency) ||
      normalizeCurrencyToken(defaultCurrency) ||
      'CZK'
    return {
      amount,
      currency,
      hasFrom: Boolean(priceInput.hasFrom),
    }
  }

  if (typeof priceInput === 'number' && Number.isFinite(priceInput)) {
    return {
      amount: priceInput,
      currency: normalizeCurrencyToken(defaultCurrency) || 'CZK',
      hasFrom: false,
    }
  }

  if (!priceInput || typeof priceInput !== 'string') return null
  const trimmed = priceInput.trim()
  if (!trimmed || trimmed === 'Price on request') return null
  if (/_{2,}/.test(trimmed)) return null

  const hasFrom = /^From\s+/i.test(trimmed)
  let withoutFrom = trimmed.replace(/^From\s+/i, '').trim()
  // "2 911,20 Kč" → treat Kč as CZK suffix
  withoutFrom = withoutFrom.replace(/\s*Kč\s*$/i, ' CZK').replace(/\s*Kc\s*$/i, ' CZK')

  const match =
    withoutFrom.match(/^([A-Za-z]{3}|€|\$|£|¥)\s*([\d\s.,]+)$/i) ||
    withoutFrom.match(/^([\d\s.,]+)\s*([A-Za-z]{3}|€|\$|£|¥)$/i)
  if (!match) return null

  const tokenA = match[1]
  const tokenB = match[2]
  const currencyFirst = normalizeCurrencyToken(tokenA)
  const currencySecond = normalizeCurrencyToken(tokenB)
  const currency = currencyFirst || currencySecond
  const amountRaw = currencyFirst ? tokenB : tokenA
  if (!currency) return null

  const amount = parseAmountNumber(amountRaw)
  if (amount == null) return null
  return { amount, currency, hasFrom }
}

/**
 * Extract CZK amount from a canonical price string.
 * Non-CZK labels return null (use parsePrice for multi-currency sources).
 * @param {string | number} priceString
 * @returns {{ amount: number, hasFrom: boolean } | null}
 */
export function parseCzkPrice(priceString) {
  const parsed = parsePrice(priceString, { defaultCurrency: 'CZK' })
  if (!parsed || parsed.currency !== 'CZK') return null
  return { amount: parsed.amount, hasFrom: parsed.hasFrom }
}

/** Alias: numeric CZK amount from product.price / priceFrom strings. */
export function parseCzkAmount(priceString) {
  const parsed = parseCzkPrice(priceString)
  return parsed ? parsed.amount : null
}

/**
 * Localized “Approx.” prefix for converted display prices.
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
  return convertPrice(czkAmount, 'CZK', currency, rates)
}

/**
 * Convert amount between currencies using rates keyed as units per 1 CZK.
 * Pivot: amount_czk = amount_from / rates[from]; amount_to = amount_czk * rates[to].
 *
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @param {Record<string, number> | null | undefined} rates
 * @returns {number | null}
 */
export function convertPrice(amount, fromCurrency, toCurrency, rates) {
  if (!(typeof amount === 'number' && Number.isFinite(amount))) return null
  const from = String(fromCurrency || '').toUpperCase()
  const to = String(toCurrency || '').toUpperCase()
  if (!from || !to) return null
  if (from === to) return amount

  if (!rates || typeof rates !== 'object') return null

  if (from === 'CZK') {
    if (typeof rates[to] !== 'number' || !(rates[to] > 0)) return null
    return amount * rates[to]
  }

  if (to === 'CZK') {
    if (typeof rates[from] !== 'number' || !(rates[from] > 0)) return null
    return amount / rates[from]
  }

  if (
    typeof rates[from] !== 'number' ||
    !(rates[from] > 0) ||
    typeof rates[to] !== 'number' ||
    !(rates[to] > 0)
  ) {
    return null
  }

  return (amount / rates[from]) * rates[to]
}

/**
 * Format a product price for display in the visitor currency.
 * Accepts CZK/EUR/USD/… labels, bare numbers (CZK), or explicit amount + sourceCurrency.
 * Does not mutate product data — display only.
 *
 * @param {string | number | { amount?: number, currency?: string, hasFrom?: boolean } | null | undefined} priceInput
 * @param {object} [options]
 * @param {string} [options.currency] — active display currency
 * @param {Record<string, number> | null} [options.rates]
 * @param {string} [options.locale]
 * @param {number | null} [options.amount] — raw numeric override (preferred over parsing)
 * @param {string | null} [options.sourceCurrency] — ISO source when using amount override
 * @param {boolean} [options.debug] — when true, include conversion fields in a DEV log
 * @returns {string}
 */
export function formatProductPrice(priceInput, options = {}) {
  const {
    currency,
    rates,
    locale,
    amount: amountOverride,
    sourceCurrency: sourceCurrencyOverride,
    debug = false,
  } = options

  if (priceInput == null && amountOverride == null) return ''
  if (typeof priceInput === 'string') {
    const trimmed = priceInput.trim()
    if (!trimmed) return ''
    if (trimmed === 'Price on request') return trimmed
  }

  const hasFromHint =
    typeof priceInput === 'string' && /^From\s+/i.test(priceInput.trim())

  let parsed = null
  if (amountOverride != null && Number.isFinite(Number(amountOverride))) {
    parsed = parsePrice({
      amount: Number(amountOverride),
      currency: sourceCurrencyOverride || 'CZK',
      hasFrom: hasFromHint,
    })
  } else {
    parsed = parsePrice(priceInput)
  }

  if (!parsed) {
    return typeof priceInput === 'string' ? priceInput.trim() : String(priceInput ?? '')
  }

  const target = (currency || 'CZK').toUpperCase()
  const source = parsed.currency
  const browserLocale =
    locale ||
    (typeof navigator !== 'undefined' ? navigator.language : undefined) ||
    'en'

  let displayAmount = parsed.amount
  let displayCurrency = source
  let converted = null

  if (target !== source) {
    converted = convertPrice(parsed.amount, source, target, rates)
    if (converted != null) {
      displayAmount = converted
      displayCurrency = target
    }
  } else {
    converted = parsed.amount
  }

  const zeroDecimal = displayCurrency === 'JPY'
  const formatted = new Intl.NumberFormat(browserLocale, {
    style: 'currency',
    currency: displayCurrency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: zeroDecimal ? 0 : 2,
    maximumFractionDigits: zeroDecimal ? 0 : 2,
  }).format(displayAmount)

  const didConvert = displayCurrency !== source
  const parts = []
  if (parsed.hasFrom) parts.push('From')
  if (didConvert) parts.push(approxPrefix(browserLocale).trimEnd())
  parts.push(formatted)

  const label = parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (debug && typeof console !== 'undefined' && console.debug) {
    console.debug('[currency:price]', {
      rawAmount: parsed.amount,
      sourceCurrency: source,
      activeCurrency: target,
      convertedAmount: converted,
      displayCurrency,
      label,
    })
  }

  return label
}

/** @deprecated Prefer formatProductPrice — same behaviour for price strings. */
export function formatPrice(priceString, options) {
  return formatProductPrice(priceString, options)
}

/**
 * Format a plain CZK amount (number) for display.
 */
export function formatCzkAmount(amount, options) {
  return formatProductPrice(Number(amount), options)
}
