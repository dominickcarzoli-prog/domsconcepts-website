/**
 * Cloudflare Pages Function — GET /api/etsy/oauth/start
 *
 * Starts Etsy OAuth 2.0 with PKCE (S256). Stores state + code_verifier in
 * short-lived HttpOnly cookies, then redirects to Etsy authorize URL.
 * Secrets stay server-side (ETSY_API_KEY / ETSY_SHARED_SECRET).
 */

import {
  ETSY_AUTHORIZE_URL,
  ETSY_REDIRECT_URI,
  ETSY_SCOPES,
  SECURITY_HEADERS,
  htmlErrorResponse,
  jsonResponse,
  pkceChallengeS256,
  randomBase64Url,
  requireEtsySecrets,
  setOAuthCookies,
} from '../_oauth.js'

export async function onRequestGet(context) {
  const secrets = requireEtsySecrets(context.env)
  if (!secrets.ok) {
    console.log('[etsy-oauth] start: misconfigured', secrets.error)
    return jsonResponse(
      {
        error: secrets.error,
        message: secrets.message,
      },
      { status: 503 },
    )
  }

  try {
    // client_id = trimmed ETSY_API_KEY keystring only (never includes shared secret).
    const clientId = secrets.apiKey
    console.log(
      '[etsy-oauth] start: building authorize URL',
      `clientIdLength=${clientId.length}`,
    )

    const state = randomBase64Url(32)
    const codeVerifier = randomBase64Url(32)
    const codeChallenge = await pkceChallengeS256(codeVerifier)

    const authorize = new URL(ETSY_AUTHORIZE_URL)
    authorize.searchParams.set('response_type', 'code')
    authorize.searchParams.set('client_id', clientId)
    authorize.searchParams.set('redirect_uri', ETSY_REDIRECT_URI)
    authorize.searchParams.set('scope', ETSY_SCOPES)
    authorize.searchParams.set('state', state)
    authorize.searchParams.set('code_challenge', codeChallenge)
    authorize.searchParams.set('code_challenge_method', 'S256')

    const headers = new Headers({
      Location: authorize.toString(),
      'Cache-Control': 'private, no-store',
      ...SECURITY_HEADERS,
    })
    for (const cookie of setOAuthCookies(context.request, state, codeVerifier)) {
      headers.append('Set-Cookie', cookie)
    }

    return new Response(null, { status: 302, headers })
  } catch (error) {
    console.log(
      '[etsy-oauth] start failed:',
      error instanceof Error ? error.message : 'unknown',
    )
    return htmlErrorResponse(
      500,
      'Etsy OAuth start failed',
      'Could not begin the Etsy connection. Please try again later.',
    )
  }
}
