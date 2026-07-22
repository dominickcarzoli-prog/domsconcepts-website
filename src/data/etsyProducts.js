/**
 * Public Etsy catalogue data layer.
 *
 * Feature flag VITE_USE_ETSY_CATALOGUE:
 * - false (default in dev/test) → callers keep hardcoded products
 * - true (production default via .env.production) → fetch approved listings from /api/products
 * - API failure → always fall back to hardcoded products
 *
 * Cloudflare Pages production env (Settings → Environment variables):
 *   VITE_USE_ETSY_CATALOGUE = true
 */

import { coerceImageUrl } from './normalizeProductGallery.js'

/** @type {boolean} */
export const USE_ETSY_CATALOGUE = Boolean(
  typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_USE_ETSY_CATALOGUE === 'true',
)

const CATEGORY_MAP = {
  'Cutting Boards': 'Cutting Boards',
  'End Grain Boards': 'Cutting Boards',
  'Serving Boards': 'Serving Boards',
  'Epoxy Pieces': 'Epoxy Pieces',
  Furniture: 'Custom Orders',
  'Wood Care': 'Wood Care',
  Accessories: 'Coasters',
  Other: 'Cutting Boards',
}

/**
 * @param {string | null | undefined} category
 */
function mapEtsyCategory(category) {
  if (category && category in CATEGORY_MAP) {
    return CATEGORY_MAP[/** @type {keyof typeof CATEGORY_MAP} */ (category)]
  }
  return 'Cutting Boards'
}

/**
 * @param {Record<string, unknown>} apiProduct
 */
export function normalizeEtsyApiProduct(apiProduct) {
  const listingId = String(apiProduct.listingId)
  const slug = String(apiProduct.slug || listingId)
  const imageUrls = (Array.isArray(apiProduct.imageUrls) ? apiProduct.imageUrls : [])
    .map((entry) => coerceImageUrl(entry))
    .filter(Boolean)
  const primary =
    coerceImageUrl(apiProduct.primaryImageUrl) || imageUrls[0] || ''
  const images = imageUrls.length ? imageUrls : primary ? [primary] : []
  const websiteStatus = String(apiProduct.websiteStatus || '')
  const isSold = websiteStatus === 'sold' || Number(apiProduct.quantity) === 0
  const priceNum =
    apiProduct.price != null && Number.isFinite(Number(apiProduct.price))
      ? Number(apiProduct.price)
      : null
  const currency = String(apiProduct.currency || 'CZK').toUpperCase()
  // Display label kept for fallbacks / non-React consumers; FormattedPrice
  // prefers priceAmount + priceCurrency so conversion does not re-parse locale strings.
  const priceLabel =
    priceNum != null
      ? `${currency} ${priceNum.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
      : 'Price on request'

  return {
    id: `etsy-${listingId}`,
    slug,
    name: String(apiProduct.title || `Listing ${listingId}`),
    category: mapEtsyCategory(
      typeof apiProduct.category === 'string' ? apiProduct.category : null,
    ),
    collection: 'Available Pieces',
    description: String(apiProduct.description || ''),
    englishDescription: String(
      apiProduct.englishDescription || apiProduct.description || '',
    ),
    shortDescription: String(apiProduct.description || '').slice(0, 160),
    longDescription: String(apiProduct.description || ''),
    dimensions: '',
    woodType: '',
    materials: '',
    price: priceLabel,
    priceFrom: priceLabel,
    /** @type {number | null} Raw listing amount (source currency) — format at render. */
    priceAmount: priceNum,
    /** @type {string} ISO 4217 source currency from Etsy / D1. */
    priceCurrency: currency,
    status: isSold ? 'sold' : 'available',
    badge: isSold ? 'Sold' : 'Available',
    availability: isSold ? 'Sold' : 'Available',
    // Do not reuse hardcoded inventory folders — Etsy gallery is the source of truth.
    imageFolder: `etsy/${listingId}`,
    mainImage: primary,
    image: primary,
    galleryImages: images,
    etsyUrl: typeof apiProduct.etsyUrl === 'string' ? apiProduct.etsyUrl : undefined,
    requestCtaText: isSold ? 'Sold' : 'Buy on Etsy',
    isAvailable: !isSold,
    isCustomOrder: false,
    isSold,
    buttonLabel: isSold ? 'Sold' : 'Buy on Etsy',
    careAddOnAvailable: false,
    featured: Boolean(apiProduct.featured),
    publicationStatus: 'published',
    /** @type {'etsy'} */
    source: 'etsy',
    listingId: Number(apiProduct.listingId),
    useLocalImages: Boolean(apiProduct.useLocalImages),
    websiteStatus,
  }
}

/**
 * @param {Array<Record<string, unknown>>} fallbackProducts
 * @param {{ locale?: 'en' | 'de' }} [options]
 */
export async function fetchEtsyCatalogueProducts(fallbackProducts, options = {}) {
  if (!USE_ETSY_CATALOGUE) return fallbackProducts

  const locale = options.locale === 'de' || options.locale === 'cs' ? options.locale : 'en'

  try {
    const res = await fetch(`/api/products?locale=${encodeURIComponent(locale)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
    if (!res.ok) return fallbackProducts
    const data = await res.json()
    if (!data || !Array.isArray(data.products) || data.products.length === 0) {
      return fallbackProducts
    }
    return data.products.map(normalizeEtsyApiProduct)
  } catch {
    return fallbackProducts
  }
}

