import { createElement } from 'react'
import {
  parseEtsyDescription,
  resolveMaterialsLabel,
  scrubAsterisks,
} from '../data/parseEtsyDescription.js'

/**
 * THE product-detail description surface.
 * Plain-text React nodes only — never dangerouslySetInnerHTML, never raw Etsy dump.
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
}) {
  const resolvedTitle = title || productTitle || ''
  const parsed = parseEtsyDescription(description || '', { title: resolvedTitle })

  const featureItems = scrubList(
    Array.isArray(features) && features.length ? features : parsed.features,
  )
  const perfectForItems = scrubList(
    Array.isArray(perfectFor) && perfectFor.length ? perfectFor : parsed.perfectFor,
  )
  const whyEndGrainText = scrubAsterisks(whyEndGrain || parsed.whyEndGrain)
  const whyThisPieceText = scrubAsterisks(whyThisPiece || parsed.whyThisPiece)
  const careText = scrubAsterisks(careInstructions || parsed.careInstructions)
  const dimensionsText = scrubAsterisks(dimensions || parsed.dimensions)
  const materialsText = scrubAsterisks(materialsLabel || parsed.materials)
  const overview = scrubAsterisks(parsed.intro)
  const importantNotes = scrubList([
    ...parsed.importantNotes,
    parsed.handmade || null,
    parsed.shipping || null,
  ])

  const detailBullets =
    parsed.confidence === 'low' && parsed.productDetails.length > 0
      ? scrubList(parsed.productDetails)
      : []

  const sections = []

  if (overview) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'overview', title: 'Overview' },
        createElement('p', { className: 'product-description__intro' }, overview),
      ),
    )
  }

  if (featureItems.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'features', title: 'Features' },
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
        { key: 'perfect-for', title: 'Perfect For' },
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
        { key: 'why-end-grain', title: 'Why End Grain?' },
        createElement('p', { className: 'product-description__body' }, whyEndGrainText),
      ),
    )
  } else if (whyThisPieceText) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'why-this-piece', title: 'Why This Piece' },
        createElement('p', { className: 'product-description__body' }, whyThisPieceText),
      ),
    )
  }

  if (dimensionsText || materialsText) {
    const rows = []
    if (materialsText) {
      rows.push(
        createElement(
          'div',
          { key: 'materials', className: 'product-description__spec-row' },
          createElement('dt', null, 'Materials'),
          createElement('dd', null, materialsText),
        ),
      )
    }
    if (dimensionsText) {
      rows.push(
        createElement(
          'div',
          { key: 'dimensions', className: 'product-description__spec-row' },
          createElement('dt', null, 'Dimensions'),
          createElement('dd', null, dimensionsText),
        ),
      )
    }
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'specs', title: 'Specifications' },
        createElement('dl', { className: 'product-description__specs' }, rows),
      ),
    )
  }

  if (careText) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'care', title: 'Care Instructions' },
        createElement('p', { className: 'product-description__body' }, careText),
      ),
    )
  }

  if (detailBullets.length > 0) {
    sections.push(
      createElement(
        DescriptionSection,
        { key: 'details', title: 'Product Details' },
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
        { key: 'important', title: 'Important Notes' },
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
    },
    sections,
  )
}

/**
 * Meta cards + structured description for the product-detail right column.
 * This is the only place full product copy is rendered for /available-pieces/:slug.
 */
export function ProductDetailInfo({
  product,
  galleryImageCount = 0,
  priceValue,
  availabilityLabel,
}) {
  const title = product.name || product.title || ''
  const description =
    product.description || product.longDescription || product.shortDescription || ''
  const parsed = parseEtsyDescription(description, { title })
  const materialsLabel = resolveMaterialsLabel(product, parsed)
  const dimensions =
    product.dimensions &&
    String(product.dimensions).trim() &&
    !/^details coming soon$/i.test(String(product.dimensions).trim())
      ? product.dimensions
      : parsed.dimensions
  const availability =
    availabilityLabel || product.availability || product.badge || 'Available'

  const cards = [
    createElement(InfoCard, {
      key: 'price',
      label: 'Price',
      value: priceValue || product.priceFrom || product.price || 'Price on request',
    }),
    createElement(InfoCard, {
      key: 'availability',
      label: 'Availability',
      value: availability,
    }),
    createElement(InfoCard, {
      key: 'materials',
      label: 'Materials',
      value: materialsLabel,
    }),
  ]

  if (galleryImageCount > 0) {
    cards.push(
      createElement(InfoCard, {
        key: 'photos',
        label: 'Photos',
        value: `${galleryImageCount} image${galleryImageCount === 1 ? '' : 's'}`,
      }),
    )
  }

  return createElement(
    'div',
    { className: 'product-detail-info', 'data-product-detail-info': 'true' },
    createElement('div', { className: 'mt-6 grid gap-4 sm:grid-cols-2' }, cards),
    createElement(
      'div',
      { className: 'product-detail-description mt-8' },
      createElement(ProductDescription, {
        description,
        title,
        features: product.features,
        perfectFor: product.perfectFor,
        whyEndGrain: product.whyEndGrain,
        whyThisPiece: product.whyThisPiece,
        careInstructions: product.careInstructions,
        dimensions: dimensions || undefined,
        materialsLabel,
      }),
    ),
  )
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
