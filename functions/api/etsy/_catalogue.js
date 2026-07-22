/**
 * Read-only Etsy catalogue sync (Pages Functions / D1).
 *
 * Etsy Open API v3 endpoints used (openapi.etsy.com):
 * - User id from OAuth token prefix / D1 (fallback GET /users/me)
 * - GET /v3/application/users/{user_id}/shops → shop_id
 * - GET /v3/application/shops/{shop_id}/listings?state=&includes=Images,Inventory&limit=&offset=
 *
 * Auth headers (values never logged):
 *   x-api-key: keystring:shared_secret
 *   Authorization: Bearer <access_token>
 *
 * Scopes required: listings_r, shops_r (read-only; already requested in OAuth).
 */

import {
  extractEtsyUserId,
  getValidEtsyAccessToken,
  requireEtsySecrets,
  resolveEtsyAccessToken,
  sanitizeUpstreamMessage,
} from './_oauth.js'

export const ETSY_API_BASE = 'https://openapi.etsy.com/v3/application'

/** Listing states to paginate — API defaults to active-only when state omitted. */
export const ETSY_LISTING_STATES = [
  'active',
  'inactive',
  'sold_out',
  'draft',
  'expired',
]

const LISTINGS_PAGE_SIZE = 100
const SYNC_LOCK_TTL_SECONDS = 30 * 60

/**
 * Derive website_status from Etsy listing state + available quantity.
 *
 * @param {string} etsyState
 * @param {number} quantity
 * @returns {'available'|'only-one-left'|'sold'|'archived'|'hidden'}
 */
export function deriveWebsiteStatus(etsyState, quantity) {
  const state = String(etsyState || '')
    .trim()
    .toLowerCase()
  const qty = Number(quantity)
  const safeQty = Number.isFinite(qty) ? qty : 0

  switch (state) {
    case 'active':
      if (safeQty > 1) return 'available'
      if (safeQty === 1) return 'only-one-left'
      return 'sold'
    case 'sold_out':
      return 'sold'
    case 'inactive':
    case 'expired':
      return 'archived'
    case 'draft':
      return 'hidden'
    default:
      return 'hidden'
  }
}

/**
 * Normalize Etsy Money / price fields to amount + divisor + currency.
 *
 * @param {unknown} price
 * @returns {{ amount: number | null, divisor: number | null, currency: string | null }}
 */
export function normalizePrice(price) {
  if (price == null || typeof price !== 'object') {
    return { amount: null, divisor: null, currency: null }
  }
  const p = /** @type {Record<string, unknown>} */ (price)
  const amountRaw = p.amount
  const divisorRaw = p.divisor
  const currencyRaw = p.currency_code ?? p.currencyCode ?? p.currency

  const amount =
    amountRaw != null && Number.isFinite(Number(amountRaw))
      ? Math.trunc(Number(amountRaw))
      : null
  const divisor =
    divisorRaw != null && Number.isFinite(Number(divisorRaw))
      ? Math.trunc(Number(divisorRaw))
      : amount != null
        ? 100
        : null
  const currency =
    currencyRaw != null && String(currencyRaw).trim() !== ''
      ? String(currencyRaw).trim()
      : null

  return { amount, divisor, currency }
}

/**
 * Sum available quantity from inventory products/offerings, else listing.quantity.
 *
 * @param {{ quantity?: unknown }} listing
 * @param {{ products?: Array<{ offerings?: Array<{ quantity?: unknown, is_enabled?: unknown, isEnabled?: unknown }> }> } | null | undefined} inventory
 * @returns {number}
 */
export function totalAvailableQuantity(listing, inventory) {
  const products = inventory && Array.isArray(inventory.products) ? inventory.products : null
  if (products && products.length > 0) {
    let total = 0
    for (const product of products) {
      const offerings = Array.isArray(product.offerings) ? product.offerings : []
      for (const offering of offerings) {
        const enabled =
          offering.is_enabled !== false && offering.isEnabled !== false
        if (!enabled) continue
        const q = Number(offering.quantity)
        if (Number.isFinite(q) && q > 0) total += Math.trunc(q)
      }
    }
    return total
  }

  const q = Number(listing && listing.quantity)
  return Number.isFinite(q) && q > 0 ? Math.trunc(q) : 0
}

/**
 * Build public Etsy listing URL.
 *
 * @param {{ listing_id?: unknown, listingId?: unknown, url?: unknown }} listing
 * @returns {string}
 */
