/**
 * Shipping copy is based on visitor country — never selected currency.
 * Free shipping applies only to deliveries within Czechia.
 */

export const SHIPPING_MESSAGE_CZ = 'Free shipping within Czechia'
export const SHIPPING_MESSAGE_INTL_SHORT = 'Shipping calculated on Etsy'
export const SHIPPING_MESSAGE_INTL_DETAIL =
  'International shipping calculated at checkout on Etsy'

/**
 * @param {string | null | undefined} country
 * @returns {boolean}
 */
export function isCzechiaCountry(country) {
  return typeof country === 'string' && country.trim().toUpperCase() === 'CZ'
}

/**
 * Short badge/line for product cards and compact UI.
 * @param {string | null | undefined} country
 */
export function getShippingMessage(country) {
  return isCzechiaCountry(country)
    ? SHIPPING_MESSAGE_CZ
    : SHIPPING_MESSAGE_INTL_SHORT
}

/**
 * Longer line for product detail badges / emphasis.
 * @param {string | null | undefined} country
 */
export function getShippingMessageDetail(country) {
  return isCzechiaCountry(country)
    ? SHIPPING_MESSAGE_CZ
    : SHIPPING_MESSAGE_INTL_DETAIL
}

/**
 * Rewrite product shipping notes that mention free shipping for the visitor's region.
 * Notes without "free shipping" are returned unchanged.
 * @param {string | null | undefined} note
 * @param {string | null | undefined} country
 */
export function localizeShippingNote(note, country) {
  if (!note || typeof note !== 'string') return note
  if (!/free shipping/i.test(note)) return note

  const replacement = isCzechiaCountry(country)
    ? SHIPPING_MESSAGE_CZ
    : SHIPPING_MESSAGE_INTL_DETAIL

  return note.replace(/Free shipping\.?/i, `${replacement}.`)
}
