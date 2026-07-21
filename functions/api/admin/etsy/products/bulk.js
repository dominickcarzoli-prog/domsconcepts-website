/**
 * Cloudflare Pages Function — POST /api/admin/etsy/products/bulk
 *
 * Bulk website-managed updates (approve, hide, unhide, category, unfeature).
 * Auth: Authorization: Bearer <ADMIN_SYNC_SECRET>
 */

import { requireAdminSyncAuth } from '../../_auth.js'
import { validateBulkBody } from '../../_products.js'
import { jsonResponse } from '../../../etsy/_oauth.js'

const BULK_SQL = {
  approve: `UPDATE etsy_products SET website_approved = 1 WHERE listing_id = ?`,
  hide: `UPDATE etsy_products SET website_hidden = 1 WHERE listing_id = ?`,
  unhide: `UPDATE etsy_products SET website_hidden = 0 WHERE listing_id = ?`,
  setCategory: `UPDATE etsy_products SET website_category = ? WHERE listing_id = ?`,
  removeFeatured: `UPDATE etsy_products SET website_featured = 0 WHERE listing_id = ?`,
}

export async function onRequestPost(context) {
  const auth = requireAdminSyncAuth(context.request, context.env)
  if (!auth.ok) return auth.response

  const db = context.env && context.env.CATALOGUE_DB
  if (!db) {
    return jsonResponse(
      { error: 'storage_not_configured', message: 'CATALOGUE_DB is not available.' },
      { status: 503 },
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

  const validated = validateBulkBody(body)
  if (!validated.ok) {
    return jsonResponse(
      { error: validated.error, message: validated.message },
      { status: 400 },
    )
  }

  const { action, listingIds, category } = validated
  const sql = BULK_SQL[action]
  let updated = 0
  let notFound = 0

  try {
    for (const listingId of listingIds) {
      const exists = await db
        .prepare(`SELECT listing_id FROM etsy_products WHERE listing_id = ?`)
        .bind(listingId)
        .first()
      if (!exists) {
        notFound += 1
        continue
      }

      if (action === 'setCategory') {
        await db.prepare(sql).bind(category, listingId).run()
      } else {
        await db.prepare(sql).bind(listingId).run()
      }
      updated += 1
    }

    return jsonResponse({
      ok: true,
      action,
      requested: listingIds.length,
      updated,
      notFound,
    })
  } catch (error) {
    console.log(
      '[admin] bulk update failed',
      error instanceof Error ? error.name : 'unknown',
    )
    return jsonResponse(
      { error: 'd1_error', message: 'Bulk update failed.' },
      { status: 500 },
    )
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context)
  }
  return jsonResponse(
    { error: 'method_not_allowed', message: 'POST required.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}
