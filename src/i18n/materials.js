/**
 * Display-only translation for known material phrases.
 * Does not modify stored D1 / product values.
 */

/** Locale-correct epoxy resin labels for materials display. */
export const EPOXY_RESIN_LABELS = {
  en: { alone: 'Epoxy resin', append: 'epoxy resin' },
  de: { alone: 'Epoxidharz', append: 'Epoxidharz' },
  cs: { alone: 'Epoxidová pryskyřice', append: 'epoxidová pryskyřice' },
}

/** Longest-first so "Black walnut" wins over "Walnut". */
const MATERIAL_PHRASES = [
  ['natural beeswax and food-grade mineral oil', { en: 'Natural beeswax and food-grade mineral oil', de: 'Natürliches Bienenwachs und lebensmittelechtes Mineralöl', cs: 'Přírodní včelí vosk a potravinářský minerální olej' }],
  ['natural beeswax, food-grade mineral oil and carnauba wax', { en: 'Natural beeswax, food-grade mineral oil and carnauba wax', de: 'Natürliches Bienenwachs, lebensmittelechtes Mineralöl und Carnaubawachs', cs: 'Přírodní včelí vosk, potravinářský minerální olej a karnaubský vosk' }],
  ['solid oak and clock mechanism', { en: 'Solid oak and clock mechanism', de: 'Massive Eiche und Uhrwerk', cs: 'Masivní dub a hodinový strojek' }],
  ['black walnut, maple, purpleheart and metal bottle opener', { en: 'Black walnut, maple, purpleheart and metal bottle opener', de: 'Amerikanischer Schwarznussbaum, Ahorn, Amaranthholz und Flaschenöffner aus Metall', cs: 'Americký černý ořech, javor, amarantové dřevo a kovový otvírák' }],
  ['black walnut, maple and mahogany', { en: 'Black walnut, maple and mahogany', de: 'Amerikanischer Schwarznussbaum, Ahorn und Mahagoni', cs: 'Americký černý ořech, javor a mahagon' }],
  ['food-grade mineral oil', { en: 'food-grade mineral oil', de: 'lebensmittelechtes Mineralöl', cs: 'potravinářský minerální olej' }],
  ['natural beeswax', { en: 'Natural beeswax', de: 'Natürliches Bienenwachs', cs: 'Přírodní včelí vosk' }],
  ['carnauba wax', { en: 'carnauba wax', de: 'Carnaubawachs', cs: 'karnaubský vosk' }],
  ['clock mechanism', { en: 'clock mechanism', de: 'Uhrwerk', cs: 'hodinový strojek' }],
  ['metal bottle opener', { en: 'metal bottle opener', de: 'Flaschenöffner aus Metall', cs: 'kovový otvírák' }],
  ['black walnut', { en: 'Black walnut', de: 'Amerikanischer Schwarznussbaum', cs: 'Americký černý ořech' }],
  ['american black walnut', { en: 'American black walnut', de: 'Amerikanischer Schwarznussbaum', cs: 'Americký černý ořech' }],
  ['american walnut', { en: 'American walnut', de: 'Amerikanischer Nussbaum', cs: 'Americký ořech' }],
  ['european oak', { en: 'European oak', de: 'Europäische Eiche', cs: 'Evropský dub' }],
  ['european walnut', { en: 'European walnut', de: 'Europäischer Nussbaum', cs: 'Evropský ořech' }],
  ['hard maple', { en: 'Hard maple', de: 'Hartahorn', cs: 'Tvrdý javor' }],
  ['epoxy resin', { en: 'Epoxy resin', de: 'Epoxidharz', cs: 'Epoxidová pryskyřice' }],
  ['solid oak', { en: 'Solid oak', de: 'Massiveiche', cs: 'Masivní dub' }],
  ['mixed hardwoods', { en: 'Mixed hardwoods', de: 'Gemischte Harthölzer', cs: 'Smíšená tvrdá dřeva' }],
  ['purpleheart', { en: 'Purpleheart', de: 'Amaranthholz', cs: 'Amarantové dřevo' }],
  ['walnut', { en: 'Walnut', de: 'Nussbaum', cs: 'Ořech' }],
  ['maple', { en: 'Maple', de: 'Ahorn', cs: 'Javor' }],
  ['oak', { en: 'Oak', de: 'Eiche', cs: 'Dub' }],
  ['iroko', { en: 'Iroko', de: 'Iroko', cs: 'Iroko' }],
  ['ash', { en: 'Ash', de: 'Esche', cs: 'Jasan' }],
  ['padouk', { en: 'Padouk', de: 'Padouk', cs: 'Padouk' }],
  ['mahogany', { en: 'Mahogany', de: 'Mahagoni', cs: 'Mahagon' }],
  ['beech', { en: 'Beech', de: 'Buche', cs: 'Buk' }],
  ['cherry', { en: 'Cherry', de: 'Kirsche', cs: 'Třešeň' }],
  ['epoxy', { en: 'Epoxy', de: 'Epoxidharz', cs: 'Epoxid' }],
  ['beeswax', { en: 'Beeswax', de: 'Bienenwachs', cs: 'Včelí vosk' }],
  ['mineral oil', { en: 'Mineral oil', de: 'Mineralöl', cs: 'Minerální olej' }],
]

