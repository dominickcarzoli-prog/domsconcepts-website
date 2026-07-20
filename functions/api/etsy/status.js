/**
 * Cloudflare Pages Function — GET /api/etsy/status
 *
 * Returns connection status only — never tokens or secrets.
 * { connected: true, expiresAt } | { connected: false }
 */

import { jsonResponse } from './_oauth.js'

export async function onRequestGet(context) {
  const db = context.env && context.env.CATALOGUE_DB
  if (!db) {
    console.log('[etsy-oauth] status: missing CATALOGUE_DB')
    return jsonResponse({ connected: false })
  }

  try {
    const row = await db
      .prepare(
        `SELECT expires_at FROM etsy_oauth_tokens WHERE id = 1`,
      )
      .first()

    if (!row || row.expires_at == null) {
      return jsonResponse({ connected: false })
    }

    return jsonResponse({
      connected: true,
      expiresAt: Number(row.expires_at),
    })
  } catch (error) {
    console.log(
      '[etsy-oauth] status: query_failed',
      error instanceof Error ? error.name : 'unknown',
    )
    return jsonResponse({ connected: false })
  }
}
