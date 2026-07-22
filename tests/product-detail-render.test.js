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
  ProductDetailInfoGrid,
  ProductDetailPurchaseInfo,
  productHasEpoxy,
  resolveProductCareKind,
  resolveProductDetailContent,
} from '../src/components/ProductDescription.js'
import { en } from '../src/i18n/dictionaries/en.js'
import { de } from '../src/i18n/dictionaries/de.js'
import { cs } from '../src/i18n/dictionaries/cs.js'
import {
  ensureEpoxyResinInMaterialsDisplay,
  materialsLabelHasEpoxyResin,
} from '../src/i18n/materials.js'

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
* Message for custom sizes or request something similar on Etsy
`

function walnutMapleProduct(overrides = {}) {
  return {
    id: 'etsy-walnut-maple',
    name: WALNUT_MAPLE_TITLE,
    title: WALNUT_MAPLE_TITLE,
    category: 'Cutting Boards',
    description: WALNUT_MAPLE_DESCRIPTION,
    longDescription: WALNUT_MAPLE_DESCRIPTION,
    shortDescription: WALNUT_MAPLE_DESCRIPTION.slice(0, 160),
    price: 'CZK 2,500',
    priceFrom: 'CZK 2,500',
    badge: 'Available',
    availability: 'Available',
    materials: 'Selected materials',
    woodType: 'Black walnut and hard maple',
    dimensions: '40 × 30 × 4 cm',
    ...overrides,
  }
}

const productLabels = {
  careInstructions: 'Care Instructions',
  perfectFor: 'Perfect For',
  dimensions: 'Dimensions',
  woodSpecies: 'Wood species',
  careBullets: en.product.careBullets,
}

describe('ProductDetailInfo render path', () => {
  it('renders purchase summary plus structured info grid for Walnut & Maple', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfo, {
        product: walnutMapleProduct(),
        galleryImageCount: 4,
        labels: productLabels,
      }),
    )

    assert.match(html, /data-product-detail-info="true"/)
    assert.match(html, /data-product-purchase-info="true"/)
    assert.match(html, /data-product-description="structured"/)
    assert.equal((html.match(/data-product-description="structured"/g) || []).length, 1)

    assert.match(html, /product-description__intro/)
    assert.match(html, />Features</)
    assert.match(html, />Perfect For</)
    assert.match(html, />Why End Grain\?</)
    assert.match(html, />Dimensions</)
    assert.match(html, />Care Instructions</)
    assert.match(html, /product-info-card/)
    assert.match(html, /data-care-bullets="true"/)

    assert.match(html, /Black walnut and hard maple/)
    assert.doesNotMatch(html, /Selected materials/)
    assert.doesNotMatch(html, /\*/)
    assert.doesNotMatch(html, /4 images/)
    assert.doesNotMatch(html, /request something similar/i)
    assert.doesNotMatch(html, /Message for custom sizes/i)

    // Raw Etsy description must not appear as one duplicated wall of text.
    const rawSlice = 'Dense end-grain surface that is gentle on knives'
    const occurrences = html.split(rawSlice).length - 1
    assert.equal(occurrences, 1)
  })

  it('keeps purchase info compact with Price, Materials, Dimensions — no photo count', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailPurchaseInfo, {
        product: walnutMapleProduct(),
        galleryImageCount: 4,
        labels: productLabels,
      }),
    )

    assert.match(html, /data-product-purchase-info="true"/)
    assert.match(html, /product-description__intro/)
    assert.match(html, />Dimensions</)
    assert.match(html, /40 × 30 × 4 cm/)
    assert.doesNotMatch(html, /4 images/)
    assert.doesNotMatch(html, />Photos</)
    assert.doesNotMatch(html, />Availability</)
    assert.doesNotMatch(html, />Features</)
    assert.doesNotMatch(html, />Care Instructions</)
    assert.doesNotMatch(html, />Why End Grain\?</)
  })

  it('renders full-width info grid sections as cards with care bullets', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: walnutMapleProduct(),
        labels: productLabels,
      }),
    )

    assert.match(html, /data-product-description="structured"/)
    assert.match(html, /product-info-grid__row--3/)
    assert.match(html, /product-info-grid__row--secondary/)
    assert.match(html, />Features</)
    assert.match(html, />Perfect For</)
    assert.match(html, />Specifications</)
    assert.match(html, />Wood species</)
    assert.match(html, />Why End Grain\?</)
    assert.match(html, />Care Instructions</)
    assert.match(html, /Hand wash only with mild soap and warm water/)
    assert.match(html, /product-info-card--compact/)
  })

  it('does not dump the full raw description as a single paragraph', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDescription, {
        description: WALNUT_MAPLE_DESCRIPTION,
        title: WALNUT_MAPLE_TITLE,
        category: 'Cutting Boards',
        labels: productLabels,
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
          category: 'Cutting Boards',
          description: 'A solid oak butcher block for heavy prep.\n\nFeatures\n* Dense surface\n* Food-safe finish',
          materials: 'Selected materials',
          price: 'CZK 1,900',
        },
        galleryImageCount: 2,
        labels: productLabels,
      }),
    )
    assert.match(html, /Solid oak/)
    assert.doesNotMatch(html, /Selected materials/)
  })

  it('uses bottle-opener care, not cutting-board care', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          id: 'walnut-maple-wall-mount-bottle-opener',
          name: 'Walnut Wall Mount Bottle Opener',
          category: 'Wall Pieces',
          description: 'A wall-mounted walnut bottle opener.',
          woodType: 'Walnut',
        },
        labels: productLabels,
      }),
    )

    assert.match(html, /Keep metal hardware dry/)
    assert.doesNotMatch(html, /dishwasher/i)
    assert.doesNotMatch(html, /Hand wash only with mild soap/)
    assert.doesNotMatch(html, /Store in a dry, well-ventilated place/)
  })

  it('uses furniture care for tables', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          name: 'Black Walnut and Smokey Grey Epoxy Coffee Table',
          category: 'Epoxy Pieces',
          description: 'A handmade coffee table.',
          woodType: 'Black walnut',
        },
        labels: productLabels,
      }),
    )

    assert.match(html, /Wipe with a soft damp cloth/)
    assert.doesNotMatch(html, /dishwasher/i)
    assert.doesNotMatch(html, /Dry upright immediately/)
  })
})

describe('resolveProductCareKind', () => {
  it('classifies cutting boards, furniture, bottle openers, clocks, and epoxy serving boards', () => {
    assert.equal(
      resolveProductCareKind({ name: 'Oak End Grain Cutting Board', category: 'Cutting Boards' }),
      'cutting_board',
    )
    assert.equal(
      resolveProductCareKind({
        name: 'Black Walnut and Smokey Grey Epoxy Coffee Table',
        category: 'Epoxy Pieces',
      }),
      'furniture',
    )
    assert.equal(
      resolveProductCareKind({
        name: 'Walnut Wall Mount Bottle Opener',
        category: 'Wall Pieces',
      }),
      'bottle_opener',
    )
    assert.equal(
      resolveProductCareKind({
        id: 'natural-wood-butter-beeswax',
        name: 'Wood Butter',
        category: 'Wood Care',
      }),
      'wood_butter',
    )
    assert.equal(
      resolveProductCareKind({
        id: 'beeswax-wood-wax-natural-wood-conditioner',
        name: 'Beeswax Wood Wax: Natural Wood Conditioner & Board Butter',
        category: 'Wood Care',
        materials: 'Natural beeswax, food-grade mineral oil and carnauba wax',
      }),
      'wood_wax',
    )
    assert.equal(
      resolveProductCareKind({
        id: 'handcrafted-oak-clock-stormy-grey-epoxy',
        name: 'Handcrafted Oak Clock',
        category: 'Wall Pieces',
      }),
      'clock',
    )
    assert.equal(
      resolveProductCareKind({
        id: 'two-in-one-book-stand-serving-board',
        name: '2-in-1 Book Stand & Serving Board',
        category: 'Serving Boards',
      }),
      'book_holder',
    )
    assert.equal(
      resolveProductCareKind({
        id: 'walnut-live-edge-charcuterie-board',
        slug: 'walnut-live-edge-charcuterie-board',
        category: 'Epoxy Pieces',
        materials: 'Black walnut and epoxy resin',
      }),
      'epoxy_serving_board',
    )
  })
})

describe('product care translations', () => {
  it('keeps EN/DE/CS care bullet sets aligned', () => {
    assert.equal(
      en.product.careBullets.cutting_board.length,
      de.product.careBullets.cutting_board.length,
    )
    assert.equal(
      en.product.careBullets.cutting_board.length,
      cs.product.careBullets.cutting_board.length,
    )
    assert.equal(
      en.product.careBullets.epoxy_serving_board.length,
      de.product.careBullets.epoxy_serving_board.length,
    )
    assert.equal(
      en.product.careBullets.epoxy_serving_board.length,
      cs.product.careBullets.epoxy_serving_board.length,
    )
    assert.equal(en.product.careBullets.furniture.length, de.product.careBullets.furniture.length)
    assert.equal(
      en.product.careBullets.bottle_opener.length,
      cs.product.careBullets.bottle_opener.length,
    )
    assert.equal(
      en.product.careBullets.wood_butter.length,
      de.product.careBullets.wood_butter.length,
    )
    assert.equal(en.product.careBullets.wood_wax.length, cs.product.careBullets.wood_wax.length)
    assert.equal(en.product.careBullets.clock.length, 0)
    assert.equal(de.product.careBullets.clock.length, 0)
    assert.equal(en.product.dimensions, 'Dimensions')
    assert.equal(de.product.dimensions, 'Maße')
    assert.equal(cs.product.dimensions, 'Rozměry')
    assert.equal(en.product.howToUse, 'How to use')
    assert.equal(de.product.howToUse, 'Anwendung')
    assert.equal(cs.product.howToUse, 'Jak používat')
    assert.equal(en.product.woodSpecies, 'Wood species')
    assert.equal(de.product.woodSpecies, 'Holzart')
    assert.equal(cs.product.woodSpecies, 'Dřevina')
    assert.equal(de.product.specifications, 'Spezifikationen')
  })
})

describe('epoxy serving board EN/DE/CS consistency', () => {
  const epoxyProduct = {
    id: 'walnut-live-edge-charcuterie-board',
    slug: 'walnut-live-edge-charcuterie-board',
    name: 'Walnut Live Edge Charcuterie Board',
    category: 'Epoxy Pieces',
    materials: 'Black walnut and epoxy resin',
    woodType: 'American black walnut with black epoxy resin',
    dimensions: '39 × 30 × 2 cm',
    description: `Artistry Meets Functionality
