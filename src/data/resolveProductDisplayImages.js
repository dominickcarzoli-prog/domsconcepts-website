/**
 * Shared public product image resolution.
 * Used by homepage cards, Available Pieces, and product detail.
 *
 * Priority when source === 'etsy':
 * 1. Etsy gallery / primary (rank order preserved) unless local override is on
 * 2. Local inventory / local gallery only as fallback or when override enabled
 *
 * Hardcoded products keep inventory-first behaviour.
 */

const PLACEHOLDER_IMAGE_PATH_RE = /placeholder|coming-soon|photo-coming/i

/**
 * @param {string} imagePath
 */
function isLikelyPlaceholderPath(imagePath) {
  return PLACEHOLDER_IMAGE_PATH_RE.test(imagePath)
}

/**
 * @param {string} imagePath
 */
function numericFilenameValue(imagePath) {
  const base = String(imagePath).split('/').pop()?.split('?')[0] ?? ''
  const match = base.match(/(\d+)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

/**
 * Sort local inventory paths by numeric filename (01, 02, …).
 * Do not use for remote Etsy CDN URLs — that would scramble rank order.
 * @param {string[]} images
 */
export function sortLocalProductImages(images) {
  return [...images].sort((a, b) => numericFilenameValue(a) - numericFilenameValue(b))
}

/**
 * @param {{ id?: string, imageFolder?: string }} product
 */
function getFolder(product) {
  return product.imageFolder || product.id || ''
}

/**
 * @param {Record<string, unknown>} product
 * @returns {string[]}
 */
function galleryCandidates(product) {
  const gallery = Array.isArray(product.galleryImages) ? product.galleryImages : []
  const main = product.mainImage
  const raw = gallery.length > 0 ? gallery : main != null && main !== '' ? [main] : []
  /** @type {string[]} */
  const candidates = []
  for (const entry of raw) {
    const url =
      typeof entry === 'string'
        ? entry
        : entry && typeof entry === 'object' && typeof /** @type {{ url?: unknown }} */ (entry).url === 'string'
          ? /** @type {{ url: string }} */ (entry).url
          : null
    if (typeof url === 'string' && url && !isLikelyPlaceholderPath(url)) {
      candidates.push(url)
    }
  }
  return candidates
}

/**
 * @param {Record<string, unknown>} product
 * @param {{ inventory?: Record<string, string[]> }} [options]
 * @returns {string[]}
 */
export function resolveProductDisplayImages(product, options = {}) {
  if (!product || typeof product !== 'object') return []

  const inventory = options.inventory && typeof options.inventory === 'object' ? options.inventory : {}
  const isEtsy = product.source === 'etsy'
  const useLocalImages = Boolean(product.useLocalImages)
  const gallery = galleryCandidates(product)
  const folder = getFolder(product)
  const fromInventory = inventory[folder] || inventory[product.id] || null

  if (isEtsy && !useLocalImages) {
    // Etsy-first: preserve API / rank order. Never prefer matching hardcoded inventory.
    if (gallery.length > 0) return gallery
    if (Array.isArray(fromInventory) && fromInventory.length > 0) {
      return sortLocalProductImages(fromInventory)
    }
    return []
  }

  if (isEtsy && useLocalImages) {
    if (Array.isArray(fromInventory) && fromInventory.length > 0) {
      return sortLocalProductImages(fromInventory)
    }
    if (gallery.length > 0) return gallery
    return []
  }

  // Hardcoded catalogue path
  if (Array.isArray(fromInventory) && fromInventory.length > 0) {
    return sortLocalProductImages(fromInventory)
  }

  return sortLocalProductImages(gallery)
}
