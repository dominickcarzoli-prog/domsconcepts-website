import productImageInventory from './product-image-inventory.json'
import { resolveProductDisplayImages } from './resolveProductDisplayImages.js'

export type ProductStatus =
  | 'Available'
  | 'Reserved'
  | 'Sold'
  | 'Made to order'
  | 'Low in stock, only 1 left'
  | 'Low in stock, only 2 left'
  | 'Low in stock, only 5 left'

/** Shop/homepage visibility. Inventory availability stays on `status`. */
export type PublicationStatus = 'published' | 'draft' | 'archived'

export type ProductBadge = 'Available' | 'Made to Order' | 'One-of-One' | 'Sold'

export type ProductCollection =
  | 'Available Pieces'
  | 'Custom Cutting Boards'
  | 'Butcher Blocks'
  | 'Serving & Gift Pieces'
  | 'One-of-One Creations'
  | 'Board Care'

export type ProductCategory =
  | 'Cutting Boards'
  | 'Serving Boards'
  | 'Breadboards'
  | 'Wood Care'
  | 'Coasters'
  | 'Wall Pieces'
  | 'Epoxy Pieces'
  | 'Custom Orders'

export type ProductButtonAction = {
  label: string
  href: string
  external: boolean
}

export type Product = {
  id: string
  slug: string
  name: string
  category: ProductCategory
  collection: ProductCollection
  description: string
  shortDescription: string
  longDescription: string
  dimensions: string
  woodType: string
  materials?: string
  price: string
  priceFrom: string
  status: ProductStatus
  badge: ProductBadge
  availability: string
  shippingNote?: string
  /** Relative folder under public/images/products/ (may be nested, e.g. oak/solid-oak-cutting-board). Defaults to id. */
  imageFolder: string
  mainImage: string
  image: string
  galleryImages: string[]
  etsyUrl?: string
  requestCtaText: string
  freeShipping?: boolean
  isAvailable: boolean
  isCustomOrder: boolean
  isSold: boolean
  buttonLabel: string
  careAddOnAvailable: boolean
  featured: boolean
  publicationStatus: PublicationStatus
  features?: string[]
  perfectFor?: string[]
  whyThisPiece?: string
  whyEndGrain?: string
  careInstructions?: string
  /** Present on Etsy-backed catalogue products */
  source?: 'etsy' | 'hardcoded'
  listingId?: number
  useLocalImages?: boolean
  websiteStatus?: string
}

export const ETSY_SHOP_URL = 'https://www.etsy.com/shop/DomsConcepts'
export const CUSTOM_ORDER_FORM_ANCHOR = '/custom-orders#custom-quote-form'

const BOARD_CARE_ELIGIBLE_CATEGORIES: ProductCategory[] = [
  'Cutting Boards',
  'Serving Boards',
  'Breadboards',
  'Epoxy Pieces',
  'Coasters',
]

export const productCollections: ProductCollection[] = [
  'Available Pieces',
  'Custom Cutting Boards',
  'Butcher Blocks',
  'Serving & Gift Pieces',
  'One-of-One Creations',
  'Board Care',
]

export const productCategories: ProductCategory[] = [
  'Cutting Boards',
  'Serving Boards',
  'Breadboards',
  'Wood Care',
  'Coasters',
  'Wall Pieces',
  'Epoxy Pieces',
  'Custom Orders',
]

const PLACEHOLDER_DESCRIPTION =
  'Handmade piece from the Dom\'s Concepts workshop. Full details and photos can be updated soon.'

const PLACEHOLDER_IMAGE_PATH_RE = /placeholder|coming-soon|photo-coming/i
const PLACEHOLDER_DIMENSIONS_RE = /details\s+coming\s+soon/i

type ProductImageInventory = Record<string, string[]>

const imageInventory = productImageInventory as ProductImageInventory

function isLikelyPlaceholderPath(imagePath: string) {
  return PLACEHOLDER_IMAGE_PATH_RE.test(imagePath)
}

