/**
 * Shared admin catalogue helpers — validation, mapping, query building.
 * Never logs or returns secrets/tokens.
 */

import { normalizedPriceValue } from '../etsy/_catalogue.js'
import {
  parseLocalImagesJson,
  resolveProductImages,
} from '../_public_products.js'

export const WEBSITE_CATEGORIES = [
  'Cutting Boards',
  'End Grain Boards',
  'Serving Boards',
  'Epoxy Pieces',
  'Furniture',
  'Wood Care',
  'Accessories',
  'Other',
]

export const DEFAULT_LIST_LIMIT = 50
export const MAX_LIST_LIMIT = 200

export const PRODUCT_SELECT_COLUMNS = `listing_id, title, description, custom_title, custom_description,
  custom_title_de, custom_description_de, seo_title_de, seo_description_de,
  custom_title_cs, custom_description_cs, seo_title_cs, seo_description_cs,
  etsy_state, website_status, quantity,
  price_amount, price_divisor, price_currency,
  website_approved, website_hidden, website_category, website_featured, website_use_local_images,
  slug, primary_image_url, image_urls_json, local_images_json, etsy_url, synced_at`

export const SORT_ORDER_SQL = `CASE etsy_state
  WHEN 'active' THEN 0
  WHEN 'draft' THEN 1
  WHEN 'sold_out' THEN 2
  WHEN 'inactive' THEN 3
  WHEN 'expired' THEN 3
  ELSE 4
END, listing_id DESC`

const CATEGORY_SET = new Set(WEBSITE_CATEGORIES)

/**
 * @param {Record<string, unknown>} row
 */
export function mapProductRow(row) {
  const localImages = parseLocalImagesJson(row.local_images_json)
  const { displayImageUrl, imageUrls, useLocalImages } = resolveProductImages(
    localImages,
    row.primary_image_url,
    row.image_urls_json,
    row.website_use_local_images,
  )

  return {
    listingId: Number(row.listing_id),
    title: row.title,
    description: row.description || null,
    customTitle: row.custom_title || null,
    customDescription: row.custom_description || null,
    customTitleDe: row.custom_title_de || null,
    customDescriptionDe: row.custom_description_de || null,
    seoTitleDe: row.seo_title_de || null,
    seoDescriptionDe: row.seo_description_de || null,
    customTitleCs: row.custom_title_cs || null,
    customDescriptionCs: row.custom_description_cs || null,
    seoTitleCs: row.seo_title_cs || null,
    seoDescriptionCs: row.seo_description_cs || null,
    germanComplete: Boolean(
      row.custom_title_de &&
        String(row.custom_title_de).trim() &&
        row.custom_description_de &&
        String(row.custom_description_de).trim(),
    ),
    czechComplete: Boolean(
      row.custom_title_cs &&
        String(row.custom_title_cs).trim() &&
        row.custom_description_cs &&
        String(row.custom_description_cs).trim(),
    ),
    etsyState: row.etsy_state,
    websiteStatus: row.website_status,
    quantity: Number(row.quantity) || 0,
    price: normalizedPriceValue(row.price_amount, row.price_divisor),
    currency: row.price_currency || null,
    approved: Number(row.website_approved) === 1,
    hidden: Number(row.website_hidden) === 1,
    category: row.website_category || null,
    featured: Number(row.website_featured) === 1,
    useLocalImages,
    slug: row.slug || null,
    primaryImageUrl: displayImageUrl,
    localImages: localImages.length ? localImages : null,
    etsyImageUrls: imageUrls.length ? imageUrls : null,
    etsyUrl: row.etsy_url,
    syncedAt: Number(row.synced_at) || null,
  }
}

/**
 * @param {string | URL} url
 */
