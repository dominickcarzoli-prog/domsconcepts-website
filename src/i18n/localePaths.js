/** @typedef {'en' | 'de' | 'cs'} Locale */

export const LOCALES = /** @type {const} */ (['en', 'de', 'cs'])
export const DEFAULT_LOCALE = /** @type {Locale} */ ('en')
export const LOCALE_STORAGE_KEY = 'domsconcepts-locale'

/** Display labels for the language selector (CZ for Czech). */
export const LOCALE_SELECTOR_LABELS = {
  en: 'EN',
  de: 'DE',
  cs: 'CZ',
}

/**
 * @param {unknown} value
 * @returns {value is Locale}
 */
export function isLocale(value) {
  return value === 'en' || value === 'de' || value === 'cs'
}

/**
 * Validate a public API locale query param.
 * @param {unknown} value
 * @returns {Locale}
 */
export function normalizeLocaleParam(value) {
  const raw = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return isLocale(raw) ? raw : DEFAULT_LOCALE
}

/**
 * @param {string | null | undefined} pathname
 * @returns {{ locale: Locale, pathnameWithoutLocale: string, hasLocalePrefix: boolean }}
 */
export function parseLocaleFromPathname(pathname) {
  const path = typeof pathname === 'string' && pathname ? pathname : '/'
  const match = path.match(/^\/(en|de|cs)(?=\/|$)/)
  if (match) {
    const locale = /** @type {Locale} */ (match[1])
    let rest = path.slice(locale.length + 1) || '/'
    if (!rest.startsWith('/')) rest = `/${rest}`
    return { locale, pathnameWithoutLocale: rest, hasLocalePrefix: true }
  }
  return { locale: DEFAULT_LOCALE, pathnameWithoutLocale: path || '/', hasLocalePrefix: false }
}

/**
 * Build a locale-aware path. English may omit the prefix; de/cs always use a prefix.
 * @param {string} pathWithoutLocale
 * @param {Locale} locale
 * @param {{ forceEnPrefix?: boolean }} [options]
 */
export function localizePath(pathWithoutLocale, locale, options = {}) {
  let path = pathWithoutLocale || '/'
  if (!path.startsWith('/')) path = `/${path}`

  if (locale === 'de' || locale === 'cs') {
    if (path === '/') return `/${locale}`
    return `/${locale}${path}`
  }

  if (options.forceEnPrefix) {
    if (path === '/') return '/en'
    return `/en${path}`
  }

  return path
}

/**
 * Switch locale while preserving the current page path/query/hash.
 * @param {string} fullPath pathname + search + hash
 * @param {Locale} nextLocale
 */
export function switchLocalePath(fullPath, nextLocale) {
  const [pathAndQuery, hash = ''] = fullPath.split('#')
  const [pathname, search = ''] = pathAndQuery.split('?')
  const { pathnameWithoutLocale } = parseLocaleFromPathname(pathname)
  const wasEnPrefixed = pathname === '/en' || pathname.startsWith('/en/')
  const nextPath = localizePath(pathnameWithoutLocale, nextLocale, {
    forceEnPrefix: nextLocale === 'en' && wasEnPrefixed,
  })
  const query = search ? `?${search}` : ''
  const fragment = hash ? `#${hash}` : ''
  return `${nextPath}${query}${fragment}`
}

/**
 * Detect preferred locale from browser languages (first visit only).
 * @param {readonly string[] | undefined} languages
 * @returns {Locale}
 */
export function detectBrowserLocale(languages) {
  const list = Array.isArray(languages) ? languages : []
  for (const raw of list) {
    const code = String(raw || '')
      .trim()
      .toLowerCase()
      .split('-')[0]
    if (code === 'de') return 'de'
    if (code === 'cs' || code === 'cz' || code === 'sk') return 'cs'
    if (code === 'en') return 'en'
  }
  return DEFAULT_LOCALE
}

/**
 * @param {Storage | null | undefined} storage
 * @returns {Locale | null}
 */
export function readStoredLocale(storage) {
  try {
    const value = storage?.getItem?.(LOCALE_STORAGE_KEY)
    return isLocale(value) ? value : null
  } catch {
    return null
  }
}

/**
 * @param {Storage | null | undefined} storage
 * @param {Locale} locale
 */
export function writeStoredLocale(storage, locale) {
  try {
    storage?.setItem?.(LOCALE_STORAGE_KEY, locale)
  } catch {
    // ignore quota / private mode
  }
}

/**
 * Resolve the active locale with explicit route priority.
 * Priority: explicit route locale → stored preference → browser → English.
 *
 * @param {{
 *   routeLocale?: Locale | string | null,
 *   hasLocalePrefix?: boolean,
 *   storedLocale?: Locale | null,
 *   browserLanguages?: readonly string[],
 * }} options
 * @returns {Locale}
 */
export function resolveActiveLocale(options = {}) {
  if (options.hasLocalePrefix && isLocale(options.routeLocale)) {
    return options.routeLocale
  }
  if (isLocale(options.storedLocale)) {
    return options.storedLocale
  }
  return detectBrowserLocale(options.browserLanguages)
}