export function buildEtsyUrl(listing) {
  const fromApi = listing && listing.url != null ? String(listing.url).trim() : ''
  if (fromApi.startsWith('https://') || fromApi.startsWith('http://')) {
    return fromApi
  }
  const id = listing.listing_id ?? listing.listingId
  return `https://www.etsy.com/listing/${id}`
}

/**
 * Pick one high-quality URL per ListingImage (never mix sizes of the same image).
 * @param {Record<string, unknown>} img
 * @returns {string | null}
 */
export function pickListingImageUrl(img) {
  if (!img || typeof img !== 'object') return null
  const candidates = [
    img.url_fullxfull,
    img.url_570xN,
    img.url_300x300,
    img.url_170x135,
    img.url_75x75,
    img.url,
  ]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim() !== '') {
      return candidate.trim()
    }
  }
  return null
}

/**
 * Build ordered image URLs from Etsy ListingImage objects.
 * Rank 1 is always primary when ranks are present.
 *
 * @param {Array<{
 *   url_fullxfull?: string,
 *   url_570xN?: string,
 *   url_300x300?: string,
 *   url_170x135?: string,
 *   url_75x75?: string,
 *   url?: string,
 *   rank?: number,
 *   listing_image_id?: number,
 *   image_id?: number,
 * }> | null | undefined} images
 * @param {{ listingId?: number | string | null, logOrder?: boolean }} [options]
 * @returns {{
 *   primary: string | null,
 *   urls: string[],
 *   ranks: Array<number | null>,
 *   primaryRank: number | null,
 *   primaryImageId: number | null,
 * }}
 */
export function extractImageUrls(images, options = {}) {
  if (!Array.isArray(images) || images.length === 0) {
    return {
      primary: null,
      urls: [],
      ranks: [],
      primaryRank: null,
      primaryImageId: null,
    }
  }

  const listingId = options.listingId ?? null
  const indexed = images.map((img, index) => ({ img, index }))
  const hasAnyRank = indexed.some(({ img }) => Number.isFinite(Number(img && img.rank)))

  let ordered
  if (hasAnyRank) {
    ordered = [...indexed].sort((a, b) => {
      const ra = Number(a.img && a.img.rank)
      const rb = Number(b.img && b.img.rank)
      const aRank = Number.isFinite(ra) ? ra : Number.POSITIVE_INFINITY
      const bRank = Number.isFinite(rb) ? rb : Number.POSITIVE_INFINITY
      if (aRank !== bRank) return aRank - bRank
      return a.index - b.index
    })
  } else {
    if (listingId != null) {
      logSyncDiag('etsy-images', {
        warning: 'missing_rank',
        listingId: Number(listingId) || String(listingId),
      })
    }
    ordered = indexed
  }

  const urls = []
  const ranks = []
  /** @type {number | null} */
  let primaryImageId = null

  for (const { img } of ordered) {
    const url = pickListingImageUrl(img)
    if (!url || urls.includes(url)) continue

    urls.push(url)
    const rankNum = Number(img && img.rank)
    ranks.push(Number.isFinite(rankNum) ? Math.trunc(rankNum) : null)

    if (primaryImageId == null) {
      const idRaw = img && (img.listing_image_id ?? img.image_id)
      const idNum = Number(idRaw)
      primaryImageId = Number.isFinite(idNum) ? Math.trunc(idNum) : null
    }
  }

  const primaryRank = ranks.length > 0 ? ranks[0] : null

  // Opt-in safe diagnostics (no URLs/tokens). Enable with { logOrder: true }.
  if (options.logOrder === true && listingId != null) {
    logSyncDiag('etsy-image-order', {
      listingId: Number(listingId) || String(listingId),
      imageCount: urls.length,
      ranks,
      primaryRank,
      primaryImageId,
    })
  }

  return {
    primary: urls[0] || null,
    urls,
    ranks,
    primaryRank,
    primaryImageId,
  }
}

/**
 * Map a raw Etsy listing (+ optional inventory) into a row payload for D1.
 * Pure — safe for unit tests.
 *
 * @param {Record<string, unknown>} listing
 * @param {Record<string, unknown> | null | undefined} inventory
 * @param {number} syncedAt
 */
