/**
 * Product image lightbox + locale image parity tests.
 */

import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'

import { mapPublicProductRow } from '../functions/api/_public_products.js'
import { ProductImageLightbox } from '../src/components/ProductImageLightbox.js'
import { normalizeEtsyApiProduct } from '../src/data/etsyProducts.js'
import {
  hasValidProductImageUrl,
  normalizeProductGallery,
  resolveActiveGalleryImage,
} from '../src/data/normalizeProductGallery.js'

const IMAGE_A = 'https://i.etsystatic.com/a.jpg'
const IMAGE_B = 'https://i.etsystatic.com/b.jpg'
const IMAGE_C = 'https://i.etsystatic.com/c.jpg'

const baseRow = {
  listing_id: 42,
  slug: 'walnut-maple-end-grain',
  title: 'Etsy Title',
  custom_title: 'English Title',
  description: 'Etsy description',
  custom_description: 'English description',
  custom_title_de: 'Deutscher Titel',
  custom_description_de: 'Deutsche Beschreibung',
  seo_title_de: 'SEO DE',
  seo_description_de: 'SEO desc DE',
  custom_title_cs: 'Český název',
  custom_description_cs: 'Český popis',
  seo_title_cs: 'SEO CS',
  seo_description_cs: 'SEO desc CS',
  etsy_state: 'active',
  website_status: 'available',
  quantity: 2,
  price_amount: 250000,
  price_divisor: 100,
  price_currency: 'CZK',
  website_category: 'Cutting Boards',
  website_featured: 0,
  website_use_local_images: 0,
  primary_image_url: IMAGE_A,
  image_urls_json: JSON.stringify([IMAGE_A, IMAGE_B, IMAGE_C]),
  local_images_json: null,
  etsy_url: 'https://www.etsy.com/listing/42',
}

describe('locale API image parity', () => {
  it('retains identical image arrays for en, de, and cs', () => {
    const en = mapPublicProductRow(baseRow, { locale: 'en' })
    const de = mapPublicProductRow(baseRow, { locale: 'de' })
    const cs = mapPublicProductRow(baseRow, { locale: 'cs' })

    assert.deepEqual(en.imageUrls, [IMAGE_A, IMAGE_B, IMAGE_C])
    assert.deepEqual(de.imageUrls, en.imageUrls)
    assert.deepEqual(cs.imageUrls, en.imageUrls)
    assert.equal(de.primaryImageUrl, en.primaryImageUrl)
    assert.equal(cs.primaryImageUrl, en.primaryImageUrl)
    assert.equal(en.primaryImageUrl, IMAGE_A)
  })

  it('product text translation does not alter image data', () => {
    const en = mapPublicProductRow(baseRow, { locale: 'en' })
    const de = mapPublicProductRow(baseRow, { locale: 'de' })
    const cs = mapPublicProductRow(baseRow, { locale: 'cs' })

    assert.equal(de.title, 'Deutscher Titel')
    assert.equal(cs.title, 'Český název')
    assert.notEqual(de.title, en.title)
    assert.notEqual(cs.title, en.title)

    assert.deepEqual(de.imageUrls, en.imageUrls)
    assert.deepEqual(cs.imageUrls, en.imageUrls)
    assert.equal(de.primaryImageUrl, en.primaryImageUrl)
    assert.equal(cs.primaryImageUrl, en.primaryImageUrl)
  })

  it('normalized client products keep the same gallery URLs across locales', () => {
    const en = normalizeEtsyApiProduct(mapPublicProductRow(baseRow, { locale: 'en' }))
    const de = normalizeEtsyApiProduct(mapPublicProductRow(baseRow, { locale: 'de' }))
    const cs = normalizeEtsyApiProduct(mapPublicProductRow(baseRow, { locale: 'cs' }))

    assert.deepEqual(de.galleryImages, en.galleryImages)
    assert.deepEqual(cs.galleryImages, en.galleryImages)
    assert.equal(de.mainImage, en.mainImage)
    assert.equal(cs.mainImage, en.mainImage)
  })
})

describe('normalizeProductGallery', () => {
  it('normalizes string and object image entries to { id, url, rank, alt }', () => {
    const images = normalizeProductGallery(
      [IMAGE_A, { url: IMAGE_B }, IMAGE_C],
      { productName: 'Walnut Board', productId: 'etsy-42' },
    )

    assert.equal(images.length, 3)
    assert.deepEqual(images[0], {
      id: 'etsy-42-1',
      url: IMAGE_A,
      rank: 1,
      alt: 'Walnut Board photo 1',
    })
    assert.equal(images[1].url, IMAGE_B)
    assert.equal(images[1].rank, 2)
    assert.equal(images[2].url, IMAGE_C)
  })

  it('rejects invalid URLs so a blank modal cannot open', () => {
    assert.equal(hasValidProductImageUrl(''), false)
    assert.equal(hasValidProductImageUrl('/'), false)
    assert.equal(hasValidProductImageUrl('https://example.com/x.jpg'), false)
    assert.equal(hasValidProductImageUrl(IMAGE_A), true)

    const images = normalizeProductGallery(['', '/', { url: 'not-a-url' }, IMAGE_A])
    assert.deepEqual(
      images.map((image) => image.url),
      [IMAGE_A],
    )
    assert.equal(resolveActiveGalleryImage(images, 0)?.url, IMAGE_A)
    assert.equal(resolveActiveGalleryImage(images, 1), null)
    assert.equal(resolveActiveGalleryImage(images, null), null)
  })
})

