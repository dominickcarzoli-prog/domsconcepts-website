import { cs } from './dictionaries/cs.js'
import { de } from './dictionaries/de.js'
import { en } from './dictionaries/en.js'
import { DEFAULT_LOCALE, isLocale } from './localePaths.js'

const dictionaries = { en, de, cs }

/**
 * @param {Record<string, unknown>} dict
 * @param {string} path
 */
function lookup(dict, path) {
  const parts = path.split('.')
  let current = /** @type {unknown} */ (dict)
  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) return undefined
    current = /** @type {Record<string, unknown>} */ (current)[part]
  }
  return typeof current === 'string' ? current : undefined
}

/**
 * Translate a dictionary key. Falls back to English, then the key itself.
 * @param {string} key
 * @param {import('./localePaths.js').Locale | string} [locale]
 * @param {Record<string, string | number>} [vars]
 */
export function translate(key, locale = DEFAULT_LOCALE, vars) {
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
  let text = lookup(dictionaries[loc], key)
  if (text == null && loc !== 'en') {
    text = lookup(dictionaries.en, key)
  }
  if (text == null) return key

  if (vars) {
    return Object.entries(vars).reduce(
      (out, [name, value]) => out.replaceAll(`{${name}}`, String(value)),
      text,
    )
  }
  return text
}

/**
 * Translate a stored website category label for display only.
 * @param {string | null | undefined} category
 * @param {(key: string) => string} t
 */
export function translateCategoryLabel(category, t) {
  if (!category) return category
  const key = `categories.${category}`
  const translated = t(key)
  return translated === key ? category : translated
}

/**
 * Translate a gallery filter / category ID for display only.
 * @param {string} categoryId
 * @param {(key: string) => string} t
 * @param {{ singular?: boolean }} [options]
 */
export function translateGalleryCategoryLabel(categoryId, t, options = {}) {
  if (!categoryId || categoryId === 'all') return t('galleryPage.galleryCategories.all')
  const group = options.singular ? 'galleryCategorySingular' : 'galleryCategories'
  const key = `galleryPage.${group}.${categoryId}`
  const translated = t(key)
  return translated === key ? categoryId : translated
}

/**
 * Map known English CTA / badge strings into the active locale.
 * @param {string} label
 * @param {(key: string) => string} t
 */
export function translateActionLabel(label, t) {
  const map = {
    'Buy on Etsy': t('actions.buyOnEtsy'),
    'Request Similar Piece': t('actions.requestSimilar'),
    'Request Custom Quote': t('actions.requestCustomQuote'),
    'View on Etsy': t('actions.viewOnEtsy'),
    'Add on Etsy': t('actions.addOnEtsy'),
  }
  if (map[label]) return map[label]
  // Legacy product CTA phrasing (catalogue fixtures)
  if (/^request something similar$/i.test(String(label || ''))) {
    return t('actions.requestSimilar')
  }
  return label
}

/**
 * @param {string} badge
 * @param {(key: string) => string} t
 */
export function translateBadgeLabel(badge, t) {
  const key = `badges.${badge}`
  const translated = t(key)
  return translated === key ? badge : translated
}

/**
 * Full messages object for the locale (arrays, nested objects).
 * @param {import('./localePaths.js').Locale | string} [locale]
 */
export function getMessages(locale = DEFAULT_LOCALE) {
  const loc = isLocale(locale) ? locale : DEFAULT_LOCALE
  return dictionaries[loc] || dictionaries.en
}

export { dictionaries, en, de, cs }