export function mapListingToProductRow(listing, inventory, syncedAt) {
  const listingId = Number(listing.listing_id ?? listing.listingId)
  const etsyState = String(listing.state || 'unknown').toLowerCase()
  const inv =
    inventory ||
    (listing.inventory && typeof listing.inventory === 'object'
      ? /** @type {Record<string, unknown>} */ (listing.inventory)
      : null)

  const quantity = totalAvailableQuantity(listing, inv)
  const websiteStatus = deriveWebsiteStatus(etsyState, quantity)

  let priceSource = listing.price
  if (
    (priceSource == null || typeof priceSource !== 'object') &&
    inv &&
    Array.isArray(inv.products)
  ) {
    for (const product of inv.products) {
      const offerings = Array.isArray(product.offerings) ? product.offerings : []
      const enabled = offerings.find(
        (o) => o.is_enabled !== false && o.isEnabled !== false && o.price,
      )
      if (enabled && enabled.price) {
        priceSource = enabled.price
        break
      }
    }
  }

  const price = normalizePrice(priceSource)
  const images = extractImageUrls(
    /** @type {unknown[]} */ (listing.images) || null,
    {
      listingId,
      // Development: set ETSY_IMAGE_ORDER_DEBUG=1 on the Worker/Pages env to log ranks.
      logOrder:
        typeof globalThis !== 'undefined' &&
        /** @type {{ process?: { env?: Record<string, string> } }} */ (globalThis)
          .process?.env?.ETSY_IMAGE_ORDER_DEBUG === '1',
    },
  )

  const updatedRaw =
    listing.last_modified_tsz ??
    listing.updated_timestamp ??
    listing.update_date ??
    null
  const etsyUpdatedAt =
    updatedRaw != null && Number.isFinite(Number(updatedRaw))
      ? Math.trunc(Number(updatedRaw))
      : null

  return {
    listing_id: listingId,
    etsy_url: buildEtsyUrl(listing),
    etsy_state: etsyState,
    website_status: websiteStatus,
    title: String(listing.title || `Listing ${listingId}`),
    description:
      listing.description != null ? String(listing.description) : null,
    price_amount: price.amount,
    price_divisor: price.divisor,
    price_currency: price.currency,
    quantity,
    primary_image_url: images.primary,
    image_urls_json: images.urls.length ? JSON.stringify(images.urls) : null,
    inventory_json: inv ? JSON.stringify(inv) : null,
    etsy_updated_at: etsyUpdatedAt,
    synced_at: syncedAt,
  }
}

/**
 * Format a normalized price for safe admin API responses.
 *
 * @param {number | null | undefined} amount
 * @param {number | null | undefined} divisor
 * @returns {number | null}
 */
export function normalizedPriceValue(amount, divisor) {
  if (amount == null || !Number.isFinite(Number(amount))) return null
  const d = Number(divisor)
  const safeDivisor = Number.isFinite(d) && d > 0 ? d : 100
  return Number(amount) / safeDivisor
}

/**
 * Log only safe sync diagnostics (never tokens/secrets/headers).
 * @param {string} stage
 * @param {Record<string, unknown>} [fields]
 */
export function logSyncDiag(stage, fields = {}) {
  const safe = { stage }
  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) continue
    safe[key] = value
  }
  console.log(JSON.stringify(safe))
}

/**
 * Authenticated Etsy GET helper. Never logs tokens.
 *
 * Headers (values never logged):
 *   Authorization: Bearer <access token>
 *   x-api-key: <keystring>:<shared_secret>
 *
 * @param {string} pathOrUrl
 * @param {string} accessToken
 * @param {{ apiKey: string, sharedSecret: string }} secrets
 * @param {Record<string, string | number | undefined>} [query]
 * @param {string} [stage]
 */
