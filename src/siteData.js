import { ETSY_SHOP_URL, products } from './data/products.ts'

export const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Shop the Collection', path: '/available-pieces' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Custom Orders', path: '/custom-orders' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export const featuredCategories = [
  {
    name: 'End Grain Cutting Boards',
    image: '/images/end-grain-board.jpg', // Replace with the end grain category photo.
  },
  {
    name: 'Edge Grain Cutting Boards',
    image: '/images/edge-grain-board.jpg', // Replace with the edge grain category photo.
  },
  {
    name: 'Butcher Blocks',
    image: '/images/butcher-block.jpg', // Replace with the butcher block category photo.
  },
  {
    name: 'Serving Boards',
    image: '/images/serving-board.jpg', // Replace with the serving board category photo.
  },
  {
    name: 'Breadboards',
    image: '/images/serving-board.jpg', // Replace with a dedicated breadboard photo later if desired.
  },
  {
    name: 'Coasters',
    image: '/images/coaster-set.jpg', // Replace with the coaster set photo.
  },
  {
    name: 'Wall-Mounted Bottle Openers',
    image: '/images/workshop-process.jpg', // Replace with the bottle opener product photo.
  },
  {
    name: 'Wood Butter / Board Conditioner',
    image: '/images/wood-butter.jpg', // Replace with the wood butter product photo.
  },
  {
    name: 'Epoxy Serving Boards',
    image: '/images/epoxy-piece.jpg', // Replace with the epoxy serving board photo.
  },
  {
    name: 'Custom Logo Pieces',
    image: '/images/workshop-process.jpg', // Replace with a custom logo commission photo.
  },
  {
    name: 'Corporate Gifts and Restaurant Boards',
    image: '/images/partner-tools.jpg', // Replace with a hospitality or gifting photo.
  },
]

