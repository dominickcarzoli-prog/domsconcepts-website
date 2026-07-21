/**
 * Cloudflare Pages Function — GET /api/products/:slug
 *
 * Public product detail for one approved + visible listing.
 */

import {
  mapPublicProductRow,
  normalizeSlugParam,
  PUBLIC_PRODUCT_COLUMNS,
  PUBLIC_PRODUCT_WHERE,
} from '../_public_products.js'
import { jsonResponse } from '../etsy/_oauth.js'

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
}

export async function onRequestGet(context) {
  const slug = normalizeSlugParam(context.params && context.params.slug)
  if (!slug) {
    return jsonResponse(
      { error: 'not_found', message: 'Product not found.' },
      { status: 404 },
    )
  }

  const db = context.env && context.env.CATALOGUE_DB
  if (!db) {
    return jsonResponse(
      { error: 'unavailable', message: 'Catalogue temporarily unavailable.' },
      { status: 503 },
    )
  }

  try {
    const row = await db
      .prepare(
        `SELECT ${PUBLIC_PRODUCT_COLUMNS}
         FROM etsy_products
         WHERE ${PUBLIC_PRODUCT_WHERE}
           AND (slug = ? OR CAST(listing_id AS TEXT) = ?)
         LIMIT 1`,
      )
      .bind(slug, slug)
      .first()

    if (!row) {
      return jsonResponse(
        { error: 'not_found', message: 'Product not found.' },
        { status: 404 },
      )
    }

    return jsonResponse(
      { ok: true, product: mapPublicProductRow(row) },
      { headers: CACHE_HEADERS },
    )
  } catch (error) {
    console.log(
      '[public-products] detail failed',
      error instanceof Error ? error.name : 'unknown',
    )
    return jsonResponse(
      { error: 'unavailable', message: 'Catalogue temporarily unavailable.' },
      { status: 500 },
    )
  }
}

export async function onRequest(context) {
  if (context.request.method === 'GET') {
    return onRequestGet(context)
  }
  return jsonResponse(
    { error: 'method_not_allowed', message: 'GET required.' },
    { status: 405, headers: { Allow: 'GET' } },
  )
}