This American Black Walnut live edge board with jet-black epoxy is a true showpiece.

✨ Features:
• Crafted from American Black Walnut with live edge character
• Jet-black epoxy resin river for bold contrast
• Finished with food-safe oil & wax

📏 Approximate Size:
39x30x2cm
`,
    englishDescription: `Artistry Meets Functionality
This American Black Walnut live edge board with jet-black epoxy is a true showpiece.

✨ Features:
• Crafted from American Black Walnut with live edge character
• Jet-black epoxy resin river for bold contrast
• Finished with food-safe oil & wax

📏 Approximate Size:
39x30x2cm
`,
  }

  const deDescription = `Kunst trifft Funktionalität
Dieses Brett aus amerikanischem Schwarznussbaum mit Naturkante und tiefschwarzem Epoxidharz ist ein echtes Schmuckstück.

✨ Merkmale:
• Aus amerikanischem Schwarznussbaum mit Naturkanten-Charakter
• Fluss aus tiefschwarzem Epoxidharz für starken Kontrast
• Veredelt mit lebensmittelechtem Öl und Wachs

📏 Ungefähre Größe:
39x30x2cm
`

  const csDescription = `Umění se snoubí s funkcí
Toto prkénko z amerického černého ořechu s přírodní hranou a hluboce černým epoxidem je opravdový kousek na obdiv.

