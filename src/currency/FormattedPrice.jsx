import { useCurrency } from './useCurrency'

/**
 * Display a product price with currency conversion.
 * Shows a subtle skeleton until currency + rates are ready (avoids wrong-currency flash).
 */
export function FormattedPrice({ price, className = '', as: Component = 'span' }) {
  const { formatProductPrice, pricesReady } = useCurrency()

  if (!pricesReady) {
    return (
      <Component
        className={['inline-block h-[1.05em] min-w-[5.5rem] animate-pulse rounded bg-white/10 align-middle', className].join(' ')}
        aria-hidden="true"
      />
    )
  }

  return <Component className={className}>{formatProductPrice(price)}</Component>
}
