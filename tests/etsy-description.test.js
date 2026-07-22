/**
 * Tests for Etsy product description parsing and product-detail display safety.
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

import {
  cleanSeparatorAsterisks,
  containsDangerousHtmlIntent,
  extractMaterialsFromTitle,
  matchSectionHeading,
  parseEtsyDescription,
  resolveMaterialsLabel,
  sanitizeDimensionsText,
  stripHtmlToText,
} from '../src/data/parseEtsyDescription.js'

const WALNUT_MAPLE_SAMPLE = `
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

const OAK_BUTCHER_WALL = `
Solid oak butcher block handmade in Prague. Dense surface for heavy prep work. Food-safe finish. Built to last for years of daily kitchen use with a beautiful natural oak grain that deepens over time. Finished by hand in our Prague workshop. Ships carefully packed. Perfect for chopping, carving, and serving. Oil regularly. Hand wash only. Never dishwasher. European oak chosen for hardness and character. A genuine heirloom piece for serious home cooks who want something better than bamboo or plastic.
`.trim()

describe('stripHtmlToText', () => {
  it('removes tags without interpreting HTML', () => {
    assert.equal(stripHtmlToText('<p>Hello<br/>world</p>'), 'Hello\nworld')
    assert.doesNotMatch(stripHtmlToText('<script>alert(1)</script>'), /script/)
  })
})

describe('cleanSeparatorAsterisks', () => {
  it('removes decorative asterisk separators and keeps content', () => {
    const cleaned = cleanSeparatorAsterisks('Intro\n***\n* Feature one\n* Feature two')
    assert.doesNotMatch(cleaned, /\*/)
    assert.match(cleaned, /Feature one/)
    assert.match(cleaned, /Feature two/)
  })
})

describe('matchSectionHeading', () => {
  it('detects expected Etsy section headings', () => {
    assert.equal(matchSectionHeading('Features')?.key, 'features')
    assert.equal(matchSectionHeading('Details')?.key, 'features')
    assert.equal(matchSectionHeading('Perfect For')?.key, 'perfectFor')
    assert.equal(matchSectionHeading('Why End Grain?')?.key, 'whyEndGrain')
    assert.equal(matchSectionHeading('Dimensions')?.key, 'dimensions')
    assert.equal(matchSectionHeading('Care Instructions')?.key, 'careInstructions')
    assert.equal(matchSectionHeading('Care')?.key, 'careInstructions')
    assert.equal(matchSectionHeading('Important')?.key, 'importantNotes')
    assert.equal(matchSectionHeading('Materials')?.key, 'materials')
    assert.equal(matchSectionHeading('✨ Features')?.key, 'features')
    assert.equal(matchSectionHeading('Merkmale')?.key, 'features')
    assert.equal(matchSectionHeading('Vlastnosti')?.key, 'features')
    assert.equal(matchSectionHeading('Ungefähre Größe')?.key, 'dimensions')
    assert.equal(matchSectionHeading('Přibližná velikost')?.key, 'dimensions')
    assert.equal(matchSectionHeading('Pflegehinweise')?.key, 'careInstructions')
    assert.equal(matchSectionHeading('Péče')?.key, 'careInstructions')
  })
})

describe('parseEtsyDescription', () => {
  it('parses starred Etsy sections into structured content', () => {
    const parsed = parseEtsyDescription(WALNUT_MAPLE_SAMPLE, {
      title: 'Walnut & Maple End Grain Cutting Board',
    })
    assert.equal(parsed.confidence, 'high')
    assert.match(parsed.intro, /Walnut & Maple/)
    assert.ok(parsed.intro.length <= 230)
    assert.ok(parsed.features.length >= 3)
    assert.ok(parsed.perfectFor.length >= 3)
    assert.match(parsed.whyEndGrain, /absorb the knife/)
    assert.match(parsed.dimensions, /40/)
    assert.match(parsed.careInstructions, /Hand wash/)
    assert.match(parsed.materials, /walnut|maple/i)
    const flat = [
      parsed.intro,
      ...parsed.features,
      ...parsed.perfectFor,
      parsed.whyEndGrain,
      parsed.dimensions,
      parsed.careInstructions,
    ].join('\n')
    assert.doesNotMatch(flat, /\*/)
  })

  it('extracts bullets from * separators', () => {
    const parsed = parseEtsyDescription('Features\n* One\n* Two\n* Three')
    assert.deepEqual(parsed.features, ['One', 'Two', 'Three'])
  })

  it('extracts dimensions and care instructions', () => {
    const parsed = parseEtsyDescription(
      'Board\n\nDimensions\n45 x 30 cm\n\nCare Instructions\nOil monthly',
    )
    assert.match(parsed.dimensions, /45 x 30/)
    assert.match(parsed.careInstructions, /Oil monthly/)
  })

  it('low-confidence fallback uses short overview and detail bullets, not a wall of text', () => {
    const parsed = parseEtsyDescription(OAK_BUTCHER_WALL, {
      title: 'Oak Butcher Block',
    })
    assert.equal(parsed.confidence, 'low')
    assert.ok(parsed.intro.length > 0)
    assert.ok(parsed.intro.length <= 230)
    assert.ok(parsed.productDetails.length >= 1)
    assert.ok(parsed.remaining.length === 0)
    assert.notEqual(parsed.intro, OAK_BUTCHER_WALL)
    assert.ok(parsed.intro.length < OAK_BUTCHER_WALL.length / 2)
    assert.match(parsed.materials, /oak/i)
  })

  it('never returns an empty description for non-empty input', () => {
    const parsed = parseEtsyDescription('Just one sentence about a board.')
    assert.ok(parsed.intro.length > 0)
  })

  it('strips HTML and ignores dangerous markup intent', () => {
    const parsed = parseEtsyDescription(
      '<p>Safe board</p><script>alert(1)</script>\nFeatures\n* Solid oak',
    )
    assert.match(parsed.intro, /Safe board/)
    assert.doesNotMatch(parsed.intro, /script/)
    assert.equal(parsed.features[0], 'Solid oak')
    assert.equal(containsDangerousHtmlIntent(parsed.intro), false)
  })
})

