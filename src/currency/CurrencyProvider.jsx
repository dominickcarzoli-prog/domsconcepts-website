import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CURRENCIES,
  CURRENCY_CODES,
  STORAGE_KEY,
  isSupportedCurrency,
} from './currencies'
import {
  countryFromNavigatorLanguage,
  countryToCurrency,
} from './countryToCurrency'
import { formatProductPrice as formatProductPriceLabel } from './formatPrice'
import {
  getShippingMessage,
  getShippingMessageDetail,
  isCzechiaCountry,
  localizeShippingNote,
} from './shippingMessages'
import { CurrencyContext } from './CurrencyContext'

const REGION_TIMEOUT_MS = 1500
const DEV_COUNTRY_OVERRIDE = new Set(['DE', 'US', 'GB', 'CZ'])

/**
 * Realistic approx rates as units of currency per 1 CZK — DEV UI only.
 * Never shipped as production rates.
 */
const DEV_FALLBACK_RATES = {
  CZK: 1,
  EUR: 0.0408,
  USD: 0.0431,
  GBP: 0.0339,
  CAD: 0.0595,
  AUD: 0.0667,
  NZD: 0.0725,
  CHF: 0.0385,
  PLN: 0.1754,
  SEK: 0.4255,
  NOK: 0.4545,
  DKK: 0.303,
  JPY: 6.45,
}

async function fetchJson(url) {
  const res = await fetch(url, { credentials: 'same-origin' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

function readStoredCurrency() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && isSupportedCurrency(stored)) {
      return stored.toUpperCase()
    }
  } catch {
    // ignore
  }
  return null
}

