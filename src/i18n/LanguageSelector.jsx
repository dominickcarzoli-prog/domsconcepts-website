import { LOCALES, LOCALE_SELECTOR_LABELS } from './localePaths.js'
import { useLocale } from './LocaleProvider.jsx'

/**
 * Restrained EN | DE | CZ selector — separate from currency.
 * @param {{ variant?: 'desktop' | 'mobile' }} props
 */
export function LanguageSelector({ variant = 'desktop' }) {
  const { locale, setLocale, t } = useLocale()

  if (variant === 'mobile') {
    return (
      <div className="mt-2 border-t border-white/10 pt-4">
        <p className="px-1 text-[10px] uppercase tracking-[0.24em] text-stone-500">
          {t('brand.language')}
        </p>
        <div className="mt-3 flex gap-2">
          {LOCALES.map((code) => (
            <LocaleButton
              key={code}
              code={code}
              active={locale === code}
              onSelect={() => setLocale(code)}
              mobile
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/25 px-2 py-1.5"
      role="group"
      aria-label={t('brand.language')}
    >
      {LOCALES.map((code, index) => (
        <span key={code} className="inline-flex items-center gap-1">
          {index > 0 ? (
            <span className="text-[10px] text-stone-600" aria-hidden="true">
              |
            </span>
          ) : null}
          <LocaleButton
            code={code}
            active={locale === code}
            onSelect={() => setLocale(code)}
          />
        </span>
      ))}
    </div>
  )
}

function LocaleButton({ code, active, onSelect, mobile = false }) {
  const label = LOCALE_SELECTOR_LABELS[code] || code.toUpperCase()
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={[
        mobile
          ? 'flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium tracking-[0.14em] uppercase transition'
          : 'px-1.5 text-[11px] font-medium tracking-[0.18em] uppercase transition',
        active
          ? mobile
            ? 'border-amber-200/40 bg-amber-950/40 text-amber-100'
            : 'text-amber-200'
          : mobile
            ? 'border-white/10 bg-white/5 text-stone-300 hover:border-white/20 hover:text-stone-100'
            : 'text-stone-500 hover:text-stone-200',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
