import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CURRENCIES,
  CURRENCY_CODES,
  STORAGE_KEY,
  isSupportedCurrency,
} from './currencies'
import { countryFromNavigatorLanguage } from './countryToCurrency'
import {
  convertPrice as convertPriceAmount,
  formatProductPrice as formatProductPriceLabel,
} from './formatPrice'
import {
  getShippingMessage,
  getShippingMessageDetail,
  isCzechiaCountry,
  localizeShippingNote,
} from './shippingMessages'
import {
  readStoredCurrency,
  resolveVisitorCurrency,
} from './resolveVisitorCurrency'
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

function browserLocales() {
  if (typeof navigator === 'undefined') return []
  return [navigator.language, ...(navigator.languages || [])].filter(Boolean)
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
 * Resolve visitor country (independent of selected currency / site language):
 * 1. DEV ?country= (localhost only)
 * 2. Cloudflare /api/visitor-region
 * 3. navigator.language country region hint
 * 4. null (unknown — currency falls back via locale / EUR)
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
 * Resolve visitor currency from storage or already-detected country / locales.
 * Country is always resolved separately — a DE visitor who picks CZK
 * (or CZ visitor who picks EUR) must not change shipping messaging.
 * Site language / route locale never participate.
 */
function resolveCurrency({ skipStorage = false, country, countrySource } = {}) {
  const storage =
    typeof localStorage !== 'undefined' ? localStorage : null
  const stored = skipStorage ? null : readStoredCurrency(storage)
  const detected = resolveVisitorCurrency({
    storedCurrency: stored,
    country,
    browserLocales: browserLocales(),
  })

  // Preserve richer country-detection labels for the selector / debug UI.
  if (detected.source === 'country') {
    if (
      countrySource === 'region' ||
      countrySource === 'dev-query' ||
      countrySource === 'language'
    ) {
      return { ...detected, source: countrySource }
    }
  }
  return detected
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
  storedCurrency,
}) {
  const rawEur = 115
  const sourceCurrency = 'EUR'
  const converted = convertPriceAmount(rawEur, sourceCurrency, currency, rates)
  const exampleCzk = formatProductPriceLabel('CZK 2,911.20', {
    currency,
    rates,
    locale,
  })
  const exampleEur = formatProductPriceLabel('EUR 115', {
    currency,
    rates,
    locale,
    amount: rawEur,
    sourceCurrency,
  })
  console.debug('[currency]', {
    storedCurrency,
    detectedCountry: visitorCountry,
    browserLocale: locale,
    activeCurrency: currency,
    source,
    countrySource,
    rawAmount: rawEur,
    sourceCurrency,
    convertedAmount: converted,
    isCzechia: isCzechiaCountry(visitorCountry),
    ratesLoaded: Boolean(rates),
    ratesSource,
    exampleCzk2911: exampleCzk,
    exampleEur115: exampleEur,
    localStorageKey: STORAGE_KEY,
    priceComponent: 'formatProductPrice',
  })
}

/** Temporary DEV-only on-page debug — stripped from production builds. */
function CurrencyDevDebug({
  country,
  browserLocale,
  storedCurrency,
  resolvedCurrency,
  source,
}) {
  if (!import.meta.env.DEV) return null
  return (
    <aside
      data-currency-debug="true"
      style={{
        position: 'fixed',
        left: 8,
        bottom: 8,
        zIndex: 99999,
        maxWidth: 300,
        padding: '8px 10px',
        borderRadius: 8,
        background: 'rgba(20, 17, 14, 0.92)',
        color: '#e7e5e4',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 11,
        lineHeight: 1.45,
        pointerEvents: 'none',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}
    >
      <div style={{ opacity: 0.65, marginBottom: 4 }}>currency debug (dev)</div>
      <div>storedCurrency: {storedCurrency ?? 'null'}</div>
      <div>detectedCountry: {country ?? 'null'}</div>
      <div>browserLocale: {browserLocale || 'n/a'}</div>
      <div>
        activeCurrency: {resolvedCurrency} ({source})
      </div>
      <div style={{ opacity: 0.55 }}>key: {STORAGE_KEY}</div>
    </aside>
  )
}

export function CurrencyProvider({ children }) {
  const storage = typeof window !== 'undefined' ? localStorage : null
  const storedInitial = typeof window !== 'undefined' ? readStoredCurrency(storage) : null
  const [currency, setCurrencyState] = useState(storedInitial || 'EUR')
  const [visitorCountry, setVisitorCountry] = useState(null)
  const [rates, setRates] = useState(null)
  const [ready, setReady] = useState(false)
  const [pricesReady, setPricesReady] = useState(false)
  const [source, setSource] = useState(storedInitial ? 'manual' : 'pending')
  const [debugSnapshot, setDebugSnapshot] = useState(() => ({
    storedCurrency: storedInitial,
    browserLocale:
      typeof navigator !== 'undefined' ? navigator.language || '' : '',
  }))
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
    const storageNow =
      typeof localStorage !== 'undefined' ? localStorage : null
    const storedNow = skipStorage ? null : readStoredCurrency(storageNow)
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
    // Detection finished (region timed out → locale/EUR). Show prices now;
    // formatProductPrice falls back to CZK if rates are still null.
    setPricesReady(true)
    setDebugSnapshot({
      storedCurrency: storedNow,
      browserLocale: locale,
    })

    if (import.meta.env.DEV) {
      logDevCurrencyDebug({
        currency: detected.currency,
        rates: ratesResult.rates,
        source: detected.source,
        ratesSource: ratesResult.ratesSource,
        locale,
        visitorCountry: countryResult.country,
        countrySource: countryResult.countrySource,
        storedCurrency: storedNow,
      })
    }

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
      setDebugSnapshot((prev) => ({ ...prev, storedCurrency: next }))

      if (import.meta.env.DEV) {
        logDevCurrencyDebug({
          currency: next,
          rates: ratesRef.current,
          source: 'manual',
          ratesSource: ratesSourceRef.current,
          locale,
          visitorCountry,
          countrySource: 'unchanged',
          storedCurrency: next,
        })
      }
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
    setDebugSnapshot((prev) => ({ ...prev, storedCurrency: null }))
    await applyDetection({ skipStorage: true })
  }, [applyDetection])

  const formatProductPrice = useCallback(
    (priceInput, extra = {}) =>
      formatProductPriceLabel(priceInput, {
        currency,
        rates,
        locale,
        ...extra,
      }),
    [currency, rates, locale],
  )

  const convertPrice = useCallback(
    (amount, fromCurrency, toCurrency = currency) =>
      convertPriceAmount(amount, fromCurrency, toCurrency, rates),
    [currency, rates],
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
      convertPrice,
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
      convertPrice,
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
    <CurrencyContext.Provider value={value}>
      {children}
      {import.meta.env.DEV ? (
        <CurrencyDevDebug
          country={visitorCountry}
          browserLocale={debugSnapshot.browserLocale}
          storedCurrency={debugSnapshot.storedCurrency}
          resolvedCurrency={currency}
          source={source}
        />
      ) : null}
    </CurrencyContext.Provider>
  )
}
