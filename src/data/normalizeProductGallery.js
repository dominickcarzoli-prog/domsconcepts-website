/**
 * Normalize product gallery images into a stable shape shared by
 * main image, thumbnails, and lightbox.
 */

/**
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
 * @param {unknown} value
 * @returns {string | null}
 */
export function coerceImageUrl(value) {
  if (typeof value === 'string') {
    return normalizeImageUrl(value)
  }
  if (value && typeof value === 'object') {
    const record = /** @type {Record<string, unknown>} */ (value)
    const candidate =
      record.url ?? record.src ?? record.href ?? record.primaryImageUrl ?? null
    if (typeof candidate === 'string') return normalizeImageUrl(candidate)
  }
  return null
}

/**
 * @param {unknown} value
 * @returns {boolean}
 */
export function hasValidProductImageUrl(value) {
  const url = coerceImageUrl(value)
  return Boolean(url && isUsableImageSrc(url))
}

/**
 * @param {unknown[]} urls
 * @param {{ productName?: string, productId?: string | number }} [options]
 * @returns {{ id: string, url: string, rank: number, alt: string }[]}
 */
export function normalizeProductGallery(urls, options = {}) {
  const productName = options.productName || 'Product'
  const productId = options.productId != null ? String(options.productId) : 'product'
  const list = Array.isArray(urls) ? urls : []
  /** @type {{ id: string, url: string, rank: number, alt: string }[]} */
  const out = []
  const seen = new Set()

  for (let index = 0; index < list.length; index += 1) {
    const url = coerceImageUrl(list[index])
    if (!url || !isUsableImageSrc(url) || seen.has(url)) continue
    seen.add(url)
    const rank = out.length + 1
    out.push({
      id: `${productId}-${rank}`,
      url,
      rank,
      alt: `${productName} photo ${rank}`,
    })
  }

  return out
}

/**
 * Resolve lightbox image from a stable index into the normalized gallery.
 * @param {{ id: string, url: string, rank: number, alt: string }[]} images
 * @param {number | null | undefined} activeImageIndex
 */
export function resolveActiveGalleryImage(images, activeImageIndex) {
  if (activeImageIndex == null || !Number.isInteger(activeImageIndex)) return null
  if (activeImageIndex < 0 || activeImageIndex >= images.length) return null
  const image = images[activeImageIndex]
  if (!image || !hasValidProductImageUrl(image.url)) return null
  return image
}