export function parseListQuery(url) {
  const params = typeof url === 'string' ? new URL(url).searchParams : url.searchParams

  const limitRaw = Number(params.get('limit'))
  const offsetRaw = Number(params.get('offset'))
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.trunc(limitRaw), MAX_LIST_LIMIT)
      : DEFAULT_LIST_LIMIT
  const offset =
    Number.isFinite(offsetRaw) && offsetRaw >= 0 ? Math.trunc(offsetRaw) : 0

  const filters = {
    state: params.get('state')?.trim().toLowerCase() || null,
    status: params.get('status')?.trim().toLowerCase() || null,
    approved: parseBoolParam(params.get('approved')),
    hidden: parseBoolParam(params.get('hidden')),
    featured: parseBoolParam(params.get('featured')),
    category: params.get('category')?.trim() || null,
    search: params.get('search')?.trim() || null,
    limit,
    offset,
  }

  if (filters.category && !CATEGORY_SET.has(filters.category)) {
    return { ok: false, error: 'invalid_category', message: 'Unknown category filter.' }
  }

  return { ok: true, filters }
}

/**
 * @param {string | null | undefined} value
 * @returns {boolean | null}
 */
function parseBoolParam(value) {
  if (value == null || value === '') return null
  const v = String(value).trim().toLowerCase()
  if (v === 'true' || v === '1') return true
  if (v === 'false' || v === '0') return false
  return null
}

/**
 * @param {{ state?: string | null, status?: string | null, approved?: boolean | null, hidden?: boolean | null, featured?: boolean | null, category?: string | null, search?: string | null }} filters
 * @returns {{ sql: string, binds: unknown[] }}
 */
export function buildListWhereClause(filters) {
  const clauses = []
  const binds = []

  if (filters.state) {
    clauses.push('etsy_state = ?')
    binds.push(filters.state)
  }
  if (filters.status) {
    clauses.push('website_status = ?')
    binds.push(filters.status)
  }
  if (filters.approved === true) {
    clauses.push('website_approved = 1')
  } else if (filters.approved === false) {
    clauses.push('website_approved = 0')
  }
  if (filters.hidden === true) {
    clauses.push('website_hidden = 1')
  } else if (filters.hidden === false) {
    clauses.push('website_hidden = 0')
  }
  if (filters.featured === true) {
    clauses.push('website_featured = 1')
  } else if (filters.featured === false) {
    clauses.push('website_featured = 0')
  }
  if (filters.category) {
    clauses.push('website_category = ?')
    binds.push(filters.category)
  }
  if (filters.search) {
    const term = `%${filters.search.replace(/[%_]/g, '')}%`
    clauses.push('(title LIKE ? OR custom_title LIKE ? OR CAST(listing_id AS TEXT) LIKE ?)')
    binds.push(term, term, term)
  }

  const sql = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
  return { sql, binds }
}

/**
 * @param {unknown} slug
 */
export function validateSlug(slug) {
  if (slug == null || slug === '') {
    return { ok: true, value: null }
  }
  if (typeof slug !== 'string') {
    return { ok: false, error: 'invalid_slug', message: 'Slug must be a string.' }
  }
  const trimmed = slug.trim().toLowerCase()
  if (trimmed.length < 2 || trimmed.length > 120) {
    return {
      ok: false,
      error: 'invalid_slug',
      message: 'Slug must be 2–120 characters.',
    }
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmed)) {
    return {
      ok: false,
      error: 'invalid_slug',
      message: 'Slug may only use lowercase letters, numbers, and hyphens.',
    }
  }
  return { ok: true, value: trimmed }
}

/**
 * @param {unknown} body
 */
