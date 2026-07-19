# Dom's Concepts website

Vite + React storefront for Dom's Concepts. Deployed on Cloudflare Pages.

## Scripts

- `npm run dev` — local Vite SPA (no Pages Functions)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the static build (still no Functions)
- `npm run lint` — Oxlint

## Multi-currency pricing

Canonical product prices stay in **CZK** in `src/data/products.ts` / `src/siteData.js`. The UI converts for display only. Etsy remains checkout authority.

### Architecture

| Piece | Role |
| --- | --- |
| `src/currency/*` | Currencies, country map, formatters, `CurrencyProvider`, selector |
| `functions/api/visitor-region.js` | `GET /api/visitor-region` — `request.cf.country` / `CF-IPCountry` → `{ country, currency }` |
| `functions/api/exchange-rates.js` | `GET /api/exchange-rates` — Frankfurter ECB rates, CZK base, 12h cache |
| `public/_routes.json` | Routes `/api/*` to Pages Functions |

Supported: CZK, EUR, USD, GBP, CAD, AUD, NZD, CHF, PLN, SEK, NOK, DKK, JPY.

Detection order: `localStorage` key `domsconcepts_currency` → `/api/visitor-region` → `navigator.language` country → USD.

Selector includes **Automatic** (clears stored preference and re-runs detection). Converted prices show an “Approx.” prefix; CZK does not. Product detail notes that final price/currency are confirmed on Etsy.

### Local Vite / preview

Pages Functions do **not** run under `vite` or `vite preview`. In that case:

1. Region API fails → currency from language hint, else USD
2. Rates API fails → **DEV only**: approximate fallback rates relative to CZK (so the selector converts prices). Production builds never use these fallbacks — they keep CZK until rates load.
3. DEV query override: `?country=DE|US|GB|CZ` (ignored in production builds)
4. Manual selector still works and persists to `localStorage`

Full CF country detection needs a Cloudflare Pages deployment (or `wrangler pages dev`).

### Manual test scenarios

1. Clear `localStorage`, open site on Pages — currency matches visitor country map
2. Pick another currency in the header — persists across reload; product prices update
3. Block `/api/exchange-rates` in production — UI falls back to CZK labels
4. In DEV without Functions — selector still converts using fallback rates
5. `?country=DE` in DEV (no localStorage) → EUR; production build ignores the query
6. Product cards, detail price, and board-care add-on prices all update together
7. “From …” products keep the From prefix; “Price on request” unchanged
8. Etsy CTAs still open the correct listing
