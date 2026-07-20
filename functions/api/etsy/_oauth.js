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

export function requireEtsySecrets(env) {
  const apiKey = env && env.ETSY_API_KEY
  const sharedSecret = env && env.ETSY_SHARED_SECRET
  if (!apiKey || !sharedSecret) {
    return null
  }
  return { apiKey, sharedSecret }
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

/**
 * PLACEHOLDER — token persistence not configured yet.
 * No D1/KV/R2 bindings exist in this project (no wrangler.toml storage).
 * Returns an explicit error; never logs or returns token values.
 *
 * @param {{ access_token: string, refresh_token: string, expires_in: number, token_type: string }} _tokens
 * @param {object} _env
 * @returns {Promise<{ ok: false, error: string, message: string }>}
 */
export async function saveEtsyTokens(_tokens, _env) {
  // TODO(Step 2): persist tokens in a secure Cloudflare binding (D1 or encrypted KV).
  // Do not store tokens in frontend code, URL query params, or non-HttpOnly cookies.
  console.log(
    '[etsy-oauth] saveEtsyTokens: storage not configured (no D1/KV binding)',
  )
  return {
    ok: false,
    error: 'storage_not_configured',
    message:
      'Etsy tokens cannot be saved until a secure Cloudflare binding (D1 or KV) is added.',
  }
}