/** DEV-only: `?country=DE|US|GB|CZ` → currency. No-op in production builds. */
function readDevCountryOverride() {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  try {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('country')
    if (!raw) return null
    const cc = raw.trim().toUpperCase()
    return DEV_COUNTRY_OVERRIDE.has(cc) ? cc : null
  } catch {
    return null
  }
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

/**
 * Resolve visitor country (independent of selected currency):
 * 1. DEV ?country= (localhost only)
 * 2. Cloudflare /api/visitor-region
 * 3. navigator.language country hint
 * 4. null (treat as international — no free shipping)
 */
async function detectVisitorCountry() {
  const devCountry = readDevCountryOverride()
  if (devCountry) {
    return { country: devCountry, countrySource: 'dev-query' }
  }

  try {
    const data = await withTimeout(fetchJson('/api/visitor-region'), REGION_TIMEOUT_MS)
    if (data?.country && typeof data.country === 'string') {
      const cc = data.country.trim().toUpperCase()
      if (cc && cc !== 'XX' && cc !== 'T1') {
        return { country: cc, countrySource: 'region' }
      }
    }
  } catch {
    // Local Vite has no Pages Functions — fall through
  }

  const langCountry = countryFromNavigatorLanguage()
  if (langCountry) {
    return { country: langCountry, countrySource: 'language' }
  }

  return { country: null, countrySource: 'unknown' }
}

/**
 * Resolve visitor currency from storage or already-detected country.
 * Country is always resolved separately — a DE visitor who picks CZK
 * (or CZ visitor who picks EUR) must not change shipping messaging.
 */
function resolveCurrency({ skipStorage = false, country, countrySource } = {}) {
  if (!skipStorage) {
    const stored = readStoredCurrency()
    if (stored) {
      return { currency: stored, source: 'manual' }
    }
  }

  if (country) {
    return {
      currency: countryToCurrency(country),
      source: countrySource === 'unknown' ? 'default' : countrySource,
    }
  }

  return { currency: 'USD', source: 'default' }
}

/**
 * Rates are units of each currency per 1 CZK (CZK: 1).
 * DEV: when Functions unavailable, use approx fallback rates for UI testing.
 */
async function fetchRates() {
  try {
    const data = await fetchJson('/api/exchange-rates')
    if (data?.rates && typeof data.rates === 'object') {
      return { rates: data.rates, ratesSource: 'api' }
    }
  } catch {
    // fall through
  }

  if (import.meta.env.DEV) {
    return { rates: { ...DEV_FALLBACK_RATES }, ratesSource: 'dev-fallback' }
  }

  return { rates: null, ratesSource: null }
}

function logDevCurrencyDebug({
  currency,
  rates,
  source,
  ratesSource,
  locale,
  visitorCountry,
  countrySource,
}) {
  if (!import.meta.env.DEV) return
  const example = formatProductPriceLabel('CZK 2,911.20', {
    currency,
    rates,
    locale,
  })
  console.debug('[currency]', {
    currency,
    source,
    visitorCountry,
    countrySource,
    isCzechia: isCzechiaCountry(visitorCountry),
    ratesLoaded: Boolean(rates),
    ratesSource,
    exampleCzk2911: example,
    priceComponent: 'formatProductPrice',
  })
}

export function CurrencyProvider({ children }) {
  const storedInitial = typeof window !== 'undefined' ? readStoredCurrency() : null
  const [currency, setCurrencyState] = useState(storedInitial || 'USD')
  const [visitorCountry, setVisitorCountry] = useState(null)
  const [rates, setRates] = useState(null)
  const [ready, setReady] = useState(false)
  const [pricesReady, setPricesReady] = useState(false)
  const [source, setSource] = useState(storedInitial ? 'manual' : 'pending')
  const ratesRef = useRef(null)
  const ratesSourceRef = useRef(null)
  const aliveRef = useRef(true)

  const locale =
    typeof navigator !== 'undefined' ? navigator.language : 'en'

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
    }
  }, [])

  const applyDetection = useCallback(async ({ skipStorage = false } = {}) => {
    const [countryResult, ratesResult] = await Promise.all([
      detectVisitorCountry(),
      fetchRates(),
    ])
    const detected = resolveCurrency({
      skipStorage,
      country: countryResult.country,
      countrySource: countryResult.countrySource,
    })

    if (!aliveRef.current) return { ...detected, ...countryResult }

    ratesRef.current = ratesResult.rates
    ratesSourceRef.current = ratesResult.ratesSource
    setVisitorCountry(countryResult.country)
    setCurrencyState(detected.currency)
    setSource(detected.source)
    setRates(ratesResult.rates)
    setReady(true)
    // Detection finished (region timed out → language/USD). Show prices now;
    // formatProductPrice falls back to CZK if rates are still null.
    setPricesReady(true)

    logDevCurrencyDebug({
      currency: detected.currency,
      rates: ratesResult.rates,
      source: detected.source,
      ratesSource: ratesResult.ratesSource,
      locale,
      visitorCountry: countryResult.country,
      countrySource: countryResult.countrySource,
    })

    return { ...detected, ...countryResult }
  }, [locale])

  useEffect(() => {
    applyDetection({ skipStorage: false })
  }, [applyDetection])

  const setCurrency = useCallback(
    (code) => {
      if (!isSupportedCurrency(code)) return
      const next = code.toUpperCase()
      try {
        localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // ignore
      }
      setCurrencyState(next)
      setSource('manual')
      setPricesReady(true)

      logDevCurrencyDebug({
        currency: next,
        rates: ratesRef.current,
        source: 'manual',
        ratesSource: ratesSourceRef.current,
        locale,
        visitorCountry,
        countrySource: 'unchanged',
      })
    },
    [locale, visitorCountry],
  )

  const useAutomaticCurrency = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    setSource('pending')
    setPricesReady(false)
    await applyDetection({ skipStorage: true })
  }, [applyDetection])

  const formatProductPrice = useCallback(
    (priceCzk) =>
      formatProductPriceLabel(priceCzk, {
        currency,
        rates,
        locale,
      }),
    [currency, rates, locale],
  )

  const isCzechia = isCzechiaCountry(visitorCountry)
  const shippingMessage = getShippingMessage(visitorCountry)
  const shippingMessageDetail = getShippingMessageDetail(visitorCountry)

  const value = useMemo(
    () => ({
      currency,
      setCurrency,
      useAutomaticCurrency,
      formatProductPrice,
      formatPrice: formatProductPrice,
      rates,
      ready,
      pricesReady,
      source,
      currencies: CURRENCIES,
      currencyCodes: CURRENCY_CODES,
      visitorCountry,
      isCzechia,
      shippingMessage,
      shippingMessageDetail,
      localizeShippingNote: (note) => localizeShippingNote(note, visitorCountry),
    }),
    [
      currency,
      setCurrency,
      useAutomaticCurrency,
      formatProductPrice,
      rates,
      ready,
      pricesReady,
      source,
      visitorCountry,
      isCzechia,
      shippingMessage,
      shippingMessageDetail,
    ],
  )

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  )
}