// Carousel images are portfolio/hero images, not product inventory images.
export const homepageCarouselSlides = [
  {
    id: 'kitchen-board',
    image: '/images/carousel/premium-cutting-boards.jpg',
    label: 'Kitchen board on counter',
    fallbackImage: '/images/serving-board.jpg',
  },
  {
    id: 'knife-table',
    image: '/images/carousel/knife-table.jpg',
    label: 'Knife table',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'dining-table',
    image: '/images/carousel/dining-table.jpg',
    label: 'Dining table',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'tv-table-media-console',
    image: '/images/carousel/tv-table-media-console.jpg',
    label: 'TV table / media console',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'side-table',
    image: '/images/carousel/side-table.jpg',
    label: 'Side table',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'bed-bedroom-piece',
    image: '/images/carousel/bed-bedroom-piece.jpg',
    label: 'Bed / bedroom piece',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
]

export const workshopAboutImagePath = '/images/workshop-placeholder.png'
export const makerAboutImagePath = '/images/about/dominick-in-workshop.jpg'
export const aboutMakerPortraitPath = '/images/about/dominick-maker.jpg'

export const signaturePieces = [
  {
    id: 'american-walnut-media-console',
    name: 'American Walnut Media Console',
    subtitle: 'TV Table / Media Console',
    description:
      'A custom media console featuring a solid American walnut top and steamed European walnut drawer fronts. The drawers use soft-close, push-to-open hardware for a clean exterior without visible handles.',
    image: '/images/signature/signature-tv-console.jpg',
    objectPosition: 'center center',
    imageScale: 0.92,
    galleryHash: 'american-walnut-media-console',
    featured: false,
  },
  {
    id: 'solid-oak-bed',
    name: 'Solid Oak Bed',
    description:
      'A 2 × 2 metre bed built around a custom-designed steel frame, fabricated and powder-coated before being clad in solid oak slabs. Selected live edges were preserved to add natural character and contrast to the clean steel structure.',
    image: '/images/signature/signature-oak-bed.jpg',
    objectPosition: 'center 42%',
    imageScale: 0.92,
    galleryHash: 'solid-oak-bed',
    featured: true,
  },
  {
    id: 'solid-black-walnut-dining-table',
    name: 'Solid Black Walnut Dining Table',
    description:
      'A solid black walnut dining table paired with custom powder-coated steel legs, designed to showcase the natural grain and warmth of the timber.',
    image: '/images/signature/signature-walnut-dining-table.jpg',
    objectPosition: 'center 55%',
    imageScale: 0.92,
    galleryHash: 'solid-black-walnut-dining-table',
    featured: true,
  },
  {
    id: 'walnut-maple-chessboard',
    name: 'Walnut & Maple Chessboard',
    description:
      'A handcrafted walnut and maple board-game piece with contrasting hardwoods, precise grid work, and a refined edge profile — built as a display piece and heirloom gift.',
    image: '/images/signature/signature-walnut-maple-chessboard.jpg',
    objectPosition: 'center center',
    imageScale: 1,
    galleryHash: 'walnut-maple-chessboard',
    featured: true,
  },
  {
    id: 'sakuro-knife-table',
    name: 'Custom Knife Table for Sakuro.cz',
    description:
      'A one-of-one knife display table created for Sakuro.cz. A knife and sharpening tool were suspended inside an epoxy river running through a dark brown stained oak tabletop.',
    image: '/images/signature/signature-knife-table.jpg',
    objectPosition: 'center 58%',
    imageScale: 0.9,
    galleryHash: 'custom-knife-table-sakuro',
    featured: true,
  },
  {
    id: 'whiskey-wednesday-serving-tray',
    name: 'Whiskey Wednesday Serving Tray',
    subtitle: "Max's Steakhouse",
    description:
      "A custom serving tray made for Max's Steakhouse and its Whiskey Wednesday club. The finished piece remains in use and can be seen in person at the restaurant.",
    image: '/images/signature/signature-maxs-whiskey-tray.jpg',
    objectPosition: 'center center',
    imageScale: 0.92,
    galleryHash: 'whiskey-wednesday-serving-tray',
    featured: false,
  },
]

/** Homepage Signature Work — four permanent featured projects (no carousel). */
export const featuredSignaturePieces = [
  'solid-black-walnut-dining-table',
  'solid-oak-bed',
  'walnut-maple-chessboard',
  'sakuro-knife-table',
]
  .map((id) => signaturePieces.find((piece) => piece.id === id))
  .filter(Boolean)

export const pastCustomPieces = [
  {
    id: 'past-aztec-gold-serving-board',
    name: 'European Walnut Aztec Gold Serving Board',
    image: '/images/past-custom/aztec-gold-serving-board.jpg',
    fallbackImage: '/images/epoxy-piece.jpg',
  },
  {
    id: 'past-restaurant-board-set',
    name: 'Restaurant Board Set',
    image: '/images/past-custom/restaurant-board-set.jpg',
    fallbackImage: '/images/serving-board.jpg',
  },
  {
    id: 'past-logo-engraved-board',
    name: 'Logo Engraved Corporate Board',
    image: '/images/past-custom/logo-engraved-board.jpg',
    fallbackImage: '/images/workshop-process.jpg',
  },
]

export { homepageReviews as premiumReviews } from './data/reviews'

export const etsyTrustPoints = [
  'Secure Etsy checkout',
  'Verified reviews',
  'Handmade in Prague',
  'Custom orders available',
]

export const customProductTypes = [
  'Cutting board',
  'Butcher block',
  'Serving board / tray',
  'Epoxy piece',
  'Furniture / table',
  'Corporate gift',
  'Restaurant boards',
  'Other custom piece',
]

export const customOrderSteps = [
  'Choose the piece',
  'Choose wood and size',
  'Add engraving or logo',
  'Receive a personal quote',
  'Handmade and delivered',
]

export const availablePieces = [
  {
    name: 'Black Walnut End Grain Board',
    dimensions: 'Dimensions placeholder',
    wood: 'Black walnut',
    price: 'Price on request',
    status: 'Available',
    image: '/images/end-grain-board.jpg', // Replace with the black walnut end grain product photo.
  },
  {
    name: 'Oak End Grain Cutting Board',
    dimensions: 'Dimensions placeholder',
    wood: 'European oak',
    price: 'Price on request',
    status: 'Reserved',
    image: '/images/edge-grain-board.jpg', // Replace with the oak board product photo.
  },
  {
    name: 'Serving Board',
    dimensions: 'Dimensions placeholder',
    wood: 'Walnut or oak',
    price: 'Price on request',
    status: 'Available',
    image: '/images/serving-board.jpg', // Replace with the serving board product photo.
  },
  {
    name: 'Wood Butter / Board Conditioner',
    dimensions: 'Jar size placeholder',
    wood: 'Board care blend',
    price: 'Price on request',
    status: 'Available',
    image: '/images/wood-butter.jpg', // Replace with the wood butter product photo.
  },
]

export const partnerItems = [
  {
    name: 'IGM',
    description:
      'Professional woodworking tools and workshop equipment used throughout the Dom\'s Concepts studio.',
    url: 'https://igmtools.com/',
    logo: '/images/partners/igm.png',
    logoClass: 'partner-logo--igm',
    fallbackInitial: 'IGM',
    fallbackName: 'IGM',
  },
  {
    name: 'Mirka',
    description:
      'Abrasives and dust-free sanding systems for smooth, refined hardwood surfaces.',
    url: 'https://www.mirka.com/en/',
    logo: '/images/partners/mirka.png',
    logoClass: 'partner-logo--mirka',
    fallbackInitial: 'M',
    fallbackName: 'Mirka',
  },
  {
    name: 'Rubio Monocoat',
    description:
      'Hardwax oil and finish systems for durable, natural wood protection.',
    url: 'https://www.rubiomonocoat.com/en',
    logo: '/images/partners/rubio-monocoat.png',
    logoClass: 'partner-logo--rubio',
    logoWrapClass: 'partner-logo-wrap--light',
    fallbackInitial: 'RM',
    fallbackName: 'Rubio Monocoat',
  },
  {
    name: 'Sakuro',
    description:
      'Workshop supplies and tooling from a trusted Czech partner.',
    url: 'https://www.sakuro.cz/',
    logo: '/images/partners/sakuro.png',
    logoClass: 'partner-logo--sakuro',
    logoWrapClass: 'partner-logo-wrap--light',
    fallbackInitial: 'S',
    fallbackName: 'Sakuro',
  },
  {
    name: 'Kraftprotz',
    description:
      'Specialty wood treatment products for conditioning and surface care.',
    url: 'https://www.arka-biotech.de/en/products/kraftprotz-universal',
    logo: '/images/partners/kraftprotz.png',
    logoClass: 'partner-logo--kraftprotz',
    fallbackInitial: 'K',
    fallbackName: 'Kraftprotz',
  },
  {
    name: 'Sortwall',
    description:
      'Workshop collaborator supporting Dom\'s Concepts projects and finishes.',
    url: 'SORTWALL_URL_PLACEHOLDER',
    logo: '/images/partners/sortwall.png',
    logoClass: 'partner-logo--sortwall',
    logoWrapClass: 'partner-logo-wrap--light',
    fallbackInitial: 'S',
    fallbackName: 'Sortwall',
  },
  {
    name: 'Iluka Designs',
    description:
      'Design collaborator connected to custom work and creative workshop projects.',
    url: 'ILUKA_DESIGNS_URL_PLACEHOLDER',
    logo: '/images/partners/iluka-designs-logo.png',
    logoClass: 'partner-logo--iluka',
    fallbackInitial: 'ID',
    fallbackName: 'Iluka Designs',
  },
  {
    name: 'Bleispitz',
    description:
      'European workshop tools and equipment trusted for precision craft work.',
    url: 'https://bleispitz.de/en',
    logo: '/images/partners/bleispitz.png',
    logoClass: 'partner-logo--bleispitz',
    fallbackInitial: 'B',
    fallbackName: 'Bleispitz',
  },
]

export const careGuidePoints = [
  {
    title: 'How to clean your board',
    text: 'Wash by hand with mild soap and warm water after use, then rinse lightly without soaking the wood.',
  },
  {
    title: 'How to dry it',
    text: 'Dry the surface immediately with a towel and let the board finish air-drying upright or with airflow around both sides.',
  },
  {
    title: 'How often to oil/wax',
    text: 'Refresh the finish regularly with Dom’s Concepts wood butter or board conditioner whenever the surface looks dry or feels less smooth.',
  },
  {
    title: 'What not to do',
    text: 'Do not place it in a dishwasher, leave it soaking, store it near direct heat, or trap moisture underneath for long periods.',
  },
]

export const shippingOptions = ['Pickup in Prague', 'Shipping']

export const woodPreferences = [
  'No preference yet',
  'Walnut',
  'Oak',
  'Maple',
  'Ash',
  'Mixed hardwoods',
]

export const engravingOptions = ['Yes', 'No']

export const budgetRanges = [
  'Under 2 500 CZK',
  '2 500 - 5 000 CZK',
  '5 000 - 10 000 CZK',
  '10 000 CZK+',
]

export const faqItems = [
  {
    question: 'Do you make custom sizes?',
    answer:
      'Yes. Most boards and serving pieces can be made to a custom length, width, and thickness after a short consultation.',
  },
  {
    question: 'Can you engrave logos?',
    answer:
      'Yes. Logo engraving and personalised text are available on selected pieces for gifts, brands, and hospitality projects.',
  },
  {
    question: 'How long does a custom order take?',
    answer:
      'Timelines depend on the piece and current workshop schedule. A personal quote will include an estimated lead time.',
  },
  {
    question: 'Do you ship or offer pickup in Prague?',
    answer:
      'Both are possible. Pickup in Prague can be arranged, and shipping is available for many ready and made-to-order pieces.',
  },
  {
    question: 'How do I care for a wooden board?',
    answer:
      'Hand wash, dry promptly, and refresh the surface with wood butter or board conditioner when it starts to look dry.',
  },
  {
    question: 'Can I order wood butter separately?',
    answer:
      'Yes. Wood butter and natural board conditioner are available as standalone products from the available pieces collection.',
  },
]

export const legalPages = [
  {
    slug: 'terms',
    path: '/terms',
    title: 'Terms & Conditions',
    intro: 'Placeholder terms for reservations, enquiries, and workshop services.',
    body: [
      'Dom\'s Concepts provides handmade woodworking pieces through direct enquiry, reservation, and custom order flows.',
      'Full legal wording will be added before full checkout/payment launch.',
      'Until then, all orders, timelines, and delivery details are confirmed personally by email.',
    ],
  },
  {
    slug: 'privacy',
    path: '/privacy',
    title: 'Privacy Policy',
    intro: 'How contact details and enquiry information are handled.',
    body: [
      'When you send an enquiry, Dom\'s Concepts may store your name, email, phone number, and project details to respond and prepare a quote.',
      'Full legal wording will be added before full checkout/payment launch.',
      'No payment card data is collected on this website at this stage.',
    ],
  },
  {
    slug: 'returns',
    path: '/returns',
    title: 'Returns & Custom Orders',
    intro: 'Placeholder guidance for ready pieces and made-to-order work.',
    body: [
      'Ready pieces and custom commissions may have different return conditions depending on the item and production stage.',
      'Full legal wording will be added before full checkout/payment launch.',
      'Custom-made pieces are generally non-returnable once production has started unless otherwise agreed in writing.',
    ],
  },
  {
    slug: 'shipping-pickup',
    path: '/shipping-pickup',
    title: 'Shipping / Pickup',
    intro: 'How delivery and Prague pickup are arranged.',
    body: [
      'Pickup in Prague can be coordinated after a piece is reserved or completed.',
      'Shipping options and costs depend on the size, weight, and destination of each piece.',
      'Full legal wording will be added before full checkout/payment launch.',
    ],
  },
]

export const pageSeo = {
  home: {
    title: 'Dom\'s Concepts | Handmade Woodworking in Prague',
    description:
      'Handmade cutting boards, serving pieces and one-of-one hardwood creations, crafted in Prague by Dom\'s Concepts.',
  },
  availablePieces: {
    title: 'Shop the Collection | Dom\'s Concepts',
    description:
      'Browse handmade boards, serving pieces, wood care, and workshop pieces available through Etsy from Dom\'s Concepts in Prague.',
  },
  customOrders: {
    title: 'Custom Orders | Dom\'s Concepts',
    description:
      'Request a custom cutting board, serving piece, engraved gift, or hospitality project with personal sizing and wood selection.',
  },
  careGuide: {
    title: 'Care Guide | Dom\'s Concepts',
    description:
      'Learn how to clean, dry, oil, and maintain hardwood boards and serving pieces from Dom\'s Concepts.',
  },
  about: {
    title: 'About | Dom\'s Concepts',
    description:
      'Dom\'s Concepts is a small Prague workshop crafting honest handmade wood and epoxy pieces since 2016.',
  },
  faq: {
    title: 'FAQ | Dom\'s Concepts',
    description:
      'Answers about custom sizes, engraving, lead times, shipping, pickup, board care, and wood butter from Dom\'s Concepts.',
  },
  reviews: {
    title: 'Customer Reviews | Dom\'s Concepts',
    description:
      'Real Etsy feedback from customers who have ordered cutting boards, gifts, and workshop care products from Dom\'s Concepts in Prague.',
  },
  gallery: {
    title: 'Past Projects | Dom\'s Concepts',
    description:
      'A look back at furniture, serving pieces and one-of-one creations handmade by Dom\'s Concepts in Prague since 2016.',
  },
}

export const boardCareUpsellCategories = [
  'Cutting Boards',
  'Serving Boards',
  'Breadboards',
  'Epoxy Pieces',
  'Coasters',
]

export const boardCarePricing = {
  normalPrice: 'CZK 252.89',
  addonPrice: 'CZK 177.37',
  discountLabel: '30%',
}

export const boardCareProducts = [
  {
    id: 'wood-butter',
    title: "Dom's Concepts Wood Butter",
    image: '/images/products/wood-care/natural-wood-butter/01.jpg',
    description:
      'A soft board conditioner for routine care. Helps refresh the surface, deepen the wood tone, and keep boards protected between uses.',
    ctaLabel: 'Add on Etsy',
    buttonLabel: 'Add on Etsy',
    productId: 'natural-wood-butter-beeswax',
    isAddOn: true,
    addonParam: 'wood-butter',
  },
  {
    id: 'wood-wax',
    title: "Dom's Concepts Wood Wax",
    image: '/images/products/wood-care/beeswax-wood-wax/01.jpg',
    description:
      'A protective wax blend with mineral oil, beeswax, and carnauba wax. Good for wood pieces that need a stronger protective finish.',
    ctaLabel: 'Add on Etsy',
    buttonLabel: 'Add on Etsy',
    productId: 'beeswax-wood-wax-natural-wood-conditioner',
    isAddOn: true,
    addonParam: 'wood-wax',
  },
]

export const boardCareAddonOptions = [
  { value: 'none', label: 'No add-on' },
  { value: 'wood-butter', label: 'Wood Butter -30%' },
  { value: 'wood-wax', label: 'Wood Wax -30%' },
  { value: 'unsure', label: 'Not sure yet' },
]

export const boardCareProductAddonOptions = [
  { value: 'none', label: 'No care add-on' },
  { value: 'wood-butter', label: 'Wood Butter — add-on with board order' },
  { value: 'wood-wax', label: 'Wood Wax — add-on with board order' },
]

/** Build board-care addon select labels with converted display prices. */
export function getBoardCareProductAddonOptions(formatProductPrice) {
  const addon = formatProductPrice
    ? formatProductPrice(boardCarePricing.addonPrice)
    : boardCarePricing.addonPrice
  return [
    { value: 'none', label: 'No care add-on' },
    {
      value: 'wood-butter',
      label: `Wood Butter — ${addon} with board order`,
    },
    {
      value: 'wood-wax',
      label: `Wood Wax — ${addon} with board order`,
    },
  ]
}

export function resolveBoardCareAddon(searchParams) {
  const addon = searchParams.get('addon') || searchParams.get('care') || 'none'
  return boardCareAddonOptions.some((option) => option.value === addon) ? addon : 'none'
}

export function isBoardCareEligible(category) {
  return boardCareUpsellCategories.includes(category)
}

export function getBoardCareAddonLabel(value) {
  return boardCareAddonOptions.find((option) => option.value === value)?.label || value
}

export function getBoardCareButtonAction(item) {
  const catalogProduct = item.productId
    ? products.find((product) => product.id === item.productId)
    : undefined

  const href =
    item.addOnEtsyUrl ?? item.etsyUrl ?? catalogProduct?.etsyUrl ?? ETSY_SHOP_URL

  const label =
    item.buttonLabel ??
    item.ctaLabel ??
    (item.isAddOn === false ? 'Buy on Etsy' : 'Add on Etsy')

  return { label, href, external: true }
}
