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
  const imageUrls = Array.isArray(apiProduct.imageUrls) ? apiProduct.imageUrls : []
  const primary =
    (typeof apiProduct.primaryImageUrl === 'string' && apiProduct.primaryImageUrl) ||
    imageUrls[0] ||
    ''
  const images = imageUrls.length ? imageUrls : primary ? [primary] : []
  const websiteStatus = String(apiProduct.websiteStatus || '')
  const isSold = websiteStatus === 'sold' || Number(apiProduct.quantity) === 0
  const priceNum = apiProduct.price
  const currency = String(apiProduct.currency || 'CZK').toUpperCase()
  const priceLabel =
    priceNum != null
      ? `${currency} ${Number(priceNum).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
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
    shortDescription: String(apiProduct.description || '').slice(0, 160),
    longDescription: String(apiProduct.description || ''),
    dimensions: '',
    woodType: '',
    price: priceLabel,
    priceFrom: priceLabel,
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
 */
export async function fetchEtsyCatalogueProducts(fallbackProducts) {
  if (!USE_ETSY_CATALOGUE) return fallbackProducts

  try {
    const res = await fetch('/api/products', {
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
 */
export async function fetchEtsyProductBySlug(slug, fallbackProducts) {
  if (!USE_ETSY_CATALOGUE) {
    return (
      fallbackProducts.find((p) => p.slug === slug || p.id === slug) || null
    )
  }

  try {
    const res = await fetch(`/api/products/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })
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
    return normalizeEtsyApiProduct(data.product)
  } catch {
    return (
      fallbackProducts.find((p) => p.slug === slug || p.id === slug) || null
    )
  }
}

/**
 * Resolve the product list for the public site (flag + fallback).
 * Import hardcoded products at the call site to avoid bundling in tests.
 *
 * @example
 * import { products } from './products.ts'
 * const items = await resolvePublicProducts(products)
 *
 * @param {Array<Record<string, unknown>>} fallbackProducts
 */
export async function resolvePublicProducts(fallbackProducts) {
  return fetchEtsyCatalogueProducts(fallbackProducts)
}
