/**
 * Shared Etsy OAuth helpers (Pages Functions only).
 * Secrets: ETSY_API_KEY, ETSY_SHARED_SECRET — never expose to the browser.
 */

export const ETSY_REDIRECT_URI =
  'https://domsconcepts.com/api/etsy/oauth/callback'
export const ETSY_AUTHORIZE_URL = 'https://www.etsy.com/oauth/connect'
export const ETSY_TOKEN_URL =
  'https://openapi.etsy.com/v3/public/oauth/token'
/** Read-only scopes only — never request write scopes. */
export const ETSY_SCOPES = 'listings_r shops_r'

export const COOKIE_STATE = 'etsy_oauth_state'
export const COOKIE_VERIFIER = 'etsy_oauth_verifier'
const COOKIE_MAX_AGE = 600 // 10 minutes
const COOKIE_PATH = '/api/etsy/oauth'

/** Pages Functions do not inherit public/_headers — apply security headers here. */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

export function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...SECURITY_HEADERS,
      ...(init.headers || {}),
    },
  })
}

export function htmlErrorResponse(status, title, message) {
  const safeTitle = escapeHtml(title)
  const safeMessage = escapeHtml(message)
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${safeTitle}</title></head><body><h1>${safeTitle}</h1><p>${safeMessage}</p></body></html>`,
    {
      status,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, no-store',
        ...SECURITY_HEADERS,
      },
    },
  )
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Resolve Etsy secrets for OAuth.
 * client_id / keystring must be ETSY_API_KEY only — never key:secret or key+sharedSecret.
 *
 * @returns {{ ok: true, apiKey: string, sharedSecret: string } | { ok: false, error: string, message: string }}
 */
export function requireEtsySecrets(env) {
  const rawApiKey = env && env.ETSY_API_KEY
  const sharedSecret = env && env.ETSY_SHARED_SECRET

  const apiKeyPresent = rawApiKey != null && String(rawApiKey).trim() !== ''
  const apiKey = apiKeyPresent ? String(rawApiKey).trim() : ''

  // Diagnostics only — never log the key or shared secret values.
  console.log(
    '[etsy-oauth] secrets:',
    `apiKeyPresent=${apiKeyPresent}`,
    `apiKeyLength=${apiKey.length}`,
  )

  if (!apiKeyPresent) {
    return {
      ok: false,
      error: 'missing_api_key',
      message:
        'ETSY_API_KEY is missing. Set it to the Etsy keystring only (not key:secret).',
    }
  }

  if (apiKey.includes(':')) {
    return {
      ok: false,
      error: 'invalid_api_key',
      message:
        'ETSY_API_KEY must be the keystring only. Do not include a colon or the shared secret (not key:secret).',
    }
  }

  if (sharedSecret == null || String(sharedSecret).trim() === '') {
    return {
      ok: false,
      error: 'missing_shared_secret',
      message:
        'ETSY_SHARED_SECRET is missing. Set it as a Cloudflare environment secret.',
    }
  }

  // apiKey is trimmed keystring only — callers must use it as client_id without concatenating sharedSecret.
  return { ok: true, apiKey, sharedSecret }
}

export function isSecureRequest(request) {
  const url = new URL(request.url)
  if (url.protocol === 'https:') return true
  const forwarded = request.headers.get('X-Forwarded-Proto')
  return forwarded === 'https'
}

function base64UrlEncode(bytes) {
  let binary = ''
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  for (let i = 0; i < view.length; i += 1) {
    binary += String.fromCharCode(view[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Cryptographically secure random base64url string (default 32 bytes → ~43 chars). */
export function randomBase64Url(byteLength = 32) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return base64UrlEncode(bytes)
}

/** PKCE S256 code_challenge from code_verifier. */
export async function pkceChallengeS256(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64UrlEncode(digest)
}

export function parseCookies(cookieHeader) {
  const out = Object.create(null)
  if (!cookieHeader) return out
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const key = part.slice(0, idx).trim()
    const value = part.slice(idx + 1).trim()
    if (key) out[key] = decodeURIComponent(value)
  }
  return out
}

function cookieFlags(request) {
  const parts = [
    `Path=${COOKIE_PATH}`,
    `Max-Age=${COOKIE_MAX_AGE}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  if (isSecureRequest(request)) {
    parts.push('Secure')
  }
  return parts.join('; ')
}

export function setOAuthCookies(request, state, codeVerifier) {
  const flags = cookieFlags(request)
  return [
    `${COOKIE_STATE}=${encodeURIComponent(state)}; ${flags}`,
    `${COOKIE_VERIFIER}=${encodeURIComponent(codeVerifier)}; ${flags}`,
  ]
}