✨ Vlastnosti:
• Z amerického černého ořechu s charakterem přírodní hrany
• Řeka z hluboce černé epoxidové pryskyřice pro silný kontrast
• Dokončeno olejem a voskem vhodnými pro styk s potravinami

📏 Přibližná velikost:
39x30x2cm
`

  function labelsFor(dict) {
    return {
      features: dict.product.features,
      perfectFor: dict.product.perfectFor,
      specifications: dict.product.specifications,
      materials: dict.product.materials,
      dimensions: dict.product.dimensions,
      finish: dict.product.finish,
      intendedUse: dict.product.intendedUse,
      battery: dict.product.battery,
      ingredients: dict.product.ingredients,
      options: dict.product.options,
      capacity: dict.product.capacity,
      howToUse: dict.product.howToUse,
      careInstructions: dict.product.careInstructions,
      productDetails: dict.product.productDetails,
      whyThisPiece: dict.product.whyThisPiece,
      handSelectedHardwoods: dict.product.handSelectedHardwoods,
      intendedUseEpoxyServing: dict.product.intendedUseEpoxyServing,
      finishEpoxyServing: dict.product.finishEpoxyServing,
      perfectForEpoxyServingBoard: dict.product.perfectForEpoxyServingBoard,
      perfectForBottleOpener: dict.product.perfectForBottleOpener,
      perfectForBookHolder: dict.product.perfectForBookHolder,
      typeContent: dict.product.typeContent,
      careBullets: dict.product.careBullets,
    }
  }

  function sectionOrder(html) {
    const headingMatches = [
      ...html.matchAll(/<h2 class="product-description__heading">([^<]+)<\/h2>/g),
    ]
    return headingMatches.map((m) => m[1])
  }

  it('keeps the same section structure and order in EN / DE / CS', () => {
    const enHtml = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: epoxyProduct,
        labels: labelsFor(en),
        locale: 'en',
      }),
    )
    const deHtml = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: { ...epoxyProduct, name: 'Charcuterie-Brett aus Nussbaum mit Naturkante', description: deDescription },
        labels: labelsFor(de),
        locale: 'de',
      }),
    )
    const csHtml = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: { ...epoxyProduct, name: 'Charcuterie prkénko z ořechu s přírodní hranou', description: csDescription },
        labels: labelsFor(cs),
        locale: 'cs',
      }),
    )

    for (const html of [enHtml, deHtml, csHtml]) {
      assert.match(html, /data-product-description="structured"/)
      assert.match(html, /product-info-grid__row/)
      assert.match(html, /data-care-bullets="true"/)
      assert.doesNotMatch(html, /Produktdetails|Detaily výrobku|Product Details/)
      assert.doesNotMatch(html, /everyday chopping|knife use|Alltag.*schneiden|každodenní krájení/i)
    }

    const enOrder = sectionOrder(enHtml)
    const deOrder = sectionOrder(deHtml)
    const csOrder = sectionOrder(csHtml)
    assert.deepEqual(
      enOrder.map((_, i) => i),
      deOrder.map((_, i) => i),
    )
    assert.equal(enOrder.length, deOrder.length)
    assert.equal(enOrder.length, csOrder.length)
    assert.ok(enOrder.includes('Features'))
    assert.ok(deOrder.includes('Merkmale'))
    assert.ok(csOrder.includes('Vlastnosti'))
    assert.ok(enOrder.includes(en.product.perfectFor) || enOrder.includes('Ideal for'))
    assert.ok(deOrder.includes('Ideal für'))
    assert.ok(csOrder.includes('Ideální pro'))
  })

  it('resolves walnut + epoxy materials and never uses generic hardwood fallback', () => {
    const enHtml = renderToStaticMarkup(
      createElement(ProductDetailInfo, {
        product: epoxyProduct,
        labels: labelsFor(en),
        locale: 'en',
        priceValue: 'CZK 3,000',
      }),
    )
    const deHtml = renderToStaticMarkup(
      createElement(ProductDetailInfo, {
        product: { ...epoxyProduct, description: deDescription },
        labels: labelsFor(de),
        locale: 'de',
        priceValue: 'CZK 3,000',
      }),
    )
    const csHtml = renderToStaticMarkup(
      createElement(ProductDetailInfo, {
        product: { ...epoxyProduct, description: csDescription },
        labels: labelsFor(cs),
        locale: 'cs',
        priceValue: 'CZK 3,000',
      }),
    )

    assert.match(enHtml, /Black walnut and epoxy resin/)
    assert.match(deHtml, /Amerikanischer Schwarznussbaum und Epoxidharz/)
    assert.match(csHtml, /Americký černý ořech a epoxidová pryskyřice/)
    assert.doesNotMatch(enHtml, /Hand-selected hardwoods|Carefully selected hardwoods/)
    assert.doesNotMatch(deHtml, /Sorgfältig ausgewählte Harthölzer/)
    assert.doesNotMatch(csHtml, /Pečlivě vybraná tvrdá dřeva/)
  })

  it('shows epoxy safety care, not cutting-board care, and serving intended use', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: epoxyProduct,
        labels: labelsFor(en),
        locale: 'en',
      }),
    )
    assert.match(html, /Do not cut directly on the epoxy surface/)
    assert.match(html, /Intended for serving, presentation and decorative use/)
    assert.match(html, /Serving and decorative presentation/)
    assert.match(html, /Charcuterie and cheese service/)
    assert.doesNotMatch(html, /Dry upright immediately after washing/)
    assert.doesNotMatch(html, /Reapply food-safe board oil when the wood begins to look dry/)

    const deHtml = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: { ...epoxyProduct, description: deDescription },
        labels: labelsFor(de),
        locale: 'de',
      }),
    )
    assert.match(deHtml, /Nicht direkt auf der Epoxidharzfläche schneiden/)
    assert.match(deHtml, /Servieren und dekorative Präsentation/)
    assert.doesNotMatch(deHtml, /Do not cut directly/)
    assert.doesNotMatch(deHtml, /Care Instructions/)

    // No duplicate care content
    assert.equal((html.match(/Do not cut directly on the epoxy surface/g) || []).length, 1)
  })

  it('keeps cutting-board and furniture care distinct from epoxy serving care', () => {
    const cutting = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: walnutMapleProduct(),
        labels: labelsFor(en),
        locale: 'en',
      }),
    )
    assert.match(cutting, /Hand wash only with mild soap and warm water/)
    assert.match(cutting, /Dry upright immediately after washing/)
    assert.doesNotMatch(cutting, /Do not cut directly on the epoxy surface/)

    const furniture = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          name: 'Black Walnut and Smokey Grey Epoxy Coffee Table',
          category: 'Epoxy Pieces',
          description: 'A handmade coffee table.',
          woodType: 'Black walnut',
        },
        labels: labelsFor(en),
        locale: 'en',
      }),
    )
    assert.match(furniture, /Wipe with a soft damp cloth/)
    assert.doesNotMatch(furniture, /Do not cut directly on the epoxy surface/)
    assert.doesNotMatch(furniture, /dishwasher/i)
  })
})

describe('product-type-specific content', () => {
  function labelsFor(dict) {
    return {
      features: dict.product.features,
      perfectFor: dict.product.perfectFor,
      specifications: dict.product.specifications,
      materials: dict.product.materials,
      dimensions: dict.product.dimensions,
      finish: dict.product.finish,
      intendedUse: dict.product.intendedUse,
      battery: dict.product.battery,
      ingredients: dict.product.ingredients,
      options: dict.product.options,
      capacity: dict.product.capacity,
      howToUse: dict.product.howToUse,
      careInstructions: dict.product.careInstructions,
      productDetails: dict.product.productDetails,
      whyThisPiece: dict.product.whyThisPiece,
      includedHardware: dict.product.includedHardware,
      handSelectedHardwoods: dict.product.handSelectedHardwoods,
      intendedUseEpoxyServing: dict.product.intendedUseEpoxyServing,
      finishEpoxyServing: dict.product.finishEpoxyServing,
      perfectForEpoxyServingBoard: dict.product.perfectForEpoxyServingBoard,
      perfectForBottleOpener: dict.product.perfectForBottleOpener,
      perfectForBookHolder: dict.product.perfectForBookHolder,
      typeContent: dict.product.typeContent,
      careBullets: dict.product.careBullets,
    }
  }

  function sectionOrder(html) {
    return [...html.matchAll(/<h2 class="product-description__heading">([^<]+)<\/h2>/g)].map(
      (m) => m[1],
    )
  }

  it('clock has no care section and keeps battery separate from dimensions', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          id: 'handcrafted-oak-clock-stormy-grey-epoxy',
          name: 'Handcrafted Oak Clock with Stormy Grey Epoxy Accents',
          category: 'Wall Pieces',
          materials: 'Wood',
          dimensions: '29 cm. 1× AA battery included. A thoughtful gift.',
          description: 'Unique oak clock.',
        },
        labels: labelsFor(en),
        locale: 'en',
      }),
    )

    assert.match(html, /Solid oak, clock mechanism and epoxy resin/)
    assert.match(html, /29 cm diameter/)
    assert.match(html, />Battery</)
    assert.match(html, /1 × AA battery included/)
    assert.doesNotMatch(html, /data-care-bullets/)
    assert.doesNotMatch(html, /Care Instructions/)
    assert.doesNotMatch(html, /Wipe clean with a soft dry/)
    assert.doesNotMatch(html, /thoughtful gift/i)
    // Battery must not be stuffed into the dimensions value.
    assert.doesNotMatch(html, /<dd>[^<]*29 cm[^<]*AA/i)
    // Epoxy accents must appear in Materials (display-only safety).
    assert.equal((html.match(/epoxy resin/gi) || []).length, 1)
  })

  it('wood butter shows beeswax ingredients, intended use, and How to use', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          id: 'natural-wood-butter-beeswax',
          name: 'Natural Wood Butter: Beeswax Wood Finish Conditioner',
          category: 'Wood Care',
          materials: 'Selected materials',
          description: 'Board conditioner.',
        },
        labels: labelsFor(en),
        locale: 'en',
      }),
    )

    assert.match(html, /Natural beeswax and food-grade mineral oil/)
    assert.match(html, />Ingredients</)
    assert.match(html, /Conditioning and protecting unfinished or oil-finished wooden kitchenware/)
    assert.match(html, />How to use</)
    assert.match(html, /Apply a small amount to clean, dry wood/)
    assert.doesNotMatch(html, /Hand-selected hardwoods/)
    assert.doesNotMatch(html, /Hand wash only with mild soap/)
    assert.doesNotMatch(html, /Care Instructions/)
  })

  it('wood wax includes carnauba wax, purpose note, and How to use', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          id: 'beeswax-wood-wax-natural-wood-conditioner',
          name: 'Beeswax Wood Wax: Natural Wood Conditioner & Board Butter',
          category: 'Wood Care',
          materials: 'Selected materials',
          description: 'Wood wax with carnauba.',
        },
        labels: labelsFor(en),
        locale: 'en',
      }),
    )

    assert.match(html, /carnauba wax/i)
    assert.match(html, /harder, more durable protective top layer/)
    assert.match(html, />How to use</)
    assert.match(html, /Buff away any excess/)
    assert.doesNotMatch(html, /Hand-selected hardwoods/)
    assert.doesNotMatch(html, /Care Instructions/)
  })

  it('bottle opener materials, ideal-for, and care omit storage boilerplate', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          id: 'walnut-maple-wall-mount-bottle-opener',
          name: 'Walnut & Maple Wall Mount Bottle Opener',
          category: 'Wall Pieces',
          description: 'Wall-mounted walnut and maple magnetic bottle opener.',
          materials: 'Wood',
        },
        labels: labelsFor(en),
        locale: 'en',
      }),
    )

    assert.match(html, /Black walnut, maple, purpleheart and metal bottle opener/)
    assert.match(html, /Man caves/)
    assert.match(html, /BBQ and grilling areas/)
    assert.match(html, /Home bars/)
    assert.match(html, /Keep metal hardware dry/)
    assert.match(html, /Magnets and wall mounting hardware/)
    assert.doesNotMatch(html, /Store in a dry, well-ventilated place/)
    assert.doesNotMatch(html, /Hand-selected hardwoods/)
  })

  it('book holder materials and dimensions exclude gift marketing copy', () => {
    const html = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: {
          id: 'two-in-one-book-stand-serving-board',
          name: '2-in-1 Book Stand & Serving Board – Black Walnut, Maple and Mahogany',
          category: 'Serving Boards',
          materials: 'Selected materials',
          dimensions:
            '475 × 170 × 25 mm. A thoughtful gift for foodies, home chefs, or book lovers.',
          description: 'Book stand and serving board.',
        },
        labels: labelsFor(en),
        locale: 'en',
      }),
    )

    assert.match(html, /Black walnut, maple and mahogany/)
    assert.match(html, /475 × 170 × 25 mm/)
    assert.match(html, /Cookbooks/)
    assert.match(html, /Tablets/)
    assert.doesNotMatch(html, /Hand-selected hardwoods/)
    assert.doesNotMatch(html, /<dd>[^<]*thoughtful gift[^<]*<\/dd>/i)
  })

  it('keeps EN/DE/CS section structure identical for bottle opener and wood butter', () => {
    const bottle = {
      id: 'walnut-maple-wall-mount-bottle-opener',
      name: 'Walnut & Maple Wall Mount Bottle Opener',
      category: 'Wall Pieces',
      description: 'Wall-mounted bottle opener.',
    }
    const butter = {
      id: 'natural-wood-butter-beeswax',
      name: 'Natural Wood Butter',
      category: 'Wood Care',
      description: 'Wood butter.',
    }

    for (const product of [bottle, butter]) {
      const enOrder = sectionOrder(
        renderToStaticMarkup(
          createElement(ProductDetailInfoGrid, {
            product,
            labels: labelsFor(en),
            locale: 'en',
          }),
        ),
      )
      const deOrder = sectionOrder(
        renderToStaticMarkup(
          createElement(ProductDetailInfoGrid, {
            product,
            labels: labelsFor(de),
            locale: 'de',
          }),
        ),
      )
      const csOrder = sectionOrder(
        renderToStaticMarkup(
          createElement(ProductDetailInfoGrid, {
            product,
            labels: labelsFor(cs),
            locale: 'cs',
          }),
        ),
      )
      assert.equal(enOrder.length, deOrder.length)
      assert.equal(enOrder.length, csOrder.length)
    }

    const butterDe = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: butter,
        labels: labelsFor(de),
        locale: 'de',
      }),
    )
    const butterCs = renderToStaticMarkup(
      createElement(ProductDetailInfoGrid, {
        product: butter,
        labels: labelsFor(cs),
        locale: 'cs',
      }),
    )
    assert.match(butterDe, />Anwendung</)
    assert.match(butterCs, />Jak používat</)
    assert.match(butterDe, /Natürliches Bienenwachs und lebensmittelechtes Mineralöl/)
    assert.match(butterCs, /Přírodní včelí vosk a potravinářský minerální olej/)
  })
})

describe('epoxy materials safety (EN / DE / CS)', () => {
  function labelsFor(dict) {
    return {
      features: dict.product.features,
      perfectFor: dict.product.perfectFor,
      specifications: dict.product.specifications,
      materials: dict.product.materials,
      dimensions: dict.product.dimensions,
      finish: dict.product.finish,
      intendedUse: dict.product.intendedUse,
      battery: dict.product.battery,
      ingredients: dict.product.ingredients,
      handSelectedHardwoods: dict.product.handSelectedHardwoods,
      intendedUseEpoxyServing: dict.product.intendedUseEpoxyServing,
      finishEpoxyServing: dict.product.finishEpoxyServing,
      perfectForEpoxyServingBoard: dict.product.perfectForEpoxyServingBoard,
      perfectForBottleOpener: dict.product.perfectForBottleOpener,
      perfectForBookHolder: dict.product.perfectForBookHolder,
      typeContent: dict.product.typeContent,
      careBullets: dict.product.careBullets,
    }
  }

  const epoxyCatalogue = [
    {
      id: 'walnut-live-edge-charcuterie-board',
      name: 'Walnut Live Edge Charcuterie Board',
      category: 'Epoxy Pieces',
      materials: 'Black walnut and epoxy resin',
      woodType: 'American black walnut with black epoxy resin',
    },
    {
      id: 'european-oak-lux-blue-epoxy-serving-board',
      name: 'European Oak & Lux Blue Epoxy Resin Serving Board',
      category: 'Epoxy Pieces',
      materials: 'European oak and epoxy resin',
      woodType: 'European oak with lux blue epoxy resin',
    },
    {
      id: 'european-walnut-aztec-gold-epoxy-serving-board',
      name: 'European Walnut with Aztec Gold Epoxy Serving Board',
      category: 'Serving Boards',
      materials: 'European walnut and epoxy resin',
      woodType: 'European walnut with Aztec gold epoxy resin',
    },
    {
      id: 'handmade-oak-epoxy-lego-brick-serving-board',
      name: 'Handmade Oak & Epoxy LEGO Brick Serving Board',
      category: 'Epoxy Pieces',
      materials: 'Oak and epoxy resin',
      woodType: 'Oak and epoxy resin',
    },
    {
      id: 'maple-blue-epoxy-coasters',
      name: 'Maple with Blue Epoxy Coasters',
      category: 'Coasters',
      materials: 'Wood and epoxy',
      woodType: 'Maple and blue epoxy',
    },
    {
      id: 'handcrafted-oak-clock-stormy-grey-epoxy',
      name: 'Handcrafted Oak Clock with Stormy Grey Epoxy Accents',
      category: 'Wall Pieces',
      materials: 'Solid oak and clock mechanism',
      woodType: 'Oak',
    },
    {
      id: 'epoxy-coffee-table-missing-materials',
      name: 'Black Walnut and Smokey Grey Epoxy Coffee Table',
      category: 'Epoxy Pieces',
      woodType: 'Black walnut',
    },
  ]

  const epoxyTerm = {
    en: /epoxy resin/i,
    de: /Epoxidharz/,
    cs: /epoxidová pryskyřice/i,
  }

  it('ensureEpoxyResinInMaterialsDisplay appends, upgrades, and never duplicates', () => {
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Black walnut', 'en'),
      'Black walnut and epoxy resin',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Black walnut and epoxy resin', 'en'),
      'Black walnut and epoxy resin',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Black walnut, maple', 'en'),
      'Black walnut, maple and epoxy resin',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Maple and epoxy', 'en'),
      'Maple and epoxy resin',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Amerikanischer Schwarznussbaum', 'de'),
      'Amerikanischer Schwarznussbaum und Epoxidharz',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay(
        'Amerikanischer Schwarznussbaum und Epoxidharz',
        'de',
      ),
      'Amerikanischer Schwarznussbaum und Epoxidharz',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Americký černý ořech', 'cs'),
      'Americký černý ořech a epoxidová pryskyřice',
    )
    assert.equal(
      ensureEpoxyResinInMaterialsDisplay('Javor a epoxid', 'cs'),
      'Javor a epoxidová pryskyřice',
    )
    assert.ok(materialsLabelHasEpoxyResin('Black walnut and epoxy resin'))
    assert.equal(materialsLabelHasEpoxyResin('Black walnut and epoxy'), false)
  })

  it('every classified epoxy product shows epoxy resin in Materials for EN / DE / CS', () => {
    for (const product of epoxyCatalogue) {
      assert.equal(productHasEpoxy(product), true, product.id)

      for (const [locale, dict] of [
        ['en', en],
        ['de', de],
        ['cs', cs],
      ]) {
        const content = resolveProductDetailContent(product, labelsFor(dict), locale)
        assert.match(
          content.materialsText,
          epoxyTerm[locale],
          `${product.id} ${locale} materialsText`,
        )
        assert.match(
          content.materialsSummary,
          epoxyTerm[locale],
          `${product.id} ${locale} materialsSummary`,
        )
        assert.equal(
          content.materialsText,
          content.materialsLabel,
          `${product.id} ${locale} purchase/specs source stay in sync`,
        )
        const resinMatches = content.materialsText.match(epoxyTerm[locale]) || []
        assert.equal(
          resinMatches.length,
          1,
          `${product.id} ${locale} must not duplicate epoxy resin`,
        )
        if (locale !== 'en') {
          assert.doesNotMatch(
            content.materialsText,
            /\bEpoxy resin\b/,
            `${product.id} ${locale} must not hardcode English epoxy resin`,
          )
        }
      }
    }
  })

  it('purchase summary and Specifications both show the same epoxy materials', () => {
    const product = {
      id: 'epoxy-coffee-table-missing-materials',
      name: 'Black Walnut and Smokey Grey Epoxy Coffee Table',
      category: 'Epoxy Pieces',
      woodType: 'Black walnut',
      description: 'A handmade coffee table.',
    }

    for (const [locale, dict, expected] of [
      ['en', en, 'Black walnut and epoxy resin'],
      ['de', de, 'Amerikanischer Schwarznussbaum und Epoxidharz'],
      ['cs', cs, 'Americký černý ořech a epoxidová pryskyřice'],
    ]) {
      const purchase = renderToStaticMarkup(
        createElement(ProductDetailPurchaseInfo, {
          product,
          labels: labelsFor(dict),
          locale,
          priceValue: 'CZK 1',
        }),
      )
      const specs = renderToStaticMarkup(
        createElement(ProductDetailInfoGrid, {
          product,
          labels: labelsFor(dict),
          locale,
        }),
      )
      assert.match(purchase, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      assert.match(specs, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      assert.equal((purchase.match(epoxyTerm[locale]) || []).length, 1)
      assert.equal((specs.match(epoxyTerm[locale]) || []).length, 1)
    }
  })

  it('does not alter stored materials when appending for display', () => {
    const product = {
      id: 'epoxy-coffee-table-missing-materials',
      name: 'Black Walnut Epoxy Coffee Table',
      category: 'Epoxy Pieces',
      woodType: 'Black walnut',
      materials: 'Black walnut',
    }
    const content = resolveProductDetailContent(product, labelsFor(en), 'en')
    assert.equal(content.materialsText, 'Black walnut and epoxy resin')
    assert.equal(product.materials, 'Black walnut')
    assert.equal(product.woodType, 'Black walnut')
  })

  it('leaves non-epoxy product materials unchanged', () => {
    const cuttingProduct = {
      id: 'walnut-maple-end-grain-cutting-board',
      name: 'Walnut & Maple End Grain Cutting Board',
      category: 'Cutting Boards',
      materials: 'Black walnut and hard maple',
      woodType: 'Walnut and maple',
    }
    assert.equal(productHasEpoxy(cuttingProduct), false)
    const cutting = resolveProductDetailContent(cuttingProduct, labelsFor(en), 'en')
    assert.equal(cutting.materialsText, 'Black walnut and hard maple')
    assert.doesNotMatch(cutting.materialsText, /epoxy/i)

    const bookProduct = {
      id: 'two-in-one-book-stand-serving-board',
      name: '2-in-1 Book Stand & Serving Board',
      category: 'Serving Boards',
      materials: 'Black walnut, maple and mahogany',
    }
    assert.equal(productHasEpoxy(bookProduct), false)
    const book = resolveProductDetailContent(bookProduct, labelsFor(en), 'en')
    assert.equal(book.materialsText, 'Black walnut, maple and mahogany')
    assert.doesNotMatch(book.materialsText, /epoxy/i)

    const butterProduct = {
      id: 'natural-wood-butter-beeswax',
      name: 'Natural Wood Butter',
      category: 'Wood Care',
      materials: 'Selected materials',
    }
    assert.equal(productHasEpoxy(butterProduct), false)
    const butter = resolveProductDetailContent(butterProduct, labelsFor(en), 'en')
    assert.doesNotMatch(butter.materialsText, /epoxy/i)
  })
})

describe('ProductDetailPage App.jsx wiring', () => {
  it('uses purchase + info grid and never passes Etsy copy as PageShell intro', async () => {
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const detailStart = app.indexOf('function ProductDetailPage()')
    const detailEnd = app.indexOf('function GalleryPage()')
    assert.ok(detailStart >= 0 && detailEnd > detailStart)
    const detail = app.slice(detailStart, detailEnd)

    assert.match(detail, /<ProductDetailPurchaseInfo/)
    assert.match(detail, /<ProductDetailInfoGrid/)
    assert.equal((detail.match(/<ProductDetailPurchaseInfo/g) || []).length, 1)
    assert.equal((detail.match(/<ProductDetailInfoGrid/g) || []).length, 1)
    assert.doesNotMatch(detail, /intro=\{shortIntro/)
    assert.doesNotMatch(detail, /intro=\{product\.shortDescription/)
    assert.doesNotMatch(detail, /intro=\{parsedDescription/)
    assert.doesNotMatch(detail, /Selected materials/)
    assert.doesNotMatch(detail, /\{product\.description\}/)
    assert.doesNotMatch(detail, /\{product\.longDescription\}/)
    assert.doesNotMatch(detail, /alsoListedExternally/)
    assert.doesNotMatch(detail, /actions\.viewOnEtsy/)
    assert.doesNotMatch(detail, /galleryImageCount=/)
    assert.match(detail, /eyebrow=\{t\('product\.availablePieces'\)\}/)
    const foundShellMatch = detail.match(
      /<PageShell\n\s*variant="product"\n\s*eyebrow=\{t\('product\.availablePieces'\)\}\n\s*title=\{product\.name\}\n\s*>/,
    )
    assert.ok(foundShellMatch, 'expected product PageShell without intro prop')
  })

  it('keeps sticky purchase card and hero structure classes', async () => {
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
    const detailStart = app.indexOf('function ProductDetailPage()')
    const detailEnd = app.indexOf('function GalleryPage()')
    const detail = app.slice(detailStart, detailEnd)

    assert.match(detail, /product-detail-hero/)
    assert.match(detail, /product-detail-purchase/)
    assert.match(detail, /product-detail-info-section/)
    assert.match(css, /\.product-detail-purchase\s*\{[\s\S]*?position:\s*sticky/)
    assert.match(css, /product-info-card/)
    assert.match(css, /clamp\(3rem,\s*6vw,\s*6\.5rem\)/)
    assert.match(css, /text-wrap:\s*balance/)
    assert.doesNotMatch(css, /\.product-info-card\s*\{[^}]*height:\s*100%/)
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
