import { useEffect, useId, useRef, useState } from 'react'
import { useCurrency } from './useCurrency'
import { getCurrencyMeta } from './currencies'

/**
 * Compact currency picker — desktop header button + mobile menu list.
 * Optional Automatic clears localStorage and re-runs detection.
 * @param {{ variant?: 'desktop' | 'mobile' }} props
 */
export function CurrencySelector({ variant = 'desktop' }) {
  const { currency, setCurrency, useAutomaticCurrency, currencies, source } =
    useCurrency()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const listId = useId()
  const meta = getCurrencyMeta(currency)
  const isAutomatic = source !== 'manual' && source !== 'pending'

  useEffect(() => {
    if (!open) return undefined

    function onPointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  async function chooseAutomatic() {
    await useAutomaticCurrency()
    setOpen(false)
  }

  if (variant === 'mobile') {
    return (
      <div className="mt-2 border-t border-white/10 pt-4">
        <p className="px-1 text-[10px] uppercase tracking-[0.24em] text-stone-500">
          Currency
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={chooseAutomatic}
            className={[
              'rounded-xl border px-3 py-2.5 text-left text-sm transition',
              isAutomatic
                ? 'border-amber-200/40 bg-amber-950/40 text-amber-100'
                : 'border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:text-stone-100',
            ].join(' ')}
          >
            <span className="font-medium tracking-wide">Automatic</span>
          </button>
          {currencies.map((item) => {
            const active = source === 'manual' && item.code === currency
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setCurrency(item.code)}
                className={[
                  'rounded-xl border px-3 py-2.5 text-left text-sm transition',
                  active
                    ? 'border-amber-200/40 bg-amber-950/40 text-amber-100'
                    : 'border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:text-stone-100',
                ].join(' ')}
              >
                <span className="font-medium tracking-wide">
                  {item.code} {item.symbol}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Select currency"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium tracking-wide text-stone-300 transition hover:border-amber-200/35 hover:text-amber-100"
      >
        <span>
          {meta.code} {meta.symbol}
        </span>
        <span aria-hidden="true" className="text-[10px] text-stone-500">
          ▾
        </span>
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label="Select currency"
          className="absolute right-0 top-full z-[60] mt-2 max-h-72 w-44 overflow-y-auto rounded-xl border border-white/12 bg-[#14110e]/98 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-md"
        >
          <li role="option" aria-selected={isAutomatic}>
            <button
              type="button"
              onClick={chooseAutomatic}
              className={[
                'flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition',
                isAutomatic
                  ? 'bg-amber-950/50 text-amber-100'
                  : 'text-stone-300 hover:bg-white/5 hover:text-stone-100',
              ].join(' ')}
            >
              <span>Automatic</span>
              <span className="text-stone-500">Auto</span>
            </button>
          </li>
          {currencies.map((item) => {
            const active = source === 'manual' && item.code === currency
            return (
              <li key={item.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    setCurrency(item.code)
                    setOpen(false)
                  }}
                  className={[
                    'flex w-full items-center justify-between gap-3 px-3.5 py-2 text-left text-sm transition',
                    active
                      ? 'bg-amber-950/50 text-amber-100'
                      : 'text-stone-300 hover:bg-white/5 hover:text-stone-100',
                  ].join(' ')}
                >
                  <span>{item.code}</span>
                  <span className="text-stone-500">{item.symbol}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

/** Understated checkout disclaimer for product detail / CTAs. */
export function EtsyPriceNote({ className = '' }) {
  return (
    <p className={['text-xs leading-6 text-stone-500', className].join(' ')}>
      Final price and currency are confirmed on Etsy.
    </p>
  )
}