export function validateUpdateBody(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_body', message: 'JSON body required.' }
  }

  const input = /** @type {Record<string, unknown>} */ (body)
  const fields = {}
  const allowed = [
    'website_approved',
    'website_hidden',
    'website_category',
    'website_featured',
    'custom_title',
    'custom_description',
    'custom_title_de',
    'custom_description_de',
    'seo_title_de',
    'seo_description_de',
    'custom_title_cs',
    'custom_description_cs',
    'seo_title_cs',
    'seo_description_cs',
    'slug',
    'local_images_json',
    'website_use_local_images',
  ]

  const keys = Object.keys(input)
  if (keys.length === 0) {
    return { ok: false, error: 'empty_body', message: 'No fields to update.' }
  }

  for (const key of keys) {
    if (!allowed.includes(key)) {
      return {
        ok: false,
        error: 'invalid_field',
        message: `Field "${key}" cannot be modified.`,
      }
    }
  }

  if ('website_approved' in input) {
    if (typeof input.website_approved !== 'boolean') {
      return { ok: false, error: 'invalid_field', message: 'website_approved must be boolean.' }
    }
    fields.website_approved = input.website_approved ? 1 : 0
  }

  if ('website_hidden' in input) {
    if (typeof input.website_hidden !== 'boolean') {
      return { ok: false, error: 'invalid_field', message: 'website_hidden must be boolean.' }
    }
    fields.website_hidden = input.website_hidden ? 1 : 0
  }

  if ('website_featured' in input) {
    if (typeof input.website_featured !== 'boolean') {
      return { ok: false, error: 'invalid_field', message: 'website_featured must be boolean.' }
    }
    fields.website_featured = input.website_featured ? 1 : 0
  }

  if ('website_category' in input) {
    const cat = input.website_category
    if (cat === null || cat === '') {
      fields.website_category = null
    } else if (typeof cat === 'string' && CATEGORY_SET.has(cat)) {
      fields.website_category = cat
    } else {
      return { ok: false, error: 'invalid_category', message: 'Unknown category.' }
    }
  }

  if ('custom_title' in input) {
    const title = input.custom_title
    if (title === null || title === '') {
      fields.custom_title = null
    } else if (typeof title === 'string' && title.trim().length <= 200) {
      fields.custom_title = title.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'custom_title too long.' }
    }
  }

  if ('custom_description' in input) {
    const desc = input.custom_description
    if (desc === null || desc === '') {
      fields.custom_description = null
    } else if (typeof desc === 'string' && desc.length <= 5000) {
      fields.custom_description = desc
    } else {
      return { ok: false, error: 'invalid_field', message: 'custom_description too long.' }
    }
  }

  if ('custom_title_de' in input) {
    const title = input.custom_title_de
    if (title === null || title === '') {
      fields.custom_title_de = null
    } else if (typeof title === 'string' && title.trim().length <= 200) {
      fields.custom_title_de = title.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'custom_title_de too long.' }
    }
  }

  if ('custom_description_de' in input) {
    const desc = input.custom_description_de
    if (desc === null || desc === '') {
      fields.custom_description_de = null
    } else if (typeof desc === 'string' && desc.length <= 5000) {
      fields.custom_description_de = desc
    } else {
      return { ok: false, error: 'invalid_field', message: 'custom_description_de too long.' }
    }
  }

  if ('seo_title_de' in input) {
    const title = input.seo_title_de
    if (title === null || title === '') {
      fields.seo_title_de = null
    } else if (typeof title === 'string' && title.trim().length <= 200) {
      fields.seo_title_de = title.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'seo_title_de too long.' }
    }
  }

  if ('seo_description_de' in input) {
    const desc = input.seo_description_de
    if (desc === null || desc === '') {
      fields.seo_description_de = null
    } else if (typeof desc === 'string' && desc.length <= 500) {
      fields.seo_description_de = desc.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'seo_description_de too long.' }
    }
  }

  if ('custom_title_cs' in input) {
    const title = input.custom_title_cs
    if (title === null || title === '') {
      fields.custom_title_cs = null
    } else if (typeof title === 'string' && title.trim().length <= 200) {
      fields.custom_title_cs = title.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'custom_title_cs too long.' }
    }
  }

  if ('custom_description_cs' in input) {
    const desc = input.custom_description_cs
    if (desc === null || desc === '') {
      fields.custom_description_cs = null
    } else if (typeof desc === 'string' && desc.length <= 5000) {
      fields.custom_description_cs = desc
    } else {
      return { ok: false, error: 'invalid_field', message: 'custom_description_cs too long.' }
    }
  }

  if ('seo_title_cs' in input) {
    const title = input.seo_title_cs
    if (title === null || title === '') {
      fields.seo_title_cs = null
    } else if (typeof title === 'string' && title.trim().length <= 200) {
      fields.seo_title_cs = title.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'seo_title_cs too long.' }
    }
  }

  if ('seo_description_cs' in input) {
    const desc = input.seo_description_cs
    if (desc === null || desc === '') {
      fields.seo_description_cs = null
    } else if (typeof desc === 'string' && desc.length <= 500) {
      fields.seo_description_cs = desc.trim()
    } else {
      return { ok: false, error: 'invalid_field', message: 'seo_description_cs too long.' }
    }
  }

  if ('slug' in input) {
    const slugResult = validateSlug(input.slug)
    if (!slugResult.ok) return slugResult
    fields.slug = slugResult.value
  }

  if ('local_images_json' in input) {
    const images = input.local_images_json
    if (images === null) {
      fields.local_images_json = null
    } else if (Array.isArray(images)) {
      const urls = images
        .filter((u) => typeof u === 'string' && u.trim() !== '')
        .map((u) => u.trim())
      if (urls.length > 20) {
        return { ok: false, error: 'invalid_field', message: 'Too many local images.' }
      }
      for (const u of urls) {
        if (!u.startsWith('https://') && !u.startsWith('/')) {
          return {
            ok: false,
            error: 'invalid_field',
            message: 'Local image URLs must be https:// or site-relative.',
          }
        }
      }
      fields.local_images_json = urls.length ? JSON.stringify(urls) : null
    } else {
      return { ok: false, error: 'invalid_field', message: 'local_images_json must be an array.' }
    }
  }

  if ('website_use_local_images' in input) {
    if (typeof input.website_use_local_images !== 'boolean') {
      return {
        ok: false,
        error: 'invalid_field',
        message: 'website_use_local_images must be boolean.',
      }
    }
    fields.website_use_local_images = input.website_use_local_images ? 1 : 0
  }

  return { ok: true, fields }
}

