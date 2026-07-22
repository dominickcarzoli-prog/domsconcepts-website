import { createElement } from 'react'
import {
  parseEtsyDescription,
  resolveMaterialsLabel,
  sanitizeDimensionsText,
  scrubAsterisks,
} from '../data/parseEtsyDescription.js'
import {
  ensureEpoxyResinInMaterialsDisplay,
  translateMaterialsLabel,
} from '../i18n/materials.js'

/**
 * THE product-detail description surface.
 * Plain-text React nodes only — never dangerouslySetInnerHTML, never raw Etsy dump.
 */

/** @typedef {'cutting_board' | 'epoxy_serving_board' | 'bottle_opener' | 'clock' | 'book_holder' | 'wood_butter' | 'wood_wax' | 'furniture' | 'other'} ProductContentType */

const DEFAULT_CARE_BULLETS = {
  cutting_board: [
    'Hand wash only with mild soap and warm water.',
    'Do not soak or place in the dishwasher.',
    'Dry upright immediately after washing.',
    'Reapply food-safe board oil when the wood begins to look dry.',
    'Finish with wood wax or board butter for added protection.',
    'Store in a dry, well-ventilated place.',
  ],
  epoxy_serving_board: [
    'Intended for serving, presentation and decorative use.',
    'Do not cut directly on the epoxy surface.',
    'Hand wash only with mild soap and warm water.',
    'Do not soak or place in the dishwasher.',
    'Dry immediately after washing.',
    'Avoid prolonged exposure to high heat.',
    'Refresh exposed wood areas with food-safe oil or wax when needed.',
  ],
  bottle_opener: [
    'Wipe with a soft dry or slightly damp cloth.',
    'Dry immediately.',
    'Do not soak.',
    'Keep metal hardware dry.',
    'Refresh the wood finish when it begins to look dry.',
  ],
  book_holder: [
    'Wipe with a soft dry or slightly damp cloth.',
    'Dry immediately after cleaning.',
    'Do not soak or place in the dishwasher.',
    'Refresh the wood finish when it begins to look dry.',
  ],
  wood_butter: [
    'Apply a small amount to clean, dry wood.',
    'Spread evenly with a lint-free cloth.',
    'Allow it to absorb.',
    'Buff away any excess.',
    'Reapply whenever the wood begins to look dry.',
  ],
  wood_wax: [
    'Apply a small amount to clean, dry wood.',
    'Spread evenly with a lint-free cloth.',
    'Allow it to absorb.',
    'Buff away any excess.',
    'Reapply whenever the wood begins to look dry.',
  ],
  furniture: [
    'Wipe with a soft damp cloth.',
    'Avoid harsh cleaners.',
    'Use coasters under glasses and hot items.',
    'Avoid prolonged heat or moisture.',
    'Refresh the finish if the surface begins to look dry.',
  ],
  clock: [],
  other: [],
  // Legacy aliases
  serving_board: undefined,
  wall_decor: undefined,
  wood_care: undefined,
  board: undefined,
  decor: undefined,
}

DEFAULT_CARE_BULLETS.serving_board = DEFAULT_CARE_BULLETS.cutting_board
DEFAULT_CARE_BULLETS.wall_decor = DEFAULT_CARE_BULLETS.bottle_opener
DEFAULT_CARE_BULLETS.board = DEFAULT_CARE_BULLETS.cutting_board
DEFAULT_CARE_BULLETS.decor = DEFAULT_CARE_BULLETS.bottle_opener
DEFAULT_CARE_BULLETS.wood_care = []

const DEFAULT_EPOXY_PERFECT_FOR = [
  'Charcuterie and cheese service',
  'Appetizer presentation',
  'Table styling',
  'Wedding and housewarming gifts',
  'Decorative serving displays',
]

const DEFAULT_BOTTLE_OPENER_PERFECT_FOR = [
  'Man caves',
  'BBQ and grilling areas',
  'Home bars',
  'Kitchens and entertainment spaces',
  'Housewarming gifts',
  'Gifts for beer lovers and hosts',
]

const DEFAULT_BOOK_HOLDER_PERFECT_FOR = [
  'Cookbooks',
  'Tablets',
  'Recipe display',
  'Kitchen counters',
  'Gifts for home cooks and book lovers',
]

