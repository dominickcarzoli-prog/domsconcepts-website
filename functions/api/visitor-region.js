/**
 * Cloudflare Pages Function — GET /api/visitor-region
 * Prefer request.cf.country, fallback CF-IPCountry.
 * Returns { country, currency } only — never cache across visitors.
 */

const EUROZONE = new Set([
  'AD',
  'AT',
  'BE',
  'CY',
  'DE',
  'EE',
  'ES',
  'FI',
  'FR',
  'GR',
  'IE',
  'IT',
  'LT',
  'LU',
  'LV',
  'MC',
  'ME',
  'MT',
  'NL',
  'PT',
  'SI',
  'SK',
  'SM',
  'VA',
  'XK',
])

const COUNTRY_CURRENCY = {
  CZ: 'CZK',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  CH: 'CHF',
  LI: 'CHF',
  PL: 'PLN',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  JP: 'JPY',
}

function countryToCurrency(countryCode) {
  if (!countryCode || typeof countryCode !== 'string') return 'USD'
  const cc = countryCode.trim().toUpperCase()
  if (cc === 'XX' || cc === 'T1') return 'USD'
  if (COUNTRY_CURRENCY[cc]) return COUNTRY_CURRENCY[cc]
  if (EUROZONE.has(cc)) return 'EUR'
  return 'USD'
}

function resolveCountry(request) {
  const cfCountry =
    request.cf && typeof request.cf.country === 'string'
      ? request.cf.country.trim()
      : ''
  if (cfCountry) return cfCountry.toUpperCase()

  const header = request.headers.get('CF-IPCountry')
  if (header && header.trim()) return header.trim().toUpperCase()

  return null
}

/** Pages Functions do not inherit public/_headers — apply security headers here. */
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
}

export async function onRequestGet(context) {
  const country = resolveCountry(context.request)
  const currency = countryToCurrency(country)

  return new Response(JSON.stringify({ country, currency }), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
      ...SECURITY_HEADERS,
    },
  })
}
