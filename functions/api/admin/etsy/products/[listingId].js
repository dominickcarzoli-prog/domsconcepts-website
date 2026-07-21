/**
 * Cloudflare Pages Function — PATCH /api/admin/etsy/products/:listingId
 *
 * Updates website-managed fields only.
 * Auth: Authorization: Bearer <ADMIN_SYNC_SECRET>
 */

import { requireAdminSyncAuth } from '../../_auth.js'
import {
  mapProductRow,
  parseListingIdParam,
  PRODUCT_SELECT_COLUMNS,
  validateUpdateBody,
} from '../../_products.js'
import { jsonResponse } from '../../../etsy/_oauth.js'

export async function onRequestPatch(context) {
  const auth = requireAdminSyncAuth(context.request, context.env)
  if (!auth.ok) return auth.response

  const db = context.env && context.env.CATALOGUE_DB
  if (!db) {
    return jsonResponse(
      { error: 'storage_not_configured', message: 'CATALOGUE_DB is not available.' },
      { status: 503 },
    )
  }

  const idResult = parseListingIdParam(context.params && context.params.listingId)
  if (!idResult.ok) {
    return jsonResponse(
      { error: idResult.error, message: idResult.message },
      { status: 400 },
    )
  }

  let body
  try {
    body = await context.request.json()
  } catch {
    return jsonResponse(
      { error: 'invalid_json', message: 'Request body must be JSON.' },
      { status: 400 },
    )
  }

  const validated = validateUpdateBody(body)
  if (!validated.ok) {
    return jsonResponse(
      { error: validated.error, message: validated.message },
      { status: 400 },
    )
  }

  const { fields } = validated
  const listingId = idResult.value

  try {
    const existing = await db
      .prepare(`SELECT listing_id FROM etsy_products WHERE listing_id = ?`)
      .bind(listingId)
      .first()

    if (!existing) {
      return jsonResponse(
        { error: 'not_found', message: 'Listing not found.' },
        { status: 404 },
      )
    }

    if ('slug' in fields && fields.slug) {
      const slugRow = await db
        .prepare(
          `SELECT listing_id FROM etsy_products WHERE slug = ? AND listing_id != ?`,
        )
        .bind(fields.slug, listingId)
        .first()
      if (slugRow) {
        return jsonResponse(
          { error: 'duplicate_slug', message: 'Slug already in use.' },
          { status: 409 },
        )
      }
    }

    const setClauses = Object.keys(fields).map((col) => `${col} = ?`)
    const values = Object.values(fields)

    await db
      .prepare(
        `UPDATE etsy_products SET ${setClauses.join(', ')} WHERE listing_id = ?`,
      )
      .bind(...values, listingId)
      .run()

    const row = await db
      .prepare(
        `SELECT ${PRODUCT_SELECT_COLUMNS} FROM etsy_products WHERE listing_id = ?`,
      )
      .bind(listingId)
      .first()

    return jsonResponse({
      ok: true,
      product: mapProductRow(row),
    })
  } catch (error) {
    const isUnique =
      error instanceof Error &&
      (error.message.includes('UNIQUE') || error.message.includes('unique'))
    if (isUnique) {
      return jsonResponse(
        { error: 'duplicate_slug', message: 'Slug already in use.' },
        { status: 409 },
      )
    }
    console.log(
      '[admin] product update failed',
      error instanceof Error ? error.name : 'unknown',
    )
    return jsonResponse(
      { error: 'd1_error', message: 'Failed to update product.' },
      { status: 500 },
    )
  }
}

export async function onRequest(context) {
  if (context.request.method === 'PATCH') {
    return onRequestPatch(context)
  }
  return jsonResponse(
    { error: 'method_not_allowed', message: 'PATCH required.' },
    { status: 405, headers: { Allow: 'PATCH' } },
  )
}
