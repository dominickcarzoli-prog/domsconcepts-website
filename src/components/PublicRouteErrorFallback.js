import { createElement } from 'react'
import { Link } from 'react-router-dom'

/**
 * Branded fallback shown when a public route throws.
 * No stack traces — safe for visitors.
 */
export function PublicRouteErrorFallback({ t, localize, onRetry, onReload }) {
  return createElement(
    'section',
    {
      className: 'mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8',
      'data-public-route-error': 'true',
    },
    createElement(
      'p',
      { className: 'text-xs uppercase tracking-[0.28em] text-amber-200/80' },
      "Dom's Concepts",
    ),
    createElement(
      'h1',
      { className: 'mt-4 font-display text-3xl text-stone-100 sm:text-4xl' },
      t('errors.somethingWentWrong'),
    ),
    createElement(
      'p',
      { className: 'mt-4 max-w-xl text-sm leading-7 text-stone-300' },
      t('errors.pageLoadFailed'),
    ),
    createElement(
      'div',
      { className: 'mt-8 flex flex-wrap gap-3' },
      createElement(
        Link,
        {
          to: localize('/available-pieces'),
          className: 'btn-gold gold-button px-6 py-3 text-sm text-[#111111]',
        },
        t('common.backToAvailablePieces'),
      ),
      createElement(
        'button',
        {
          type: 'button',
          onClick: onRetry,
          className: 'btn-outline-light px-6 py-3 text-sm',
        },
        t('errors.tryAgain'),
      ),
      createElement(
        'button',
        {
          type: 'button',
          onClick: onReload,
          className: 'btn-outline-light px-6 py-3 text-sm',
        },
        t('errors.reloadPage'),
      ),
    ),
  )
}
