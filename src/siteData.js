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
    image: '/images/signature/signature-knife-table.jpg',
    label: 'Knife table',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'dining-table',
    image: '/images/signature/signature-walnut-dining-table.jpg',
    label: 'Dining table',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'tv-table-media-console',
    image: '/images/signature/signature-tv-console.jpg',
    label: 'TV table / media console',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'side-table',
    image: '/images/hero-workshop-board.jpg',
    label: 'Side table',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
  {
    id: 'bed-bedroom-piece',
    image: '/images/signature/signature-oak-bed.jpg',
    label: 'Bed / bedroom piece',
    fallbackImage: '/images/hero-workshop-board.jpg',
  },
]

export const workshopAboutImagePath = '/images/workshop-placeholder.png'
// Primary workshop portrait (dominick-in-workshop.jpg not yet uploaded).
export const makerAboutImagePath = '/images/about/dominick-maker.jpg'
export const aboutMakerPortraitPath = '/images/about/dominick-maker.jpg'

export {
  signaturePieces,
  featuredSignaturePieces,
  getFeaturedSignaturePieces,
  localizeSignaturePiece,
} from './data/signaturePieces.js'

export const pastCustomPieces = [
  {
    id: 'past-aztec-gold-serving-board',
    name: 'European Walnut Aztec Gold Serving Board',
    // past-custom asset not uploaded yet
    image: '/images/epoxy-piece.jpg',
    fallbackImage: '/images/epoxy-piece.jpg',
  },
  {
    id: 'past-restaurant-board-set',
    name: 'Restaurant Board Set',
    // past-custom asset not uploaded yet
    image: '/images/serving-board.jpg',
    fallbackImage: '/images/serving-board.jpg',
  },
  {
    id: 'past-logo-engraved-board',
    name: 'Logo Engraved Corporate Board',
    // past-custom asset not uploaded yet
    image: '/images/workshop-process.jpg',
    fallbackImage: '/images/workshop-process.jpg',
  },
]

export { homepageReviews as premiumReviews } from './data/reviews'

export const etsyTrustPoints = [
  'Secure Etsy checkout',
  'Verified reviews',
  'Handmade in Prague',
  'Custom commissions welcome',
]

/** Stable form option values (English IDs). Labels come from i18n dictionaries. */
export const customProductTypeOptions = [
  { value: 'cuttingBoard', labelKey: 'forms.productTypes.cuttingBoard' },
  { value: 'butcherBlock', labelKey: 'forms.productTypes.butcherBlock' },
  { value: 'servingBoard', labelKey: 'forms.productTypes.servingBoard' },
  { value: 'epoxyPiece', labelKey: 'forms.productTypes.epoxyPiece' },
  { value: 'furniture', labelKey: 'forms.productTypes.furniture' },
  { value: 'corporateGift', labelKey: 'forms.productTypes.corporateGift' },
  { value: 'restaurantBoards', labelKey: 'forms.productTypes.restaurantBoards' },
  { value: 'other', labelKey: 'forms.productTypes.other' },
]

/** @deprecated Use customProductTypeOptions — kept for mailto fallback labels */
export const customProductTypes = customProductTypeOptions.map((o) => o.value)

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
    url: '', // Real URL TBD — PartnerCard renders as non-link until set
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
    url: '', // Real URL TBD — PartnerCard renders as non-link until set
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

export const shippingOptionChoices = [
  { value: 'pickup', labelKey: 'forms.shippingOptions.pickup' },
  { value: 'shipping', labelKey: 'forms.shippingOptions.shipping' },
]
export const shippingOptions = shippingOptionChoices.map((o) => o.value)

export const woodPreferenceChoices = [
  { value: 'none', labelKey: 'forms.woodPreferences.none' },
  { value: 'walnut', labelKey: 'forms.woodPreferences.walnut' },
  { value: 'oak', labelKey: 'forms.woodPreferences.oak' },
  { value: 'maple', labelKey: 'forms.woodPreferences.maple' },
  { value: 'ash', labelKey: 'forms.woodPreferences.ash' },
  { value: 'mixed', labelKey: 'forms.woodPreferences.mixed' },
]
export const woodPreferences = woodPreferenceChoices.map((o) => o.value)

export const engravingOptionChoices = [
  { value: 'yes', labelKey: 'forms.engravingOptions.yes' },
  { value: 'no', labelKey: 'forms.engravingOptions.no' },
]
export const engravingOptions = engravingOptionChoices.map((o) => o.value)

export const budgetRangeChoices = [
  { value: 'under2500', labelKey: 'forms.budgetOptions.under2500' },
  { value: 'r2500_5000', labelKey: 'forms.budgetOptions.r2500_5000' },
  { value: 'r5000_10000', labelKey: 'forms.budgetOptions.r5000_10000' },
  { value: 'over10000', labelKey: 'forms.budgetOptions.over10000' },
]
export const budgetRanges = budgetRangeChoices.map((o) => o.value)

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
