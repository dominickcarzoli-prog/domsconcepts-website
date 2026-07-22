import { isSupportedCurrency, STORAGE_KEY } from './currencies.js'
import { countryToCurrency } from './countryToCurrency.js'

/**
 * Primary language → currency when the browser locale has no region subtag.
 * Uses navigator languages only — never the site UI locale / route prefix.
 */
const LANGUAGE_CURRENCY = {
  cs: 'CZK',
  de: 'EUR',
}

/**
 * Read and validate stored currency. Clears stale/invalid values safely.
 * @param {Pick<Storage, 'getItem' | 'removeItem'> | null | undefined} storage
 * @returns {string | null}
 */
export function readStoredCurrency(storage) {
  if (!storage || typeof storage.getItem !== 'function') return null
  try {
    const stored = storage.getItem(STORAGE_KEY)
    if (stored == null || stored === '') return null
    if (isSupportedCurrency(stored)) {
      return stored.toUpperCase()
    }
    if (typeof storage.removeItem === 'function') {
      storage.removeItem(STORAGE_KEY)
    }
  } catch {
    // ignore quota / private mode
  }
  return null
}

/**
 * Currency hint from browser locale tags (navigator.language / languages).
 * Region subtags win (cs-CZ → CZK, de-AT → EUR, en-US → USD).
 * Language-only tags: cs → CZK, de → EUR.
 * Does not accept site locale or route locale.
 *
 * @param {readonly string[] | null | undefined} locales
 * @returns {string | null} ISO 4217 code or null
 */
export function currencyFromBrowserLocales(locales) {
  const tags = (locales || []).filter(Boolean).map((tag) => String(tag).trim())
  if (!tags.length) return null

  for (const tag of tags) {
    const region = tag.match(/[-_]([A-Za-z]{2})$/)
    if (region) {
      return countryToCurrency(region[1].toUpperCase())
    }
  }

  for (const tag of tags) {
    const primary = tag.toLowerCase().split(/[-_]/)[0]
    if (primary && LANGUAGE_CURRENCY[primary]) {
      return LANGUAGE_CURRENCY[primary]
    }
  }

  return null
}

/**
 * Resolve display currency. Priority:
 * 1. explicit user-selected currency (localStorage)
 * 2. Cloudflare / detected country
 * 3. browser locale fallback
 * 4. EUR when country is unknown
 *
 * Intentionally ignores site language and route locale — pass neither.
 *
 * @param {{
 *   storedCurrency?: string | null,
 *   country?: string | null,
 *   browserLocales?: readonly string[] | null,
 *   siteLocale?: string | null,
 *   routeLocale?: string | null,
 * }} [input]
 * @returns {{ currency: string, source: 'manual' | 'country' | 'locale' | 'default' }}
 */
export function resolveVisitorCurrency({
  storedCurrency = null,
  country = null,
  browserLocales = null,
  // Accepted only so callers/tests can prove UI locale is ignored.
  siteLocale: _siteLocale = null,
  routeLocale: _routeLocale = null,
} = {}) {
  void _siteLocale
  void _routeLocale

  if (storedCurrency && isSupportedCurrency(storedCurrency)) {
    return { currency: storedCurrency.toUpperCase(), source: 'manual' }
  }

  if (country && typeof country === 'string') {
    const cc = country.trim().toUpperCase()
    if (cc && cc !== 'XX' && cc !== 'T1') {
      return { currency: countryToCurrency(cc), source: 'country' }
    }
  }

  const fromLocale = currencyFromBrowserLocales(browserLocales)
  if (fromLocale) {
    return { currency: fromLocale, source: 'locale' }
  }

  return { currency: 'EUR', source: 'default' }
}
