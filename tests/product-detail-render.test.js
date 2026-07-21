/**
 * Render-level tests for the product-detail description path.
 * Uses react-dom/server against the real ProductDetailInfo / ProductDescription components.
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it } from 'node:test'

import {
  ProductDescription,
  ProductDetailInfo,
} from '../src/components/ProductDescription.js'

const WALNUT_MAPLE_TITLE = 'Walnut & Maple End Grain Cutting Board'

const WALNUT_MAPLE_DESCRIPTION = `
Handmade Walnut & Maple End Grain Cutting Board from Dom's Concepts workshop in Prague.

Features
* Dense end-grain surface that is gentle on knives
* Beautiful walnut and maple checker pattern
* Finished with food-safe oil

Perfect For
* Everyday kitchen prep
* Serving cheese and charcuterie
* A lasting handmade gift

Why End Grain?
End grain boards are the preferred choice for serious cooks because the wood fibers absorb the knife edge rather than dulling it.

Dimensions
* 40 × 30 × 4 cm

Care Instructions
* Hand wash only
* Oil regularly with food-safe mineral oil or wood butter
* Do not soak or put in the dishwasher
`

function walnutMapleProduct(overrides = {}) {
  return {
    id: 'etsy-walnut-maple',
    name: WALNUT_MAPLE_TITLE,
    title: WALNUT_MAPLE_TITLE,
    description: WALNUT_MAPLE_DESCRIPTION,
    longDescription: WALNUT_MAPLE_DESCRIPTION,
    shortDescription: WALNUT_MAPLE_DESCRIPTION.slice(0, 160),
    price: 'CZK 2,500',
    priceFrom: 'CZK 2,500',
    badge: 'Available',
    availability: 'Available',
    materials: 'Selected materials',
    ...overrides,
  }
}

describe('ProductDetailInfo render path', () => {
  it('renders structured ProductDescription once for Walnut & Maple', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfo, {
        product: walnutMapleProduct(),
        galleryImageCount: 4,
      }),
    )

    assert.match(html, /data-product-detail-info="true"/)
    assert.match(html, /data-product-description="structured"/)
    assert.equal((html.match(/data-product-description="structured"/g) || []).length, 1)

    assert.match(html, />Overview</)
    assert.match(html, />Features</)
    assert.match(html, />Perfect For</)
    assert.match(html, />Why End Grain\?</)
    assert.match(html, />Dimensions</)
    assert.match(html, />Care Instructions</)

    assert.match(html, /Black walnut and hard maple/)
    assert.doesNotMatch(html, /Selected materials/)
    assert.doesNotMatch(html, /\*/)

    // Raw Etsy description must not appear as one duplicated wall of text.
    const rawSlice = 'Dense end-grain surface that is gentle on knives'
    const occurrences = html.split(rawSlice).length - 1
    assert.equal(occurrences, 1)
  })

  it('does not dump the full raw description as a single paragraph', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDescription, {
        description: WALNUT_MAPLE_DESCRIPTION,
        title: WALNUT_MAPLE_TITLE,
      }),
    )

    assert.doesNotMatch(html, new RegExp(WALNUT_MAPLE_DESCRIPTION.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    assert.match(html, /product-description__list/)
    assert.match(html, /product-description__heading/)
    assert.doesNotMatch(html, /\*/)
  })

  it('infers Solid oak materials for Oak Butcher Block', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfo, {
        product: {
          name: 'Oak Butcher Block',
          description: 'A solid oak butcher block for heavy prep.\n\nFeatures\n* Dense surface\n* Food-safe finish',
          materials: 'Selected materials',
          price: 'CZK 1,900',
        },
        galleryImageCount: 2,
      }),
    )
    assert.match(html, /Solid oak/)
    assert.doesNotMatch(html, /Selected materials/)
  })
})

describe('ProductDetailPage App.jsx wiring', () => {
  it('uses ProductDetailInfo and never passes Etsy copy as PageShell intro', async () => {
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const detailStart = app.indexOf('function ProductDetailPage()')
    const detailEnd = app.indexOf('function GalleryPage()')
    assert.ok(detailStart >= 0 && detailEnd > detailStart)
    const detail = app.slice(detailStart, detailEnd)

    assert.match(detail, /<ProductDetailInfo/)
    assert.equal((detail.match(/<ProductDetailInfo/g) || []).length, 1)
    assert.equal((detail.match(/<ProductDescription/g) || []).length, 0)

    assert.doesNotMatch(detail, /intro=\{/)
    assert.doesNotMatch(detail, /Selected materials/)
    assert.doesNotMatch(detail, /\{product\.description\}/)
    assert.doesNotMatch(detail, /\{product\.longDescription\}/)
    assert.doesNotMatch(detail, /\{product\.shortDescription\}/)
    assert.doesNotMatch(detail, /shortIntro/)
    assert.match(detail, /eyebrow="Available Pieces"/)
  })

  it('does not use dangerouslySetInnerHTML on the description path', async () => {
    const component = await readFile(
      new URL('../src/components/ProductDescription.js', import.meta.url),
      'utf8',
    )
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    assert.doesNotMatch(component, /dangerouslySetInnerHTML\s*=/)
    assert.doesNotMatch(app, /dangerouslySetInnerHTML\s*=/)
  })
})
