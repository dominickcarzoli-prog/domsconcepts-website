/**
 * Unit tests for public Etsy product API helpers.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getProductImageCandidates,
  isPublicProductRow,
  isUsableImageSrc,
  mapPublicProductRow,
  normalizeImageUrl,
  resolveProductImages,
} from '../functions/api/_public_products.js'
import {
  normalizeEtsyApiProduct,
  USE_ETSY_CATALOGUE,
} from '../src/data/etsyProducts.js'

describe('normalizeImageUrl', () => {
  it('keeps https Etsy CDN URLs intact', () => {
    const url = 'https://i.etsystatic.com/123/abc/fullxfull.jpg'
    assert.equal(normalizeImageUrl(url), url)
  })

  it('upgrades protocol-relative URLs', () => {
    assert.equal(
      normalizeImageUrl('//i.etsystatic.com/x.jpg'),
      'https://i.etsystatic.com/x.jpg',
    )
  })

  it('normalizes site-relative paths', () => {
    assert.equal(normalizeImageUrl('images/foo.jpg'), '/images/foo.jpg')
  })
})

describe('resolveProductImages', () => {
  it('prefers Etsy images by default', () => {
    const result = resolveProductImages(
      ['/images/local.jpg'],
      'https://i.etsystatic.com/remote.jpg',
      null,
      0,
    )
    assert.equal(result.displayImageUrl, 'https://i.etsystatic.com/remote.jpg')
    assert.deepEqual(result.imageUrls, ['https://i.etsystatic.com/remote.jpg'])
  })

  it('falls back to Etsy primary', () => {
    const etsy = 'https://i.etsystatic.com/remote.jpg'
    const result = resolveProductImages(null, etsy, null, 0)
    assert.equal(result.displayImageUrl, etsy)
  })

  it('uses local images when override is enabled', () => {
    const result = resolveProductImages(
      ['/images/local.jpg'],
      'https://i.etsystatic.com/remote.jpg',
      '["https://i.etsystatic.com/remote.jpg","https://i.etsystatic.com/second.jpg"]',
      1,
    )
    assert.equal(result.displayImageUrl, '/images/local.jpg')
    assert.deepEqual(result.imageUrls, ['/images/local.jpg'])
    assert.equal(result.useLocalImages, true)
  })

  it('falls back to local images when Etsy images are missing', () => {
    const result = resolveProductImages(['/images/local.jpg'], null, null, 0)
    assert.equal(result.displayImageUrl, '/images/local.jpg')
    assert.deepEqual(result.imageUrls, ['/images/local.jpg'])
  })
})

describe('isPublicProductRow', () => {
  const base = {
    website_approved: 1,
    website_hidden: 0,
    etsy_state: 'active',
    website_category: 'Cutting Boards',
  }

  it('allows approved visible active', () => {
    assert.equal(isPublicProductRow(base), true)
  })

  it('excludes unapproved', () => {
    assert.equal(isPublicProductRow({ ...base, website_approved: 0 }), false)
  })

  it('excludes hidden', () => {
    assert.equal(isPublicProductRow({ ...base, website_hidden: 1 }), false)
  })

  it('excludes draft', () => {
    assert.equal(isPublicProductRow({ ...base, etsy_state: 'draft' }), false)
  })

  it('excludes inactive', () => {
    assert.equal(isPublicProductRow({ ...base, etsy_state: 'inactive' }), false)
  })

  it('excludes expired', () => {
    assert.equal(isPublicProductRow({ ...base, etsy_state: 'expired' }), false)
  })

  it('allows approved sold_out', () => {
    assert.equal(
      isPublicProductRow({ ...base, etsy_state: 'sold_out', quantity: 0 }),
      true,
    )
  })

  it('excludes custom orders unless active', () => {
    assert.equal(
      isPublicProductRow({
        ...base,
        website_category: 'Custom Orders',
        etsy_state: 'inactive',
      }),
      false,
    )
    assert.equal(
      isPublicProductRow({
        ...base,
        website_category: 'Custom Orders',
        etsy_state: 'active',
      }),
      true,
    )
  })
})

describe('mapPublicProductRow', () => {
  it('uses custom title and description', () => {
    const row = mapPublicProductRow({
      listing_id: 42,
      slug: 'board',
      title: 'Etsy title',
      custom_title: 'Site title',
      description: 'Etsy desc',
      custom_description: 'Site desc',
      etsy_state: 'active',
      website_status: 'available',
      quantity: 2,
      price_amount: 10000,
      price_divisor: 100,
      price_currency: 'CZK',
      website_category: 'Cutting Boards',
      website_featured: 0,
      website_use_local_images: 0,
      primary_image_url: 'https://i.etsystatic.com/a.jpg',
      image_urls_json: null,
      local_images_json: '["/images/local.jpg"]',
      etsy_url: 'https://www.etsy.com/listing/42',
    })

    assert.equal(row.title, 'Site title')
    assert.equal(row.description, 'Site desc')
    assert.equal(row.primaryImageUrl, 'https://i.etsystatic.com/a.jpg')
    assert.deepEqual(row.imageUrls, ['https://i.etsystatic.com/a.jpg'])
  })

  it('uses local override when enabled', () => {
    const row = mapPublicProductRow({
      listing_id: 42,
      slug: 'board',
      title: 'Etsy title',
      custom_title: null,
      description: 'Etsy desc',
      custom_description: null,
      etsy_state: 'active',
      website_status: 'available',
      quantity: 2,
      price_amount: 10000,
      price_divisor: 100,
      price_currency: 'CZK',
      website_category: 'Cutting Boards',
      website_featured: 0,
      website_use_local_images: 1,
      primary_image_url: 'https://i.etsystatic.com/a.jpg',
      image_urls_json: '["https://i.etsystatic.com/a.jpg","https://i.etsystatic.com/b.jpg"]',
      local_images_json: '["/images/local.jpg"]',
      etsy_url: 'https://www.etsy.com/listing/42',
    })

    assert.equal(row.primaryImageUrl, '/images/local.jpg')
    assert.deepEqual(row.imageUrls, ['/images/local.jpg'])
    assert.equal(row.useLocalImages, true)
  })

  it('marks sold products', () => {
    const row = mapPublicProductRow({
      listing_id: 1,
      slug: 'sold',
      title: 'Sold',
      etsy_state: 'sold_out',
      website_status: 'sold',
      quantity: 0,
      website_category: null,
      website_featured: 0,
      website_use_local_images: 0,
      primary_image_url: null,
      image_urls_json: null,
      local_images_json: null,
      etsy_url: 'https://www.etsy.com/listing/1',
    })
    assert.equal(row.websiteStatus, 'sold')
    assert.equal(row.isSold, true)
  })
})

describe('normalizeEtsyApiProduct', () => {
  it('maps sold product without buy CTA label', () => {
    const product = normalizeEtsyApiProduct({
      listingId: 9,
      slug: 'sold-board',
      title: 'Board',
      description: 'Desc',
      price: 100,
      currency: 'CZK',
      quantity: 0,
      websiteStatus: 'sold',
      category: 'Cutting Boards',
      featured: false,
      imageUrls: ['https://i.etsystatic.com/x.jpg'],
      primaryImageUrl: 'https://i.etsystatic.com/x.jpg',
      etsyUrl: 'https://www.etsy.com/listing/9',
    })
    assert.equal(product.isSold, true)
    assert.equal(product.buttonLabel, 'Sold')
    assert.equal(product.isAvailable, false)
  })
})

describe('USE_ETSY_CATALOGUE flag', () => {
  it('defaults to false in test env', () => {
    assert.equal(USE_ETSY_CATALOGUE, false)
  })
})

describe('isUsableImageSrc', () => {
  it('accepts Etsy CDN URLs', () => {
    assert.equal(
      isUsableImageSrc(
        'https://i.etsystatic.com/21681588/r/il/0cd26a/7673231393/il_fullxfull.7673231393_8bcj.jpg',
      ),
      true,
    )
  })
  it('accepts other etsystatic subdomains', () => {
    assert.equal(isUsableImageSrc('https://img0.etsystatic.com/foo.jpg'), true)
  })
  it('rejects bare slash', () => {
    assert.equal(isUsableImageSrc('/'), false)
  })
  it('rejects random remote hosts', () => {
    assert.equal(isUsableImageSrc('https://example.com/a.jpg'), false)
  })
})

describe('getProductImageCandidates', () => {
  it('prefers Etsy first when override is off', () => {
    const candidates = getProductImageCandidates({
      localImages: ['/images/local.jpg'],
      primaryImageUrl: 'https://i.etsystatic.com/a.jpg',
      etsyImageUrls: ['https://i.etsystatic.com/b.jpg'],
      useLocalImages: false,
    })
    assert.deepEqual(candidates, [
      'https://i.etsystatic.com/a.jpg',
      'https://i.etsystatic.com/b.jpg',
      '/images/local.jpg',
    ])
  })

  it('prefers local images when override is on', () => {
    const candidates = getProductImageCandidates({
      localImages: ['/images/local.jpg'],
      primaryImageUrl: 'https://i.etsystatic.com/a.jpg',
      etsyImageUrls: ['https://i.etsystatic.com/b.jpg'],
      useLocalImages: true,
    })
    assert.deepEqual(candidates, [
      '/images/local.jpg',
      'https://i.etsystatic.com/a.jpg',
      'https://i.etsystatic.com/b.jpg',
    ])
  })
})

describe('CSP img-src', () => {
  it('allows Etsy CDN wildcard host only', async () => {
    const { readFile } = await import('node:fs/promises')
    const headers = await readFile(
      new URL('../public/_headers', import.meta.url),
      'utf8',
    )
    assert.match(headers, /img-src[^;]*https:\/\/\*\.etsystatic\.com/)
    assert.doesNotMatch(headers, /img-src \*/)
  })
})