const DEFAULT_TYPE_CONTENT = {
  clock: {
    materials: 'Solid oak and clock mechanism',
    dimensions: '29 cm diameter',
    battery: '1 × AA battery included',
  },
  wood_butter: {
    materials: 'Natural beeswax and food-grade mineral oil',
    ingredients: 'Natural beeswax and food-grade mineral oil',
    intendedUse: 'Conditioning and protecting unfinished or oil-finished wooden kitchenware',
  },
  wood_wax: {
    materials: 'Natural beeswax, food-grade mineral oil and carnauba wax',
    ingredients: 'Natural beeswax, food-grade mineral oil and carnauba wax',
    purposeNote: 'Carnauba wax adds a harder, more durable protective top layer.',
  },
  bottle_opener: {
    materials: 'Black walnut, maple, purpleheart and metal bottle opener',
    perfectFor: DEFAULT_BOTTLE_OPENER_PERFECT_FOR,
  },
  book_holder: {
    materials: 'Black walnut, maple and mahogany',
    dimensions: '475 × 170 × 25 mm',
    perfectFor: DEFAULT_BOOK_HOLDER_PERFECT_FOR,
  },
}

const DEFAULT_LABELS = {
  overview: 'Overview',
  features: 'Features',
  perfectFor: 'Perfect For',
  whyEndGrain: 'Why End Grain?',
  whyThisPiece: 'Why This Piece',
  specifications: 'Specifications',
  materials: 'Materials',
  dimensions: 'Dimensions',
  finish: 'Finish',
  construction: 'Construction',
  woodSpecies: 'Wood species',
  includedHardware: 'Included hardware',
  intendedUse: 'Intended use',
  battery: 'Battery',
  ingredients: 'Ingredients',
  options: 'Options',
  capacity: 'Capacity',
  careInstructions: 'Board care',
  howToUse: 'How to use',
  productDetails: 'Product Details',
  importantNotes: 'Important Notes',
  price: 'Price',
  availability: 'Availability',
  photos: 'Photos',
  photoSingular: 'image',
  photoPlural: 'images',
  handSelectedHardwoods: 'Hand-selected hardwoods',
  priceOnRequest: 'Price on request',
  intendedUseEpoxyServing: 'Serving and decorative presentation',
  finishEpoxyServing: 'Food-safe oil and wax',
  perfectForEpoxyServingBoard: DEFAULT_EPOXY_PERFECT_FOR,
  perfectForBottleOpener: DEFAULT_BOTTLE_OPENER_PERFECT_FOR,
  perfectForBookHolder: DEFAULT_BOOK_HOLDER_PERFECT_FOR,
  typeContent: DEFAULT_TYPE_CONTENT,
  careBullets: DEFAULT_CARE_BULLETS,
}

/**
 * Stable epoxy detection from category / materials / slug — not translated prose.
 * @param {Record<string, unknown> | null | undefined} product
 */
