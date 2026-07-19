/**
 * Cloudflare Pages Function — GET /api/exchange-rates
 *
 * Upstream: Frankfurter (ECB-based, EUR base, no API key).
 * Returns rates as units of each currency per 1 CZK.
 * Cache: Cache API + Cache-Control s-maxage=12h. On upstream failure, serve last cache.
 */

const SUPPORTED = [
  'CZK',
  'EUR',
  'USD',
  'GBP',
  'CAD',
  'AUD',
  'NZD',
  'CHF',
  'PLN',
  'SEK',
  'NOK',
  'DKK',
  'JPY',
]

const CACHE_SECONDS = 43200 // 12 hours
const FRANKFURTER_URL = `https://api.frankfurter.app/latest?from=EUR&to=${SUPPORTED.filter((c) => c !== 'EUR').join(',')}`

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': `public, s-maxage=${CACHE_SECONDS}`,
      ...(init.headers || {}),
    },
  })
}

/** Convert Frankfurter EUR-based rates → units per 1 CZK. */
function ratesFromFrankfurter(payload) {
  const eurRates = { EUR: 1, ...(payload.rates || {}) }
  const czkPerEur = eurRates.CZK
  if (!(czkPerEur > 0)) {
    throw new Error('Missing CZK rate from Frankfurter')
  }

  const rates = { CZK: 1 }
  for (const code of SUPPORTED) {
    if (code === 'CZK') continue
    const perEur = eurRates[code]
    if (!(perEur > 0)) continue
    // 1 CZK = (1/czkPerEur) EUR = perEur/czkPerEur of target
    rates[code] = perEur / czkPerEur
  }
  return rates
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url)
  const cacheKey = new Request(`${url.origin}/api/exchange-rates#v1`, {
    method: 'GET',
  })

  const cache = caches.default
  const cached = await cache.match(cacheKey)

  try {
    const upstream = await fetch(FRANKFURTER_URL, {
      cf: {
        // Cloudflare edge cache for the upstream fetch
        cacheTtl: CACHE_SECONDS,
        cacheEverything: true,
      },
      headers: { Accept: 'application/json' },
    })

    if (!upstream.ok) {
      throw new Error(`Frankfurter HTTP ${upstream.status}`)
    }

    const payload = await upstream.json()
    const rates = ratesFromFrankfurter(payload)
    const body = {
      base: 'CZK',
      date: payload.date || null,
      provider: 'frankfurter',
      rates,
    }

    const response = jsonResponse(body)
    context.waitUntil(cache.put(cacheKey, response.clone()))
    return response
  } catch (error) {
    if (cached) {
      const headers = new Headers(cached.headers)
      headers.set('X-Rates-Source', 'cache-fallback')
      return new Response(cached.body, {
        status: cached.status,
        headers,
      })
    }

    return jsonResponse(
      {
        error: 'rates_unavailable',
        message: error instanceof Error ? error.message : 'Upstream failed',
        rates: null,
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
