/**
 * Unit tests for Etsy catalogue sync helpers (no live Etsy / D1).
 * Run: npm test
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  deriveWebsiteStatus,
  normalizePrice,
  totalAvailableQuantity,
  mapListingToProductRow,
  buildEtsyUrl,
  extractImageUrls,
  pickListingImageUrl,
  syncEtsyCatalogue,
} from '../functions/api/etsy/_catalogue.js'

describe('deriveWebsiteStatus', () => {
  it('active qty 2 → available', () => {
    assert.equal(deriveWebsiteStatus('active', 2), 'available')
  })
  it('active qty 1 → only-one-left', () => {
    assert.equal(deriveWebsiteStatus('active', 1), 'only-one-left')
  })
  it('active qty 0 → sold', () => {
    assert.equal(deriveWebsiteStatus('active', 0), 'sold')
  })
  it('sold_out → sold', () => {
    assert.equal(deriveWebsiteStatus('sold_out', 5), 'sold')
  })
  it('inactive → archived', () => {
    assert.equal(deriveWebsiteStatus('inactive', 2), 'archived')
  })
  it('expired → archived', () => {
    assert.equal(deriveWebsiteStatus('expired', 2), 'archived')
  })
  it('draft → hidden', () => {
    assert.equal(deriveWebsiteStatus('draft', 2), 'hidden')
  })
  it('unknown → hidden', () => {
    assert.equal(deriveWebsiteStatus('weird', 2), 'hidden')
  })
})

describe('normalizePrice', () => {
  it('normalizes amount/divisor/currency', () => {
    assert.deepEqual(normalizePrice({ amount: 45900, divisor: 100, currency_code: 'CZK' }), {
      amount: 45900,
      divisor: 100,
      currency: 'CZK',
    })
  })
  it('defaults divisor to 100 when amount present', () => {
    assert.deepEqual(normalizePrice({ amount: 1000, currency_code: 'EUR' }), {
      amount: 1000,
      divisor: 100,
      currency: 'EUR',
    })
  })
})

describe('totalAvailableQuantity', () => {
  it('sums enabled variation offerings', () => {
    const inventory = {
      products: [
        {
          offerings: [
            { quantity: 2, is_enabled: true },
            { quantity: 3, is_enabled: true },
            { quantity: 9, is_enabled: false },
          ],
        },
      ],
    }
    assert.equal(totalAvailableQuantity({ quantity: 99 }, inventory), 5)
  })
  it('falls back to listing.quantity', () => {
    assert.equal(totalAvailableQuantity({ quantity: 4 }, null), 4)
  })
})

describe('extractImageUrls', () => {
  it('sorts out-of-order ranks so rank 1 is primary', () => {
    const result = extractImageUrls(
      [
        {
          rank: 3,
          listing_image_id: 30,
          url_fullxfull: 'https://i.etsystatic.com/rank3.jpg',
        },
        {
          rank: 1,
          listing_image_id: 10,
          url_fullxfull: 'https://i.etsystatic.com/rank1.jpg',
        },
        {
          rank: 2,
          listing_image_id: 20,
          url_fullxfull: 'https://i.etsystatic.com/rank2.jpg',
        },
      ],
      { listingId: 500 },
    )

    assert.equal(result.primary, 'https://i.etsystatic.com/rank1.jpg')
    assert.deepEqual(result.urls, [
      'https://i.etsystatic.com/rank1.jpg',
      'https://i.etsystatic.com/rank2.jpg',
      'https://i.etsystatic.com/rank3.jpg',
    ])
    assert.deepEqual(result.ranks, [1, 2, 3])
    assert.equal(result.primaryRank, 1)
    assert.equal(result.primaryImageId, 10)
  })

  it('removes duplicate URLs without breaking rank order', () => {
    const result = extractImageUrls([
      { rank: 2, url_fullxfull: 'https://i.etsystatic.com/dup.jpg' },
      { rank: 1, url_fullxfull: 'https://i.etsystatic.com/hero.jpg' },
      { rank: 3, url_fullxfull: 'https://i.etsystatic.com/dup.jpg' },
    ])

    assert.equal(result.primary, 'https://i.etsystatic.com/hero.jpg')
    assert.deepEqual(result.urls, [
      'https://i.etsystatic.com/hero.jpg',
      'https://i.etsystatic.com/dup.jpg',
    ])
    assert.deepEqual(result.ranks, [1, 2])
  })

  it('falls back to API response order when ranks are missing', () => {
    const result = extractImageUrls(
      [
        { url_fullxfull: 'https://i.etsystatic.com/first.jpg' },
        { url_fullxfull: 'https://i.etsystatic.com/second.jpg' },
      ],
      { listingId: 77 },
    )

    assert.equal(result.primary, 'https://i.etsystatic.com/first.jpg')
    assert.deepEqual(result.urls, [
      'https://i.etsystatic.com/first.jpg',
      'https://i.etsystatic.com/second.jpg',
    ])
  })

  it('uses fallback size when fullxfull is missing', () => {
    const result = extractImageUrls([
      { rank: 1, url_570xN: 'https://i.etsystatic.com/hero-570.jpg' },
      { rank: 2, url_fullxfull: 'https://i.etsystatic.com/gallery.jpg' },
    ])

    assert.equal(result.primary, 'https://i.etsystatic.com/hero-570.jpg')
    assert.deepEqual(result.urls, [
      'https://i.etsystatic.com/hero-570.jpg',
      'https://i.etsystatic.com/gallery.jpg',
    ])
  })
})

describe('pickListingImageUrl', () => {
  it('prefers url_fullxfull over smaller sizes', () => {
    assert.equal(
      pickListingImageUrl({
        url_75x75: 'https://i.etsystatic.com/small.jpg',
        url_570xN: 'https://i.etsystatic.com/mid.jpg',
        url_fullxfull: 'https://i.etsystatic.com/full.jpg',
      }),
      'https://i.etsystatic.com/full.jpg',
    )
  })
})

describe('mapListingToProductRow', () => {
  it('maps active listing with images and price', () => {
    const row = mapListingToProductRow(
      {
        listing_id: 111,
        state: 'active',
        title: 'Walnut board',
        description: 'desc',
        quantity: 2,
        price: { amount: 12000, divisor: 100, currency_code: 'EUR' },
        url: 'https://www.etsy.com/listing/111/walnut-board',
        images: [
          { rank: 1, url_fullxfull: 'https://i.etsystatic.com/a.jpg', is_primary: true },
          { rank: 2, url_fullxfull: 'https://i.etsystatic.com/b.jpg' },
        ],
        last_modified_tsz: 1700000000,
      },
      null,
      1700001000,
    )

    assert.equal(row.listing_id, 111)
    assert.equal(row.website_status, 'available')
    assert.equal(row.etsy_state, 'active')
    assert.equal(row.quantity, 2)
    assert.equal(row.price_amount, 12000)
    assert.equal(row.price_currency, 'EUR')
    assert.equal(row.primary_image_url, 'https://i.etsystatic.com/a.jpg')
    assert.equal(row.etsy_url, 'https://www.etsy.com/listing/111/walnut-board')
  })

  it('uses rank 1 as primary even when API returns images out of order', () => {
    const row = mapListingToProductRow(
      {
        listing_id: 333,
        state: 'active',
        title: 'Reordered board',
        images: [
          { rank: 3, url_fullxfull: 'https://i.etsystatic.com/old-hero.jpg' },
          { rank: 1, url_fullxfull: 'https://i.etsystatic.com/new-hero.jpg' },
          { rank: 2, url_fullxfull: 'https://i.etsystatic.com/detail.jpg' },
        ],
      },
      null,
      1,
    )

    assert.equal(row.primary_image_url, 'https://i.etsystatic.com/new-hero.jpg')
    assert.equal(
      row.image_urls_json,
      '["https://i.etsystatic.com/new-hero.jpg","https://i.etsystatic.com/detail.jpg","https://i.etsystatic.com/old-hero.jpg"]',
    )
  })

  it('preserves response order when ranks are missing and removes duplicates', () => {
    const row = mapListingToProductRow(
      {
        listing_id: 222,
        state: 'active',
        title: 'Ordered board',
        images: [
          { url_fullxfull: 'https://i.etsystatic.com/first.jpg' },
          { url_fullxfull: 'https://i.etsystatic.com/second.jpg' },
          { url_fullxfull: 'https://i.etsystatic.com/first.jpg' },
        ],
      },
      null,
      1,
    )

    assert.equal(row.primary_image_url, 'https://i.etsystatic.com/first.jpg')
    assert.equal(
      row.image_urls_json,
      '["https://i.etsystatic.com/first.jpg","https://i.etsystatic.com/second.jpg"]',
    )
  })

  it('builds etsy url from id when API url missing', () => {
    assert.equal(
      buildEtsyUrl({ listing_id: 42 }),
      'https://www.etsy.com/listing/42',
    )
  })

  it('active qty 1 → only-one-left', () => {
    const row = mapListingToProductRow(
      { listing_id: 1, state: 'active', title: 't', quantity: 1 },
      null,
      1,
    )
    assert.equal(row.website_status, 'only-one-left')
  })

  it('active qty 0 → sold', () => {
    const row = mapListingToProductRow(
      { listing_id: 1, state: 'active', title: 't', quantity: 0 },
      null,
      1,
    )
    assert.equal(row.website_status, 'sold')
  })

  it('sold_out → sold', () => {
    const row = mapListingToProductRow(
      { listing_id: 1, state: 'sold_out', title: 't', quantity: 0 },
      null,
      1,
    )
    assert.equal(row.website_status, 'sold')
  })

  it('uses variation inventory quantity and price', () => {
    const inventory = {
      products: [
        {
          offerings: [
            {
              quantity: 1,
              is_enabled: true,
              price: { amount: 9900, divisor: 100, currency_code: 'USD' },
            },
          ],
        },
      ],
    }
    const row = mapListingToProductRow(
      { listing_id: 7, state: 'active', title: 'var', quantity: 0 },
      inventory,
      10,
    )
    assert.equal(row.quantity, 1)
    assert.equal(row.website_status, 'only-one-left')
    assert.equal(row.price_amount, 9900)
    assert.equal(row.price_currency, 'USD')
  })
})

describe('sync overwrites stale image fields', () => {
  function mockDbWithStaleImages() {
    const products = new Map([
      [
        55,
        {
          listing_id: 55,
          primary_image_url: 'https://i.etsystatic.com/stale-primary.jpg',
          image_urls_json:
            '["https://i.etsystatic.com/stale-primary.jpg","https://i.etsystatic.com/stale-b.jpg"]',
          website_approved: 1,
          website_hidden: 0,
          custom_title: 'Kept title',
          slug: 'kept-slug',
        },
      ],
    ])

    return {
      products,
      prepare(sql) {
        const statement = {
          bind(...args) {
            statement._args = args
            return statement
          },
          async first() {
            if (sql.includes('FROM etsy_sync_runs')) return null
            if (sql.includes('FROM etsy_products WHERE listing_id')) {
              const id = statement._args[0]
              return products.has(id) ? { listing_id: id } : null
            }
            return null
          },
          async run() {
            if (sql.includes('INSERT INTO etsy_sync_runs')) {
              return { meta: { last_row_id: 1 } }
            }
            if (sql.includes('UPDATE etsy_sync_runs')) {
              return { meta: {} }
            }
            if (sql.includes('INSERT INTO etsy_products')) {
              const id = statement._args[0]
              const existing = products.get(id) || {}
              // Args mirror upsertProduct bind order:
              // 0 listing_id … 10 primary_image_url, 11 image_urls_json
              products.set(id, {
                ...existing,
                listing_id: id,
                primary_image_url: statement._args[10],
                image_urls_json: statement._args[11],
                title: statement._args[4],
              })
              return { meta: { changes: 1 } }
            }
            return { meta: {} }
          },
          async all() {
            return { results: [] }
          },
        }
        return statement
      },
    }
  }

  it('replaces stale primary URL and unsorted gallery on re-sync', async () => {
    const db = mockDbWithStaleImages()
    const env = {
      CATALOGUE_DB: db,
      ETSY_API_KEY: 'keystring',
      ETSY_SHARED_SECRET: 'secret',
      ETSY_SHOP_ID: '999',
    }

    const result = await syncEtsyCatalogue(env, {
      getAccessToken: async () => 'token',
      resolveShopId: async () => ({ ok: true, shopId: '999' }),
      fetchListings: async () => [
        {
          listing_id: 55,
          state: 'active',
          title: 'Updated title',
          quantity: 2,
          price: { amount: 1000, divisor: 100, currency_code: 'EUR' },
          images: [
            { rank: 2, url_fullxfull: 'https://i.etsystatic.com/detail.jpg' },
            { rank: 1, url_fullxfull: 'https://i.etsystatic.com/new-hero.jpg' },
            { rank: 3, url_fullxfull: 'https://i.etsystatic.com/extra.jpg' },
          ],
        },
      ],
    })

    assert.equal(result.ok, true)
    const row = db.products.get(55)
    assert.equal(row.primary_image_url, 'https://i.etsystatic.com/new-hero.jpg')
    assert.equal(
      row.image_urls_json,
      '["https://i.etsystatic.com/new-hero.jpg","https://i.etsystatic.com/detail.jpg","https://i.etsystatic.com/extra.jpg"]',
    )
    assert.equal(row.custom_title, 'Kept title')
    assert.equal(row.slug, 'kept-slug')
  })

  it('updates primary URL when Etsy only reorders existing images', async () => {
    const db = mockDbWithStaleImages()
    const env = {
      CATALOGUE_DB: db,
      ETSY_API_KEY: 'keystring',
      ETSY_SHARED_SECRET: 'secret',
      ETSY_SHOP_ID: '999',
    }

    await syncEtsyCatalogue(env, {
      getAccessToken: async () => 'token',
      resolveShopId: async () => ({ ok: true, shopId: '999' }),
      fetchListings: async () => [
        {
          listing_id: 55,
          state: 'active',
          title: 'Same images reordered',
          quantity: 1,
          images: [
            {
              rank: 1,
              url_fullxfull: 'https://i.etsystatic.com/stale-b.jpg',
            },
            {
              rank: 2,
              url_fullxfull: 'https://i.etsystatic.com/stale-primary.jpg',
            },
          ],
        },
      ],
    })

    const row = db.products.get(55)
    assert.equal(row.primary_image_url, 'https://i.etsystatic.com/stale-b.jpg')
    assert.equal(
      row.image_urls_json,
      '["https://i.etsystatic.com/stale-b.jpg","https://i.etsystatic.com/stale-primary.jpg"]',
    )
  })
})

describe('syncEtsyCatalogue', () => {
  function mockDb(existingIds = new Set()) {
    const products = new Map()
    for (const id of existingIds) {
      products.set(id, { listing_id: id })
    }
    const runs = []

    return {
      products,
      runs,
      prepare(sql) {
        const statement = {
          bind(...args) {
            statement._args = args
            return statement
          },
          async first() {
            if (sql.includes('FROM etsy_products WHERE listing_id')) {
              const id = statement._args[0]
              return products.has(id) ? { listing_id: id } : null
            }
            return null
          },
          async run() {
            if (sql.includes('INSERT INTO etsy_sync_runs')) {
              const id = runs.length + 1
              runs.push({ id, args: statement._args })
              return { meta: { last_row_id: id } }
            }
            if (sql.includes('UPDATE etsy_sync_runs')) {
              return { meta: {} }
            }
            if (sql.includes('INSERT INTO etsy_products')) {
              const id = statement._args[0]
              const was = products.has(id)
              products.set(id, { listing_id: id, price: statement._args[6] })
              return { meta: { changes: was ? 1 : 1 } }
            }
            return { meta: {} }
          },
          async all() {
            return { results: [] }
          },
        }
        return statement
      },
    }
  }

  function mockDbWithRunningSync() {
    const db = mockDb()
    const originalPrepare = db.prepare.bind(db)
    return {
      ...db,
      prepare(sql) {
        const statement = originalPrepare(sql)
        if (sql.includes('FROM etsy_sync_runs')) {
          return {
            bind(...args) {
              statement._args = args
              return this
            },
            async first() {
              return { id: 77, started_at: Math.floor(Date.now() / 1000) }
            },
          }
        }
        return statement
      },
    }
  }

  it('upserts listings and is idempotent on duplicate sync', async () => {
    const db = mockDb()
    const listings = [
      {
        listing_id: 10,
        state: 'active',
        title: 'A',
        quantity: 2,
        price: { amount: 1000, divisor: 100, currency_code: 'EUR' },
      },
      {
        listing_id: 11,
        state: 'inactive',
        title: 'B',
        quantity: 0,
      },
    ]

    const env = {
      CATALOGUE_DB: db,
      ETSY_API_KEY: 'keystring',
      ETSY_SHARED_SECRET: 'secret',
      ETSY_SHOP_ID: '999',
    }

    const deps = {
      getAccessToken: async () => 'token',
      resolveShopId: async () => ({ ok: true, shopId: '999' }),
      fetchListings: async () => listings,
    }

    const first = await syncEtsyCatalogue(env, deps)
    assert.equal(first.ok, true)
    assert.equal(first.listingsFound, 2)
    assert.equal(first.listingsCreated, 2)
    assert.equal(first.listingsUpdated, 0)

    const second = await syncEtsyCatalogue(env, deps)
    assert.equal(second.ok, true)
    assert.equal(second.listingsFound, 2)
    assert.equal(second.listingsCreated, 0)
    assert.equal(second.listingsUpdated, 2)
    assert.equal(db.products.size, 2)
  })

  it('updates price on re-sync without deleting', async () => {
    const db = mockDb()
    const env = {
      CATALOGUE_DB: db,
      ETSY_API_KEY: 'keystring',
      ETSY_SHARED_SECRET: 'secret',
      ETSY_SHOP_ID: '999',
    }

    const listing = {
      listing_id: 55,
      state: 'active',
      title: 'Priced',
      quantity: 3,
      price: { amount: 1000, divisor: 100, currency_code: 'EUR' },
    }

    await syncEtsyCatalogue(env, {
      getAccessToken: async () => 'token',
      resolveShopId: async () => ({ ok: true, shopId: '999' }),
      fetchListings: async () => [listing],
    })

    listing.price = { amount: 2000, divisor: 100, currency_code: 'EUR' }
    const again = await syncEtsyCatalogue(env, {
      getAccessToken: async () => 'token',
      resolveShopId: async () => ({ ok: true, shopId: '999' }),
      fetchListings: async () => [listing],
    })

    assert.equal(again.ok, true)
    assert.equal(again.listingsUpdated, 1)
    assert.equal(db.products.get(55).price, 2000)
  })

  it('records API failure without throwing', async () => {
    const db = mockDb()
    const result = await syncEtsyCatalogue(
      {
        CATALOGUE_DB: db,
        ETSY_API_KEY: 'keystring',
        ETSY_SHARED_SECRET: 'secret',
        ETSY_SHOP_ID: '999',
      },
      {
        getAccessToken: async () => 'token',
        resolveShopId: async () => ({ ok: true, shopId: '999' }),
        fetchListings: async () => {
          throw new Error('etsy_listings_failed:500')
        },
      },
    )

    assert.equal(result.ok, false)
    assert.equal(result.error, 'etsy_api_failed')
    assert.equal(result.status, 'error')
  })

  it('handles OAuth refresh failure (no access token)', async () => {
    const db = mockDb()
    const result = await syncEtsyCatalogue(
      {
        CATALOGUE_DB: db,
        ETSY_API_KEY: 'keystring',
        ETSY_SHARED_SECRET: 'secret',
      },
      {
        getAccessToken: async () => null,
      },
    )

    assert.equal(result.ok, false)
    assert.equal(result.error, 'oauth_unavailable')
  })

  it('skips overlapping sync runs', async () => {
    const db = mockDbWithRunningSync()
    const result = await syncEtsyCatalogue(
      {
        CATALOGUE_DB: db,
        ETSY_API_KEY: 'keystring',
        ETSY_SHARED_SECRET: 'secret',
      },
      {
        getAccessToken: async () => 'token',
      },
    )

    assert.equal(result.ok, false)
    assert.equal(result.error, 'sync_already_running')
  })
})
