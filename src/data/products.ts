export type ProductStatus =
  | 'Available'
  | 'Reserved'
  | 'Sold'
  | 'Made to order'
  | 'Low in stock, only 1 left'

export type ProductCategory =
  | 'Cutting Boards'
  | 'Serving Boards'
  | 'Wood Care'
  | 'Coasters'
  | 'Wall Pieces'
  | 'Epoxy Pieces'
  | 'Custom Orders'

export type Product = {
  id: string
  name: string
  category: ProductCategory
  description: string
  dimensions: string
  woodType: string
  materials?: string
  price: string
  status: ProductStatus
  mainImage: string
  galleryImages: string[]
  etsyUrl?: string
  requestCtaText: string
  features?: string[]
  perfectFor?: string[]
  whyThisPiece?: string
  whyEndGrain?: string
  careInstructions?: string
  returnsShippingNote?: string
}

export const productCategories: ProductCategory[] = [
  'Cutting Boards',
  'Serving Boards',
  'Wood Care',
  'Coasters',
  'Wall Pieces',
  'Epoxy Pieces',
  'Custom Orders',
]

function productGallery(folder: string) {
  return [
    `/images/products/${folder}/01.jpg`,
    `/images/products/${folder}/02.jpg`,
    `/images/products/${folder}/03.jpg`,
    `/images/products/${folder}/04.jpg`,
    `/images/products/${folder}/05.jpg`,
    `/images/products/${folder}/06.jpg`,
    `/images/products/${folder}/07.jpg`,
    `/images/products/${folder}/08.jpg`,
  ]
}

