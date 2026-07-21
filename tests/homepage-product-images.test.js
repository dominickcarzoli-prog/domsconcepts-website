/**
 * Homepage / catalogue display image resolution tests.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeEtsyApiProduct } from '../src/data/etsyProducts.js'
import { resolveProductDisplayImages } from '../src/data/resolveProductDisplayImages.js'

const HARDCODED_COAT_HANGER_IMAGE =
  '/images/products/specialties/solid-oak-coat-hanger/01.jpg'
const ETSY_COAT_HANGER_HERO =
  'https://i.etsystatic.com/21681588/r/il/newhero/4370517694/il_fullxfull.4370517694_abcd.jpg'

const inventory = {
  'solid-oak-coat-hanger-black-metal-hooks': [HARDCODED_COAT_HANGER_IMAGE],
  'specialties/solid-oak-coat-hanger': [HARDCODED_COAT_HANGER_IMAGE],
}

describe('resolveProductDisplayImages', () => {
  it('lets Etsy image win over matching hardcoded inventory image', () => {
    const etsyProduct = {
      id: 'etsy-4370517694',
      slug: 'solid-oak-coat-hanger-black-metal-hooks',
      imageFolder: 'solid-oak-coat-hanger-black-metal-hooks',
      source: 'etsy',
      useLocalImages: false,
      mainImage: ETSY_COAT_HANGER_HERO,
      galleryImages: [
        ETSY_COAT_HANGER_HERO,
        'https://i.etsystatic.com/21681588/r/il/detail/4370517694/il_fullxfull.2.jpg',
      ],
    }

    const images = resolveProductDisplayImages(etsyProduct, { inventory })
    assert.equal(images[0], ETSY_COAT_HANGER_HERO)
    assert.notEqual(images[0], HARDCODED_COAT_HANGER_IMAGE)
  })

  it('uses hardcoded inventory only when Etsy product has no usable image', () => {
    const etsyProduct = {
      id: 'etsy-4370517694',
      slug: 'solid-oak-coat-hanger-black-metal-hooks',
      imageFolder: 'solid-oak-coat-hanger-black-metal-hooks',
      source: 'etsy',
      useLocalImages: false,
      mainImage: '',
      galleryImages: [],
    }

    const images = resolveProductDisplayImages(etsyProduct, { inventory })
    assert.equal(images[0], HARDCODED_COAT_HANGER_IMAGE)
  })

  it('uses local override only when explicitly enabled', () => {
    const etsyProduct = {
      id: 'etsy-4370517694',
      imageFolder: 'solid-oak-coat-hanger-black-metal-hooks',
      source: 'etsy',
      useLocalImages: true,
      mainImage: ETSY_COAT_HANGER_HERO,
      galleryImages: [ETSY_COAT_HANGER_HERO],
    }

    const images = resolveProductDisplayImages(etsyProduct, { inventory })
    assert.equal(images[0], HARDCODED_COAT_HANGER_IMAGE)
  })

  it('preserves Etsy rank order and does not sort CDN URLs by filename digits', () => {
    const images = resolveProductDisplayImages(
      {
        id: 'etsy-1',
        source: 'etsy',
        galleryImages: [
          'https://i.etsystatic.com/x/il_fullxfull.999.jpg',
          'https://i.etsystatic.com/x/il_fullxfull.111.jpg',
        ],
      },
      { inventory },
    )
    assert.deepEqual(images, [
      'https://i.etsystatic.com/x/il_fullxfull.999.jpg',
      'https://i.etsystatic.com/x/il_fullxfull.111.jpg',
    ])
  })

  it('homepage and Available Pieces resolve the same image for one product', () => {
    const product = {
      id: 'etsy-4370517694',
      listingId: 4370517694,
      source: 'etsy',
      imageFolder: 'etsy/4370517694',
      mainImage: ETSY_COAT_HANGER_HERO,
      galleryImages: [ETSY_COAT_HANGER_HERO],
    }

    const homepageImage = resolveProductDisplayImages(product, { inventory })[0]
    const availablePiecesImage = resolveProductDisplayImages(product, {
      inventory,
    })[0]
    assert.equal(homepageImage, availablePiecesImage)
    assert.equal(homepageImage, ETSY_COAT_HANGER_HERO)
  })
})

describe('normalizeEtsyApiProduct image wiring', () => {
  it('coat hanger listing 4370517694 keeps Etsy primary, not workshop inventory folder', () => {
    const product = normalizeEtsyApiProduct({
      listingId: 4370517694,
      slug: 'solid-oak-coat-hanger-black-metal-hooks',
      title: 'Solid Oak Coat Hanger',
      description: 'Handmade',
      price: 1200,
      currency: 'CZK',
      quantity: 1,
      websiteStatus: 'available',
      category: 'Accessories',
      featured: true,
      useLocalImages: false,
      imageUrls: [ETSY_COAT_HANGER_HERO],
      primaryImageUrl: ETSY_COAT_HANGER_HERO,
      etsyUrl: 'https://www.etsy.com/listing/4370517694',
    })

    assert.equal(product.source, 'etsy')
    assert.equal(product.listingId, 4370517694)
    assert.equal(product.imageFolder, 'etsy/4370517694')
    assert.equal(product.mainImage, ETSY_COAT_HANGER_HERO)
    assert.equal(product.galleryImages[0], ETSY_COAT_HANGER_HERO)

    const display = resolveProductDisplayImages(product, { inventory })
    assert.equal(display[0], ETSY_COAT_HANGER_HERO)
    assert.notEqual(display[0], HARDCODED_COAT_HANGER_IMAGE)
  })
})