async function etsyGet(pathOrUrl, accessToken, secrets, query, stage) {
  const url = pathOrUrl.startsWith('http')
    ? new URL(pathOrUrl)
    : new URL(
        pathOrUrl.startsWith('/')
          ? `${ETSY_API_BASE}${pathOrUrl}`
          : `${ETSY_API_BASE}/${pathOrUrl}`,
      )

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(key, String(value))
    }
  }

  const upstreamPath = url.pathname

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'x-api-key': `${secrets.apiKey}:${secrets.sharedSecret}`,
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const contentType = res.headers.get('content-type')
    const text = await res.text()
    let body = null
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = null
    }

    const upstreamMessage = res.ok
      ? null
      : sanitizeUpstreamMessage(body, text)

    if (!res.ok && stage) {
      logSyncDiag(stage, {
        upstreamStatus: res.status,
        upstreamPath,
        contentType,
        errorCategory: 'etsy_http_error',
        upstreamMessage,
      })
    }

    return {
      ok: res.ok,
      status: res.status,
      body,
      contentType,
      upstreamPath,
      upstreamMessage,
    }
  } catch (error) {
    if (stage) {
      logSyncDiag(stage, {
        upstreamPath,
        errorCategory: 'etsy_fetch_threw',
        detail: error instanceof Error ? error.name : 'unknown',
      })
    }
    return {
      ok: false,
      status: 0,
      body: null,
      contentType: null,
      upstreamPath,
      upstreamMessage: 'Network error calling Etsy.',
      threw: true,
    }
  }
}

/**
 * Resolve shop ID: env.ETSY_SHOP_ID → D1 cache → Etsy users/{id}/shops.
 * Prefer user id from D1 / access-token prefix — Etsy has no reliable public `/users/me`
 * for all apps; token prefix `{userId}.…` is the documented approach.
 *
 * @param {Record<string, unknown>} env
 * @param {string} accessToken
 * @param {{ apiKey: string, sharedSecret: string }} secrets
 * @returns {Promise<
 *   | { ok: true, shopId: string, stage: string }
 *   | { ok: false, stage: string, error: string, message: string, upstreamStatus?: number, upstreamMessage?: string | null, contentType?: string | null }
 * >}
 */
export async function resolveEtsyShopId(env, accessToken, secrets) {
  const fromEnv = env && env.ETSY_SHOP_ID
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    logSyncDiag('etsy-shop-lookup', {
      errorCategory: null,
      source: 'env',
    })
    return {
      ok: true,
      shopId: String(fromEnv).trim(),
      stage: 'etsy-shop-lookup',
    }
  }

  const db = env && env.CATALOGUE_DB
  if (db) {
    try {
      const cached = await db
        .prepare(`SELECT shop_id FROM etsy_shop_meta WHERE id = 1`)
        .first()
      if (cached && cached.shop_id) {
        logSyncDiag('etsy-shop-lookup', {
          errorCategory: null,
          source: 'd1_cache',
        })
        return {
          ok: true,
          shopId: String(cached.shop_id),
          stage: 'etsy-shop-lookup',
        }
      }
    } catch (error) {
      logSyncDiag('etsy-shop-lookup', {
        errorCategory: 'shop_meta_read_failed',
        detail: error instanceof Error ? error.name : 'unknown',
      })
    }
  }

  let userId = null
  if (db) {
    try {
      const row = await db
        .prepare(`SELECT etsy_user_id FROM etsy_oauth_tokens WHERE id = 1`)
        .first()
      if (row && row.etsy_user_id) userId = String(row.etsy_user_id)
    } catch {
      // continue
    }
  }

  if (!userId) {
    userId = extractEtsyUserId(accessToken)
  }

  if (!userId) {
    // Last resort: historical `/users/me` (may 404 on some apps).
    logSyncDiag('etsy-user-lookup', { errorCategory: null, source: 'users_me' })
    const me = await etsyGet(
      '/users/me',
      accessToken,
      secrets,
      undefined,
      'etsy-user-lookup',
    )
    if (!me.ok || !me.body || me.body.user_id == null) {
      return {
        ok: false,
        stage: 'etsy-user-lookup',
        error: 'user_lookup_failed',
        message: 'Could not resolve Etsy user id from token or API.',
        upstreamStatus: me.status || undefined,
        upstreamMessage: me.upstreamMessage,
        contentType: me.contentType,
      }
    }
    userId = String(me.body.user_id)
  } else {
    logSyncDiag('etsy-user-lookup', {
      errorCategory: null,
      source: 'token_or_d1',
      userIdPresent: true,
    })
  }

  logSyncDiag('etsy-shop-lookup', {
    errorCategory: null,
    source: 'users_shops',
  })
  const shops = await etsyGet(
    `/users/${userId}/shops`,
    accessToken,
    secrets,
    undefined,
    'etsy-shop-lookup',
  )
  if (!shops.ok) {
    return {
      ok: false,
      stage: 'etsy-shop-lookup',
      error: 'shop_lookup_failed',
      message: 'Etsy request failed',
      upstreamStatus: shops.status || undefined,
      upstreamMessage: shops.upstreamMessage,
      contentType: shops.contentType,
    }
  }

  const results = shops.body && Array.isArray(shops.body.results)
    ? shops.body.results
    : Array.isArray(shops.body)
      ? shops.body
      : []

  const first = results[0]
  const shopId =
    first && (first.shop_id != null || first.shopId != null)
      ? String(first.shop_id ?? first.shopId)
      : shops.body && shops.body.shop_id != null
        ? String(shops.body.shop_id)
        : null

  if (!shopId) {
    logSyncDiag('etsy-shop-lookup', {
      errorCategory: 'shop_not_found',
      upstreamStatus: shops.status,
    })
    return {
      ok: false,
      stage: 'etsy-shop-lookup',
      error: 'shop_not_found',
      message: 'No Etsy shop found for the connected user.',
      upstreamStatus: shops.status,
    }
  }

  if (db) {
    const now = Math.floor(Date.now() / 1000)
    try {
      await db
        .prepare(
          `INSERT INTO etsy_shop_meta (id, shop_id, updated_at) VALUES (1, ?, ?)
           ON CONFLICT(id) DO UPDATE SET shop_id = excluded.shop_id, updated_at = excluded.updated_at`,
        )
        .bind(shopId, now)
        .run()
    } catch (error) {
      logSyncDiag('etsy-shop-lookup', {
        errorCategory: 'shop_meta_write_failed',
        detail: error instanceof Error ? error.name : 'unknown',
      })
    }
  }

  logSyncDiag('etsy-shop-lookup', {
    errorCategory: null,
    shopIdPresent: true,
  })
  return { ok: true, shopId, stage: 'etsy-shop-lookup' }
}

