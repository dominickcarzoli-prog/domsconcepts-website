/**
 * Cloudflare Pages Function — GET /api/etsy/oauth/callback
 *
 * Validates OAuth state, exchanges authorization code for tokens (server-side),
 * never returns tokens to the browser. Persistence is a placeholder until D1/KV.
 */

import {
  COOKIE_STATE,
  COOKIE_VERIFIER,
  ETSY_REDIRECT_URI,
  ETSY_TOKEN_URL,
  SECURITY_HEADERS,
  clearOAuthCookies,
  htmlErrorResponse,
  jsonResponse,
  parseCookies,
  requireEtsySecrets,
  saveEtsyTokens,
} from '../_oauth.js'

function redirectWithClearedCookies(request, path) {
  const headers = new Headers({
    Location: path,
    'Cache-Control': 'private, no-store',
    ...SECURITY_HEADERS,
  })
  for (const cookie of clearOAuthCookies(request)) {
    headers.append('Set-Cookie', cookie)
  }
  return new Response(null, { status: 302, headers })
}

export async function onRequestGet(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const oauthError = url.searchParams.get('error')

  const cookies = parseCookies(request.headers.get('Cookie'))
  const cookieState = cookies[COOKIE_STATE]
  const codeVerifier = cookies[COOKIE_VERIFIER]

  if (oauthError) {
    console.log('[etsy-oauth] callback: provider error', oauthError)
    return redirectWithClearedCookies(request, '/about?etsy=error')
  }

  if (!code || !state) {
    console.log('[etsy-oauth] callback: missing code or state')
    return htmlErrorResponse(
      400,
      'Invalid OAuth callback',
      'Missing authorization code or state parameter.',
    )
  }

  if (!cookieState || !codeVerifier) {
    console.log('[etsy-oauth] callback: missing oauth cookies')
    return htmlErrorResponse(
      400,
      'Invalid OAuth session',
      'OAuth cookies are missing or expired. Start the connection again.',
    )
  }

  if (state !== cookieState) {
    console.log('[etsy-oauth] callback: state mismatch')
    const res = htmlErrorResponse(
      403,
      'Invalid OAuth state',
      'The state parameter did not match. Please start the connection again.',
    )
    const headers = new Headers(res.headers)
    for (const cookie of clearOAuthCookies(request)) {
      headers.append('Set-Cookie', cookie)
    }
    return new Response(res.body, { status: 403, headers })
  }

  const secrets = requireEtsySecrets(env)
  if (!secrets) {
    console.log('[etsy-oauth] callback: secrets missing')
    const res = jsonResponse(
      {
        error: 'misconfigured',
        message:
          'ETSY_API_KEY and ETSY_SHARED_SECRET must be set as Cloudflare environment secrets.',
      },
      { status: 503 },
    )
    const headers = new Headers(res.headers)
    for (const cookie of clearOAuthCookies(request)) {
      headers.append('Set-Cookie', cookie)
    }
    return new Response(res.body, { status: 503, headers })
  }

  let tokenPayload
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: secrets.apiKey,
      redirect_uri: ETSY_REDIRECT_URI,
      code,
      code_verifier: codeVerifier,
    })

    const tokenRes = await fetch(ETSY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-api-key': `${secrets.apiKey}:${secrets.sharedSecret}`,
      },
      body,
    })

    if (!tokenRes.ok) {
      console.log('[etsy-oauth] token exchange failed:', tokenRes.status)
      return redirectWithClearedCookies(request, '/about?etsy=error')
    }

    tokenPayload = await tokenRes.json()
    const { access_token, refresh_token, expires_in, token_type } = tokenPayload

    if (!access_token || !refresh_token) {
      console.log('[etsy-oauth] token exchange: incomplete response')
      return redirectWithClearedCookies(request, '/about?etsy=error')
    }

    console.log('[etsy-oauth] token exchange succeeded')

    // PLACEHOLDER: tokens are obtained but not persisted until D1/KV exists.
    const saveResult = await saveEtsyTokens(
      {
        access_token,
        refresh_token,
        expires_in: Number(expires_in) || 0,
        token_type: token_type || 'Bearer',
      },
      env,
    )

    // Drop token references immediately — never send to browser.
    tokenPayload = null

    if (!saveResult.ok) {
      console.log(
        '[etsy-oauth] tokens obtained but not stored:',
        saveResult.error,
      )
      return redirectWithClearedCookies(
        request,
        '/about?etsy=storage_pending',
      )
    }

    return redirectWithClearedCookies(request, '/about?etsy=connected')
  } catch (error) {
    console.log(
      '[etsy-oauth] callback failed:',
      error instanceof Error ? error.message : 'unknown',
    )
    return redirectWithClearedCookies(request, '/about?etsy=error')
  }
}
