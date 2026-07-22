/**
 * Public Etsy product mapping and query helpers.
 * Never exposes admin-only fields or tokens.
 */

import { normalizedPriceValue } from './etsy/_catalogue.js'

/** Etsy listing states that must never appear on the public site. */
export const PUBLIC_EXCLUDED_ETSY_STATES = ['draft', 'inactive', 'expired']

export const PUBLIC_PRODUCT_COLUMNS = `listing_id, slug, title, custom_title, description, custom_description,
  custom_title_de, custom_description_de, seo_title_de, seo_description_de,
  custom_title_cs, custom_description_cs, seo_title_cs, seo_description_cs,
  etsy_state, website_status, quantity,
  price_amount, price_divisor, price_currency,
  website_category, website_featured, website_use_local_images,
  primary_image_url, image_urls_json, local_images_json, etsy_url`

export const PUBLIC_PRODUCT_WHERE = `website_approved = 1
  AND website_hidden = 0
  AND etsy_state NOT IN ('draft', 'inactive', 'expired')
  AND (
    website_category IS NULL
    OR website_category != 'Custom Orders'
    OR etsy_state = 'active'
  )`

/**
 * Normalize an image URL for browser use (absolute https or same-origin path).
 * @param {unknown} url
 * @returns {string | null}
 */
