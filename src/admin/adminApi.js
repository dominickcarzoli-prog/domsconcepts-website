/**
 * Admin catalogue API client — token in sessionStorage only.
 * Never logs the token.
 */

const SESSION_KEY = 'domsconcepts_admin_token'

export function getAdminToken() {
  try {
    return sessionStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

export function setAdminToken(token) {
  sessionStorage.setItem(SESSION_KEY, String(token).trim())
}

export function clearAdminToken() {
  sessionStorage.removeItem(SESSION_KEY)
}

/**
 * @param {string} path
 * @param {RequestInit} [options]
 */
export async function adminFetch(path, options = {}) {
  const token = getAdminToken()
  if (!token) {
    return { ok: false, status: 401, data: { error: 'no_token' } }
  }

  const headers = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  }

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(path, { ...options, headers })
  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  return { ok: res.ok, status: res.status, data }
}

/**
 * @param {Record<string, string | number | boolean | null | undefined>} params
 */
export function buildProductsQuery(params) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return `/api/admin/etsy/products${qs ? `?${qs}` : ''}`
}

export async function fetchProducts(params) {
  return adminFetch(buildProductsQuery(params))
}

/**
 * @param {number} listingId
 * @param {Record<string, unknown>} fields
 */
export async function patchProduct(listingId, fields) {
  return adminFetch(`/api/admin/etsy/products/${listingId}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  })
}

/**
 * @param {string} action
 * @param {number[]} listingIds
 * @param {string} [category]
 */
export async function bulkProducts(action, listingIds, category) {
  const body = { action, listingIds }
  if (category) body.category = category
  return adminFetch('/api/admin/etsy/products/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export const WEBSITE_CATEGORIES = [
  'Cutting Boards',
  'End Grain Boards',
  'Serving Boards',
  'Epoxy Pieces',
  'Furniture',
  'Wood Care',
  'Accessories',
  'Other',
]
