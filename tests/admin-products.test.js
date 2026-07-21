/**
 * Unit tests for admin catalogue helpers (no live D1 / HTTP).
 * Run: npm test
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { requireAdminSyncAuth } from '../functions/api/admin/_auth.js'
import {
  buildListWhereClause,
  mapProductRow,
  parseListQuery,
  parseListingIdParam,
  validateBulkBody,
  validateSlug,
  validateUpdateBody,
  WEBSITE_CATEGORIES,
} from '../functions/api/admin/_products.js'
import { syncEtsyCatalogue } from '../functions/api/etsy/_catalogue.js'

describe('validateSlug', () => {
  it('accepts valid slug', () => {
    assert.deepEqual(validateSlug('walnut-board'), {
      ok: true,
      value: 'walnut-board',
    })
  })
  it('rejects invalid characters', () => {
    assert.equal(validateSlug('Bad Slug!').ok, false)
  })
  it('allows null to clear', () => {
    assert.deepEqual(validateSlug(null), { ok: true, value: null })
  })
})

describe('validateUpdateBody', () => {
  it('approves website-managed fields only', () => {
    const result = validateUpdateBody({
      website_approved: true,
      custom_title: 'Site title',
      website_category: 'Cutting Boards',
    })
    assert.equal(result.ok, true)
    assert.equal(result.fields.website_approved, 1)
    assert.equal(result.fields.custom_title, 'Site title')
    assert.equal(result.fields.website_category, 'Cutting Boards')
  })

  it('rejects Etsy-managed fields', () => {
    const result = validateUpdateBody({ title: 'Hacked' })
    assert.equal(result.ok, false)
    assert.equal(result.error, 'invalid_field')
  })

  it('rejects invalid category', () => {
    const result = validateUpdateBody({ website_category: 'Not Real' })
    assert.equal(result.ok, false)
    assert.equal(result.error, 'invalid_category')
  })

  it('accepts local image override toggle', () => {
    const result = validateUpdateBody({ website_use_local_images: true })
    assert.equal(result.ok, true)
    assert.equal(result.fields.website_use_local_images, 1)
  })
})

describe('validateBulkBody', () => {
  it('accepts approve action', () => {
    const result = validateBulkBody({ action: 'approve', listingIds: [1, 2] })
    assert.equal(result.ok, true)
    assert.equal(result.action, 'approve')
  })

  it('requires category for setCategory', () => {
    const result = validateBulkBody({ action: 'setCategory', listingIds: [1] })
    assert.equal(result.ok, false)
  })

  it('rejects invalid listing id', () => {
    const result = validateBulkBody({ action: 'hide', listingIds: ['x'] })
    assert.equal(result.ok, false)
  })
})

describe('parseListQuery', () => {
  it('defaults to active filter params when provided', () => {
    const result = parseListQuery('https://x.test/api/admin/etsy/products?state=active&approved=false')
    assert.equal(result.ok, true)
    assert.equal(result.filters.state, 'active')
    assert.equal(result.filters.approved, false)
    assert.equal(result.filters.limit, 50)
  })

  it('rejects unknown category filter', () => {
    const result = parseListQuery('https://x.test/?category=Fake')
    assert.equal(result.ok, false)
  })
})

describe('buildListWhereClause', () => {
  it('builds active-only clause', () => {
    const { sql, binds } = buildListWhereClause({ state: 'active' })
    assert.match(sql, /etsy_state = \?/)
    assert.deepEqual(binds, ['active'])
  })
})

describe('mapProductRow', () => {
  it('maps safe admin fields', () => {
    const row = mapProductRow({
      listing_id: 99,
      title: 'Etsy title',
      custom_title: 'Site title',
      custom_description: 'Desc',
      etsy_state: 'active',
      website_status: 'available',
      quantity: 2,
      price_amount: 10000,
      price_divisor: 100,
      price_currency: 'CZK',
      website_approved: 1,
      website_hidden: 0,
      website_category: 'Cutting Boards',
      website_featured: 0,
      website_use_local_images: 0,
      slug: 'board',
      primary_image_url: 'https://i.etsystatic.com/etsy.jpg',
      image_urls_json: '["https://i.etsystatic.com/etsy.jpg","https://i.etsystatic.com/gallery.jpg"]',
      local_images_json: '["/images/local.jpg"]',
      etsy_url: 'https://www.etsy.com/listing/99',
      synced_at: 1700000000,
    })
    assert.equal(row.listingId, 99)
    assert.equal(row.customTitle, 'Site title')
    assert.equal(row.approved, true)
    assert.equal(row.hidden, false)
    assert.equal(row.primaryImageUrl, 'https://i.etsystatic.com/etsy.jpg')
    assert.deepEqual(row.localImages, ['/images/local.jpg'])
    assert.equal(row.useLocalImages, false)
    assert.equal(row.price, 100)
  })

  it('uses local override when enabled', () => {
    const row = mapProductRow({
      listing_id: 99,
      title: 'Etsy title',
      custom_title: null,
      custom_description: 'Desc',
      etsy_state: 'active',
      website_status: 'available',
      quantity: 2,
      price_amount: 10000,
      price_divisor: 100,
      price_currency: 'CZK',
      website_approved: 1,
      website_hidden: 0,
      website_category: 'Cutting Boards',
      website_featured: 0,
      website_use_local_images: 1,
      slug: 'board',
      primary_image_url: 'https://i.etsystatic.com/etsy.jpg',
      image_urls_json: '["https://i.etsystatic.com/gallery.jpg"]',
      local_images_json: '["/images/local.jpg"]',
      etsy_url: 'https://www.etsy.com/listing/99',
      synced_at: 1700000000,
    })
    assert.equal(row.primaryImageUrl, '/images/local.jpg')
    assert.equal(row.useLocalImages, true)
  })
})

describe('parseListingIdParam', () => {
  it('parses valid id', () => {
    assert.deepEqual(parseListingIdParam('123'), { ok: true, value: 123 })
  })
  it('rejects invalid id', () => {
    assert.equal(parseListingIdParam('abc').ok, false)
  })
})

describe('requireAdminSyncAuth', () => {
  it('rejects missing bearer token', () => {
    const request = new Request('https://x.test/', { method: 'GET' })
    const result = requireAdminSyncAuth(request, { ADMIN_SYNC_SECRET: 'secret' })
    assert.equal(result.ok, false)
  })

  it('accepts valid bearer token', () => {
    const request = new Request('https://x.test/', {
      headers: { Authorization: 'Bearer secret' },
    })
    const result = requireAdminSyncAuth(request, { ADMIN_SYNC_SECRET: 'secret' })
    assert.equal(result.ok, true)
  })
})

describe('sync preserves website-managed fields', () => {
  function mockDbWithWebsiteFields() {
    const products = new Map([
      [
        10,
        {
          listing_id: 10,
          website_approved: 1,
          website_hidden: 0,
          website_category: 'Cutting Boards',
          website_featured: 1,
          custom_title: 'Kept title',
          custom_description: 'Kept desc',
          slug: 'kept-slug',
          local_images_json: '["/images/kept.jpg"]',
          website_use_local_images: 1,
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
            if (sql.includes('FROM etsy_products WHERE listing_id')) {
              const id = statement._args[0]
              return products.get(id) || null
            }
            if (sql.includes('SELECT listing_id FROM etsy_products WHERE listing_id')) {
              const id = statement._args[0]
              return products.has(id) ? { listing_id: id } : null
            }
            return null
          },
          async run() {
            if (sql.includes('INSERT INTO etsy_sync_runs')) {
              return { meta: { last_row_id: 1 } }
            }
            if (sql.includes('INSERT INTO etsy_products')) {
              const id = statement._args[0]
              const existing = products.get(id)
              if (existing && sql.includes('ON CONFLICT')) {
                // Simulate upsert: Etsy fields update, website fields preserved (not in UPDATE SET)
                products.set(id, {
                  ...existing,
                  title: statement._args[4],
                  etsy_state: statement._args[3],
                  website_status: statement._args[3],
                })
              }
              return { meta: { changes: 1 } }
            }
            if (sql.includes('UPDATE etsy_sync_runs')) {
              return { meta: {} }
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

  it('does not overwrite custom title/slug on re-sync', async () => {
    const db = mockDbWithWebsiteFields()
    const env = {
      CATALOGUE_DB: db,
      ETSY_API_KEY: 'keystring',
      ETSY_SHARED_SECRET: 'secret',
      ETSY_SHOP_ID: '999',
    }

    await syncEtsyCatalogue(env, {
      getAccessToken: async () => '12345.token',
      resolveShopId: async () => ({ ok: true, shopId: '999' }),
      fetchListings: async () => [
        {
          listing_id: 10,
          state: 'active',
          title: 'New Etsy title',
          quantity: 2,
          price: { amount: 5000, divisor: 100, currency_code: 'CZK' },
        },
      ],
    })

    const kept = db.products.get(10)
    assert.equal(kept.custom_title, 'Kept title')
    assert.equal(kept.slug, 'kept-slug')
    assert.equal(kept.website_category, 'Cutting Boards')
    assert.equal(kept.website_approved, 1)
    assert.equal(kept.website_use_local_images, 1)
  })
})

describe('draft listing publish safety', () => {
  it('draft maps to hidden website status', () => {
    const row = mapProductRow({
      listing_id: 1,
      title: 'Draft',
      etsy_state: 'draft',
      website_status: 'hidden',
      quantity: 1,
      website_approved: 0,
      website_hidden: 1,
      website_use_local_images: 0,
      etsy_url: 'https://www.etsy.com/listing/1',
      synced_at: 1,
    })
    assert.equal(row.websiteStatus, 'hidden')
    assert.equal(row.approved, false)
    assert.equal(row.hidden, true)
  })
})

describe('sold listing', () => {
  it('sold status is preserved in mapping', () => {
    const row = mapProductRow({
      listing_id: 2,
      title: 'Sold board',
      etsy_state: 'sold_out',
      website_status: 'sold',
      quantity: 0,
      website_approved: 1,
      website_hidden: 0,
      website_use_local_images: 0,
      etsy_url: 'https://www.etsy.com/listing/2',
      synced_at: 1,
    })
    assert.equal(row.websiteStatus, 'sold')
    assert.equal(row.approved, true)
  })
})

describe('WEBSITE_CATEGORIES', () => {
  it('includes required admin categories', () => {
    for (const cat of [
      'Cutting Boards',
      'End Grain Boards',
      'Serving Boards',
      'Epoxy Pieces',
      'Furniture',
      'Wood Care',
      'Accessories',
      'Other',
    ]) {
      assert.ok(WEBSITE_CATEGORIES.includes(cat))
    }
  })
})