/**
 * @param {unknown} body
 */
export function validateBulkBody(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_body', message: 'JSON body required.' }
  }

  const input = /** @type {Record<string, unknown>} */ (body)
  const action = input.action
  const validActions = ['approve', 'hide', 'unhide', 'setCategory', 'removeFeatured']
  if (!action || !validActions.includes(String(action))) {
    return { ok: false, error: 'invalid_action', message: 'Unknown bulk action.' }
  }

  const listingIds = input.listingIds
  if (!Array.isArray(listingIds) || listingIds.length === 0) {
    return { ok: false, error: 'invalid_listing_ids', message: 'listingIds array required.' }
  }
  if (listingIds.length > 200) {
    return { ok: false, error: 'invalid_listing_ids', message: 'Too many listing IDs.' }
  }

  const ids = []
  for (const id of listingIds) {
    const n = Number(id)
    if (!Number.isFinite(n) || n <= 0) {
      return { ok: false, error: 'invalid_listing_id', message: 'Invalid listing ID.' }
    }
    ids.push(Math.trunc(n))
  }

  let category = null
  if (action === 'setCategory') {
    category = input.category
    if (!category || typeof category !== 'string' || !CATEGORY_SET.has(category)) {
      return { ok: false, error: 'invalid_category', message: 'Valid category required.' }
    }
  }

  return { ok: true, action: String(action), listingIds: ids, category }
}

/**
 * @param {number} listingId
 */
export function parseListingIdParam(listingId) {
  const n = Number(listingId)
  if (!Number.isFinite(n) || n <= 0) {
    return { ok: false, error: 'invalid_listing_id', message: 'Invalid listing ID.' }
  }
  return { ok: true, value: Math.trunc(n) }
}