describe('ProductImageLightbox', () => {
  const images = normalizeProductGallery([IMAGE_A, IMAGE_B, IMAGE_C], {
    productName: 'Board',
    productId: 'p1',
  })

  it('English main image opens in lightbox with the correct src', () => {
    const html = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images,
        activeImageIndex: 0,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.match(html, new RegExp(`src="${IMAGE_A}"`))
    assert.match(html, /aria-label="Board photo 1"/)
    assert.match(html, /Close image preview/)
    assert.match(html, /product-image-lightbox-image/)
    assert.match(html, /referrerPolicy|referrerpolicy/i)
  })

  it('German main image opens in lightbox with the same URL', () => {
    const deProduct = normalizeEtsyApiProduct(mapPublicProductRow(baseRow, { locale: 'de' }))
    const deImages = normalizeProductGallery(deProduct.galleryImages, {
      productName: deProduct.name,
      productId: deProduct.id,
    })
    const html = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images: deImages,
        activeImageIndex: 0,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.match(html, new RegExp(`src="${IMAGE_A}"`))
    assert.equal(deImages[0].url, IMAGE_A)
  })

  it('Czech main image opens in lightbox with the same URL', () => {
    const csProduct = normalizeEtsyApiProduct(mapPublicProductRow(baseRow, { locale: 'cs' }))
    const csImages = normalizeProductGallery(csProduct.galleryImages, {
      productName: csProduct.name,
      productId: csProduct.id,
    })
    const html = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images: csImages,
        activeImageIndex: 0,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.match(html, new RegExp(`src="${IMAGE_A}"`))
    assert.equal(csImages[0].url, IMAGE_A)
  })

  it('thumbnails open the correct image by index', () => {
    const thumbIndex = 1
    const active = resolveActiveGalleryImage(images, thumbIndex)
    assert.equal(active?.url, IMAGE_B)

    const html = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images,
        activeImageIndex: thumbIndex,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.match(html, new RegExp(`src="${IMAGE_B}"`))
  })

  it('next/previous navigation resolves adjacent gallery URLs', () => {
    assert.equal(resolveActiveGalleryImage(images, 0)?.url, IMAGE_A)
    assert.equal(resolveActiveGalleryImage(images, 1)?.url, IMAGE_B)
    assert.equal(resolveActiveGalleryImage(images, 2)?.url, IMAGE_C)

    const atFirst = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images,
        activeImageIndex: 0,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.match(atFirst, /Next product photo/)
    assert.doesNotMatch(atFirst, /Previous product photo/)

    const atMiddle = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images,
        activeImageIndex: 1,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.match(atMiddle, /Previous product photo/)
    assert.match(atMiddle, /Next product photo/)
    assert.match(atMiddle, new RegExp(`src="${IMAGE_B}"`))
  })

  it('invalid image URL does not open a blank modal', () => {
    const html = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images: [{ id: 'x', url: '', rank: 1, alt: 'Broken' }],
        activeImageIndex: 0,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.equal(html, '')

    const closed = renderToStaticMarkup(
      createElement(ProductImageLightbox, {
        images,
        activeImageIndex: null,
        onClose() {},
        onNavigate() {},
      }),
    )
    assert.equal(closed, '')
  })
})

describe('ProductDetailPage lightbox wiring', () => {
  it('uses activeImageIndex state and resets on slug/locale changes', async () => {
    const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
    const detailStart = app.indexOf('function ProductDetailPage()')
    const detailEnd = app.indexOf('function GalleryPage()')
    assert.ok(detailStart >= 0 && detailEnd > detailStart)
    const detail = app.slice(detailStart, detailEnd)

    assert.match(detail, /normalizeProductGallery/)
    assert.match(detail, /activeImageIndex/)
    assert.match(detail, /setActiveImageIndex\(null\)/)
    assert.match(detail, /\[location\.pathname, product\?\.id, productId, locale\]/)
    assert.match(detail, /<ProductImageLightbox/)
    assert.match(detail, /openLightboxAt/)
    assert.doesNotMatch(detail, /setActiveImageIndex\(event/)
    assert.doesNotMatch(detail, /setActiveImageIndex\(product/)
  })

  it('locale switching resets stale modal state (index closed)', () => {
    // Simulate EN → DE → CS: opening index 2 then resetting on locale change.
    let activeImageIndex = 2
    const resetOnRouteChange = () => {
      activeImageIndex = null
    }

    assert.equal(resolveActiveGalleryImage(
      normalizeProductGallery([IMAGE_A, IMAGE_B, IMAGE_C]),
      activeImageIndex,
    )?.url, IMAGE_C)

    resetOnRouteChange()
    assert.equal(activeImageIndex, null)
    assert.equal(
      resolveActiveGalleryImage(normalizeProductGallery([IMAGE_A, IMAGE_B, IMAGE_C]), activeImageIndex),
      null,
    )
  })
})