export const products: Product[] = [
  {
    id: 'black-walnut-end-grain-board',
    name: 'Handmade Black Walnut & Maple End Grain Cutting Board',
    category: 'Cutting Boards',
    description:
      'Bring craftsmanship and modern design into your kitchen with this handmade end grain cutting board crafted from premium black walnut and hard maple. Featuring a striking geometric inlay pattern and rich natural grain, this board is both a functional kitchen tool and a statement piece.',
    dimensions: '37.5 × 26 cm',
    woodType: 'Black walnut and hard maple',
    materials: 'Wood',
    price: 'CZK 2,029.11',
    status: 'Low in stock, only 1 left',
    mainImage: '/images/products/black-walnut-end-grain-board/01.jpg', // Replace with the primary black walnut board photo.
    galleryImages: productGallery('black-walnut-end-grain-board'),
    etsyUrl: 'https://www.etsy.com/shop/DomsConcepts',
    requestCtaText: 'Reserve This Piece',
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
    returnsShippingNote: 'Returns accepted within 30 days.',
  },
  {
    id: 'oak-end-grain-board',
    name: 'Oak End Grain Cutting Board',
    category: 'Cutting Boards',
    description: 'A heavier oak board with a clean handmade finish and a classic end grain pattern.',
    dimensions: 'Custom / varies',
    woodType: 'European oak',
    materials: 'Wood',
    price: 'Price on request',
    status: 'Available',
    mainImage: '/images/products/oak-end-grain-board/01.jpg', // Replace with the primary oak end grain board photo.
    galleryImages: productGallery('oak-end-grain-board'),
    requestCtaText: 'Reserve This Piece',
    features: ['End grain hardwood construction', 'Finished by hand', 'Made for kitchen prep and serving'],
    perfectFor: ['Everyday kitchen use', 'Gift orders', 'Premium countertop presentation'],
    careInstructions: 'Hand wash and dry promptly. Refresh with board oil or wood butter as needed.',
  },
  {
    id: 'edge-grain-cutting-board',
    name: 'Edge Grain Cutting Board',
    category: 'Cutting Boards',
    description: 'An edge grain cutting board designed for everyday prep with a refined hardwood look.',
    dimensions: 'Custom / varies',
    woodType: 'Walnut or oak',
    materials: 'Wood',
    price: 'Price on request',
    status: 'Made to order',
    mainImage: '/images/products/oak-end-grain-board/01.jpg', // Replace with the dedicated edge grain board photo.
    galleryImages: productGallery('oak-end-grain-board'),
    requestCtaText: 'Request This Piece',
    features: ['Slimmer edge grain profile', 'Refined hardwood finish', 'Made to order sizing available'],
    perfectFor: ['Daily prep work', 'Compact kitchens', 'Personalised orders'],
  },
  {
    id: 'serving-board',
    name: 'Serving Board',
    category: 'Serving Boards',
    description: 'A serving board for table presentation, gifting, and hospitality use.',
    dimensions: 'Custom / varies',
    woodType: 'Walnut or oak',
    materials: 'Wood',
    price: 'Price on request',
    status: 'Available',
    mainImage: '/images/products/serving-board/01.jpg', // Replace with the serving board primary photo.
    galleryImages: productGallery('serving-board'),
    requestCtaText: 'Reserve This Piece',
    features: ['Made for table presentation', 'Hand-finished hardwood surface', 'Balanced for gifting or hosting'],
    perfectFor: ['Serving cheese and charcuterie', 'Hosting', 'Gift pieces'],
  },
  {
    id: 'breadboard-set',
    name: 'Breadboard Set',
    category: 'Serving Boards',
    description: 'A warm hardwood breadboard set made for serving, slicing, and display.',
    dimensions: 'Custom / varies',
    woodType: 'Oak or mixed hardwoods',
    materials: 'Wood',
    price: 'Price on request',
    status: 'Made to order',
    mainImage: '/images/products/breadboard-set/01.jpg', // Replace with the breadboard set primary photo.
    galleryImages: productGallery('breadboard-set'),
    requestCtaText: 'Request This Piece',
    perfectFor: ['Bread service', 'Breakfast tables', 'Custom gift sets'],
  },
  {
    id: 'coaster-set',
    name: 'Coaster Set',
    category: 'Coasters',
    description: 'A handmade coaster set for home use, gifting, or hospitality tables.',
    dimensions: 'Custom / varies',
    woodType: 'Walnut, oak, or mixed hardwoods',
    materials: 'Wood',
    price: 'Price on request',
    status: 'Available',
    mainImage: '/images/products/coaster-set/01.jpg', // Replace with the coaster set primary photo.
    galleryImages: productGallery('coaster-set'),
    requestCtaText: 'Reserve This Piece',
    perfectFor: ['Coffee tables', 'Hospitality use', 'Small gifting'],
  },
  {
    id: 'wall-mounted-bottle-opener',
    name: 'Wall-Mounted Bottle Opener',
    category: 'Wall Pieces',
    description: 'A compact wall piece combining practical use with a handmade hardwood finish.',
    dimensions: 'Custom / varies',
    woodType: 'Oak or walnut',
    materials: 'Wood and hardware',
    price: 'Price on request',
    status: 'Made to order',
    mainImage: '/images/products/bottle-opener/01.jpg', // Replace with the bottle opener primary photo.
    galleryImages: productGallery('bottle-opener'),
    requestCtaText: 'Request This Piece',
  },
  {
    id: 'oak-coat-hanger',
    name: 'Oak Coat Hanger',
    category: 'Wall Pieces',
    description: 'A simple hardwood wall piece designed for practical entryway use and clean visual lines.',
    dimensions: 'Custom / varies',
    woodType: 'Oak',
    materials: 'Wood and hardware',
    price: 'Price on request',
    status: 'Made to order',
    mainImage: '/images/products/oak-coat-hanger/01.jpg', // Replace with the oak coat hanger primary photo.
    galleryImages: productGallery('oak-coat-hanger'),
    requestCtaText: 'Request This Piece',
  },
  {
    id: 'epoxy-oak-clock',
    name: 'Epoxy Oak Clock',
    category: 'Epoxy Pieces',
    description: 'A selected epoxy wall piece combining oak with a darker resin accent.',
    dimensions: 'Custom / varies',
    woodType: 'Oak and epoxy',
    materials: 'Wood and epoxy',
    price: 'Price on request',
    status: 'Made to order',
    mainImage: '/images/products/epoxy-clock/01.jpg', // Replace with the epoxy clock primary photo.
    galleryImages: productGallery('epoxy-clock'),
    requestCtaText: 'Request This Piece',
    whyThisPiece: 'A functional wall piece with a warmer handmade character than mass-produced clocks.',
  },
  {
    id: 'epoxy-serving-board',
    name: 'Epoxy Serving Board',
    category: 'Epoxy Pieces',
    description: 'A serving board with a richer epoxy detail while keeping a handcrafted hardwood base.',
    dimensions: 'Custom / varies',
    woodType: 'Walnut or oak with epoxy',
    materials: 'Wood and epoxy',
    price: 'Price on request',
    status: 'Available',
    mainImage: '/images/products/epoxy-serving-board/01.jpg', // Replace with the epoxy serving board primary photo.
    galleryImages: productGallery('epoxy-serving-board'),
    requestCtaText: 'Reserve This Piece',
    perfectFor: ['Statement serving', 'Gift commissions', 'Feature table pieces'],
  },
  {
    id: 'wood-butter-board-conditioner',
    name: 'Wood Butter / Board Conditioner',
    category: 'Wood Care',
    description: 'A care product for refreshing boards, serving pieces, and other hardwood surfaces.',
    dimensions: 'Jar size placeholder',
    woodType: 'Board care blend',
    materials: 'Conditioning blend',
    price: 'Price on request',
    status: 'Available',
    mainImage: '/images/products/wood-butter/01.jpg', // Replace with the wood butter primary product photo.
    galleryImages: productGallery('wood-butter'),
    requestCtaText: 'Reserve This Piece',
    features: ['Designed for routine board maintenance', 'Helps refresh hardwood tone', 'Made for repeated care use'],
    perfectFor: ['Board care kits', 'Repeat customers', 'Kitchen maintenance'],
    careInstructions: 'Apply lightly to a clean dry surface and buff after absorption.',
  },
  {
    id: 'custom-logo-board',
    name: 'Custom Logo Board',
    category: 'Custom Orders',
    description: 'A custom board designed for logo engraving, gifting, or branded presentation.',
    dimensions: 'Custom / varies',
    woodType: 'Selected hardwoods',
    materials: 'Wood',
    price: 'Price on request',
    status: 'Made to order',
    mainImage: '/images/products/black-walnut-end-grain-board/01.jpg', // Replace with the custom logo board primary photo.
    galleryImages: productGallery('black-walnut-end-grain-board'),
    requestCtaText: 'Request This Piece',
    perfectFor: ['Brand gifting', 'Personalised commissions', 'Logo engraving projects'],
  },
  {
    id: 'corporate-gift-boards',
    name: 'Corporate Gift Boards',
    category: 'Custom Orders',
    description: 'A tailored set of branded or personalised boards for premium corporate gifting.',
    dimensions: 'Custom / varies',
    woodType: 'Selected hardwoods',
    materials: 'Wood',
    price: 'From ___ CZK',
    status: 'Made to order',
    mainImage: '/images/products/serving-board/01.jpg', // Replace with the corporate gift boards primary photo.
    galleryImages: productGallery('serving-board'),
    requestCtaText: 'Request This Piece',
    perfectFor: ['Corporate gifting', 'Brand activations', 'Premium event sets'],
  },
  {
    id: 'restaurant-boards',
    name: 'Restaurant Boards',
    category: 'Custom Orders',
    description: 'Serving and presentation boards developed for hospitality and restaurant use.',
    dimensions: 'Custom / varies',
    woodType: 'Selected hardwoods',
    materials: 'Wood',
    price: 'From ___ CZK',
    status: 'Made to order',
    mainImage: '/images/products/serving-board/01.jpg', // Replace with the restaurant board primary photo.
    galleryImages: productGallery('serving-board'),
    requestCtaText: 'Request This Piece',
    perfectFor: ['Hospitality service', 'Restaurant plating', 'Custom branded service boards'],
  },
]