/** Extract leading/sole digit run from a filename basename (e.g. 01.jpg → 1). */
function numericFilenameValue(imagePath: string): number {
  const base = imagePath.split('/').pop()?.split('?')[0] ?? ''
  const match = base.match(/(\d+)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

/** Sort product gallery paths by numeric filename value (01, 02, … 10), not locale/alpha. */
export function sortProductImagesByNumericFilename(images: string[]): string[] {
  return [...images].sort((a, b) => numericFilenameValue(a) - numericFilenameValue(b))
}

export function hasDisplayableDimensions(dimensions?: string): boolean {
  const trimmed = dimensions?.trim() ?? ''
  if (!trimmed) return false
  if (PLACEHOLDER_DIMENSIONS_RE.test(trimmed)) return false
  return true
}

export function getProductImageFolder(
  product: Pick<Product, 'id' | 'imageFolder'>,
): string {
  return product.imageFolder || product.id
}

export function getProductRealImages(
  product: Pick<
    Product,
    'id' | 'imageFolder' | 'galleryImages' | 'mainImage' | 'source' | 'useLocalImages'
  >,
) {
  return resolveProductDisplayImages(product, { inventory: imageInventory })
}

export function hasProductMainImage(
  product: Pick<Product, 'id' | 'imageFolder' | 'galleryImages' | 'mainImage'>,
) {
  return getProductRealImages(product).length > 0
}

function applyRealImages(product: Product): Product {
  const realImages = getProductRealImages(product)

  if (realImages.length === 0) {
    return product
  }

  return {
    ...product,
    mainImage: realImages[0],
    image: realImages[0],
    galleryImages: realImages,
  }
}

// Product photo rule:
// Upload product images into public/images/products/{imageFolder}/
// Prefer nested category folders: oak/, walnut/, epoxy/, wood-care/, specialties/.
// Use numbered filenames: 01.jpg (also .jpeg / .png / .webp).
// Product id / URL slug stay stable; imageFolder may differ (short nested path).
// Do not create new product image folders unless the product is added to this file.
// Inactive / made-to-order reference images live in _archive/ or _future/ subfolders.

const imagePath = (folder: string, file: string) => `/images/products/${folder}/${file}`

const galleryFor = (folder: string, count = 8) =>
  Array.from({ length: count }, (_, index) =>
    imagePath(folder, `${String(index + 1).padStart(2, '0')}.jpg`),
  )

/** product id → nested imageFolder under public/images/products/ */
export const productImageFolders: Record<string, string> = {
  'handmade-solid-oak-cutting-board': 'oak/solid-oak-cutting-board',
  'handmade-oak-end-grain-cutting-board': 'oak/oak-end-grain-cutting-board',
  'oak-cutting-board-breadboard-black-lines': 'oak/oak-breadboard-black-lines',
  'oak-maple-mahogany-strip-cutting-board': 'oak/oak-maple-mahogany-strip',
  'handmade-end-grain-walnut-breadboard': 'walnut/end-grain-walnut-breadboard',
  'handmade-black-walnut-maple-end-grain-cutting-board':
    'walnut/black-walnut-maple-end-grain',
  'american-walnut-maple-padouk-cutting-board': 'walnut/walnut-maple-padouk',
  'american-black-walnut-oak-maple-padouk-cutting-board':
    'walnut/walnut-oak-maple-padouk',
  'european-oak-lux-blue-epoxy-serving-board': 'epoxy/oak-lux-blue-epoxy',
  'european-walnut-aztec-gold-epoxy-serving-board': 'epoxy/walnut-aztec-gold-epoxy',
  'handmade-oak-epoxy-lego-brick-serving-board': 'epoxy/oak-epoxy-lego-brick',
  'walnut-live-edge-charcuterie-board': 'epoxy/walnut-live-edge-charcuterie',
  'natural-wood-butter-beeswax': 'wood-care/natural-wood-butter',
  'beeswax-wood-wax-natural-wood-conditioner': 'wood-care/beeswax-wood-wax',
  'solid-oak-coat-hanger-black-metal-hooks': 'specialties/solid-oak-coat-hanger',
  'walnut-wall-mount-bottle-opener': 'specialties/walnut-bottle-opener',
  'walnut-maple-wall-mount-bottle-opener': 'specialties/walnut-maple-bottle-opener',
  'maple-blue-epoxy-coasters': 'specialties/maple-blue-epoxy-coasters',
  'handmade-walnut-steak-board-two-cups': 'specialties/walnut-steak-board-two-cups',
  'two-in-one-book-stand-serving-board': 'specialties/book-stand-serving-board',
  'handcrafted-oak-clock-stormy-grey-epoxy': 'specialties/oak-clock-stormy-grey',
}

// Legacy Etsy / old site URLs → current product id (URL slug). Image folders may be nested.
export const productIdRedirects: Record<string, string> = {
  'Walnut-steak-board-two-cups': 'handmade-walnut-steak-board-two-cups',
  'walnut-steak-board-two-cups': 'handmade-walnut-steak-board-two-cups',
  'epoxy-wall-clock': 'handcrafted-oak-clock-stormy-grey-epoxy',
  'epoxy-clock': 'handcrafted-oak-clock-stormy-grey-epoxy',
  'black-walnut-end-grain-board': 'handmade-black-walnut-maple-end-grain-cutting-board',
  // Legacy breadboard slug was a duplicate of the maple end-grain board (wrong oak photos).
  'handmade-end-grain-walnut-breadboard':
    'handmade-black-walnut-maple-end-grain-cutting-board',
  'bottle-opener': 'walnut-wall-mount-bottle-opener',
  // Older Lux Blue / epoxy serving-board slugs → corrected product
  'european-oak-lux-blue-epoxy-board': 'european-oak-lux-blue-epoxy-serving-board',
  'epoxy-serving-board': 'european-oak-lux-blue-epoxy-serving-board',
  'lux-blue-epoxy-serving-board': 'european-oak-lux-blue-epoxy-serving-board',
  'lux-blue-epoxy-board': 'european-oak-lux-blue-epoxy-serving-board',
}

/** Template note; UI rewrites "Free shipping" via localizeShippingNote(visitorCountry). */
const DEFAULT_SHIPPING_NOTE =
  'Free shipping. Ships from Czech Republic. Returns accepted within 30 days.'

const STATUS_SORT_ORDER: Record<ProductStatus, number> = {
  Available: 0,
  'Low in stock, only 5 left': 1,
  'Low in stock, only 2 left': 1,
  'Low in stock, only 1 left': 1,
  'Made to order': 2,
  Reserved: 3,
  Sold: 4,
}

function isPurchasableStatus(status: ProductStatus) {
  return (
    status === 'Available' ||
    status.startsWith('Low in stock')
  )
}

function deriveCollection(
  category: ProductCategory,
  status: ProductStatus,
  name: string,
): ProductCollection {
  if (category === 'Wood Care') return 'Board Care'
  if (status === 'Made to order' || category === 'Custom Orders') {
    return 'Custom Cutting Boards'
  }
  if (category === 'Epoxy Pieces') return 'One-of-One Creations'
  if (
    category === 'Serving Boards' ||
    category === 'Breadboards' ||
    category === 'Coasters' ||
    category === 'Wall Pieces'
  ) {
    return 'Serving & Gift Pieces'
  }
  const lowerName = name.toLowerCase()
  if (lowerName.includes('end grain') || lowerName.includes('butcher')) {
    return 'Butcher Blocks'
  }
  if (category === 'Cutting Boards') return 'Available Pieces'
  return 'Available Pieces'
}

function deriveBadge(
  status: ProductStatus,
  category: ProductCategory,
  badge?: ProductBadge,
): ProductBadge {
  if (badge) return badge
  if (status === 'Sold') return 'Sold'
  if (status === 'Made to order') return 'Made to Order'
  if (category === 'Epoxy Pieces') return 'One-of-One'
  return 'Available'
}

function formatPriceFrom(price: string) {
  if (price.startsWith('From ') || price === 'Price on request') {
    return price
  }
  return `From ${price}`
}

function toShortDescription(description: string) {
  const trimmed = description.trim()
  const sentenceEnd = trimmed.search(/[.!?](\s|$)/)
  if (sentenceEnd > 0 && sentenceEnd < 120) {
    return trimmed.slice(0, sentenceEnd + 1)
  }
  if (trimmed.length <= 110) return trimmed
  return `${trimmed.slice(0, 107).trimEnd()}…`
}

function deriveButtonLabel(product: {
  buttonLabel?: string
  isSold: boolean
  isCustomOrder: boolean
  etsyUrl?: string
  isAvailable: boolean
}): string {
  if (product.buttonLabel) return product.buttonLabel
  if (product.isSold) return 'Request Similar Piece'
  if (product.isCustomOrder) return 'Request Custom Quote'
  if (product.etsyUrl && product.isAvailable) return 'Buy on Etsy'
  if (product.isAvailable) return 'Buy on Etsy'
  return 'Request Similar Piece'
}

export function getProductEnquiryHref(product: Pick<Product, 'name'>): string {
  return `/custom-orders?product=${encodeURIComponent(product.name)}#custom-quote-form`
}

export function getProductDetailHref(product: Pick<Product, 'id' | 'slug'>): string {
  return `/available-pieces/${product.slug || product.id}`
}

export function getProductEtsyHref(product: Pick<Product, 'etsyUrl'>): string {
  return product.etsyUrl ?? ETSY_SHOP_URL
}

export function getProductPrimaryAction(product: Product): ProductButtonAction {
  if (product.isAvailable) {
    return {
      label: 'Buy on Etsy',
      href: getProductEtsyHref(product),
      external: true,
    }
  }

  if (product.isSold) {
    return {
      label: 'Request something similar',
      href: getProductEnquiryHref(product),
      external: false,
    }
  }

  if (product.isCustomOrder) {
    return {
      label: 'Request Custom Quote',
      href: getProductEnquiryHref(product),
      external: false,
    }
  }

  return {
    label: product.buttonLabel || 'Request Similar Piece',
    href: getProductEnquiryHref(product),
    external: false,
  }
}

export function getProductSecondaryAction(product: Product): ProductButtonAction {
  return {
    label: 'Request something similar',
    href: getProductEnquiryHref(product),
    external: false,
  }
}

export function getProductButtonAction(product: Product): ProductButtonAction {
  return getProductPrimaryAction(product)
}

type ProductInput = {
  id: string
  name: string
  category: ProductCategory
  price: string
  status: ProductStatus
  woodType: string
  description?: string
  dimensions?: string
  materials?: string
  shippingNote?: string
  freeShipping?: boolean
  galleryCount?: number
  /** Nested folder under public/images/products/; defaults via productImageFolders or id. */
  imageFolder?: string
  collection?: ProductCollection
  badge?: ProductBadge
  featured?: boolean
  etsyUrl?: string
  buttonLabel?: string
  shortDescription?: string
  longDescription?: string
  priceFrom?: string
  mainImage?: string
  features?: string[]
  perfectFor?: string[]
  whyThisPiece?: string
  whyEndGrain?: string
  careInstructions?: string
  publicationStatus?: PublicationStatus
}

function resolveImageFolder(id: string, explicit?: string): string {
  return explicit || productImageFolders[id] || id
}

function createProduct(input: ProductInput): Product {
  const {
    galleryCount = 8,
    status,
    shippingNote,
    freeShipping,
    description = PLACEHOLDER_DESCRIPTION,
    dimensions = 'Details coming soon',
    collection,
    badge,
    featured = false,
    etsyUrl,
    buttonLabel,
    publicationStatus = 'draft',
    shortDescription,
    longDescription,
    priceFrom,
    mainImage: inputMainImage,
    imageFolder: inputImageFolder,
    ...rest
  } = input

  const isSold = status === 'Sold'
  const isCustomOrder = status === 'Made to order'
  const isAvailable = isPurchasableStatus(status)
  const resolvedCollection =
    collection ?? deriveCollection(input.category, status, input.name)
  const resolvedBadge = deriveBadge(status, input.category, badge)
  const imageFolder = resolveImageFolder(input.id, inputImageFolder)
  const resolvedMainImage = inputMainImage ?? imagePath(imageFolder, '01.jpg')
  const resolvedEtsyUrl = etsyUrl

  const productFlags = {
    isSold,
    isCustomOrder,
    isAvailable,
    etsyUrl: resolvedEtsyUrl,
    buttonLabel: undefined as string | undefined,
  }

  const resolvedButtonLabel = deriveButtonLabel({
    ...productFlags,
    buttonLabel,
  })
  const careAddOnAvailable =
    BOARD_CARE_ELIGIBLE_CATEGORIES.includes(input.category) &&
    isAvailable &&
    !isSold &&
    !isCustomOrder

  return {
    ...rest,
    slug: input.id,
    description,
    dimensions,
    status,
    collection: resolvedCollection,
    shortDescription: shortDescription ?? toShortDescription(description),
    longDescription: longDescription ?? description,
    priceFrom: priceFrom ?? formatPriceFrom(input.price),
    badge: resolvedBadge,
    availability: status,
    shippingNote: shippingNote ?? DEFAULT_SHIPPING_NOTE,
    freeShipping: freeShipping ?? true,
    imageFolder,
    mainImage: resolvedMainImage,
    image: resolvedMainImage,
    galleryImages: inputMainImage
      ? [inputMainImage]
      : galleryFor(imageFolder, galleryCount),
    etsyUrl: resolvedEtsyUrl,
    requestCtaText:
      status === 'Made to order' ? 'Request Custom Quote' : 'Buy on Etsy',
    isSold,
    isCustomOrder,
    isAvailable,
    careAddOnAvailable,
    featured,
    publicationStatus,
    buttonLabel: resolvedButtonLabel,
  }
}

function listing(
  id: string,
  name: string,
  category: ProductCategory,
  price: string,
  status: ProductStatus,
  woodType: string,
  options: Partial<
    Omit<ProductInput, 'id' | 'name' | 'category' | 'price' | 'status' | 'woodType'>
  > = {},
): Product {
  return createProduct({
    id,
    name,
    category,
    price,
    status,
    woodType,
    description: PLACEHOLDER_DESCRIPTION,
    dimensions: 'Details coming soon',
    materials: 'Wood',
    ...options,
  })
}

const rawProducts: Product[] = [
  listing(
    'american-black-walnut-oak-maple-padouk-cutting-board',
    'American Black Walnut, Oak, Maple & Padouk Cutting Board',
    'Cutting Boards',
    'CZK 2,151.76',
    'Available',
    'Black walnut, oak, maple, and padouk',
    { publicationStatus: 'draft' },
  ),
  listing(
    'oak-maple-mahogany-strip-cutting-board',
    'Oak, Maple & Mahogany Strip Cutting Board',
    'Cutting Boards',
    'CZK 2,151.76',
    'Available',
    'Oak, maple, and mahogany',
    { publicationStatus: 'draft' },
  ),
  createProduct({
    id: 'american-walnut-maple-padouk-cutting-board',
    name: 'American Walnut, Maple & Padouk/Mahogany Cutting Board',
    category: 'Cutting Boards',
    price: 'CZK 2,151.76',
    status: 'Low in stock, only 1 left',
    publicationStatus: 'draft',
    woodType: 'American walnut, maple, and Padouk/Mahogany',
    materials: 'Wood',
    description:
      'This is an American walnut, maple, and Padouk/Mahogany cutting board. It is handmade from premium hardwoods with a durable, food-safe finish.',
    dimensions:
      'Padouk version: 34.5 × 20.5 × 2.9 cm · Mahogany version: 33.5 × 18.5 × 2.8 cm',
    features: [
      'Handmade from American walnut, maple, and Padouk/Mahogany',
      'Exotic hardwood combination',
      'Durable food-safe finish',
      'Smooth hand-finished surface',
      'Suitable for kitchen use, serving, or gifting',
      'Handmade in the center of Prague',
    ],
    perfectFor: [
      'Everyday kitchen use',
      'Serving cheese, bread, or snacks',
      'Gifts for family or friends',
      'Customers looking for a rare exotic hardwood piece',
    ],
    careInstructions:
      'Hand wash only. Do not soak or place in the dishwasher. Dry immediately after cleaning and refresh regularly with wood butter, oil, or wax.',
    whyThisPiece:
      'Handmade in the center of Prague with love and passion for wood. Slow wood — enjoy nature.',
    shippingNote:
      'Free shipping. Returns accepted. Ships from Czech Republic.',
    freeShipping: true,
  }),
  createProduct({
    id: 'european-oak-lux-blue-epoxy-serving-board',
    name: 'European Oak & Lux Blue Epoxy Resin Serving Board',
    category: 'Epoxy Pieces',
    price: 'CZK 3,037.77',
    status: 'Low in stock, only 1 left',
    publicationStatus: 'published',
    woodType: 'European oak with lux blue epoxy resin',
    materials: 'Wood and epoxy resin',
    // Canonical card/hero: styled kitchen 01.jpg (public folder). Inventory supplies full gallery.
    mainImage: '/images/products/epoxy/oak-lux-blue-epoxy/01.jpg',
    description:
      'This is a European oak and lux blue epoxy resin serving tray. Perfect as a gift for family or friends. It has a durable, food-safe finish and is finished with a three-step finishing procedure for a long-lasting surface.',
    dimensions: '39.5 × 30 × 2.1 cm',
    features: [
      'Handmade from European oak',
      'Lux blue epoxy resin detail',
      'Durable food-safe finish',
      'Finished with a three-step finishing process',
      'Suitable as a serving tray or decorative kitchen piece',
      'Handmade in the center of Prague',
    ],
    careInstructions:
      'To extend the life of your board, clean by hand, dry immediately, and refresh the surface regularly with wood oil, wood butter, or wax.',
    whyThisPiece:
      'Handmade in the center of Prague with love and passion for wood. Slow wood — enjoy nature.',
    shippingNote: 'Returns accepted. Ships from Czech Republic.',
    freeShipping: false,
    galleryCount: 6,
    badge: 'Available',
  }),
  createProduct({
    id: 'european-walnut-aztec-gold-epoxy-serving-board',
    name: 'European Walnut with Aztec Gold Epoxy Serving Board',
    category: 'Serving Boards',
    price: 'CZK 2,784.63',
    status: 'Low in stock, only 1 left',
    publicationStatus: 'published',
    woodType: 'European walnut with Aztec gold epoxy resin',
    materials: 'Wood and epoxy resin',
    description:
      'This is a European walnut and Aztec gold epoxy resin serving tray. Perfect as a gift for family or friends. It has a durable, food-safe finish and is finished with a three-step finishing procedure for a long-lasting surface.',
    dimensions: '39.5 × 30 × 2.5 cm',
    features: [
      'Handmade from European walnut',
      'Aztec gold epoxy resin detail',
      'Durable food-safe finish',
      'Finished with a three-step finishing process',
      'Suitable as a serving tray or decorative kitchen piece',
      'Handmade in the center of Prague',
    ],
    careInstructions:
      'To extend the life of your board, clean by hand, dry immediately, and refresh the surface regularly with wood oil, wood butter, or wax.',
    whyThisPiece:
      'Handmade in the center of Prague with love and passion for wood. Slow wood — enjoy nature.',
    shippingNote: 'Returns accepted. Ships from Czech Republic.',
    freeShipping: false,
    badge: 'Available',
  }),
  createProduct({
    id: 'handmade-oak-epoxy-lego-brick-serving-board',
    name: 'Handmade Oak & Epoxy LEGO Brick Serving Board',
    category: 'Epoxy Pieces',
    // One-of-One via Epoxy Pieces default collection
    price: 'CZK 3,290.92',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'Oak and epoxy',
    materials: 'Wood and epoxy',
    badge: 'Available',
    buttonLabel: 'Buy on Etsy',
    galleryCount: 8,
    // TODO(Dominick): paste exact Etsy listing URL when ready
    // etsyUrl: '',
    // TODO(Dominick): confirm exact dimensions, price, and stock
    description:
      'A handmade oak serving board with epoxy resin poured in a LEGO brick motif — a playful statement piece for serving and display. Finished for food-safe use and suitable as a gift for family or friends.',
    dimensions: 'Details coming soon',
    features: [
      'Handmade from oak with epoxy resin',
      'Distinctive LEGO brick epoxy motif',
      'Food-safe finished surface',
      'Suitable for serving or display',
      'Handmade in the center of Prague',
    ],
    perfectFor: [
      'Entertaining and gifting',
      'Statement kitchen or table décor',
      'Customers looking for a unique epoxy piece',
    ],
    whyThisPiece:
      'Oak paired with a LEGO brick epoxy inlay makes a memorable one-of-a-kind serving board — craftsmanship with a playful twist.',
    careInstructions:
      'Hand wash only. Do not soak or place in dishwasher. Dry immediately and refresh with board oil or wax as needed.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'natural-wood-butter-beeswax',
    name: 'Natural Wood Butter: Beeswax Wood Finish Conditioner',
    category: 'Wood Care',
    price: 'CZK 252.89',
    status: 'Low in stock, only 5 left',
    publicationStatus: 'published',
    woodType: 'Board care blend',
    materials: 'Mineral oil, beeswax',
    description:
      'Made from 100% food-safe materials. Food-grade mineral oil and natural beeswax.',
    dimensions: 'Details coming soon',
    galleryCount: 6,
    careInstructions:
      'Apply liberally to any wood surface, let it soak in, then buff off with a clean rag. The surface should be refreshed and protected.',
    features: [
      'Helps condition cutting boards, serving boards, trays, and wooden kitchen pieces',
      'Helps protect the surface',
      'Deepens the wood tone',
      'Suitable for routine board maintenance',
    ],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    // Legacy duplicate of handmade-black-walnut-maple-end-grain-cutting-board.
    // Kept as draft so old title/oak-copied nested images never appear in Shop All.
    // URL redirects via productIdRedirects.
    id: 'handmade-end-grain-walnut-breadboard',
    name: 'Handmade End Grain Walnut Breadboard',
    category: 'Breadboards',
    collection: 'Available Pieces',
    price: 'CZK 1,772.04',
    status: 'Available',
    publicationStatus: 'draft',
    woodType: 'American black walnut',
    materials: 'Wood',
    badge: 'Available',
    buttonLabel: 'Buy on Etsy',
    galleryCount: 11,
    description:
      'Handmade from American black walnut with a striking end grain pattern, this breadboard combines durability, functionality, and warm natural character. The repeating light and dark walnut blocks create a rich geometric surface that works beautifully for slicing, serving, or display.',
    dimensions: 'Details coming soon',
    features: [
      'Handmade from premium American black walnut',
      'Durable end grain construction',
      'Distinct repeating walnut block pattern',
      'Gentle on knife edges',
      'Thick butcher-block style for stability',
      'Sanded smooth and finished by hand',
      'Treated with food-safe mineral oil and beeswax',
    ],
    perfectFor: [
      'Everyday bread prep and serving',
      'Kitchen countertop display',
      'Housewarming or wedding gifts',
      'Home chefs who appreciate end grain craftsmanship',
    ],
    whyEndGrain:
      'End grain boards absorb knife impact through the wood fibers, helping reduce wear on blades and minimizing visible cut marks over time.',
    careInstructions:
      'Hand wash only. Do not soak or place in dishwasher. Reapply board oil periodically to maintain the finish and longevity.',
    whyThisPiece:
      'Each board is handmade with natural variations in grain and tone that make every piece unique — a practical kitchen tool and a beautiful centerpiece in one.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'walnut-live-edge-charcuterie-board',
    name: 'Walnut Live Edge Charcuterie Board',
    category: 'Epoxy Pieces',
    collection: 'One-of-One Creations',
    price: 'CZK 3,037.77',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'American black walnut with black epoxy resin',
    materials: 'Wood and epoxy resin',
    badge: 'Available',
    buttonLabel: 'Buy on Etsy',
    galleryCount: 7,
    description:
      'A one-of-a-kind live edge charcuterie board crafted from American black walnut, featuring a dramatic black epoxy river that follows the natural contour of the wood. Finished for food-safe serving, it is ideal for cheese, cured meats, fruit, and entertaining.',
    dimensions: 'Details coming soon',
    features: [
      'Handmade from premium American black walnut',
      'Natural live edge profile preserved',
      'Black epoxy resin river detail',
      'Food-safe hand-rubbed oil and wax finish',
      'Unique one-of-one character',
      'Suitable for serving and display',
    ],
    perfectFor: [
      'Charcuterie and cheese boards',
      'Entertaining and gifting',
      'Customers looking for a unique live edge piece',
      'Home décor with natural wood character',
    ],
    whyThisPiece:
      'Live edge walnut paired with a flowing epoxy river creates a striking serving piece that highlights the natural beauty of the timber — no two boards are ever the same.',
    careInstructions:
      'Hand wash only. Do not soak or place in dishwasher. Dry immediately and refresh with board oil or wax as needed.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'handmade-walnut-steak-board-two-cups',
    name: 'Handmade Walnut Steak Board with Two Cups',
    category: 'Serving Boards',
    price: 'CZK 3,037.77',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'American black walnut',
    materials: 'Wood',
    description:
      'Take your grilling and serving game to the next level with this solid American black walnut steak board. Designed for both function and style, it includes a deep juice groove to catch drippings, two stainless steel insert cups for sauces, salt, or pepper, and easy-grip handles for carrying straight from the grill to the table.',
    dimensions: 'Custom sizing / details coming soon',
    features: [
      'Handmade from premium American black walnut',
      'Juice groove helps keep your counter clean and tidy',
      'Two stainless steel insert cups, perfect for condiments, dips, salt, or pepper',
      'Built-in handles make it easy to lift and transport',
      'Food-safe finish with oil and wax',
      'Makes a perfect gift for BBQ enthusiasts, steak lovers, or home entertainers',
    ],
    careInstructions:
      'Hand wash only. Dry immediately. Oil regularly to maintain the walnut\'s rich finish.',
    whyThisPiece:
      'Bring elegance and practicality to your next steak night with this walnut steak serving board — where craftsmanship meets functionality.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'handmade-solid-oak-cutting-board',
    name: 'Handmade Solid Oak Cutting Board',
    category: 'Cutting Boards',
    collection: 'Available Pieces',
    price: 'CZK 2,025.18',
    status: 'Low in stock, only 2 left',
    publicationStatus: 'published',
    woodType: 'Solid European Oak',
    materials: 'Wood · Edge grain',
    badge: 'Available',
    buttonLabel: 'Buy on Etsy',
    galleryCount: 6,
    // TODO(Dominick): paste exact Etsy listing URL when ready
    // etsyUrl: '',
    shortDescription:
      'A strong, simple and timeless cutting board handcrafted from solid European oak. Designed for everyday chopping, slicing, food preparation and serving.',
    description:
      'Crafted from solid European oak, this handmade cutting board is built for reliable daily use while bringing natural warmth to the kitchen. Its durable edge-grain construction offers a practical cutting surface, while the natural grain ensures that every piece is unique.',
    longDescription:
      'Crafted from solid European oak, this handmade cutting board is built for reliable daily use while bringing natural warmth to the kitchen. Its durable edge-grain construction offers a practical cutting surface, while the natural grain ensures that every piece is unique.',
    dimensions: '38 × 25 × 2.5 cm',
    features: [
      'Handmade from solid European oak',
      'Durable edge-grain construction',
      'Natural grain variation makes each board unique',
      'Finished with food-safe oil and wax',
      'Suitable for chopping, slicing, meal preparation and serving',
      'Ideal as a wedding, housewarming or cooking gift',
    ],
    perfectFor: [
      'Everyday chopping and meal prep',
      'Serving bread, cheese, or snacks',
      'Wedding, housewarming, or cooking gifts',
      'A simple, timeless kitchen board',
    ],
    careInstructions:
      'Hand wash only. Never soak. Dry immediately after washing. Do not place in a dishwasher. Reapply board oil periodically.',
    whyThisPiece:
      'Handmade in the center of Prague with love and passion for wood. Slow wood — enjoy nature.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'walnut-wall-mount-bottle-opener',
    name: 'Walnut Wall Mount Bottle Opener',
    category: 'Wall Pieces',
    price: 'CZK 759.44',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'Walnut',
    materials: 'Wood and hardware',
    description:
      'A wall-mounted walnut bottle opener with solid hardware — a practical workshop accessory and a warm hardwood accent for kitchens, bars, or garages.',
    dimensions: 'Details coming soon',
    features: [
      'Handmade from walnut',
      'Wall-mounted bottle opener hardware',
      'Suitable for kitchen, bar, or workshop walls',
      'Handmade in the center of Prague',
    ],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'walnut-maple-wall-mount-bottle-opener',
    name: 'Walnut & Maple Wall Mount Bottle Opener',
    category: 'Wall Pieces',
    price: 'CZK 759.44',
    status: 'Low in stock, only 2 left',
    publicationStatus: 'published',
    woodType: 'Walnut and maple',
    materials: 'Wood',
    description:
      'Wall-mounted walnut and maple magnetic bottle opener. Perfect for wall décor or as a gift for friends and family. Possibility to custom laser engrave to make it truly unique. Send a message and custom engraving can be arranged.',
    dimensions: '26 × 11 × 2 cm',
    freeShipping: false,
    shippingNote: 'Ships from Czech Republic. Returns accepted within 30 days.',
  }),
  createProduct({
    id: 'maple-blue-epoxy-coasters',
    name: 'Maple with Blue Epoxy Coasters',
    category: 'Coasters',
    price: 'CZK 759.44',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'Maple and blue epoxy',
    materials: 'Wood and epoxy',
    description:
      'A set of maple coasters with blue epoxy detail — protective, food-safe finished hardwood accents for serving and everyday table use.',
    dimensions: 'Details coming soon',
    features: [
      'Handmade from maple with blue epoxy resin',
      'Protective finished surface for drinks',
      'Suitable for gifting or everyday use',
      'Handmade in the center of Prague',
    ],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'two-in-one-book-stand-serving-board',
    name: '2-in-1 Book Stand & Serving Board – Black Walnut, Maple and Mahogany',
    category: 'Serving Boards',
    price: 'CZK 2,531.48',
    status: 'Low in stock, only 1 left',
    publicationStatus: 'published',
    woodType: 'Black walnut, maple, and mahogany',
    materials: 'Wood',
    description:
      'Why settle for one function when you can have two? This handcrafted piece is both a stylish book or tablet stand and a serving board with handle. Perfect for kitchens, dining rooms, or cozy reading nooks.',
    dimensions: '475 × 170 × 25 mm (18.7" × 6.7" × 0.98")',
    features: [
      'Premium mix of black walnut, maple, and mahogany',
      'Sturdy design with a smooth, food-safe finish',
      'Use it as a cookbook or tablet stand while cooking',
      'Flip it down and use it as a serving board for charcuterie, cheese, or bread',
      'Elegant handle design with hanging hole for easy storage',
    ],
    perfectFor: ['Foodies', 'Home chefs', 'Book lovers', 'Thoughtful gifting'],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'handmade-oak-end-grain-cutting-board',
    name: 'Handmade Oak End Grain Cutting Board',
    category: 'Cutting Boards',
    collection: 'Available Pieces',
    price: 'CZK 2,911.20',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'Solid Oak',
    materials: 'Wood · End grain',
    badge: 'Available',
    buttonLabel: 'Buy on Etsy',
    galleryCount: 11,
    // TODO(Dominick): paste exact Etsy listing URL when ready
    // etsyUrl: '',
    shortDescription:
      'A handmade solid-oak end-grain cutting board featuring a distinctive geometric pattern, substantial butcher-block construction and a durable knife-friendly surface.',
    description:
      'Crafted from premium solid oak with a striking geometric end-grain pattern, this handmade cutting board combines durability, functionality and modern design. The rich natural tones and detailed layout make it both a practical kitchen tool and a beautiful countertop centrepiece.',
    longDescription:
      'Crafted from premium solid oak with a striking geometric end-grain pattern, this handmade cutting board combines durability, functionality and modern design. The rich natural tones and detailed layout make it both a practical kitchen tool and a beautiful countertop centrepiece.',
    dimensions: '35.5 × 27.5 cm',
    features: [
      'Handmade from premium solid oak',
      'Durable end-grain construction',
      'Distinctive geometric pattern',
      'Gentle on knife edges',
      'Thick butcher-block construction',
      'Sanded and finished by hand',
      'Treated with food-safe mineral oil and beeswax',
      'Suitable for food preparation, serving and charcuterie',
      'Each board has unique natural grain and colour variation',
      'Personalisation available',
    ],
    perfectFor: [
      'Everyday cooking and meal prep',
      'Serving charcuterie or appetizers',
      'Kitchen décor',
      'Housewarming or wedding gifts',
      'Professional or home chefs',
    ],
    whyEndGrain:
      'End-grain boards are valued for durability and their ability to better absorb knife impact. This helps reduce visible cutting marks and can be gentler on knife edges than conventional cutting surfaces.',
    careInstructions:
      'Hand wash only. Do not soak. Do not place in a dishwasher. Dry immediately. Reapply board oil periodically.',
    whyThisPiece:
      'Each board is handmade and one of a kind, with natural variations in grain and colour that make every piece unique. Personalisation is available on request.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'handmade-black-walnut-maple-end-grain-cutting-board',
    name: 'American Black Walnut & Maple End Grain Cutting Board',
    category: 'Cutting Boards',
    price: 'CZK 2,911.20',
    // Available so Shop All sorts this ahead of other Available boards (name A…).
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'Black walnut and hard maple',
    materials: 'Wood',
    description:
      'Bring craftsmanship and modern design into your kitchen with this handmade end grain cutting board crafted from premium black walnut and hard maple. Featuring a striking geometric inlay pattern and rich natural grain, this board is both a functional kitchen tool and a statement piece.',
    dimensions: '37.5 × 26 cm',
    etsyUrl: 'https://www.etsy.com/shop/DomsConcepts',
    features: [
      'Handmade from solid black walnut and hard maple',
      'Durable end grain construction helps protect knife edges',
      'Unique geometric pattern design',
      'Thick, heavy-duty butcher block style',
      'Smooth hand-finished surface',
      'Finished with food-safe mineral oil and beeswax',
      'Reversible design for extended use',
    ],
    perfectFor: [
      'Everyday meal prep',
      'Chopping and carving',
      'Serving charcuterie or appetizers',
      'Housewarming or wedding gifts',
      'Luxury kitchen décor',
    ],
    whyEndGrain:
      'End grain boards are preferred because the wood fibers absorb knife impact, helping preserve blade sharpness while reducing visible cut marks over time.',
    careInstructions:
      'Hand wash only. Do not soak or place in dishwasher. Reapply board oil periodically to maintain beauty and durability.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'beeswax-wood-wax-natural-wood-conditioner',
    name: 'Beeswax Wood Wax: Natural Wood Conditioner & Board Butter',
    category: 'Wood Care',
    price: 'CZK 252.89',
    status: 'Low in stock, only 5 left',
    publicationStatus: 'published',
    woodType: 'Beeswax conditioning blend',
    materials: 'Mineral oil, beeswax, carnauba wax',
    description:
      'Made from 100% food-safe materials. Food-grade mineral oil, natural beeswax, and carnauba wax.',
    dimensions: 'Details coming soon',
    careInstructions:
      'Rub it onto any surface. Buff on, let it sit for a while, then buff off.',
    features: [
      'Can be used for any surface that needs protection',
      'Works well on wood and metal surfaces',
    ],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'solid-oak-coat-hanger-black-metal-hooks',
    name: 'Solid Oak Coat Hanger with Black Metal Hooks',
    category: 'Wall Pieces',
    price: 'CZK 1,772.04',
    status: 'Available',
    publicationStatus: 'published',
    woodType: 'European oak',
    materials: 'Wood and hardware',
    description:
      'A solid oak wall coat hanger with black metal hooks — a durable entryway piece that pairs clean hardware with natural oak grain.',
    dimensions: 'Details coming soon',
    features: [
      'Handmade from solid European oak',
      'Black metal coat hooks',
      'Wall-mounted entryway storage',
      'Handmade in the center of Prague',
    ],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  listing(
    'oak-cutting-board-breadboard-black-lines',
    'Oak Cutting Board / Breadboard with Black Lines',
    'Breadboards',
    'CZK 1,772.04',
    'Available',
    'European oak',
    { publicationStatus: 'draft' },
  ),
  listing(
    'handcrafted-oak-cutting-board-small-set',
    'Handcrafted Oak Cutting Board – Small Set',
    'Cutting Boards',
    'CZK 1,772.04',
    'Available',
    'European oak',
    { publicationStatus: 'draft' },
  ),
  createProduct({
    id: 'handcrafted-oak-clock-stormy-grey-epoxy',
    name: 'Handcrafted Oak Clock with Stormy Grey Epoxy Accents',
    category: 'Wall Pieces',
    price: 'CZK 1,772.04',
    status: 'Low in stock, only 1 left',
    publicationStatus: 'published',
    woodType: 'Oak',
    materials: 'Wood',
    description:
      'Bring a touch of nature and modern design into your home with this unique oak clock.',
    dimensions: '29 cm',
    features: [
      'Solid oak wood showcasing natural grain and texture',
      'Elegant stormy grey epoxy detail adding depth and contrast',
      'Silent quartz movement — no ticking, just peace and style',
      'Perfect as a gift or statement piece for a living room, office, or kitchen',
      '1× AA battery included',
    ],
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  listing(
    'oak-end-grain-cutting-board-made-to-order',
    'Handmade Oak End Grain Cutting Board — Made to Order',
    'Cutting Boards',
    'CZK 2,029.11',
    'Made to order',
    'European oak',
    {
      publicationStatus: 'draft',
      description:
        'Handmade oak end grain cutting boards can be made to order in the Dom\'s Concepts workshop. More pieces are coming soon — enquire for lead time and sizing.',
      dimensions: 'Custom sizes available on request',
      freeShipping: false,
      shippingNote: 'Made to order. Shipping and returns confirmed per enquiry.',
    },
  ),
  listing(
    'edge-grain-cutting-board',
    'Edge Grain Cutting Board',
    'Cutting Boards',
    'Price on request',
    'Made to order',
    'Walnut or oak',
    {
      publicationStatus: 'draft',
      description:
        'An edge grain cutting board designed for everyday prep with a refined hardwood look. Made to order.',
      freeShipping: false,
      shippingNote: 'Made to order. Shipping and returns confirmed per enquiry.',
    },
  ),
  listing(
    'custom-logo-board',
    'Custom Logo Board',
    'Custom Orders',
    'Price on request',
    'Made to order',
    'Selected hardwoods',
    {
      publicationStatus: 'draft',
      description:
        'A custom board designed for logo engraving, gifting, or branded presentation.',
      freeShipping: false,
      shippingNote: 'Made to order. Shipping and returns confirmed per enquiry.',
      perfectFor: ['Brand gifting', 'Personalised commissions', 'Logo engraving projects'],
    },
  ),
  listing(
    'corporate-gift-boards',
    'Corporate Gift Boards',
    'Custom Orders',
    'From ___ CZK',
    'Made to order',
    'Selected hardwoods',
    {
      publicationStatus: 'draft',
      description:
        'A tailored set of branded or personalised boards for premium corporate gifting.',
      freeShipping: false,
      shippingNote: 'Made to order. Shipping and returns confirmed per enquiry.',
      perfectFor: ['Corporate gifting', 'Brand activations', 'Premium event sets'],
    },
  ),
  listing(
    'restaurant-boards',
    'Restaurant Boards',
    'Custom Orders',
    'From ___ CZK',
    'Made to order',
    'Selected hardwoods',
    {
      publicationStatus: 'draft',
      description:
        'Serving and presentation boards developed for hospitality and restaurant use.',
      freeShipping: false,
      shippingNote: 'Made to order. Shipping and returns confirmed per enquiry.',
      perfectFor: ['Hospitality service', 'Restaurant plating', 'Custom branded service boards'],
    },
  ),
  createProduct({
    id: 'sold-logo-engraved-corporate-board',
    name: 'Logo Engraved Corporate Board',
    category: 'Serving Boards',
    price: 'Price on request',
    status: 'Sold',
    woodType: 'Selected hardwoods',
    materials: 'Wood',
    mainImage: '/images/workshop-process.jpg',
    publicationStatus: 'draft',
    description:
      'A custom engraved corporate serving board made for branded gifting. Similar commissions available.',
    shortDescription:
      'Custom logo engraved board for corporate gifting. Sold — similar work on request.',
    dimensions: 'Custom size',
    badge: 'Sold',
    freeShipping: false,
    collection: 'Serving & Gift Pieces',
  }),
]

export const products: Product[] = rawProducts.map(applyRealImages)

function isValidPriceLabel(priceLabel: string) {
  const trimmed = priceLabel?.trim()
  if (!trimmed) return false
  if (/___/.test(trimmed)) return false
  if (/coming soon/i.test(trimmed)) return false
  return true
}

function isUnfinishedProductContent(product: Product) {
  if (product.description === PLACEHOLDER_DESCRIPTION) return true
  if (product.longDescription === PLACEHOLDER_DESCRIPTION) return true
  return false
}

function hasValidProductAction(product: Product) {
  return product.isAvailable || product.isSold
}

export function isPublished(product: Pick<Product, 'publicationStatus'>): boolean {
  return product.publicationStatus === 'published'
}

export function isPubliclyRoutable(product: Pick<Product, 'publicationStatus'>): boolean {
  return isPublished(product)
}

export function getPublicationCounts(items: Product[] = products) {
  return items.reduce(
    (counts, product) => {
      counts[product.publicationStatus] += 1
      return counts
    },
    { published: 0, draft: 0, archived: 0 } as Record<PublicationStatus, number>,
  )
}

export function getPublishedProducts(items: Product[] = products) {
  return items.filter(isPublished)
}

export function getProductById(productId: string, items: Product[] = products) {
  return items.find((product) => product.id === productId)
}

export function getProductBySlugOrId(identifier: string, items: Product[] = products) {
  return items.find(
    (product) => product.slug === identifier || product.id === identifier,
  )
}

export function getPublicProductById(productId: string, items: Product[] = products) {
  const product = getProductById(productId, items)
  if (!product || !isPubliclyRoutable(product)) {
    return undefined
  }
  return product
}

/** Alias for shop listing queries. */
export function getShopProducts(items: Product[] = products) {
  return sortProducts(items.filter(isShopGridVisible))
}

export function isShopGridVisible(product: Product): boolean {
  if (!isPublished(product)) {
    return false
  }

  if (product.isCustomOrder) {
    return false
  }

  if (!product.name?.trim()) {
    return false
  }

  const priceLabel = product.priceFrom || product.price
  if (!isValidPriceLabel(priceLabel)) {
    return false
  }

  if (!hasProductMainImage(product)) {
    return false
  }

  if (isUnfinishedProductContent(product)) {
    return false
  }

  if (!hasValidProductAction(product)) {
    return false
  }

  return true
}

export function sortProducts(items: Product[]) {
  return [...items].sort((left, right) => {
    const statusDifference =
      STATUS_SORT_ORDER[left.status] - STATUS_SORT_ORDER[right.status]

    if (statusDifference !== 0) {
      return statusDifference
    }

    return left.name.localeCompare(right.name)
  })
}

export const sortedProducts = sortProducts(products)

export const shopProducts = getShopProducts(products)

export function getShopCollections(items: Product[] = shopProducts): ProductCollection[] {
  const collections = new Set(items.map((product) => product.collection))
  return productCollections.filter((collection) => collections.has(collection))
}

/**
 * Homepage "Available This Week" cards — curated mix of boards, accessories,
 * care products and epoxy. Independent of Shop sorting order.
 * Keep Shop listing driven by publicationStatus + getShopProducts only.
 */
export const HOMEPAGE_FEATURED_PRODUCT_IDS = [
  'handmade-black-walnut-maple-end-grain-cutting-board',
  'handmade-walnut-steak-board-two-cups',
  'two-in-one-book-stand-serving-board',
  'european-oak-lux-blue-epoxy-serving-board',
  'walnut-maple-wall-mount-bottle-opener',
  'walnut-wall-mount-bottle-opener',
  'solid-oak-coat-hanger-black-metal-hooks',
  'maple-blue-epoxy-coasters',
  'natural-wood-butter-beeswax',
  'beeswax-wood-wax-natural-wood-conditioner',
] as const

/** Material folders under public/images/products/ — used for mobile homepage groups. */
export type ProductMaterialKey =
  | 'oak'
  | 'walnut'
  | 'epoxy'
  | 'specialties'
  | 'wood-care'

export const PRODUCT_MATERIAL_GROUPS: ReadonlyArray<{
  key: ProductMaterialKey
  label: string
}> = [
  { key: 'oak', label: 'Oak Pieces' },
  { key: 'walnut', label: 'Walnut Pieces' },
  { key: 'epoxy', label: 'Epoxy Pieces' },
  { key: 'specialties', label: 'Specialties' },
  { key: 'wood-care', label: 'Wood Care' },
]

const PRODUCT_MATERIAL_KEYS = new Set<string>(
  PRODUCT_MATERIAL_GROUPS.map((group) => group.key),
)

export function isProductMaterialKey(value: string | null | undefined): value is ProductMaterialKey {
  return Boolean(value && PRODUCT_MATERIAL_KEYS.has(value))
}

export function getProductMaterialKey(
  product: Pick<Product, 'id' | 'imageFolder'>,
): ProductMaterialKey | null {
  const folder = product.imageFolder || productImageFolders[product.id] || ''
  const top = folder.split('/')[0]
  return isProductMaterialKey(top) ? top : null
}

export function getAvailablePiecesMaterialHref(key: ProductMaterialKey) {
  return `/available-pieces?material=${encodeURIComponent(key)}`
}

export function getHomepageFeaturedProducts(items: Product[], limit = 10) {
  const visible = items.filter(isShopGridVisible)

  const featured = sortProducts(visible.filter((product) => product.featured))
  if (featured.length > 0) {
    return featured.slice(0, limit)
  }

  const byId = new Map(visible.map((product) => [product.id, product]))

  const curated = HOMEPAGE_FEATURED_PRODUCT_IDS.map((id) => byId.get(id)).filter(
    (product): product is Product => Boolean(product),
  )

  if (curated.length >= Math.min(limit, 8)) {
    return curated.slice(0, limit)
  }

  // Fallback: fill from remaining shop-visible published products.
  const curatedIds = new Set(curated.map((product) => product.id))
  const extras = visible.filter((product) => !curatedIds.has(product.id))

  return [...curated, ...extras].slice(0, limit)
}

/**
 * Mobile homepage "Available This Week" — shop-visible products grouped by
 * material folder, max `perGroup` cards each. Featured IDs surface first
 * within a group; remaining keep shop sort order.
 */
export function getHomepageMobileMaterialGroups(
  items: Product[] = shopProducts,
  perGroup = 3,
) {
  const visible = items.filter(isShopGridVisible)
  const featuredIndex = new Map(
    HOMEPAGE_FEATURED_PRODUCT_IDS.map((id, index) => [id, index]),
  )

  return PRODUCT_MATERIAL_GROUPS.flatMap(({ key, label }) => {
    const inGroup = visible.filter((product) => getProductMaterialKey(product) === key)
    if (inGroup.length === 0) return []

    const ordered = [...inGroup].sort((left, right) => {
      const leftFeatured = featuredIndex.has(left.id)
        ? featuredIndex.get(left.id)!
        : Number.POSITIVE_INFINITY
      const rightFeatured = featuredIndex.has(right.id)
        ? featuredIndex.get(right.id)!
        : Number.POSITIVE_INFINITY

      if (leftFeatured !== rightFeatured) {
        return leftFeatured - rightFeatured
      }

      return 0
    })

    return [
      {
        key,
        label,
        href: getAvailablePiecesMaterialHref(key),
        products: ordered.slice(0, perGroup),
        total: ordered.length,
        hasMore: ordered.length > perGroup,
      },
    ]
  })
}

if (import.meta.env.DEV) {
  const counts = getPublicationCounts()
  console.info(
    `[products] Published: ${counts.published} | Draft: ${counts.draft} | Archived: ${counts.archived}`,
  )
}
