/**
 * Cloudflare Pages Function — GET /api/admin/etsy/products
 *
 * Lists synced Etsy products with filters and pagination.
 * Auth: Authorization: Bearer <ADMIN_SYNC_SECRET>
 */

import { requireAdminSyncAuth } from '../_auth.js'
import {
  buildListWhereClause,
  mapProductRow,
  parseListQuery,
  PRODUCT_SELECT_COLUMNS,
  SORT_ORDER_SQL,
} from '../_products.js'
import { jsonResponse } from '../../etsy/_oauth.js'

export async function onRequestGet(context) {
  const auth = requireAdminSyncAuth(context.request, context.env)
  if (!auth.ok) return auth.response

  const db = context.env && context.env.CATALOGUE_DB
  if (!db) {
    return jsonResponse(
      { error: 'storage_not_configured', message: 'CATALOGUE_DB is not available.' },
      { status: 503 },
    )
  }

  const parsed = parseListQuery(context.request.url)
  if (!parsed.ok) {
    return jsonResponse(
      { error: parsed.error, message: parsed.message },
      { status: 400 },
    )
  }

  const { filters } = parsed
  const { sql: whereSql, binds } = buildListWhereClause(filters)

  try {
    const countRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM etsy_products ${whereSql}`)
      .bind(...binds)
      .first()
    const total = Number(countRow && countRow.total) || 0

    const { results } = await db
      .prepare(
        `SELECT ${PRODUCT_SELECT_COLUMNS}
         FROM etsy_products
         ${whereSql}
         ORDER BY ${SORT_ORDER_SQL}
         LIMIT ? OFFSET ?`,
      )
      .bind(...binds, filters.limit, filters.offset)
      .all()

    const products = (results || []).map(mapProductRow)

    return jsonResponse({
      ok: true,
      total,
      count: products.length,
      limit: filters.limit,
      offset: filters.offset,
      filters: {
        state: filters.state,
        status: filters.status,
        approved: filters.approved,
        hidden: filters.hidden,
        featured: filters.featured,
        category: filters.category,
        search: filters.search,
      },
      products,
    })
  } catch (error) {
    console.log(
      '[admin] products query failed',
      error instanceof Error ? error.name : 'unknown',
    )
    return jsonResponse(
      { error: 'd1_error', message: 'Failed to load products.' },
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
