/**
 * Cloudflare Pages Function — GET /api/products
 *
 * Public read-only catalogue: approved + visible Etsy products only.
 */

import {
  mapPublicProductRow,
  PUBLIC_PRODUCT_COLUMNS,
  PUBLIC_PRODUCT_WHERE,
} from './_public_products.js'
import { jsonResponse, SECURITY_HEADERS } from './etsy/_oauth.js'

const CACHE_HEADERS = {
  'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
}

export async function onRequestGet(context) {
  const db = context.env && context.env.CATALOGUE_DB
  if (!db) {
    return jsonResponse(
      { error: 'unavailable', message: 'Catalogue temporarily unavailable.' },
      { status: 503 },
    )
  }

  try {
    const { results } = await db
      .prepare(
        `SELECT ${PUBLIC_PRODUCT_COLUMNS}
         FROM etsy_products
         WHERE ${PUBLIC_PRODUCT_WHERE}
         ORDER BY website_featured DESC,
           CASE etsy_state WHEN 'active' THEN 0 WHEN 'sold_out' THEN 1 ELSE 2 END,
           listing_id DESC`,
      )
      .all()

    const products = (results || []).map(mapPublicProductRow)

    return jsonResponse(
      { ok: true, count: products.length, products },
      { headers: CACHE_HEADERS },
    )
  } catch (error) {
    console.log(
      '[public-products] list failed',
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
    { status: 405, headers: { Allow: 'GET', ...SECURITY_HEADERS } },
  )
}