/**
 * Paginate all listings for a shop across known states.
 * Prefer includes=Images,Inventory; fall back if Etsy rejects the include set.
 *
 * @param {string} shopId
 * @param {string} accessToken
 * @param {{ apiKey: string, sharedSecret: string }} secrets
 * @param {{ fetchPage?: typeof etsyGet }} [deps]
 */
export async function fetchAllShopListings(
  shopId,
  accessToken,
  secrets,
  deps = {},
) {
  const get = deps.fetchPage || etsyGet
  /** @type {Map<number, Record<string, unknown>>} */
  const byId = new Map()

  const includeAttempts = ['Images,Inventory', 'Images', '']

  for (const state of ETSY_LISTING_STATES) {
    let includes = includeAttempts[0]
    let includeIdx = 0
    let offset = 0

    for (;;) {
      const stage =
        includes.includes('Inventory')
          ? 'listings-fetch'
          : includes.includes('Images')
            ? 'images-fetch'
            : 'listings-fetch'

      const query = {
        state,
        limit: LISTINGS_PAGE_SIZE,
        offset,
      }
      if (includes) query.includes = includes

      const page = await get(
        `/shops/${shopId}/listings`,
        accessToken,
        secrets,
        query,
        stage,
      )

      if (!page.ok) {
        // Retry without Inventory / Images when Etsy rejects includes.
        if (
          (page.status === 400 || page.status === 403) &&
          includeIdx < includeAttempts.length - 1
        ) {
          includeIdx += 1
          includes = includeAttempts[includeIdx]
          logSyncDiag('listings-fetch', {
            errorCategory: 'includes_fallback',
            upstreamStatus: page.status,
            upstreamPath: page.upstreamPath,
            nextIncludes: includes || 'none',
            listingState: state,
          })
          offset = 0
          continue
        }

        const err = new Error(`etsy_listings_failed:${page.status}`)
        err.status = page.status
        err.body = page.body
        err.stage = stage
        err.upstreamStatus = page.status
        err.upstreamMessage = page.upstreamMessage
        err.contentType = page.contentType
        err.upstreamPath = page.upstreamPath
        throw err
      }

      if (includes.includes('Inventory')) {
        logSyncDiag('inventory-fetch', {
          errorCategory: null,
          listingState: state,
          offset,
          pageCount: Array.isArray(page.body && page.body.results)
            ? page.body.results.length
            : 0,
        })
      }
      if (includes.includes('Images')) {
        logSyncDiag('images-fetch', {
          errorCategory: null,
          listingState: state,
          offset,
        })
      }

      const results =
        page.body && Array.isArray(page.body.results) ? page.body.results : []
      for (const listing of results) {
        const id = Number(listing.listing_id ?? listing.listingId)
        if (Number.isFinite(id)) byId.set(id, listing)
      }

      const count =
        page.body && page.body.count != null
          ? Number(page.body.count)
          : results.length
      offset += results.length
      if (results.length === 0 || offset >= count) break
    }
  }

  logSyncDiag('listings-fetch', {
    errorCategory: null,
    listingsFound: byId.size,
  })
  return [...byId.values()]
}

