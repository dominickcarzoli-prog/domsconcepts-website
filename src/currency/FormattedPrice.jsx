import { useCurrency } from './useCurrency'

/**
 * Display a product price with currency conversion at render time.
 * Prefer raw `amount` + `sourceCurrency` when available; otherwise parse `price` labels.
 * Shows a subtle skeleton until currency + rates are ready (avoids wrong-currency flash).
 */
export function FormattedPrice({
  price,
  amount = null,
  sourceCurrency = null,
  className = '',
  as: Component = 'span',
}) {
  const { formatProductPrice, pricesReady, currency } = useCurrency()

  if (!pricesReady) {
    return (
      <Component
        className={['inline-block h-[1.05em] min-w-[5.5rem] animate-pulse rounded bg-white/10 align-middle', className].join(' ')}
        aria-hidden="true"
      />
    )
  }

  return (
    <Component
      className={className}
      data-active-currency={currency}
      data-source-currency={sourceCurrency || undefined}
    >
      {formatProductPrice(price, { amount, sourceCurrency })}
    </Component>
  )
}