/**
 * @param {string} slug
 * @param {Array<Record<string, unknown>>} fallbackProducts
 * @param {{ locale?: 'en' | 'de' }} [options]
 */
export async function fetchEtsyProductBySlug(slug, fallbackProducts, options = {}) {
  if (!USE_ETSY_CATALOGUE) {
    return (
      fallbackProducts.find((p) => p.slug === slug || p.id === slug) || null
    )
  }

  const locale = options.locale === 'de' || options.locale === 'cs' ? options.locale : 'en'

  try {
    const res = await fetch(
      `/api/products/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
      {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      },
    )
    if (res.status === 404) return null
    if (!res.ok) {
      return (
        fallbackProducts.find((p) => p.slug === slug || p.id === slug) || null
      )
    }
    const data = await res.json()
    if (!data || !data.product) {
      return (
        fallbackProducts.find((p) => p.slug === slug || p.id === slug) || null
      )
    }
    return mergeHardcodedProductFields(
      normalizeEtsyApiProduct(data.product),
      fallbackProducts.find((p) => p.slug === slug || p.id === slug),
    )
  } catch {
    return (
      fallbackProducts.find((p) => p.slug === slug || p.id === slug) || null
    )
  }
}

/**
 * Carry stable structured fields from hardcoded catalogue entries onto Etsy API products.
 * Does not override title, description, price, images, or Etsy URL from the API.
 * @param {Record<string, unknown>} etsyProduct
 * @param {Record<string, unknown> | undefined} hardcoded
 */
function mergeHardcodedProductFields(etsyProduct, hardcoded) {
  if (!hardcoded) return etsyProduct
  const materials =
    typeof hardcoded.materials === 'string' && hardcoded.materials.trim()
      ? hardcoded.materials.trim()
      : etsyProduct.materials
  const woodType =
    typeof hardcoded.woodType === 'string' && hardcoded.woodType.trim()
      ? hardcoded.woodType.trim()
      : etsyProduct.woodType
  const dimensions =
    typeof hardcoded.dimensions === 'string' &&
    hardcoded.dimensions.trim() &&
    !/^details coming soon$/i.test(hardcoded.dimensions.trim())
      ? hardcoded.dimensions.trim()
      : etsyProduct.dimensions
  return {
    ...etsyProduct,
    materials,
    woodType,
    dimensions,
    construction: hardcoded.construction || etsyProduct.construction,
    finish: hardcoded.finish || etsyProduct.finish,
    features:
      Array.isArray(hardcoded.features) && hardcoded.features.length
        ? hardcoded.features
        : etsyProduct.features,
    perfectFor:
      Array.isArray(hardcoded.perfectFor) && hardcoded.perfectFor.length
        ? hardcoded.perfectFor
        : etsyProduct.perfectFor,
    whyThisPiece: hardcoded.whyThisPiece || etsyProduct.whyThisPiece,
    whyEndGrain: hardcoded.whyEndGrain || etsyProduct.whyEndGrain,
  }
}

/**
 * @param {Array<Record<string, unknown>>} fallbackProducts
 * @param {{ locale?: 'en' | 'de' }} [options]
 */
export async function resolvePublicProducts(fallbackProducts, options = {}) {
  return fetchEtsyCatalogueProducts(fallbackProducts, options)
}
