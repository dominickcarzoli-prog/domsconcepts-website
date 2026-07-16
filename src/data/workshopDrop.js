/**
 * Weekly Workshop Drop — edit these fields for each week’s offer.
 * Leave `etsyUrl` empty to use the featured product’s catalog etsyUrl
 * (or the shop fallback from products.ts). Do not invent listing URLs.
 */
export const workshopDrop = {
  /** Must be a published product id from products.ts */
  productId: 'handmade-walnut-steak-board-two-cups',
  /** Optional override. Prefer blank so the catalog URL is used. */
  etsyUrl: '',
  /** Editable coupon code appended to the Etsy CTA when present */
  couponCode: 'WORKSHOP30',
  discountLabel: '30% off',
  giftMessage: 'Complimentary Wood Butter included',
  ctaLabel: "Claim this week's offer on Etsy",
  eyebrow: 'THE WORKSHOP DROP',
  supportingCopy:
    'One handcrafted piece. One exclusive weekly offer. Available until Sunday.',
}

/**
 * Build the Etsy CTA href from config + catalog product URL.
 * @param {string} catalogEtsyUrl
 */
export function getWorkshopDropEtsyHref(catalogEtsyUrl) {
  const base = (workshopDrop.etsyUrl || catalogEtsyUrl || '').trim()
  if (!base) return catalogEtsyUrl

  const code = workshopDrop.couponCode?.trim()
  if (!code) return base

  try {
    const url = new URL(base)
    url.searchParams.set('coupon', code)
    return url.toString()
  } catch {
    const joiner = base.includes('?') ? '&' : '?'
    return `${base}${joiner}coupon=${encodeURIComponent(code)}`
  }
}

function getPragueParts(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Prague',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  })

  return Object.fromEntries(
    formatter.formatToParts(date).flatMap(({ type, value }) =>
      type === 'literal' ? [] : [[type, value]],
    ),
  )
}

/** Convert a Europe/Prague wall-clock time to a UTC Date. */
function pragueWallTimeToUtc(year, month, day, hour, minute, second = 0, ms = 0) {
  // Initial guess: Central Europe is UTC+1 or UTC+2.
  let utcMs = Date.UTC(year, month - 1, day, hour - 2, minute, second, ms)

  for (let i = 0; i < 8; i += 1) {
    const parts = getPragueParts(new Date(utcMs))
    const got = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    )
    const want = Date.UTC(year, month - 1, day, hour, minute, second)
    const delta = want - got
    if (delta === 0) {
      // Align fractional milliseconds without shifting the wall clock second.
      const currentMs = new Date(utcMs).getUTCMilliseconds()
      return new Date(utcMs - currentMs + ms)
    }
    utcMs += delta
  }

  return new Date(utcMs)
}

/**
 * Next Sunday 23:59:59.999 in Europe/Prague, as a UTC Date.
 * If now is Sunday before the deadline, returns this Sunday.
 */
export function getNextSundayDeadlinePrague(now = new Date()) {
  const parts = getPragueParts(now)
  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  const dayOfWeek = weekdayMap[parts.weekday] ?? 0

  let daysUntilSunday = (7 - dayOfWeek) % 7
  if (dayOfWeek === 0) {
    const secondsToday =
      Number(parts.hour) * 3600 + Number(parts.minute) * 60 + Number(parts.second)
    if (secondsToday >= 23 * 3600 + 59 * 60) {
      daysUntilSunday = 7
    }
  }

  // Advance in calendar-day space (UTC date arithmetic on Y-M-D components).
  const targetUtcDay = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day) + daysUntilSunday,
  )
  const target = new Date(targetUtcDay)

  return pragueWallTimeToUtc(
    target.getUTCFullYear(),
    target.getUTCMonth() + 1,
    target.getUTCDate(),
    23,
    59,
    59,
    999,
  )
}
