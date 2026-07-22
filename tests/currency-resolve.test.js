import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { countryToCurrency } from '../src/currency/countryToCurrency.js'
import { STORAGE_KEY } from '../src/currency/currencies.js'
import {
  currencyFromBrowserLocales,
  readStoredCurrency,
  resolveVisitorCurrency,
} from '../src/currency/resolveVisitorCurrency.js'

describe('countryToCurrency', () => {
  it('maps CZ → CZK', () => {
    assert.equal(countryToCurrency('CZ'), 'CZK')
    assert.equal(countryToCurrency('cz'), 'CZK')
  })

  it('maps DE → EUR', () => {
    assert.equal(countryToCurrency('DE'), 'EUR')
  })

  it('maps US → USD', () => {
    assert.equal(countryToCurrency('US'), 'USD')
  })

  it('maps GB → GBP when supported', () => {
    assert.equal(countryToCurrency('GB'), 'GBP')
  })

  it('maps unknown / Cloudflare placeholders → EUR', () => {
    assert.equal(countryToCurrency(null), 'EUR')
    assert.equal(countryToCurrency(undefined), 'EUR')
    assert.equal(countryToCurrency('XX'), 'EUR')
    assert.equal(countryToCurrency('T1'), 'EUR')
    assert.equal(countryToCurrency('BR'), 'EUR')
  })
})

describe('resolveVisitorCurrency', () => {
  it('CZ country → CZK', () => {
    const result = resolveVisitorCurrency({ country: 'CZ', browserLocales: ['en-US'] })
    assert.deepEqual(result, { currency: 'CZK', source: 'country' })
  })

  it('DE country → EUR', () => {
    const result = resolveVisitorCurrency({ country: 'DE', browserLocales: ['cs'] })
    assert.deepEqual(result, { currency: 'EUR', source: 'country' })
  })

  it('US country → USD', () => {
    const result = resolveVisitorCurrency({ country: 'US' })
    assert.deepEqual(result, { currency: 'USD', source: 'country' })
  })

  it('stored user choice overrides country', () => {
    const result = resolveVisitorCurrency({
      storedCurrency: 'USD',
      country: 'CZ',
      browserLocales: ['cs-CZ'],
    })
    assert.deepEqual(result, { currency: 'USD', source: 'manual' })
  })

  it('invalid stored value ignored', () => {
    const result = resolveVisitorCurrency({
      storedCurrency: 'BTC',
      country: 'CZ',
    })
    assert.deepEqual(result, { currency: 'CZK', source: 'country' })
  })

  it('language change does not change currency', () => {
    const base = resolveVisitorCurrency({
      storedCurrency: 'USD',
      country: 'DE',
      browserLocales: ['en-US'],
      siteLocale: 'en',
    })
    const afterCs = resolveVisitorCurrency({
      storedCurrency: 'USD',
      country: 'DE',
      browserLocales: ['en-US'],
      siteLocale: 'cs',
    })
    const afterDe = resolveVisitorCurrency({
      storedCurrency: 'USD',
      country: 'DE',
      browserLocales: ['en-US'],
      siteLocale: 'de',
    })
    assert.equal(base.currency, 'USD')
    assert.equal(afterCs.currency, base.currency)
    assert.equal(afterDe.currency, base.currency)
    assert.equal(afterCs.source, 'manual')
  })

  it('explicit route locale does not affect currency', () => {
    const enRoute = resolveVisitorCurrency({
      country: 'US',
      browserLocales: ['en-US'],
      routeLocale: 'en',
    })
    const csRoute = resolveVisitorCurrency({
      country: 'US',
      browserLocales: ['en-US'],
      routeLocale: 'cs',
    })
    const deRoute = resolveVisitorCurrency({
      country: 'US',
      browserLocales: ['en-US'],
      routeLocale: 'de',
    })
    assert.equal(enRoute.currency, 'USD')
    assert.equal(csRoute.currency, 'USD')
    assert.equal(deRoute.currency, 'USD')
  })

  it('no country + Czech browser locale → CZK', () => {
    assert.deepEqual(
      resolveVisitorCurrency({ browserLocales: ['cs'] }),
      { currency: 'CZK', source: 'locale' },
    )
    assert.deepEqual(
      resolveVisitorCurrency({ browserLocales: ['cs-CZ'] }),
      { currency: 'CZK', source: 'locale' },
    )
  })

  it('no country + German browser locale → EUR', () => {
    assert.deepEqual(
      resolveVisitorCurrency({ browserLocales: ['de'] }),
      { currency: 'EUR', source: 'locale' },
    )
    assert.deepEqual(
      resolveVisitorCurrency({ browserLocales: ['de-DE'] }),
      { currency: 'EUR', source: 'locale' },
    )
  })

  it('no country + unknown browser locale → EUR', () => {
    assert.deepEqual(
      resolveVisitorCurrency({ browserLocales: ['en'] }),
      { currency: 'EUR', source: 'default' },
    )
    assert.deepEqual(resolveVisitorCurrency({}), { currency: 'EUR', source: 'default' })
  })

  it('choosing Czech / German site language must not force currency', () => {
    const withCsUi = resolveVisitorCurrency({
      country: null,
      browserLocales: ['en-GB'],
      siteLocale: 'cs',
    })
    const withDeUi = resolveVisitorCurrency({
      country: null,
      browserLocales: ['en-GB'],
      siteLocale: 'de',
    })
    // Browser en-GB → GBP from region; site locale ignored
    assert.equal(withCsUi.currency, 'GBP')
    assert.equal(withDeUi.currency, 'GBP')
  })
})

describe('currencyFromBrowserLocales', () => {
  it('prefers region subtag over primary language', () => {
    assert.equal(currencyFromBrowserLocales(['de-CH']), 'CHF')
    assert.equal(currencyFromBrowserLocales(['cs-SK']), 'EUR') // Slovakia eurozone
  })
})

describe('readStoredCurrency', () => {
  it('returns valid stored currency', () => {
    const store = new Map([[STORAGE_KEY, 'eur']])
    const storage = {
      getItem: (key) => store.get(key) ?? null,
      removeItem: (key) => {
        store.delete(key)
      },
    }
    assert.equal(readStoredCurrency(storage), 'EUR')
    assert.equal(store.get(STORAGE_KEY), 'eur')
  })

  it('clears invalid stored currency', () => {
    const store = new Map([[STORAGE_KEY, 'YEN']])
    const storage = {
      getItem: (key) => store.get(key) ?? null,
      removeItem: (key) => {
        store.delete(key)
      },
    }
    assert.equal(readStoredCurrency(storage), null)
    assert.equal(store.has(STORAGE_KEY), false)
  })
})
