import productImageInventory from './product-image-inventory.json'

export type ProductStatus =
  | 'Available'
  | 'Reserved'
  | 'Sold'
  | 'Made to order'
  | 'Low in stock, only 1 left'
  | 'Low in stock, only 2 left'
  | 'Low in stock, only 5 left'

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
  hidden: boolean
  isDraft: boolean
  features?: string[]
  perfectFor?: string[]
  whyThisPiece?: string
  whyEndGrain?: string
  careInstructions?: string
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

type ProductImageInventory = Record<string, string[]>

const imageInventory = productImageInventory as ProductImageInventory

function isLikelyPlaceholderPath(imagePath: string) {
  return PLACEHOLDER_IMAGE_PATH_RE.test(imagePath)
}

export function getProductRealImages(product: Pick<Product, 'id' | 'galleryImages' | 'mainImage'>) {
  const fromInventory = imageInventory[product.id]
  if (fromInventory?.length) {
    return fromInventory
  }

  const candidates =
    product.galleryImages.length > 0 ? product.galleryImages : [product.mainImage]

  return candidates.filter(Boolean).filter((image) => !isLikelyPlaceholderPath(image))
}

export function hasProductMainImage(product: Pick<Product, 'id' | 'galleryImages' | 'mainImage'>) {
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
// Upload product images into public/images/products/{product.id}/
// Use filenames 01.jpg, 02.jpg, 03.jpg up to 08.jpg.
// The product id, URL slug, and image folder name must match exactly.
// Do not create new product image folders unless the product is added to this file.
// Inactive / made-to-order reference images live in _archive/ or _future/ subfolders.

const imagePath = (id: string, file: string) => `/images/products/${id}/${file}`

const galleryFor = (id: string, count = 8) =>
  Array.from({ length: count }, (_, index) =>
    imagePath(id, `${String(index + 1).padStart(2, '0')}.jpg`),
  )

// Legacy Etsy / old site URLs → current product id (also used as image folder name).
export const productIdRedirects: Record<string, string> = {
  'Walnut-steak-board-two-cups': 'handmade-walnut-steak-board-two-cups',
  'walnut-steak-board-two-cups': 'handmade-walnut-steak-board-two-cups',
  'epoxy-wall-clock': 'handcrafted-oak-clock-stormy-grey-epoxy',
  'epoxy-clock': 'handcrafted-oak-clock-stormy-grey-epoxy',
  'black-walnut-end-grain-board': 'handmade-black-walnut-maple-end-grain-cutting-board',
  'bottle-opener': 'walnut-wall-mount-bottle-opener',
}

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

export function getProductDetailHref(product: Pick<Product, 'id'>): string {
  return `/available-pieces/${product.id}`
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
      label: 'Request Similar Piece',
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
  if (product.isAvailable) {
    return {
      label: 'Ask a question / custom enquiry',
      href: getProductEnquiryHref(product),
      external: false,
    }
  }

  if (product.isSold) {
    return {
      label: 'Ask about this piece',
      href: getProductEnquiryHref(product),
      external: false,
    }
  }

  return {
    label: 'Ask a question',
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
  hidden?: boolean
  isDraft?: boolean
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
    hidden = false,
    isDraft = false,
    shortDescription,
    longDescription,
    priceFrom,
    mainImage: inputMainImage,
    ...rest
  } = input

  const isSold = status === 'Sold'
  const isCustomOrder = status === 'Made to order'
  const isAvailable = isPurchasableStatus(status)
  const resolvedCollection =
    collection ?? deriveCollection(input.category, status, input.name)
  const resolvedBadge = deriveBadge(status, input.category, badge)
  const resolvedMainImage = inputMainImage ?? imagePath(input.id, '01.jpg')
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
    mainImage: resolvedMainImage,
    image: resolvedMainImage,
    galleryImages: inputMainImage
      ? [inputMainImage]
      : galleryFor(input.id, galleryCount),
    etsyUrl: resolvedEtsyUrl,
    requestCtaText:
      status === 'Made to order' ? 'Request Custom Quote' : 'Buy on Etsy',
    isSold,
    isCustomOrder,
    isAvailable,
    careAddOnAvailable,
    featured,
    hidden,
    isDraft,
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
    'CZK 2,029.11',
    'Available',
    'Black walnut, oak, maple, and padouk',
  ),
  listing(
    'oak-maple-mahogany-strip-cutting-board',
    'Oak, Maple & Mahogany Strip Cutting Board',
    'Cutting Boards',
    'CZK 2,029.11',
    'Available',
    'Oak, maple, and mahogany',
  ),
  createProduct({
    id: 'american-walnut-maple-padouk-cutting-board',
    name: 'American Walnut, Maple & Padouk/Mahogany Cutting Board',
    category: 'Cutting Boards',
    price: 'CZK 2,029.11',
    status: 'Low in stock, only 1 left',
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
    price: 'CZK 3,043.67',
    status: 'Low in stock, only 1 left',
    woodType: 'European oak with lux blue epoxy resin',
    materials: 'Wood and epoxy resin',
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
    galleryCount: 7,
    badge: 'Available',
  }),
  createProduct({
    id: 'european-walnut-aztec-gold-epoxy-serving-board',
    name: 'European Walnut with Aztec Gold Epoxy Serving Board',
    category: 'Serving Boards',
    price: 'CZK 3,043.67',
    status: 'Low in stock, only 1 left',
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
  listing(
    'handmade-oak-epoxy-lego-brick-serving-board',
    'Handmade Oak & Epoxy LEGO Brick Serving Board',
    'Epoxy Pieces',
    'CZK 2,029.11',
    'Available',
    'Oak and epoxy',
    { materials: 'Wood and epoxy' },
  ),
  createProduct({
    id: 'natural-wood-butter-beeswax',
    name: 'Natural Wood Butter: Beeswax Wood Finish Conditioner',
    category: 'Wood Care',
    price: 'CZK 253.39',
    status: 'Low in stock, only 5 left',
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
    id: 'handmade-end-grain-walnut-breadboard',
    name: 'Handmade End Grain Walnut Breadboard',
    category: 'Breadboards',
    collection: 'Available Pieces',
    price: 'CZK 2,029.11',
    status: 'Available',
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
    price: 'CZK 2,029.11',
    status: 'Available',
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
    price: 'CZK 2,029.11',
    status: 'Available',
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
  listing(
    'handmade-solid-oak-cutting-board',
    'Handmade Solid Oak Cutting Board',
    'Cutting Boards',
    'CZK 2,029.11',
    'Available',
    'European oak',
  ),
  listing(
    'walnut-wall-mount-bottle-opener',
    'Walnut Wall Mount Bottle Opener',
    'Wall Pieces',
    'CZK 760.92',
    'Available',
    'Walnut',
    { materials: 'Wood and hardware' },
  ),
  createProduct({
    id: 'walnut-maple-wall-mount-bottle-opener',
    name: 'Walnut & Maple Wall Mount Bottle Opener',
    category: 'Wall Pieces',
    price: 'CZK 760.92',
    status: 'Low in stock, only 2 left',
    woodType: 'Walnut and maple',
    materials: 'Wood',
    description:
      'Wall-mounted walnut and maple magnetic bottle opener. Perfect for wall décor or as a gift for friends and family. Possibility to custom laser engrave to make it truly unique. Send a message and custom engraving can be arranged.',
    dimensions: '26 × 11 × 2 cm',
    freeShipping: false,
    shippingNote: 'Ships from Czech Republic. Returns accepted within 30 days.',
  }),
  listing(
    'maple-blue-epoxy-coasters',
    'Maple with Blue Epoxy Coasters',
    'Coasters',
    'CZK 1,014.56',
    'Available',
    'Maple and blue epoxy',
    { materials: 'Wood and epoxy' },
  ),
  createProduct({
    id: 'two-in-one-book-stand-serving-board',
    name: '2-in-1 Book Stand & Serving Board – Black Walnut, Maple and Mahogany',
    category: 'Serving Boards',
    price: 'CZK 2,536.39',
    status: 'Low in stock, only 1 left',
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
    price: 'CZK 2,029.11',
    status: 'Low in stock, only 1 left',
    woodType: 'Oak',
    materials: 'Wood',
    description:
      'Crafted from solid oak with a striking geometric end grain pattern, this handmade cutting board combines durability, functionality, and modern design. The rich natural wood tones and detailed layout make it both a practical kitchen tool and a beautiful countertop centerpiece.',
    dimensions: '35.5 × 27.5 cm',
    features: [
      'Handmade from premium solid oak',
      'Durable end grain construction',
      'Unique decorative pattern design',
      'Gentle on knife edges',
      'Thick butcher block style for stability',
      'Sanded smooth and finished by hand',
      'Treated with food-safe mineral oil and beeswax',
    ],
    perfectFor: [
      'Everyday cooking and meal prep',
      'Serving charcuterie or appetizers',
      'Kitchen décor',
      'Housewarming or wedding gifts',
      'Professional or home chefs',
    ],
    whyEndGrain:
      'End grain cutting boards are highly valued for their durability and self-healing properties. The wood fibers absorb knife impact, helping reduce wear on blades and minimizing visible cut marks.',
    careInstructions:
      'Hand wash only. Do not soak or place in dishwasher. Reapply board oil periodically to maintain the finish and longevity.',
    whyThisPiece:
      'Each board is handmade and one of a kind, with natural variations in grain and color that make every piece unique. This is the oak end grain board currently available from the workshop.',
    shippingNote: DEFAULT_SHIPPING_NOTE,
  }),
  createProduct({
    id: 'handmade-black-walnut-maple-end-grain-cutting-board',
    name: 'Handmade Black Walnut & Maple End Grain Cutting Board',
    category: 'Cutting Boards',
    price: 'CZK 2,029.11',
    status: 'Low in stock, only 1 left',
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
    price: 'CZK 253.39',
    status: 'Low in stock, only 5 left',
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
  listing(
    'solid-oak-coat-hanger-black-metal-hooks',
    'Solid Oak Coat Hanger with Black Metal Hooks',
    'Wall Pieces',
    'CZK 2,029.11',
    'Available',
    'European oak',
    { materials: 'Wood and hardware' },
  ),
  listing(
    'oak-cutting-board-breadboard-black-lines',
    'Oak Cutting Board / Breadboard with Black Lines',
    'Breadboards',
    'CZK 2,029.11',
    'Available',
    'European oak',
  ),
  listing(
    'handcrafted-oak-cutting-board-small-set',
    'Handcrafted Oak Cutting Board – Small Set',
    'Cutting Boards',
    'CZK 2,029.11',
    'Available',
    'European oak',
    { hidden: true },
  ),
  createProduct({
    id: 'handcrafted-oak-clock-stormy-grey-epoxy',
    name: 'Handcrafted Oak Clock with Stormy Grey Epoxy Accents',
    category: 'Wall Pieces',
    price: 'CZK 2,029.11',
    status: 'Low in stock, only 1 left',
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
      hidden: true,
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
      hidden: true,
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
      hidden: true,
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
      hidden: true,
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
      hidden: true,
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
    hidden: true,
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

export function isShopGridVisible(product: Product): boolean {
  if (product.hidden || product.isDraft) {
    return false
  }

  if (product.isCustomOrder) {
    return false
  }

  if (!product.name?.trim()) {
    return false
  }

  const priceLabel = product.priceFrom || product.price
  if (!priceLabel?.trim()) {
    return false
  }

  if (!hasProductMainImage(product)) {
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

export const shopProducts = sortProducts(products.filter(isShopGridVisible))

export function getShopCollections(items: Product[] = shopProducts): ProductCollection[] {
  const collections = new Set(items.map((product) => product.collection))
  return productCollections.filter((collection) => collections.has(collection))
}

export function getHomepageFeaturedProducts(items: Product[], limit = 8) {
  const visible = items.filter(isShopGridVisible)
  const available = visible.filter((piece) => piece.isAvailable)
  const sold = visible.filter((piece) => piece.isSold)

  return [...available, ...sold].slice(0, limit)
}