export function normalizeImageUrl(url) {
  if (url == null || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('//')) return `https:${trimmed}`
  if (trimmed.startsWith('http://')) return trimmed.replace(/^http:\/\//i, 'https://')
  if (trimmed.startsWith('https://')) return trimmed
  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed}`
}

/**
 * Whether a URL is safe to pass to <img src> (avoids "/", page-relative junk).
 * @param {unknown} url
 */
export function isUsableImageSrc(url) {
  const normalized = normalizeImageUrl(url)
  if (!normalized || normalized === '/') return false
  if (normalized.startsWith('https://')) {
    try {
      const { hostname, pathname } = new URL(normalized)
      if (!hostname || pathname === '/' || pathname.length < 2) return false
      if (hostname === 'i.etsystatic.com' || hostname.endsWith('.etsystatic.com')) {
        return true
      }
      return false
    } catch {
      return false
    }
  }
  if (normalized.startsWith('/images/')) return true
  return false
}

/**
 * @param {unknown} hostname
 */
export function imageHostnameForDiagnostics(url) {
  if (!isUsableImageSrc(url)) return null
  try {
    const normalized = normalizeImageUrl(url)
    if (normalized && normalized.startsWith('https://')) {
      return new URL(normalized).hostname
    }
    if (normalized && normalized.startsWith('/')) return 'self'
  } catch {
    return null
  }
  return null
}

/**
 * Ordered unique candidates:
 * - Etsy first by default
 * - local override only when explicitly enabled
 * @param {{
 *   localImages?: string[] | null,
 *   primaryImageUrl?: string | null,
 *   etsyImageUrls?: string[] | null,
 *   useLocalImages?: boolean | null,
 * }} product
 * @returns {string[]}
 */
export function getProductImageCandidates(product) {
  const candidates = []
  const push = (value) => {
    if (!isUsableImageSrc(value)) return
    const normalized = normalizeImageUrl(value)
    if (normalized && !candidates.includes(normalized)) candidates.push(normalized)
  }

  const useLocalImages = Boolean(product && product.useLocalImages)

  if (useLocalImages && product && Array.isArray(product.localImages)) {
    for (const url of product.localImages) push(url)
  }
  if (product) {
    push(product.primaryImageUrl)
  }
  if (product && Array.isArray(product.etsyImageUrls)) {
    for (const url of product.etsyImageUrls) push(url)
  }
  if (!useLocalImages && product && Array.isArray(product.localImages)) {
    for (const url of product.localImages) push(url)
  }

  return candidates
}

/**
 * @param {unknown} json
 * @returns {string[]}
 */
export function parseLocalImagesJson(json) {
  if (!json) return []
  try {
    const parsed = JSON.parse(String(json))
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((u) => typeof u === 'string' && u.trim() !== '')
      .map((u) => normalizeImageUrl(u))
      .filter(Boolean)
  } catch {
    return []
  }
}

/**
 * @param {unknown} json
 * @param {unknown} primary
 * @returns {string[]}
 */
export function parseEtsyImageUrls(json, primary) {
  const urls = []

  const push = (value) => {
    let candidate = value
    if (candidate && typeof candidate === 'object') {
      const record = /** @type {Record<string, unknown>} */ (candidate)
      candidate =
        record.url ?? record.src ?? record.href ?? record.primaryImageUrl ?? null
    }
    const norm = normalizeImageUrl(candidate)
    if (norm && !urls.includes(norm)) urls.push(norm)
  }

  if (json) {
    try {
      const parsed = JSON.parse(String(json))
      if (Array.isArray(parsed)) {
        for (const u of parsed) push(u)
      }
    } catch {
      // ignore
    }
  }

  push(primary)

  return urls
}

/**
 * Etsy images first by default. Local images win only when explicitly enabled.
 * @param {string[] | null | undefined} localImages
 * @param {unknown} primaryImageUrl
 * @param {unknown} imageUrlsJson
 * @param {unknown} websiteUseLocalImages
 * @returns {{ displayImageUrl: string | null, imageUrls: string[], useLocalImages: boolean }}
 */
export function resolveProductImages(
  localImages,
  primaryImageUrl,
  imageUrlsJson,
  websiteUseLocalImages,
) {
  const local = Array.isArray(localImages)
    ? localImages.map(normalizeImageUrl).filter(Boolean)
    : parseLocalImagesJson(
        localImages == null ? null : JSON.stringify(localImages),
      )
  const useLocalImages = Number(websiteUseLocalImages) === 1 || websiteUseLocalImages === true

  if (useLocalImages && local.length > 0) {
    return { displayImageUrl: local[0], imageUrls: local, useLocalImages }
  }

  const etsy = parseEtsyImageUrls(imageUrlsJson, primaryImageUrl)
  return {
    displayImageUrl: etsy[0] || local[0] || null,
    imageUrls: etsy.length > 0 ? etsy : local,
    useLocalImages,
  }
}

/**
 * @param {Record<string, unknown>} row
 * @param {{ locale?: 'en' | 'de' | 'cs' }} [options]
 */
export function mapPublicProductRow(row, options = {}) {
  const locale =
    options.locale === 'de' || options.locale === 'cs' ? options.locale : 'en'
  const localImages = parseLocalImagesJson(row.local_images_json)
  const { imageUrls, displayImageUrl, useLocalImages } = resolveProductImages(
    localImages,
    row.primary_image_url,
    row.image_urls_json,
    row.website_use_local_images,
  )

  const slug = row.slug ? String(row.slug).trim() : String(row.listing_id)
  const websiteStatus = String(row.website_status || '')
  const quantity = Number(row.quantity) || 0

  const englishTitle =
    (row.custom_title && String(row.custom_title).trim()) || String(row.title)
  const englishDescription =
    (row.custom_description && String(row.custom_description).trim()) ||
    (row.description != null ? String(row.description) : '')

  const germanTitle =
    (row.custom_title_de && String(row.custom_title_de).trim()) || ''
  const germanDescription =
    (row.custom_description_de && String(row.custom_description_de).trim()) || ''
  const czechTitle =
    (row.custom_title_cs && String(row.custom_title_cs).trim()) || ''
  const czechDescription =
    (row.custom_description_cs && String(row.custom_description_cs).trim()) || ''

  let title = englishTitle
  let description = englishDescription
  if (locale === 'de') {
    title = germanTitle || englishTitle
    description = germanDescription || englishDescription
  } else if (locale === 'cs') {
    title = czechTitle || englishTitle
    description = czechDescription || englishDescription
  }

  const seoTitleDe = (row.seo_title_de && String(row.seo_title_de).trim()) || null
  const seoDescriptionDe =
    (row.seo_description_de && String(row.seo_description_de).trim()) || null
  const seoTitleCs = (row.seo_title_cs && String(row.seo_title_cs).trim()) || null
  const seoDescriptionCs =
    (row.seo_description_cs && String(row.seo_description_cs).trim()) || null

  let seoTitle = title
  let seoDescription = description.slice(0, 160)
  if (locale === 'de') {
    seoTitle = seoTitleDe || title
    seoDescription = seoDescriptionDe || description.slice(0, 160)
  } else if (locale === 'cs') {
    seoTitle = seoTitleCs || title
    seoDescription = seoDescriptionCs || description.slice(0, 160)
  }

  return {
    listingId: Number(row.listing_id),
    slug,
    title,
    description,
    englishDescription,
    seoTitle,
    seoDescription,
    price: normalizedPriceValue(row.price_amount, row.price_divisor),
    currency: row.price_currency || null,
    quantity,
    websiteStatus,
    category: row.website_category || null,
    featured: Number(row.website_featured) === 1,
    useLocalImages,
    imageUrls,
    primaryImageUrl: displayImageUrl,
    etsyUrl: row.etsy_url,
    isSold: websiteStatus === 'sold' || Number(row.quantity) === 0,
    locale,
    hasGermanTranslation: Boolean(germanTitle && germanDescription),
    hasCzechTranslation: Boolean(czechTitle && czechDescription),
  }
}

/**
 * Pick first non-empty trimmed string.
 * @param {...unknown} values
 */
export function firstNonEmpty(...values) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

/**
 * Whether a raw D1 row is eligible for the public catalogue.
 * @param {Record<string, unknown>} row
 */
export function isPublicProductRow(row) {
  if (!row) return false
  if (Number(row.website_approved) !== 1) return false
  if (Number(row.website_hidden) !== 0) return false

  const state = String(row.etsy_state || '').toLowerCase()
  if (PUBLIC_EXCLUDED_ETSY_STATES.includes(state)) return false

  const category = row.website_category ? String(row.website_category) : null
  if (category === 'Custom Orders' && state !== 'active') return false

  return true
}

/**
 * @param {string} slug
 */
export function normalizeSlugParam(slug) {
  if (!slug || typeof slug !== 'string') return null
  const trimmed = slug.trim().toLowerCase()
  return trimmed || null
}