const CONNECTORS = {
  en: { and: ' and ', comma: ', ' },
  de: { and: ' und ', comma: ', ' },
  cs: { and: ' a ', comma: ', ' },
}

/**
 * @param {string} locale
 */
function localeKey(locale) {
  if (locale === 'de' || locale === 'cs') return locale
  return 'en'
}

/**
 * True when a materials string already lists epoxy resin (locale-aware).
 * Bare "epoxy" / "epoxid" alone is not enough for CS safety clarity.
 * @param {string | null | undefined} materials
 */
export function materialsLabelHasEpoxyResin(materials) {
  return /\bepoxy\s+resin\b|\bepoxidharz\b|\bepoxidov[áa]\s+pryskyřice\b/i.test(
    String(materials || ''),
  )
}

/**
 * Display-only: ensure epoxy resin appears in a materials label.
 * Does not modify stored D1 / product values. No duplicate when already present.
 * @param {string | null | undefined} materials
 * @param {string} [locale]
 */
export function ensureEpoxyResinInMaterialsDisplay(materials, locale = 'en') {
  const loc = localeKey(locale)
  const labels = EPOXY_RESIN_LABELS[loc] || EPOXY_RESIN_LABELS.en
  const text = String(materials || '').trim()
  if (!text) return labels.alone

  if (materialsLabelHasEpoxyResin(text)) return text

  // Upgrade bare "epoxy" → full "epoxy resin" (never doubles into "epoxy resin resin").
  if (/(^|[^a-zA-Z])[Ee]poxy(?!\s*resin)(?=$|[^a-zA-Z])/.test(text)) {
    return text.replace(
      /(^|[^a-zA-Z])([Ee]poxy)(?!\s*resin)(?=$|[^a-zA-Z])/g,
      (_match, pre, word) => `${pre}${word[0] === 'E' ? 'Epoxy resin' : 'epoxy resin'}`,
    )
  }

  // Upgrade bare "epoxid" — not Epoxidharz / epoxidová…
  if (
    /(^|[^a-zA-Zá-žÁ-Ž])[Ee]poxid(?!harz|ov)(?=$|[^a-zA-Zá-žÁ-ŽäÄ])/.test(text)
  ) {
    return text.replace(
      /(^|[^a-zA-Zá-žÁ-Ž])([Ee]poxid)(?!harz|ov)(?=$|[^a-zA-Zá-žÁ-ŽäÄ])/g,
      (_match, pre, word) => `${pre}${word[0] === 'E' ? labels.alone : labels.append}`,
    )
  }

  const connectors = CONNECTORS[loc]
  const splitRe =
    loc === 'de'
      ? /\s*,\s*|\s+und\s+|\s+and\s+|\s+&\s+/i
      : loc === 'cs'
        ? /\s*,\s*|\s+a\s+|\s+and\s+|\s+&\s+/i
        : /\s*,\s*|\s+and\s+|\s+&\s+/i

  const parts = text.split(splitRe).map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return labels.alone
  if (parts.length === 1) {
    return `${parts[0]}${connectors.and}${labels.append}`
  }
  return `${parts.join(connectors.comma)}${connectors.and}${labels.append}`
}

