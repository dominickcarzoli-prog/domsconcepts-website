/**
 * Shared helpers for static product translation import/export.
 * No paid APIs — file + D1 only.
 */

export const TRANSLATION_FIELDS = [
  'custom_title_de',
  'custom_description_de',
  'seo_title_de',
  'seo_description_de',
  'custom_title_cs',
  'custom_description_cs',
  'seo_title_cs',
  'seo_description_cs',
]

/**
 * @param {unknown} value
 */
export function normalizeListingId(value) {
  if (value == null || value === '') return null
  const n = Number(String(value).trim())
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

/**
 * @param {unknown} value
 */
export function normalizeOptionalText(value) {
  if (value == null) return null
  const text = String(value)
  if (!text.trim()) return null
  return text
}

/**
 * @param {unknown} entry
 */
export function parseTranslationEntry(entry) {
  if (!entry || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' }
  }
  const row = /** @type {Record<string, unknown>} */ (entry)
  const listingId = normalizeListingId(row.listing_id ?? row.listingId)
  if (!listingId) {
    return { ok: false, error: 'invalid_listing_id' }
  }

  /** @type {Record<string, string | null>} */
  const fields = {}
  let provided = 0
  for (const key of TRANSLATION_FIELDS) {
    if (!(key in row)) continue
    fields[key] = normalizeOptionalText(row[key])
    provided += 1
  }

  if (provided === 0) {
    return { ok: false, error: 'no_translation_fields', listingId }
  }

  return { ok: true, listingId, fields }
}

/**
 * Decide which fields to write for one product.
 * Default preserves existing non-empty translations unless overwrite is true.
 *
 * @param {{
 *   incoming: Record<string, string | null>,
 *   existing: Record<string, string | null | undefined>,
 *   overwrite: boolean,
 * }} options
 */
export function planTranslationUpdates(options) {
  const { incoming, existing, overwrite } = options
  /** @type {Record<string, string | null>} */
  const updates = {}
  /** @type {string[]} */
  const skipped = []

  for (const key of TRANSLATION_FIELDS) {
    if (!(key in incoming)) continue
    const nextValue = incoming[key]
    const current = existing[key]
    const hasExisting = current != null && String(current).trim() !== ''

    if (!overwrite && hasExisting) {
      skipped.push(key)
      continue
    }

    // Only include when value changes (including clearing with null when overwrite)
    const currentNormalized = hasExisting ? String(current) : null
    if (currentNormalized === nextValue) {
      skipped.push(key)
      continue
    }

    updates[key] = nextValue
  }

  return { updates, skipped }
}

/**
 * Escape a value for use in a single-quoted SQL string literal.
 * @param {string | null} value
 */
export function sqlStringLiteral(value) {
  if (value == null) return 'NULL'
  return `'${String(value).replaceAll("'", "''")}'`
}

/**
 * Build a single-row UPDATE for translation fields only.
 * @param {number} listingId
 * @param {Record<string, string | null>} updates
 */
export function buildTranslationUpdateSql(listingId, updates) {
  const keys = Object.keys(updates)
  if (!keys.length) return null
  const assignments = keys.map((key) => `${key} = ${sqlStringLiteral(updates[key])}`)
  return `UPDATE etsy_products SET ${assignments.join(', ')} WHERE listing_id = ${Number(listingId)};`
}

/**
 * Map a D1 product row into the export template shape.
 * @param {Record<string, unknown>} row
 */
export function mapExportRow(row) {
  const listingId = normalizeListingId(row.listing_id)
  const englishTitle =
    (row.custom_title && String(row.custom_title).trim()) ||
    (row.title && String(row.title).trim()) ||
    ''
  const englishDescription =
    (row.custom_description && String(row.custom_description).trim()) ||
    (row.description && String(row.description).trim()) ||
    ''

  /** @type {Record<string, string | number | null>} */
  const out = {
    listing_id: listingId,
    english_title: englishTitle,
    english_description: englishDescription,
  }

  for (const key of TRANSLATION_FIELDS) {
    const value = row[key]
    out[key] = value == null || String(value).trim() === '' ? null : String(value)
  }

  return out
}
