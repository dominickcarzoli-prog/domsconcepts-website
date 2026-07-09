export type ProductStatus =
  | 'Available'
  | 'Reserved'
  | 'Sold'
  | 'Made to order'
  | 'Low in stock, only 1 left'
  | 'Low in stock, only 2 left'
  | 'Low in stock, only 5 left'

export type ProductCategory =
  | 'Cutting Boards'
  | 'Serving Boards'
  | 'Breadboards'
  | 'Wood Care'
  | 'Coasters'
  | 'Wall Pieces'
  | 'Epoxy Pieces'
  | 'Custom Orders'

export type Product = {
  id: string
  slug: string
  name: string
  category: ProductCategory
  description: string
  dimensions: string
  woodType: string
  materials?: string
  price: string
  status: ProductStatus
  shippingNote?: string
  mainImage: string
  galleryImages: string[]
  etsyUrl?: string
  requestCtaText: string
  freeShipping?: boolean
  features?: string[]
  perfectFor?: string[]
  whyThisPiece?: string
  whyEndGrain?: string
  careInstructions?: string
}

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

type ProductInput = Omit<Product, 'slug' | 'mainImage' | 'galleryImages' | 'requestCtaText'> & {
  galleryCount?: number
}

function createProduct(input: ProductInput): Product {
  const {
    galleryCount = 8,
    status,
    shippingNote,
    freeShipping,
    ...rest
  } = input

  return {
    ...rest,
    slug: input.id,
    status,
    shippingNote: shippingNote ?? DEFAULT_SHIPPING_NOTE,
    freeShipping: freeShipping ?? true,
    mainImage: imagePath(input.id, '01.jpg'),
    galleryImages: galleryFor(input.id, galleryCount),
    requestCtaText:
      status === 'Made to order' ? 'Request This Piece' : 'Reserve This Piece',
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

export const products: Product[] = [
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
  listing(
    'handmade-end-grain-walnut-breadboard',
    'Handmade End Grain Walnut Breadboard',
    'Breadboards',
    'CZK 2,029.11',
    'Available',
    'Walnut',
  ),
  listing(
    'walnut-live-edge-charcuterie-board',
    'Walnut Live Edge Charcuterie Board',
    'Serving Boards',
    'CZK 2,029.11',
    'Available',
    'Walnut',
  ),
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
      description:
        'Serving and presentation boards developed for hospitality and restaurant use.',
      freeShipping: false,
      shippingNote: 'Made to order. Shipping and returns confirmed per enquiry.',
      perfectFor: ['Hospitality service', 'Restaurant plating', 'Custom branded service boards'],
    },
  ),
]

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