/**
 * Translate a materials label for display. Unknown phrases pass through unchanged.
 * @param {string | null | undefined} materials
 * @param {string} [locale]
 */
export function translateMaterialsLabel(materials, locale = 'en') {
  if (!materials || typeof materials !== 'string') return materials || ''
  const loc = localeKey(locale)
  if (loc === 'en') return materials

  const connectors = CONNECTORS[loc]
  let remaining = materials.trim()
  if (!remaining) return remaining

  /** @type {{ start: number, end: number, text: string }[]} */
  const hits = []
  const lower = remaining.toLowerCase()

  for (const [phrase, labels] of MATERIAL_PHRASES) {
    let from = 0
    while (from < lower.length) {
      const idx = lower.indexOf(phrase, from)
      if (idx === -1) break
      const end = idx + phrase.length
      const overlaps = hits.some((h) => idx < h.end && end > h.start)
      if (!overlaps) {
        hits.push({ start: idx, end, text: labels[loc] || labels.en })
      }
      from = end
    }
  }

  if (hits.length === 0) return materials

  hits.sort((a, b) => a.start - b.start)

  let out = ''
  let cursor = 0
  for (const hit of hits) {
    const gap = remaining.slice(cursor, hit.start)
    out += normalizeGap(gap, connectors) + hit.text
    cursor = hit.end
  }
  out += remaining.slice(cursor)
  return tidyMaterialsOutput(out, connectors, loc)
}

/**
 * @param {string} gap
 * @param {{ and: string, comma: string }} connectors
 */
function normalizeGap(gap, connectors) {
  if (!gap) return ''
  const trimmed = gap.replace(/\s+/g, ' ')
  if (/^\s*,\s*(and|&)?\s*$/i.test(trimmed) || /^\s+and\s+$/i.test(trimmed) || /^\s+&\s+$/.test(trimmed)) {
    return connectors.comma
  }
  if (/^\s+and\s+/i.test(trimmed) || /^\s+&\s+/.test(trimmed)) {
    return connectors.and
  }
  if (/^\s*,\s*/.test(trimmed)) {
    return connectors.comma
  }
  return trimmed
}

/**
 * @param {string} text
 * @param {{ and: string, comma: string }} connectors
 */
/**
 * @param {string} text
 * @param {{ and: string, comma: string }} connectors
 * @param {'en' | 'de' | 'cs'} loc
 */
function tidyMaterialsOutput(text, connectors, loc = 'en') {
  let out = text.replace(/\s+/g, ' ').trim()
  const parts = out.split(connectors.comma).map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) {
    const last = parts.pop()
    if (loc === 'cs') {
      const rest = parts.map((part, index) =>
        index === 0 ? part : lowercaseMaterialToken(part),
      )
      out = `${rest.join(connectors.comma)}${connectors.and}${lowercaseMaterialToken(last)}`
    } else {
      out = `${parts.join(connectors.comma)}${connectors.and}${last}`
    }
  }
  out = out.replace(
    new RegExp(`${escapeReg(connectors.comma)}${escapeReg(connectors.and.trim())}\\s*`, 'g'),
    connectors.and,
  )
  return out
}

function lowercaseMaterialToken(value) {
  if (!value) return value
  return value.charAt(0).toLowerCase() + value.slice(1)
}

function escapeReg(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