export function clearOAuthCookies(request) {
  const secure = isSecureRequest(request) ? '; Secure' : ''
  const base = `Path=${COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  return [
    `${COOKIE_STATE}=; ${base}`,
    `${COOKIE_VERIFIER}=; ${base}`,
  ]
}

const TOKEN_SKEW_SECONDS = 5 * 60 // refresh when fewer than 5 minutes remain

/**
 * Extract Etsy user id from access_token only when the common
 * `{numericUserId}.{rest}` pattern is present. Otherwise null.
 * Never logs the token.
 */
export function extractEtsyUserId(accessToken) {
  if (typeof accessToken !== 'string' || accessToken.length === 0) return null
  const match = /^(\d+)\./.exec(accessToken)
  return match ? match[1] : null
}

/**
 * Persist Etsy OAuth tokens in D1 (single row id = 1).
 * Never logs or returns token values.
 *
 * @param {{ access_token: string, refresh_token: string, expires_in: number, token_type?: string, scope?: string }} tokens
 * @param {{ CATALOGUE_DB?: D1Database }} env
 * @returns {Promise<{ ok: true } | { ok: false, error: string, message: string }>}
 */
export async function saveEtsyTokens(tokens, env) {
  const db = env && env.CATALOGUE_DB
  if (!db) {
    console.log('[etsy-oauth] saveEtsyTokens: missing CATALOGUE_DB binding')
    return {
      ok: false,
      error: 'storage_not_configured',
      message: 'CATALOGUE_DB D1 binding is not available.',
    }
  }

  const accessToken = tokens && tokens.access_token
  const refreshToken = tokens && tokens.refresh_token
  if (!accessToken || !refreshToken) {
    console.log('[etsy-oauth] saveEtsyTokens: incomplete token payload')
    return {
      ok: false,
      error: 'incomplete_tokens',
      message: 'Access and refresh tokens are required.',
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresIn = Number(tokens.expires_in)
  const expiresAt = now + (Number.isFinite(expiresIn) && expiresIn > 0 ? expiresIn : 0)
  const tokenType = (tokens.token_type && String(tokens.token_type)) || 'Bearer'
  const scope = tokens.scope != null ? String(tokens.scope) : null
  const etsyUserId = extractEtsyUserId(accessToken)

  try {
    await db
      .prepare(
        `INSERT INTO etsy_oauth_tokens (
          id, etsy_user_id, access_token, refresh_token, token_type, scope,
          expires_at, created_at, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          etsy_user_id = excluded.etsy_user_id,
          access_token = excluded.access_token,
          refresh_token = excluded.refresh_token,
          token_type = excluded.token_type,
          scope = excluded.scope,
          expires_at = excluded.expires_at,
          updated_at = excluded.updated_at`,
      )
      .bind(
        etsyUserId,
        accessToken,
        refreshToken,
        tokenType,
        scope,
        expiresAt,
        now,
        now,
      )
      .run()

    console.log('[etsy-oauth] saveEtsyTokens: stored')
    return { ok: true }
  } catch (error) {
    console.log(
      '[etsy-oauth] saveEtsyTokens: d1_error',
      error instanceof Error ? error.name : 'unknown',
    )
    return {
      ok: false,
      error: 'd1_error',
      message: 'Failed to persist Etsy tokens.',
    }
  }
}

/**
 * Server-only: return a usable Etsy access token, refreshing via D1 when needed.
 * Never expose this to public API responses.
 *
 * @param {{ CATALOGUE_DB?: D1Database, ETSY_API_KEY?: string, ETSY_SHARED_SECRET?: string }} env
 * @returns {Promise<string | null>}
 */
export async function getValidEtsyAccessToken(env) {
  const db = env && env.CATALOGUE_DB
  if (!db) {
    console.log('[etsy-oauth] getValidEtsyAccessToken: missing CATALOGUE_DB')
    return null
  }

  let row
  try {
    row = await db
      .prepare(
        `SELECT access_token, refresh_token, expires_at, token_type, scope, etsy_user_id
         FROM etsy_oauth_tokens WHERE id = 1`,
      )
      .first()
  } catch (error) {
    console.log(
      '[etsy-oauth] getValidEtsyAccessToken: read_failed',
      error instanceof Error ? error.name : 'unknown',
    )
    return null
  }

  if (!row || !row.access_token || !row.refresh_token) {
    console.log('[etsy-oauth] getValidEtsyAccessToken: no_tokens')
    return null
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresAt = Number(row.expires_at) || 0
  if (expiresAt - now > TOKEN_SKEW_SECONDS) {
    return row.access_token
  }

  const secrets = requireEtsySecrets(env)
  if (!secrets.ok) {
    console.log(
      '[etsy-oauth] getValidEtsyAccessToken: secrets',
      secrets.error,
    )
    return null
  }

  try {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: secrets.apiKey,
      refresh_token: row.refresh_token,
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
      console.log(
        '[etsy-oauth] getValidEtsyAccessToken: refresh_failed',
        tokenRes.status,
      )
      return null
    }

    const payload = await tokenRes.json()
    const accessToken = payload && payload.access_token
    const refreshToken = (payload && payload.refresh_token) || row.refresh_token
    const expiresIn = Number(payload && payload.expires_in) || 0
    const tokenType =
      (payload && payload.token_type) || row.token_type || 'Bearer'
    const scope =
      payload && payload.scope != null ? payload.scope : row.scope

    if (!accessToken) {
      console.log('[etsy-oauth] getValidEtsyAccessToken: incomplete_refresh')
      return null
    }

    const saveResult = await saveEtsyTokens(
      {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn,
        token_type: tokenType,
        scope,
      },
      env,
    )

    if (!saveResult.ok) {
      console.log(
        '[etsy-oauth] getValidEtsyAccessToken: save_after_refresh',
        saveResult.error,
      )
      return null
    }

    console.log('[etsy-oauth] getValidEtsyAccessToken: refreshed')
    return accessToken
  } catch (error) {
    console.log(
      '[etsy-oauth] getValidEtsyAccessToken: refresh_error',
      error instanceof Error ? error.name : 'unknown',
    )
    return null
  }
}