describe('sanitizeDimensionsText', () => {
  it('keeps measurement-only dimensions', () => {
    const result = sanitizeDimensionsText('40 × 30 × 4 cm')
    assert.equal(result.dimensions, '40 × 30 × 4 cm')
    assert.equal(result.battery, '')
  })

  it('extracts battery and strips gift marketing copy', () => {
    const result = sanitizeDimensionsText(
      '29 cm diameter. 1 × AA battery included. A thoughtful gift for foodies.',
    )
    assert.match(result.dimensions, /29 cm/)
    assert.doesNotMatch(result.dimensions, /thoughtful gift|foodies|battery/i)
    assert.match(result.battery, /AA/i)
  })

  it('moves custom sizing into options', () => {
    const result = sanitizeDimensionsText('45 x 30 cm. Custom sizing available on request.')
    assert.match(result.dimensions, /45 x 30/)
    assert.match(result.options, /Custom sizing/i)
  })
})

describe('extractMaterialsFromTitle', () => {
  it('maps walnut/maple and oak titles to polished labels', () => {
    assert.equal(
      extractMaterialsFromTitle('Walnut & Maple End Grain Cutting Board'),
      'Black walnut and hard maple',
    )
    assert.equal(extractMaterialsFromTitle('Oak Butcher Block'), 'Solid oak')
    assert.equal(extractMaterialsFromTitle('Oak End Grain Cutting Board'), 'Solid oak')
  })
})

describe('resolveMaterialsLabel', () => {
  it('avoids generic Selected materials label', () => {
    assert.equal(
      resolveMaterialsLabel({ materials: 'Selected materials' }, { materials: '' }),
      'Hand-selected hardwoods',
    )
    assert.equal(
      resolveMaterialsLabel({ materials: '' }, { materials: 'Walnut and maple' }),
      'Walnut and maple',
    )
  })

  it('infers materials from product title when needed', () => {
    assert.equal(
      resolveMaterialsLabel(
        { name: 'Walnut & Maple End Grain Cutting Board', materials: 'Selected materials' },
        { materials: '' },
      ),
      'Black walnut and hard maple',
    )
    assert.equal(
      resolveMaterialsLabel({ name: 'Oak End Grain Cutting Board' }, { materials: '' }),
      'Solid oak',
    )
  })

  it('prefers specific woodType over generic Wood and epoxy resin', () => {
    assert.equal(
      resolveMaterialsLabel(
        {
          materials: 'Wood and epoxy resin',
          woodType: 'American black walnut with black epoxy resin',
          slug: 'walnut-live-edge-charcuterie-board',
        },
        { materials: '' },
      ),
      'Black walnut and epoxy resin',
    )
  })
})

describe('product detail display safety', () => {
  it('does not use dangerouslySetInnerHTML in product description components', async () => {
    const component = await readFile(
      new URL('../src/components/ProductDescription.js', import.meta.url),
      'utf8',
    )
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    assert.doesNotMatch(component, /dangerouslySetInnerHTML\s*=/)
    assert.doesNotMatch(app, /dangerouslySetInnerHTML\s*=/)
  })

  it('does not pass Etsy shortDescription as PageShell intro under the title', async () => {
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const detailStart = app.indexOf('function ProductDetailPage()')
    const detailEnd = app.indexOf('function GalleryPage()')
    const detail = app.slice(detailStart, detailEnd)
    assert.match(detail, /<ProductDetailPurchaseInfo/)
    assert.match(detail, /<ProductDetailInfoGrid/)
    assert.doesNotMatch(detail, /intro=\{shortIntro/)
    assert.doesNotMatch(detail, /intro=\{product\.shortDescription/)
    assert.doesNotMatch(detail, /Selected materials/)
    assert.equal((detail.match(/<ProductDetailPurchaseInfo/g) || []).length, 1)
    assert.equal((detail.match(/<ProductDetailInfoGrid/g) || []).length, 1)
    assert.match(
      detail,
      /<PageShell\n\s*variant="product"\n\s*eyebrow=\{t\('product\.availablePieces'\)\}\n\s*title=\{product\.name\}\n\s*>/,
    )
  })

  it('defines restrained product title typography below the fixed header', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    assert.match(css, /product-detail-title/)
    assert.match(css, /clamp\(3rem,\s*6vw,\s*6\.5rem\)/)
    assert.match(css, /text-wrap:\s*balance/)
    assert.match(app, /variant="product"/)
    assert.match(app, /page-shell--product/)
    assert.match(app, /pt-24/)
  })

  it('mobile product description styles keep readable body size', async () => {
    const css = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')
    assert.match(css, /product-description__intro/)
    assert.match(css, /line-height:\s*1\.6/)
    assert.match(css, /product-description__specs/)
    assert.match(css, /product-detail-layout/)
    assert.match(css, /max-width:\s*65ch/)
  })
})