/**
 * UPSERT listing row; preserves website-managed columns on update.
 *
 * @param {D1Database} db
 * @param {ReturnType<typeof mapListingToProductRow>} row
 * @returns {Promise<'created'|'updated'>}
 */
/**
 * Upsert one listing. Website-managed columns are preserved on conflict:
 * website_category, website_featured, website_hidden, website_approved,
 * custom_title, custom_description, custom_title_de, custom_description_de,
 * seo_title_de, seo_description_de, custom_title_cs, custom_description_cs,
 * seo_title_cs, seo_description_cs, local_images_json, website_use_local_images, slug.
 */
async function upsertProduct(db, row) {
  const existing = await db
    .prepare(`SELECT listing_id FROM etsy_products WHERE listing_id = ?`)
    .bind(row.listing_id)
    .first()

  await db
    .prepare(
      `INSERT INTO etsy_products (
        listing_id, etsy_url, etsy_state, website_status, title, description,
        price_amount, price_divisor, price_currency, quantity,
        primary_image_url, image_urls_json, inventory_json,
        etsy_updated_at, synced_at,
        website_category, website_featured, website_hidden, website_approved,
        custom_title, custom_description, local_images_json, website_use_local_images, slug
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 0, 1, 0, NULL, NULL, NULL, 0, NULL)
      ON CONFLICT(listing_id) DO UPDATE SET
        etsy_url = excluded.etsy_url,
        etsy_state = excluded.etsy_state,
        website_status = excluded.website_status,
        title = excluded.title,
        description = excluded.description,
        price_amount = excluded.price_amount,
        price_divisor = excluded.price_divisor,
        price_currency = excluded.price_currency,
        quantity = excluded.quantity,
        primary_image_url = excluded.primary_image_url,
        image_urls_json = excluded.image_urls_json,
        inventory_json = excluded.inventory_json,
        etsy_updated_at = excluded.etsy_updated_at,
        synced_at = excluded.synced_at`,
    )
    .bind(
      row.listing_id,
      row.etsy_url,
      row.etsy_state,
      row.website_status,
      row.title,
      row.description,
      row.price_amount,
      row.price_divisor,
      row.price_currency,
      row.quantity,
      row.primary_image_url,
      row.image_urls_json,
      row.inventory_json,
      row.etsy_updated_at,
      row.synced_at,
    )
    .run()

  return existing ? 'updated' : 'created'
}

/**
 * Avoid overlapping sync runs. A run is considered active until finished,
 * with a 30-minute stale timeout matching the cron interval.
 * @param {D1Database} db
 * @param {number} now
 */
async function findRunningSync(db, now) {
  return db
    .prepare(
      `SELECT id, started_at
       FROM etsy_sync_runs
       WHERE status = 'running'
         AND finished_at IS NULL
         AND started_at >= ?
       ORDER BY started_at DESC
       LIMIT 1`,
    )
    .bind(now - SYNC_LOCK_TTL_SECONDS)
    .first()
}

/**
 * Full read-only catalogue sync. Never deletes missing listings.
 * Always returns a structured result (never throws to the caller).
 *
 * @param {Record<string, unknown>} env
 * @param {{
 *   getAccessToken?: typeof getValidEtsyAccessToken,
 *   resolveAccessToken?: typeof resolveEtsyAccessToken,
 *   resolveShopId?: typeof resolveEtsyShopId,
 *   fetchListings?: typeof fetchAllShopListings,
 * }} [deps]
 */
