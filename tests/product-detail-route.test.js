/**
 * Product detail route stability — blank-page regression suite.
 * Covers social proof i18n crash, error boundary, gallery/lightbox guards,
 * locale image/API parity, and missing-translation fallback.
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'node:test'

import { mapPublicProductRow } from '../functions/api/_public_products.js'
import {
  ProductImageLightbox,
  restoreLightboxDocumentStyles,
} from '../src/components/ProductImageLightbox.js'
import { PublicRouteErrorFallback } from '../src/components/PublicRouteErrorFallback.js'
import {
  hasValidProductImageUrl,
  normalizeProductGallery,
  resolveActiveGalleryImage,
} from '../src/data/normalizeProductGallery.js'
import { getProductSocialProof } from '../src/data/reviews.js'
import { localizePath, parseLocaleFromPathname } from '../src/i18n/localePaths.js'
import { translate } from '../src/i18n/translate.js'

const IMAGE_A = 'https://i.etsystatic.com/a.jpg'
const IMAGE_B = 'https://i.etsystatic.com/b.jpg'

function SocialProofFixture({ review }) {
  const rating = Number.isFinite(Number(review.rating)) ? Number(review.rating) : 0
  const quote = review.shortQuote || review.quote || ''
  const name = review.name || ''
  const outOfFive = translate('socialProof.outOfFive', 'en')
  const verified = translate('socialProof.verifiedReview', 'en')
  return createElement(
    'div',
    { className: 'product-social-proof', 'data-social-proof': 'true' },
    createElement(
      'p',
      null,
      createElement('span', { 'aria-label': `${rating} ${outOfFive}` }, '★★★★★'),
      ` “${quote}” — ${name}, ${verified}`,
    ),
  )
}

describe('product detail blank-page regression', () => {
  it('cutting-board products resolve social proof (the previous crash path)', () => {
    const proof = getProductSocialProof({
      id: 'handmade-black-walnut-maple-end-grain-cutting-board',
      category: 'Cutting Boards',
      name: 'Walnut & Maple',
    })
    assert.ok(proof)
    assert.ok(proof.rating)
    assert.ok(proof.quote || proof.shortQuote)
  })

  it('social proof copy renders without referencing an undefined t()', () => {
    const proof = getProductSocialProof({
      id: 'handmade-oak-end-grain-cutting-board',
      category: 'Cutting Boards',
      name: 'Oak',
    })
    const html = renderToStaticMarkup(createElement(SocialProofFixture, { review: proof }))
    assert.match(html, /data-social-proof="true"/)
    assert.match(html, /out of 5 stars/)
    assert.match(html, /verified Etsy review/)
    assert.doesNotMatch(html, /undefined/)
  })

  it('ProductSocialProof in App.jsx calls useLocale before using t()', async () => {
    const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const start = source.indexOf('function ProductSocialProof')
    const end = source.indexOf('\nfunction ', start + 1)
    const body = source.slice(start, end === -1 ? undefined : end)
    assert.match(body, /const \{ t \} = useLocale\(\)/)
    assert.match(body, /t\('socialProof\.outOfFive'\)/)
    assert.match(body, /t\('socialProof\.verifiedReview'\)/)
    const tIndex = body.indexOf("t('socialProof")
    const localeIndex = body.indexOf('useLocale()')
    assert.ok(localeIndex !== -1 && tIndex !== -1 && localeIndex < tIndex)
  })

  it('does not blank when gallery images are missing or empty', () => {
    const empty = normalizeProductGallery(null, { productName: 'X', productId: 'x' })
    assert.deepEqual(empty, [])
    assert.equal(resolveActiveGalleryImage(empty, 0), null)
    assert.equal(hasValidProductImageUrl(undefined), false)

    const html = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images: undefined,
        activeImageIndex: 0,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.equal(html, '')
  })

  it('PublicRouteErrorFallback is branded and hides stack traces', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ['/available-pieces/oak'] },
        createElement(PublicRouteErrorFallback, {
          t: (key) => translate(key, 'en'),
          localize: (path) => localizePath(path, 'en'),
          onRetry() {},
          onReload() {},
        }),
      ),
    )
    assert.match(html, /data-public-route-error="true"/)
    assert.match(html, /Something went wrong/)
    assert.match(html, /Back to Available Pieces/)
    assert.match(html, /Try again/)
    assert.match(html, /Reload page/)
    assert.match(html, /Dom/)
    assert.doesNotMatch(html, /stack/i)
    assert.doesNotMatch(html, /componentStack/)
  })

  it('SiteLayout wraps public Routes with PublicRouteErrorBoundary', async () => {
    const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    assert.match(source, /PublicRouteErrorBoundary/)
    assert.match(
      source,
      /<PublicRouteErrorBoundary>[\s\S]*<Routes>[\s\S]*available-pieces\/:productId/,
    )
  })

  it('missing DE/CS translations still return a product object (never null)', () => {
    const row = {
      listing_id: 99,
      slug: 'test-board',
      title: 'English Title',
      custom_title: null,
      description: 'English body',
      custom_description: null,
      custom_title_de: null,
      custom_description_de: null,
      seo_title_de: null,
      seo_description_de: null,
      custom_title_cs: null,
      custom_description_cs: null,
      seo_title_cs: null,
      seo_description_cs: null,
      etsy_state: 'active',
      website_status: 'available',
      quantity: 1,
      price_amount: 10000,
      price_divisor: 100,
      price_currency: 'CZK',
      website_category: 'Cutting Boards',
      website_featured: 0,
      website_use_local_images: 0,
      primary_image_url: IMAGE_A,
      image_urls_json: JSON.stringify([IMAGE_A, IMAGE_B]),
      local_images_json: null,
      etsy_url: 'https://www.etsy.com/listing/99',
    }

    const en = mapPublicProductRow(row, { locale: 'en' })
    const de = mapPublicProductRow(row, { locale: 'de' })
    const cs = mapPublicProductRow(row, { locale: 'cs' })

    assert.ok(en)
    assert.ok(de)
    assert.ok(cs)
    assert.equal(de.title, 'English Title')
    assert.equal(cs.title, 'English Title')
    assert.deepEqual(de.imageUrls, en.imageUrls)
    assert.deepEqual(cs.imageUrls, en.imageUrls)
  })

  it('locale product paths parse for EN/DE/CS including direct URL refresh', () => {
    const slug = 'handmade-black-walnut-maple-end-grain-cutting-board'
    assert.equal(
      parseLocaleFromPathname(`/available-pieces/${slug}`).pathnameWithoutLocale,
      `/available-pieces/${slug}`,
    )
    assert.equal(parseLocaleFromPathname(`/de/available-pieces/${slug}`).locale, 'de')
    assert.equal(parseLocaleFromPathname(`/cs/available-pieces/${slug}`).locale, 'cs')
    assert.equal(
      localizePath(`/available-pieces/${slug}`, 'de'),
      `/de/available-pieces/${slug}`,
    )
  })

  it('lightbox restores body overflow / inert / aria-hidden cleanup helpers', () => {
    const attrs = new Map()
    const style = { overflow: 'hidden' }
    const body = {
      style,
      hasAttribute: (name) => attrs.has(name),
      getAttribute: (name) => (attrs.has(name) ? attrs.get(name) : null),
      removeAttribute: (name) => {
        attrs.delete(name)
      },
    }
    body.style.removeProperty = (prop) => {
      delete body.style[prop]
    }
    const documentElement = {
      hasAttribute: (name) => attrs.has(`html:${name}`),
      removeAttribute: (name) => attrs.delete(`html:${name}`),
    }
    attrs.set('inert', '')
    attrs.set('aria-hidden', 'true')
    attrs.set('html:inert', '')

    const previousDocument = globalThis.document
    globalThis.document = { body, documentElement }
    try {
      restoreLightboxDocumentStyles('')
      assert.equal(body.style.overflow, undefined)
      assert.equal(body.hasAttribute('inert'), false)
      assert.equal(body.getAttribute('aria-hidden'), null)
      assert.equal(documentElement.hasAttribute('inert'), false)
    } finally {
      globalThis.document = previousDocument
    }
  })

  it('ProductDetailPage resets lightbox index on pathname/locale/slug change', async () => {
    const source = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const start = source.indexOf('function ProductDetailPage')
    const end = source.indexOf('\nfunction GalleryPage')
    const body = source.slice(start, end)
    assert.match(body, /setActiveImageIndex\(null\)/)
    assert.match(body, /location\.pathname/)
    assert.match(body, /productId/)
    assert.match(body, /locale/)
    assert.match(body, /Array\.isArray\(rawImages\)/)
    assert.match(body, /loadError/)
  })

  it('error dictionary keys exist for EN/DE/CS', () => {
    for (const locale of ['en', 'de', 'cs']) {
      assert.ok(translate('errors.somethingWentWrong', locale))
      assert.ok(translate('errors.pageLoadFailed', locale))
      assert.ok(translate('errors.tryAgain', locale))
      assert.ok(translate('errors.reloadPage', locale))
      assert.ok(translate('errors.catalogueUnavailable', locale))
      assert.notEqual(
        translate('errors.somethingWentWrong', locale),
        'errors.somethingWentWrong',
      )
    }
  })
})
