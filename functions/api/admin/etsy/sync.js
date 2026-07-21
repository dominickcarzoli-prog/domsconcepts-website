/**
 * Cloudflare Pages Function — POST /api/admin/etsy/sync
 *
 * Triggers a read-only Etsy catalogue sync.
 * Auth: Authorization: Bearer <ADMIN_SYNC_SECRET>
 * Returns a safe summary only (no tokens / secrets / raw Etsy bodies).
 */

import { requireAdminSyncAuth } from '../_auth.js'
import { jsonResponse } from '../../etsy/_oauth.js'
import { logSyncDiag, syncEtsyCatalogue } from '../../etsy/_catalogue.js'

function safeSyncJson(result) {
  const success = Boolean(result && (result.success === true || result.ok === true))
  const body = {
    success,
    stage: (result && result.stage) || (success ? 'sync-complete' : 'unknown'),
    message:
      (result && result.message) ||
      (success ? 'Sync completed' : 'Sync failed'),
  }

  if (!success) {
    if (result && result.upstreamStatus != null) {
      body.upstreamStatus = result.upstreamStatus
    }
    if (result && result.upstreamMessage) {
      body.upstreamMessage = result.upstreamMessage
    }
    if (result && result.error) {
      body.error = result.error
    }
  } else {
    body.listingsFound = result.listingsFound ?? 0
    body.created = result.listingsCreated ?? 0
    body.updated = result.listingsUpdated ?? 0
    if (result.runId != null) body.runId = result.runId
  }

  // Include counts on failure when partial progress exists.
  if (!success && result) {
    if (result.listingsFound != null) body.listingsFound = result.listingsFound
    if (result.listingsCreated != null) body.created = result.listingsCreated
    if (result.listingsUpdated != null) body.updated = result.listingsUpdated
    if (result.runId != null) body.runId = result.runId
  }

  return body
}

export async function onRequestPost(context) {
  try {
    const auth = requireAdminSyncAuth(context.request, context.env)
    if (!auth.ok) return auth.response

    logSyncDiag('authentication-passed', { errorCategory: null })

    let result
    try {
      result = await syncEtsyCatalogue(context.env)
    } catch (error) {
      logSyncDiag('sync-unexpected', {
        errorCategory: 'unhandled',
        detail: error instanceof Error ? error.name : 'unknown',
      })
      // Always return JSON — never let Cloudflare emit plain "error code: 502".
      return jsonResponse(
        {
          success: false,
          stage: 'sync-unexpected',
          message: 'Sync failed with an unexpected error.',
          error: 'unhandled',
        },
        { status: 200 },
      )
    }

    const body = safeSyncJson(result)
    // Use 200 for handled failures so clients always receive diagnostic JSON
    // (Cloudflare may replace bare 502 Worker failures with "error code: 502").
    const status =
      body.success
        ? 200
        : result && result.error === 'oauth_unavailable'
          ? 401
          : result && result.error === 'storage_not_configured'
            ? 503
            : 200

    return jsonResponse(body, { status })
  } catch (error) {
    logSyncDiag('sync-route', {
      errorCategory: 'unhandled',
      detail: error instanceof Error ? error.name : 'unknown',
    })
    return jsonResponse(
      {
        success: false,
        stage: 'sync-route',
        message: 'Sync route failed unexpectedly.',
        error: 'unhandled',
      },
      { status: 200 },
    )
  }
}

export async function onRequest(context) {
  if (context.request.method === 'POST') {
    return onRequestPost(context)
  }
  return jsonResponse(
    { success: false, error: 'method_not_allowed', message: 'POST required.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}
