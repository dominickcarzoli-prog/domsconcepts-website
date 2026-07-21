/**
 * Admin sync auth — Bearer ADMIN_SYNC_SECRET only.
 * Never expose the secret value in responses or logs.
 */

import { jsonResponse } from '../etsy/_oauth.js'

/**
 * @param {Request} request
 * @param {{ ADMIN_SYNC_SECRET?: string }} env
 * @returns {{ ok: true } | { ok: false, response: Response }}
 */
export function requireAdminSyncAuth(request, env) {
  const secret = env && env.ADMIN_SYNC_SECRET
  if (secret == null || String(secret).trim() === '') {
    console.log('[admin] ADMIN_SYNC_SECRET missing')
    return {
      ok: false,
      response: jsonResponse(
        { error: 'not_configured', message: 'Admin sync is not configured.' },
        { status: 503 },
      ),
    }
  }

  const header = request.headers.get('Authorization') || ''
  const match = /^Bearer\s+(.+)$/i.exec(header)
  const token = match ? match[1].trim() : ''

  if (!token || token !== String(secret)) {
    console.log('[admin] unauthorized')
    return {
      ok: false,
      response: jsonResponse(
        { error: 'unauthorized', message: 'Valid Bearer token required.' },
        { status: 401 },
      ),
    }
  }

  return { ok: true }
}
