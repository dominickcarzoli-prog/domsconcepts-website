import { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  DEFAULT_LOCALE,
  detectBrowserLocale,
  localizePath,
  parseLocaleFromPathname,
  readStoredLocale,
  switchLocalePath,
  writeStoredLocale,
} from './localePaths.js'
import { getMessages, translate } from './translate.js'

/** @typedef {import('./localePaths.js').Locale} Locale */

const LocaleContext = createContext({
  locale: DEFAULT_LOCALE,
  hasLocalePrefix: false,
  t: (key, vars) => translate(key, DEFAULT_LOCALE, vars),
  messages: getMessages(DEFAULT_LOCALE),
  localize: (path) => localizePath(path, DEFAULT_LOCALE),
  setLocale: /** @type {(locale: Locale) => void} */ (() => {}),
})

/**
 * @param {{ locale: Locale, hasLocalePrefix?: boolean, children: import('react').ReactNode }} props
 */
export function LocaleProvider({ locale, hasLocalePrefix = false, children }) {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (locale === 'de') document.documentElement.lang = 'de'
    else if (locale === 'cs') document.documentElement.lang = 'cs'
    else document.documentElement.lang = 'en'
  }, [locale])

  // Explicit /de or /cs routes always win — sync preference to the route locale.
  useEffect(() => {
    if (!hasLocalePrefix) return
    writeStoredLocale(typeof localStorage !== 'undefined' ? localStorage : null, locale)
  }, [hasLocalePrefix, locale])

  const t = useCallback((key, vars) => translate(key, locale, vars), [locale])
  const messages = useMemo(() => getMessages(locale), [locale])

  const localize = useCallback(
    (path) => localizePath(path, locale, { forceEnPrefix: hasLocalePrefix && locale === 'en' }),
    [hasLocalePrefix, locale],
  )

  const setLocale = useCallback(
    (nextLocale) => {
      writeStoredLocale(typeof localStorage !== 'undefined' ? localStorage : null, nextLocale)
      const full = `${location.pathname}${location.search}${location.hash}`
      navigate(switchLocalePath(full, nextLocale))
    },
    [location.hash, location.pathname, location.search, navigate],
  )

  const value = useMemo(
    () => ({
      locale,
      hasLocalePrefix,
      t,
      messages,
      localize,
      setLocale,
    }),
    [hasLocalePrefix, locale, localize, messages, setLocale, t],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}

/**
 * On first visit (no stored preference), DE/CS browsers land on prefixed routes.
 */
export function FirstVisitLocaleRedirect() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const storage = typeof localStorage !== 'undefined' ? localStorage : null
    const stored = readStoredLocale(storage)
    if (stored) return

    const { locale, hasLocalePrefix, pathnameWithoutLocale } = parseLocaleFromPathname(
      location.pathname,
    )
    if (locale !== 'en' || hasLocalePrefix) return

    const browserLocale = detectBrowserLocale(
      typeof navigator !== 'undefined' ? navigator.languages || [navigator.language] : [],
    )
    if (browserLocale === 'en') return

    writeStoredLocale(storage, browserLocale)
    const target = localizePath(pathnameWithoutLocale, browserLocale)
    const query = location.search || ''
    const hash = location.hash || ''
    navigate(`${target}${query}${hash}`, { replace: true })
  }, [location.hash, location.pathname, location.search, navigate])

  return null
}