export async function syncEtsyCatalogue(env, deps = {}) {
  /** @type {string} */
  let stage = 'd1-binding'

  const fail = (fields) => ({
    success: false,
    ok: false,
    status: 'error',
    listingsFound: fields.listingsFound ?? 0,
    listingsCreated: fields.listingsCreated ?? 0,
    listingsUpdated: fields.listingsUpdated ?? 0,
    stage: fields.stage || stage,
    error: fields.error,
    message: fields.message || 'Sync failed',
    upstreamStatus: fields.upstreamStatus ?? null,
    upstreamMessage: fields.upstreamMessage ?? null,
    contentType: fields.contentType ?? null,
    runId: fields.runId,
  })

  try {
    const db = env && env.CATALOGUE_DB
    if (!db) {
      logSyncDiag('d1-binding', { errorCategory: 'storage_not_configured' })
      return fail({
        stage: 'd1-binding',
        error: 'storage_not_configured',
        message: 'CATALOGUE_DB D1 binding is not available.',
      })
    }
    logSyncDiag('d1-binding', { errorCategory: null, available: true })

    const startedAt = Math.floor(Date.now() / 1000)
    let runId = null

    stage = 'd1-sync-run-insert'
    try {
      const existingRun = await findRunningSync(db, startedAt)
      if (existingRun) {
        logSyncDiag('d1-sync-run-insert', {
          errorCategory: 'sync_already_running',
          runningRunId: existingRun.id,
        })
        return fail({
          stage: 'd1-sync-run-insert',
          error: 'sync_already_running',
          message: 'Another Etsy catalogue sync is already running.',
        })
      }

      const insertRun = await db
        .prepare(
          `INSERT INTO etsy_sync_runs (started_at, status, listings_found, listings_created, listings_updated)
           VALUES (?, 'running', 0, 0, 0)`,
        )
        .bind(startedAt)
        .run()
      runId = insertRun.meta && insertRun.meta.last_row_id
      logSyncDiag('d1-sync-run-insert', {
        errorCategory: null,
        runIdPresent: runId != null,
      })
    } catch (error) {
      logSyncDiag('d1-sync-run-insert', {
        errorCategory: 'd1_error',
        detail: error instanceof Error ? error.name : 'unknown',
      })
      return fail({
        stage: 'd1-sync-run-insert',
        error: 'd1_error',
        message:
          'Failed to insert sync run. Confirm migration 0002_etsy_catalogue.sql is applied.',
      })
    }

    const finishRun = async (payload) => {
      const finishedAt = Math.floor(Date.now() / 1000)
      if (runId == null) return { ...payload, runId: undefined }
      try {
        await db
          .prepare(
            `UPDATE etsy_sync_runs SET
              finished_at = ?,
              status = ?,
              listings_found = ?,
              listings_created = ?,
              listings_updated = ?,
              error_message = ?
             WHERE id = ?`,
          )
          .bind(
            finishedAt,
            payload.status,
            payload.listingsFound,
            payload.listingsCreated,
            payload.listingsUpdated,
            payload.message || payload.error || null,
            runId,
          )
          .run()
      } catch (error) {
        logSyncDiag('d1-sync-run-insert', {
          errorCategory: 'd1_update_failed',
          detail: error instanceof Error ? error.name : 'unknown',
        })
      }
      return { ...payload, runId }
    }

    stage = 'oauth-token-loaded'
    let accessToken = null
    if (deps.getAccessToken) {
      accessToken = await deps.getAccessToken(env)
      if (!accessToken) {
        logSyncDiag('oauth-token-loaded', { errorCategory: 'oauth_unavailable' })
        return finishRun(
          fail({
            stage: 'oauth-token-loaded',
            error: 'oauth_unavailable',
            message:
              'No valid Etsy access token. Connect OAuth or wait for refresh.',
          }),
        )
      }
      logSyncDiag('oauth-token-loaded', { errorCategory: null })
    } else {
      const resolveToken = deps.resolveAccessToken || resolveEtsyAccessToken
      const tokenResult = await resolveToken(env)
      if (!tokenResult.ok) {
        return finishRun(
          fail({
            stage: tokenResult.stage || 'oauth-token-loaded',
            error: tokenResult.error,
            message: tokenResult.message,
            upstreamStatus: tokenResult.upstreamStatus,
            upstreamMessage: tokenResult.upstreamMessage,
            contentType: tokenResult.contentType,
          }),
        )
      }
      accessToken = tokenResult.accessToken
      if (tokenResult.refreshed) {
        logSyncDiag('oauth-refresh-succeeded', { errorCategory: null })
      }
    }

    stage = 'etsy-secrets'
    const secrets = requireEtsySecrets(env)
    if (!secrets.ok) {
      logSyncDiag('etsy-secrets', { errorCategory: secrets.error })
      return finishRun(
        fail({
          stage: 'etsy-secrets',
          error: secrets.error,
          message: secrets.message,
        }),
      )
    }

    stage = 'etsy-shop-lookup'
    const resolveShop = deps.resolveShopId || resolveEtsyShopId
    let shop
    try {
      shop = await resolveShop(env, accessToken, secrets)
    } catch (error) {
      logSyncDiag('etsy-shop-lookup', {
        errorCategory: 'unexpected',
        detail: error instanceof Error ? error.name : 'unknown',
      })
      return finishRun(
        fail({
          stage: 'etsy-shop-lookup',
          error: 'shop_lookup_failed',
          message: 'Etsy shop lookup threw an unexpected error.',
        }),
      )
    }
    if (!shop.ok) {
      return finishRun(
        fail({
          stage: shop.stage || 'etsy-shop-lookup',
          error: shop.error,
          message: shop.message || 'Etsy request failed',
          upstreamStatus: shop.upstreamStatus,
          upstreamMessage: shop.upstreamMessage,
          contentType: shop.contentType,
        }),
      )
    }

    stage = 'listings-fetch'
    let listings
    try {
      const fetchListings = deps.fetchListings || fetchAllShopListings
      listings = await fetchListings(shop.shopId, accessToken, secrets)
    } catch (error) {
      const upstreamStatus =
        error && typeof error === 'object' && 'upstreamStatus' in error
          ? /** @type {{ upstreamStatus?: number }} */ (error).upstreamStatus
          : error && typeof error === 'object' && 'status' in error
            ? /** @type {{ status?: number }} */ (error).status
            : null
      const upstreamMessage =
        error && typeof error === 'object' && 'upstreamMessage' in error
          ? /** @type {{ upstreamMessage?: string }} */ (error).upstreamMessage
          : null
      const errStage =
        error && typeof error === 'object' && 'stage' in error
          ? String(/** @type {{ stage?: string }} */ (error).stage)
          : 'listings-fetch'
      logSyncDiag(errStage, {
        errorCategory: 'etsy_api_failed',
        upstreamStatus,
        upstreamMessage,
        detail: error instanceof Error ? error.message : 'unknown',
      })
      return finishRun(
        fail({
          stage: errStage,
          error: 'etsy_api_failed',
          message: 'Etsy request failed',
          upstreamStatus,
          upstreamMessage,
          contentType:
            error && typeof error === 'object' && 'contentType' in error
              ? /** @type {{ contentType?: string }} */ (error).contentType
              : null,
        }),
      )
    }

    stage = 'product-upsert'
    const syncedAt = Math.floor(Date.now() / 1000)
    let created = 0
    let updated = 0

    try {
      for (const listing of listings) {
        const inv =
          listing.inventory && typeof listing.inventory === 'object'
            ? listing.inventory
            : null
        const row = mapListingToProductRow(listing, inv, syncedAt)
        if (!Number.isFinite(row.listing_id)) continue
        const result = await upsertProduct(db, row)
        if (result === 'created') created += 1
        else updated += 1
      }
    } catch (error) {
      logSyncDiag('product-upsert', {
        errorCategory: 'd1_error',
        detail: error instanceof Error ? error.name : 'unknown',
      })
      return finishRun(
        fail({
          stage: 'product-upsert',
          listingsFound: listings.length,
          listingsCreated: created,
          listingsUpdated: updated,
          error: 'd1_error',
          message: 'Failed while writing catalogue rows.',
        }),
      )
    }

    stage = 'sync-complete'
    logSyncDiag('sync-complete', {
      errorCategory: null,
      listingsFound: listings.length,
      created,
      updated,
    })

    return finishRun({
      success: true,
      ok: true,
      status: 'success',
      listingsFound: listings.length,
      listingsCreated: created,
      listingsUpdated: updated,
      stage: 'sync-complete',
      message: 'Sync completed',
      upstreamStatus: null,
      upstreamMessage: null,
      contentType: null,
    })
  } catch (error) {
    logSyncDiag(stage || 'sync-unexpected', {
      errorCategory: 'unhandled',
      detail: error instanceof Error ? error.name : 'unknown',
    })
    return fail({
      stage: stage || 'sync-unexpected',
      error: 'unhandled',
      message: 'Sync failed with an unexpected error.',
    })
  }
}