export function productHasEpoxy(product) {
  if (!product) return false
  const category = String(product.category || product.categoryId || '').trim()
  if (category === 'Epoxy Pieces') return true
  const tags = Array.isArray(product.tags) ? product.tags.join(' ') : String(product.tags || '')
  const haystack = [
    product.materials,
    product.woodType,
    product.productType,
    product.id,
    product.slug,
    tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return /\bepoxy\b|\bepoxid/.test(haystack)
}

/**
 * Resolve the stable product content type used for materials / specs / care rules.
 * @returns {ProductContentType | null}
 */
export function resolveProductContentType(product) {
  if (!product) return null

  const category = String(product.category || product.categoryId || '').trim()
  const stableHaystack = [
    product.id,
    product.slug,
    category,
    product.materials,
    product.woodType,
    product.productType,
    Array.isArray(product.tags) ? product.tags.join(' ') : product.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const nameHaystack = [product.name, product.title]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  const haystack = `${stableHaystack} ${nameHaystack}`

  // Wax before butter: wax listings may also mention "board butter" in the title.
  if (
    /\bwood\s*wax\b|\bbeeswax\s*wood\s*wax\b/.test(haystack) ||
    /beeswax-wood-wax/.test(stableHaystack) ||
    (category === 'Wood Care' && /\bcarnauba\b/.test(haystack))
  ) {
    return 'wood_wax'
  }

  if (
    /\bwood\s*butter\b|\bboard\s*butter\b|\bboard\s*conditioner\b/.test(haystack) ||
    /natural-wood-butter/.test(stableHaystack)
  ) {
    return 'wood_butter'
  }

  if (category === 'Wood Care') {
    if (/\bwax\b/.test(haystack)) return 'wood_wax'
    if (/\bbutter\b|\bconditioner\b/.test(haystack)) return 'wood_butter'
    return 'other'
  }

  if (
    /\bclock\b|\buhr\b|\bhodiny\b/.test(haystack) ||
    /oak-clock|epoxy-wall-clock|epoxy-clock/.test(stableHaystack)
  ) {
    return 'clock'
  }

  if (
    /\bbottle\s*opener\b|\bflaschenöffner\b|\botvírák\b/.test(haystack) ||
    /bottle-opener/.test(stableHaystack)
  ) {
    return 'bottle_opener'
  }

  if (
    /\bbook\s*(stand|holder)\b|\bcookbook\s*stand\b|\b2-in-1\b.*\bbook\b|\bbook\b.*\bserving\b/.test(
      haystack,
    ) ||
    /book-stand|book-holder/.test(stableHaystack)
  ) {
    return 'book_holder'
  }

  if (
    /^furniture$/i.test(category) ||
    /\b(coffee\s*table|dining\s*table|side\s*table|console\s*table|bed|chair|desk|cabinet|nightstand|furniture|couch|sofa|stool|tisch|stuhl)\b/.test(
      haystack,
    )
  ) {
    return 'furniture'
  }

  const hasEpoxy = productHasEpoxy(product)
  const looksLikeServingBoard =
    category === 'Serving Boards' ||
    category === 'Epoxy Pieces' ||
    /\b(serving|charcuterie|tray|live\s*edge|servier|tác)\b/.test(haystack)
  const explicitlyCutting =
    category === 'Cutting Boards' ||
    /\bcutting\s*board\b|\bbutcher\b|\bschneidebrett\b|\bkrájecí\b/.test(haystack)

  if (hasEpoxy && looksLikeServingBoard && !explicitlyCutting) {
    return 'epoxy_serving_board'
  }

  if (
    category === 'Cutting Boards' ||
    /\bcutting\s*board\b|\bbutcher\b/.test(stableHaystack)
  ) {
    return 'cutting_board'
  }

  if (
    category === 'Serving Boards' ||
    category === 'Breadboards' ||
    /\bserving\s*board\b|\bbreadboard\b|\btray\b|\bsteak\s*board\b/.test(haystack)
  ) {
    // Serving boards share cutting-board care; book holders already returned above.
    return 'cutting_board'
  }

  if (hasEpoxy) return 'epoxy_serving_board'

  if (category === 'Coasters' || category === 'Custom Orders' || /\bcoaster\b/.test(haystack)) {
    return 'other'
  }

  if (category === 'Wall Pieces') return 'other'

  return 'other'
}

/**
 * @deprecated Prefer resolveProductContentType — kept as a stable alias for care routing.
 * @returns {ProductContentType | null}
 */
export function resolveProductCareKind(product) {
  return resolveProductContentType(product)
}

/**
 * Resolve shared product description fields used by purchase + info sections.
 */
export function resolveProductDetailContent(product, labels = {}, locale = 'en') {
  const L = {
    ...DEFAULT_LABELS,
    ...labels,
    careBullets: {
      ...DEFAULT_CARE_BULLETS,
      ...(labels.careBullets || {}),
    },
    typeContent: {
      ...DEFAULT_TYPE_CONTENT,
      ...(labels.typeContent || {}),
      clock: { ...DEFAULT_TYPE_CONTENT.clock, ...(labels.typeContent?.clock || {}) },
      wood_butter: {
        ...DEFAULT_TYPE_CONTENT.wood_butter,
        ...(labels.typeContent?.wood_butter || {}),
      },
      wood_wax: { ...DEFAULT_TYPE_CONTENT.wood_wax, ...(labels.typeContent?.wood_wax || {}) },
      bottle_opener: {
        ...DEFAULT_TYPE_CONTENT.bottle_opener,
        ...(labels.typeContent?.bottle_opener || {}),
      },
      book_holder: {
        ...DEFAULT_TYPE_CONTENT.book_holder,
        ...(labels.typeContent?.book_holder || {}),
      },
    },
    perfectForEpoxyServingBoard:
      labels.perfectForEpoxyServingBoard || DEFAULT_LABELS.perfectForEpoxyServingBoard,
    perfectForBottleOpener:
      labels.perfectForBottleOpener ||
      labels.typeContent?.bottle_opener?.perfectFor ||
      DEFAULT_LABELS.perfectForBottleOpener,
    perfectForBookHolder:
      labels.perfectForBookHolder ||
      labels.typeContent?.book_holder?.perfectFor ||
      DEFAULT_LABELS.perfectForBookHolder,
  }

  const contentType = resolveProductContentType(product)
  const typeOverride = contentType ? L.typeContent?.[contentType] || null : null

  const title = product.name || product.title || ''
  // Prefer English source for structure when locale copy is a full prose translation.
  const description =
    product.description || product.longDescription || product.shortDescription || ''
  const structureSource =
    product.englishDescription ||
    product.descriptionEn ||
    product.longDescriptionEn ||
    description
  const parsed = parseEtsyDescription(structureSource, { title })
  const localeParsed =
    structureSource === description
      ? parsed
      : parseEtsyDescription(description, { title })

  const overrideMaterials = typeOverride?.materials
    ? scrubAsterisks(typeOverride.materials)
    : ''
  let materialsLabel = overrideMaterials
  if (!materialsLabel) {
    const rawMaterials = resolveMaterialsLabel(product, parsed, {
      fallback: L.handSelectedHardwoods,
    })
    materialsLabel =
      rawMaterials === L.handSelectedHardwoods
        ? rawMaterials
        : translateMaterialsLabel(rawMaterials, locale) || rawMaterials
  }

  // Display-only safety: epoxy products must list epoxy resin in Materials.
  // Does not alter stored D1 / product source values.
  if (productHasEpoxy(product)) {
    materialsLabel = ensureEpoxyResinInMaterialsDisplay(materialsLabel, locale)
  }

  const rawDimensionsSource =
    product.dimensions &&
    String(product.dimensions).trim() &&
    !/^details coming soon$/i.test(String(product.dimensions).trim())
      ? String(product.dimensions)
      : parsed.dimensions || localeParsed.dimensions || ''

  const sanitized = sanitizeDimensionsText(rawDimensionsSource)
  const overrideDimensions = typeOverride?.dimensions
    ? scrubAsterisks(typeOverride.dimensions)
    : ''
  // Prefer stored measurement-only values over type defaults when already clean
  // (e.g. book holder 475×170×25 mm). Type override wins for clock diameter wording.
  const dimensions =
    contentType === 'clock'
      ? overrideDimensions || sanitized.dimensions
      : sanitized.dimensions ||
        overrideDimensions ||
        (rawDimensionsSource ? scrubAsterisks(rawDimensionsSource) : '')

  const batteryText = scrubAsterisks(
    typeOverride?.battery || sanitized.battery || product.battery || '',
  )
  const optionsText = scrubAsterisks(sanitized.options || product.options || '')
  const capacityText = scrubAsterisks(sanitized.capacity || product.capacity || '')
  const ingredientsText = scrubAsterisks(
    typeOverride?.ingredients ||
      (contentType === 'wood_butter' || contentType === 'wood_wax' ? materialsLabel : ''),
  )

  const careKind = contentType
  const careBullets = resolveCareBullets(careKind, L.careBullets)
  const careHeading =
    contentType === 'wood_butter' || contentType === 'wood_wax'
      ? L.howToUse || L.careInstructions
      : L.careInstructions
  const purposeNote = scrubAsterisks(typeOverride?.purposeNote || '')

  const epoxyPerfectFor = scrubList(
    Array.isArray(L.perfectForEpoxyServingBoard) ? L.perfectForEpoxyServingBoard : [],
  )
  const bottlePerfectFor = scrubList(
    Array.isArray(L.perfectForBottleOpener) ? L.perfectForBottleOpener : [],
  )
  const bookPerfectFor = scrubList(
    Array.isArray(L.perfectForBookHolder) ? L.perfectForBookHolder : [],
  )

  let perfectForItems = []
  if (contentType === 'epoxy_serving_board' && epoxyPerfectFor.length) {
    perfectForItems = epoxyPerfectFor
  } else if (contentType === 'bottle_opener' && bottlePerfectFor.length) {
    perfectForItems = bottlePerfectFor
  } else if (contentType === 'book_holder' && bookPerfectFor.length) {
    perfectForItems = bookPerfectFor
  } else {
    perfectForItems = scrubList(
      Array.isArray(product.perfectFor) && product.perfectFor.length
        ? product.perfectFor
        : localeParsed.perfectFor.length
          ? localeParsed.perfectFor
          : parsed.perfectFor,
    )
  }

  const featureItems = scrubList(
    locale !== 'en' && localeParsed.features.length
      ? localeParsed.features
      : Array.isArray(product.features) && product.features.length
        ? product.features
        : localeParsed.features.length
          ? localeParsed.features
          : parsed.features,
  )
  const whyEndGrainText = scrubAsterisks(
    (locale !== 'en' && localeParsed.whyEndGrain) ||
      product.whyEndGrain ||
      localeParsed.whyEndGrain ||
      parsed.whyEndGrain,
  )
  const whyThisPieceText = scrubAsterisks(
    (locale !== 'en' && localeParsed.whyThisPiece) ||
      product.whyThisPiece ||
      localeParsed.whyThisPiece ||
      parsed.whyThisPiece,
  )
  const dimensionsText = scrubAsterisks(dimensions)
  const materialsText = scrubAsterisks(materialsLabel || parsed.materials)
  const finishText = scrubAsterisks(
    contentType === 'epoxy_serving_board'
      ? L.finishEpoxyServing || product.finish || ''
      : product.finish || '',
  )
  const constructionText = scrubAsterisks(product.construction || '')
  const hardwareText = scrubAsterisks(
    resolveIncludedHardware(product, contentType) || product.includedHardware || '',
  )
  const intendedUseText = scrubAsterisks(
    typeOverride?.intendedUse ||
      product.intendedUse ||
      (contentType === 'epoxy_serving_board' ? L.intendedUseEpoxyServing || '' : ''),
  )
  const woodSpeciesText = scrubAsterisks(
    contentType === 'epoxy_serving_board' ||
      contentType === 'wood_butter' ||
      contentType === 'wood_wax' ||
      contentType === 'clock' ||
      contentType === 'bottle_opener' ||
      contentType === 'book_holder'
      ? ''
      : product.woodType &&
          String(product.woodType).trim() &&
          !/^selected(\s+materials)?$/i.test(String(product.woodType).trim()) &&
          !/^wood(\s+and\s+epoxy(\s+resin)?)?$/i.test(String(product.woodType).trim()) &&
          !/^board\s+care\b/i.test(String(product.woodType).trim()) &&
          !/^beeswax\b/i.test(String(product.woodType).trim())
        ? String(product.woodType).trim()
        : '',
  )
  // Overview / intro should follow the active locale description.
  const overview = scrubAsterisks(localeParsed.intro || parsed.intro)
  const importantNotes = scrubList([
    ...localeParsed.importantNotes,
    ...parsed.importantNotes,
    localeParsed.handmade || parsed.handmade || null,
    localeParsed.shipping || parsed.shipping || null,
  ]).filter((note) => !isCustomEnquiryCopy(note))

  const hasPrimaryStructure =
    featureItems.length > 0 ||
    perfectForItems.length > 0 ||
    Boolean(whyEndGrainText || whyThisPieceText) ||
    Boolean(
      materialsText ||
        dimensionsText ||
        constructionText ||
        finishText ||
        intendedUseText ||
        batteryText ||
        ingredientsText,
    ) ||
    careBullets.length > 0

  // Never fall back to a DE/CS-only "Produktdetails" dump when shared sections exist.
  const detailBullets =
    !hasPrimaryStructure &&
    (localeParsed.confidence === 'low' || parsed.confidence === 'low') &&
    (localeParsed.productDetails.length > 0 || parsed.productDetails.length > 0)
      ? scrubList(
          localeParsed.productDetails.length
            ? localeParsed.productDetails
            : parsed.productDetails,
        ).filter((item) => !isCustomEnquiryCopy(item))
      : []

  return {
    L,
    title,
    description,
    parsed: localeParsed,
    materialsLabel,
    materialsSummary: shortenMaterialsSummary(materialsText),
    materialsText,
    dimensionsText,
    dimensionsSummary: shortenMaterialsSummary(dimensionsText),
    finishText,
    constructionText,
    hardwareText,
    woodSpeciesText,
    intendedUseText,
    batteryText,
    ingredientsText,
    optionsText,
    capacityText,
    purposeNote,
    overview,
    featureItems,
    perfectForItems,
    whyEndGrainText,
    whyThisPieceText,
    careKind,
    contentType,
    careBullets,
    careHeading,
    importantNotes,
    detailBullets,
  }
}

/**
 * Compact purchase-column content: meta chips + short overview only.
 */
export function ProductDetailPurchaseInfo({
  product,
  galleryImageCount = 0,
  priceValue,
  labels = {},
  locale = 'en',
}) {
  void galleryImageCount
  const content = resolveProductDetailContent(product, labels, locale)
  const { L, materialsSummary, dimensionsSummary, overview } = content

  const cards = [
    createElement(InfoCard, {
      key: 'price',
      label: L.price,
      value: priceValue || product.priceFrom || product.price || L.priceOnRequest,
    }),
    createElement(InfoCard, {
      key: 'materials',
      label: L.materials,
      value: materialsSummary,
    }),
  ]

  if (dimensionsSummary) {
    cards.push(
      createElement(InfoCard, {
        key: 'dimensions',
        label: L.dimensions,
        value: dimensionsSummary,
      }),
    )
  }

  return createElement(
    'div',
    { className: 'product-detail-purchase-info', 'data-product-purchase-info': 'true' },
    createElement('div', { className: 'product-detail-purchase-stats mt-5 grid gap-3 sm:grid-cols-2' }, cards),
    overview
      ? createElement(
          'div',
          { className: 'product-detail-overview mt-4' },
          createElement('p', { className: 'product-description__intro' }, overview),
        )
      : null,
  )
}

/**
 * Full-width information cards below the hero (Features / Perfect For / Specs / Why / Care).
 */
export function ProductDetailInfoGrid({ product, labels = {}, locale = 'en' }) {
  const content = resolveProductDetailContent(product, labels, locale)
  const {
    L,
    featureItems,
    perfectForItems,
    whyEndGrainText,
    whyThisPieceText,
    careBullets,
    careHeading,
    materialsText,
    dimensionsText,
    finishText,
    constructionText,
    hardwareText,
    woodSpeciesText,
    intendedUseText,
    batteryText,
    ingredientsText,
    optionsText,
    capacityText,
    purposeNote,
    contentType,
    detailBullets,
    importantNotes,
    parsed,
  } = content

  const primaryCards = []

  if (featureItems.length > 0) {
    primaryCards.push(
      createElement(
        InfoSectionCard,
        { key: 'features', title: L.features },
        createElement(
          'ul',
          { className: 'product-description__list' },
          featureItems.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (perfectForItems.length > 0) {
    primaryCards.push(
      createElement(
        InfoSectionCard,
        { key: 'perfect-for', title: L.perfectFor },
        createElement(
          'ul',
          { className: 'product-description__list' },
          perfectForItems.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  const specRows = buildSpecRows({
    L,
    contentType,
    materialsText,
    dimensionsText,
    constructionText,
    finishText,
    woodSpeciesText,
    hardwareText,
    intendedUseText,
    batteryText,
    ingredientsText,
    optionsText,
    capacityText,
  })

  if (specRows.length > 0) {
    primaryCards.push(
      createElement(
        InfoSectionCard,
        { key: 'specs', title: L.specifications, compact: true },
        createElement('dl', { className: 'product-description__specs' }, specRows),
      ),
    )
  }

  const secondaryCards = []

  if (whyEndGrainText) {
    secondaryCards.push(
      createElement(
        InfoSectionCard,
        { key: 'why-end-grain', title: L.whyEndGrain },
        createElement('p', { className: 'product-description__body' }, whyEndGrainText),
      ),
    )
  } else if (whyThisPieceText) {
    secondaryCards.push(
      createElement(
        InfoSectionCard,
        { key: 'why-this-piece', title: L.whyThisPiece },
        createElement('p', { className: 'product-description__body' }, whyThisPieceText),
      ),
    )
  }

  if (careBullets.length > 0) {
    secondaryCards.push(
      createElement(
        InfoSectionCard,
        { key: 'care', title: careHeading },
        purposeNote
          ? createElement('p', { className: 'product-description__body' }, purposeNote)
          : null,
        createElement(
          'ul',
          { className: 'product-description__list', 'data-care-bullets': 'true' },
          careBullets.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  const extraCards = []

  if (detailBullets.length > 0) {
    extraCards.push(
      createElement(
        InfoSectionCard,
        { key: 'details', title: L.productDetails },
        createElement(
          'ul',
          { className: 'product-description__list' },
          detailBullets.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (importantNotes.length > 0) {
    extraCards.push(
      createElement(
        InfoSectionCard,
        { key: 'important', title: L.importantNotes },
        createElement(
          'ul',
          { className: 'product-description__list' },
          importantNotes.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (
    primaryCards.length === 0 &&
    secondaryCards.length === 0 &&
    extraCards.length === 0
  ) {
    return null
  }

  return createElement(
    'div',
    {
      className: 'product-detail-info-grid product-description',
      'data-product-description': 'structured',
      'data-confidence': parsed.confidence,
      'data-content-type': contentType || 'other',
    },
    primaryCards.length > 0
      ? createElement(
          'div',
          {
            className: [
              'product-info-grid__row',
              `product-info-grid__row--${Math.min(primaryCards.length, 3)}`,
            ].join(' '),
          },
          primaryCards,
        )
      : null,
    secondaryCards.length > 0
      ? createElement(
          'div',
          {
            className: [
              'product-info-grid__row',
              'product-info-grid__row--secondary',
              `product-info-grid__row--${Math.min(secondaryCards.length, 2)}`,
            ].join(' '),
          },
          secondaryCards,
        )
      : null,
    extraCards.length > 0
      ? createElement(
          'div',
          {
            className: [
              'product-info-grid__row',
              `product-info-grid__row--${Math.min(extraCards.length, 2)}`,
            ].join(' '),
          },
          extraCards,
        )
      : null,
  )
}

/**
 * Meta cards + structured description (purchase summary + info grid).
 * Kept for tests and any single-column consumers.
 */
export function ProductDetailInfo({
  product,
  galleryImageCount = 0,
  priceValue,
  availabilityLabel,
  labels = {},
  locale = 'en',
}) {
  void availabilityLabel
  return createElement(
    'div',
    { className: 'product-detail-info', 'data-product-detail-info': 'true' },
    createElement(ProductDetailPurchaseInfo, {
      product,
      galleryImageCount,
      priceValue,
      labels,
      locale,
    }),
    createElement(
      'div',
      { className: 'product-detail-description mt-8' },
      createElement(ProductDetailInfoGrid, { product, labels, locale }),
    ),
  )
}

/**
 * Legacy single-column structured description (all sections stacked).
 * Prefer ProductDetailInfoGrid for the redesigned detail page.
 */
export function ProductDescription({
  description,
  title,
  productTitle,
  features,
  perfectFor,
  whyEndGrain,
  whyThisPiece,
  careInstructions,
  dimensions,
  materialsLabel,
  finish,
  construction,
  includedHardware,
  woodType,
  category,
  labels = {},
}) {
  void careInstructions
  const product = {
    name: title || productTitle || '',
    title: title || productTitle || '',
    description: description || '',
    features,
    perfectFor,
    whyEndGrain,
    whyThisPiece,
    dimensions,
    materials: materialsLabel,
    finish,
    construction,
    includedHardware,
    woodType,
    category,
  }
  const content = resolveProductDetailContent(product, labels, 'en')
  const {
    L,
    overview,
    featureItems,
    perfectForItems,
    whyEndGrainText,
    whyThisPieceText,
    careBullets,
    careHeading,
    materialsText,
    dimensionsText,
    finishText,
    constructionText,
    hardwareText,
    woodSpeciesText,
    intendedUseText,
    batteryText,
    ingredientsText,
    optionsText,
    capacityText,
    purposeNote,
    contentType,
    detailBullets,
    importantNotes,
    parsed,
  } = content

  const sections = []

  if (overview) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'overview', title: L.overview },
        createElement('p', { className: 'product-description__intro' }, overview),
      ),
    )
  }

  if (featureItems.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'features', title: L.features },
        createElement(
          'ul',
          { className: 'product-description__list' },
          featureItems.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (perfectForItems.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'perfect-for', title: L.perfectFor },
        createElement(
          'ul',
          { className: 'product-description__list' },
          perfectForItems.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (whyEndGrainText) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'why-end-grain', title: L.whyEndGrain },
        createElement('p', { className: 'product-description__body' }, whyEndGrainText),
      ),
    )
  } else if (whyThisPieceText) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'why-this-piece', title: L.whyThisPiece },
        createElement('p', { className: 'product-description__body' }, whyThisPieceText),
      ),
    )
  }

  const specRows = buildSpecRows({
    L,
    contentType,
    materialsText,
    dimensionsText,
    constructionText,
    finishText,
    woodSpeciesText,
    hardwareText,
    intendedUseText,
    batteryText,
    ingredientsText,
    optionsText,
    capacityText,
  })

  if (specRows.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'specs', title: L.specifications },
        createElement('dl', { className: 'product-description__specs' }, specRows),
      ),
    )
  }

  if (careBullets.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'care', title: careHeading },
        purposeNote
          ? createElement('p', { className: 'product-description__body' }, purposeNote)
          : null,
        createElement(
          'ul',
          { className: 'product-description__list', 'data-care-bullets': 'true' },
          careBullets.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (detailBullets.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'details', title: L.productDetails },
        createElement(
          'ul',
          { className: 'product-description__list' },
          detailBullets.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  if (importantNotes.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'important', title: L.importantNotes },
        createElement(
          'ul',
          { className: 'product-description__list' },
          importantNotes.map((item) => createElement('li', { key: item }, item)),
        ),
      ),
    )
  }

  return createElement(
    'div',
    {
      className: 'product-description',
      'data-product-description': 'structured',
      'data-confidence': parsed.confidence,
      'data-content-type': contentType || 'other',
    },
    sections,
  )
}

function resolveCareBullets(careKind, careBullets) {
  if (!careKind || careKind === 'clock' || careKind === 'other') return []
  const aliases = {
    board: 'cutting_board',
    decor: 'bottle_opener',
    wall_decor: 'bottle_opener',
    serving_board: 'cutting_board',
    wood_care: null,
  }
  const key = aliases[careKind] === null ? null : aliases[careKind] || careKind
  if (!key) return []
  const list = careBullets?.[key] || careBullets?.[careKind]
  return Array.isArray(list) ? list.map(scrubAsterisks).filter(Boolean) : []
}

function resolveIncludedHardware(product, contentType) {
  if (contentType !== 'bottle_opener' || !product) return ''
  const haystack = [
    product.id,
    product.slug,
    product.name,
    product.title,
    product.description,
    product.longDescription,
    Array.isArray(product.features) ? product.features.join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const hasMagnets = /\bmagnet/.test(haystack)
  const hasMounting =
    /\bmounting\s+hardware\b|\bwall[- ]?mount/.test(haystack) ||
    /\bhardware\b/.test(haystack)

  if (hasMagnets && hasMounting) return 'Magnets and wall mounting hardware'
  if (hasMagnets) return 'Magnets'
  if (hasMounting) return 'Wall mounting hardware'
  return ''
}

function isCustomEnquiryCopy(text) {
  return /\b(contact\s+me|message\s+(me|us)|request\s+(a\s+)?custom|custom\s+order|enquiry|inquiry|etsy|buy\s+on\s+etsy|request\s+something\s+similar)\b/i.test(
    String(text || ''),
  )
}

function buildSpecRows({
  L,
  contentType,
  materialsText,
  dimensionsText,
  constructionText,
  finishText,
  woodSpeciesText,
  hardwareText,
  intendedUseText,
  batteryText,
  ingredientsText,
  optionsText,
  capacityText,
}) {
  const rows = []
  const push = (key, label, value) => {
    if (!value) return
    rows.push(
      createElement(
        'div',
        { key, className: 'product-description__spec-row' },
        createElement('dt', null, label),
        createElement('dd', null, value),
      ),
    )
  }

  const isCareProduct = contentType === 'wood_butter' || contentType === 'wood_wax'
  if (isCareProduct) {
    push('ingredients', L.ingredients || L.materials, ingredientsText || materialsText)
    push('intended-use', L.intendedUse, intendedUseText)
    return rows
  }

  push('materials', L.materials, materialsText)
  push('dimensions', L.dimensions, dimensionsText)
  push('battery', L.battery, batteryText)
  push('construction', L.construction, constructionText)
  push('finish', L.finish, finishText)
  push('intended-use', L.intendedUse, intendedUseText)
  push('options', L.options, optionsText)
  push('capacity', L.capacity, capacityText)
  push('wood-species', L.woodSpecies, woodSpeciesText)
  push('hardware', L.includedHardware, hardwareText)
  return rows
}

function shortenMaterialsSummary(materialsText) {
  const text = scrubAsterisks(materialsText || '')
  if (!text) return text
  if (text.length <= 72) return text
  const cut = text.slice(0, 72)
  const boundary = Math.max(cut.lastIndexOf(','), cut.lastIndexOf(' '), cut.lastIndexOf('/'))
  const trimmed = (boundary > 28 ? cut.slice(0, boundary) : cut).trim()
  return trimmed.endsWith('…') ? trimmed : `${trimmed}…`
}

function InfoCard({ label, value }) {
  return createElement(
    'div',
    { className: 'rounded-2xl border border-white/10 bg-black/20 p-4' },
    createElement(
      'p',
      { className: 'text-xs uppercase tracking-[0.25em] text-stone-400' },
      label,
    ),
    createElement('p', { className: 'mt-2 text-stone-100' }, value),
  )
}

function InfoSectionCard({ title, children, compact = false }) {
  return createElement(
    'section',
    {
      className: ['product-info-card', compact ? 'product-info-card--compact' : '']
        .filter(Boolean)
        .join(' '),
    },
    title
      ? createElement('h2', { className: 'product-description__heading' }, title)
      : null,
    children,
  )
}

function scrubList(items) {
  return (items || []).map(scrubAsterisks).filter(Boolean)
}

function DescriptionSection({ title, children }) {
  return createElement(
    'section',
    { className: 'product-description__section' },
    title
      ? createElement('h2', { className: 'product-description__heading' }, title)
      : null,
    children,
  )
}
