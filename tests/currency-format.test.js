import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  convertPrice,
  formatProductPrice,
  parseCzkPrice,
  parsePrice,
} from '../src/currency/formatPrice.js'

/** Realistic units-of-currency per 1 CZK (aligned with CurrencyProvider DEV fallback). */
const RATES = {
  CZK: 1,
  EUR: 0.0408,
  USD: 0.0431,
  GBP: 0.0339,
}

describe('parsePrice', () => {
  it('parses CZK labels', () => {
    assert.deepEqual(parsePrice('CZK 2,911.20'), {
      amount: 2911.2,
      currency: 'CZK',
      hasFrom: false,
    })
    assert.deepEqual(parsePrice('From CZK 2,911.20'), {
      amount: 2911.2,
      currency: 'CZK',
      hasFrom: true,
    })
  })

  it('parses EUR / USD Etsy-style labels', () => {
    assert.deepEqual(parsePrice('EUR 115'), {
      amount: 115,
      currency: 'EUR',
      hasFrom: false,
    })
    assert.deepEqual(parsePrice('EUR 115.00'), {
      amount: 115,
      currency: 'EUR',
      hasFrom: false,
    })
    assert.deepEqual(parsePrice('USD 120'), {
      amount: 120,
      currency: 'USD',
      hasFrom: false,
    })
  })

  it('treats bare numbers as CZK', () => {
    assert.deepEqual(parsePrice(2911.2), {
      amount: 2911.2,
      currency: 'CZK',
      hasFrom: false,
    })
  })

  it('accepts explicit amount objects', () => {
    assert.deepEqual(parsePrice({ amount: 115, currency: 'EUR' }), {
      amount: 115,
      currency: 'EUR',
      hasFrom: false,
    })
  })
})

describe('parseCzkPrice', () => {
  it('still accepts CZK and rejects EUR', () => {
    assert.equal(parseCzkPrice('CZK 100').amount, 100)
    assert.equal(parseCzkPrice('EUR 115'), null)
  })
})

describe('convertPrice', () => {
  it('identity and CZK pivot', () => {
    assert.equal(convertPrice(100, 'EUR', 'EUR', RATES), 100)
    assert.ok(Math.abs(convertPrice(100, 'CZK', 'EUR', RATES) - 4.08) < 1e-9)
    assert.ok(Math.abs(convertPrice(115, 'EUR', 'CZK', RATES) - 115 / 0.0408) < 1e-6)
  })

  it('converts EUR → USD without double conversion', () => {
    const usd = convertPrice(115, 'EUR', 'USD', RATES)
    const expected = (115 / RATES.EUR) * RATES.USD
    assert.ok(Math.abs(usd - expected) < 1e-9)
  })

  it('returns null when rates missing', () => {
    assert.equal(convertPrice(115, 'EUR', 'USD', null), null)
    assert.equal(convertPrice(115, 'EUR', 'USD', {}), null)
  })
})

describe('formatProductPrice reactivity', () => {
  it('updates EUR source amount when display currency changes', () => {
    const eur = formatProductPrice('EUR 115', {
      currency: 'EUR',
      rates: RATES,
      locale: 'en-US',
      amount: 115,
      sourceCurrency: 'EUR',
    })
    const czk = formatProductPrice('EUR 115', {
      currency: 'CZK',
      rates: RATES,
      locale: 'en-US',
      amount: 115,
      sourceCurrency: 'EUR',
    })
    const usd = formatProductPrice('EUR 115', {
      currency: 'USD',
      rates: RATES,
      locale: 'en-US',
      amount: 115,
      sourceCurrency: 'EUR',
    })

    assert.match(eur, /€|EUR/)
    assert.doesNotMatch(eur, /Approx/i)
    assert.match(czk, /CZK|Kč/)
    assert.match(czk, /Approx|Přibližně|Ca\./i)
    assert.match(usd, /\$|USD/)
    assert.match(usd, /Approx/i)
    assert.notEqual(eur, czk)
    assert.notEqual(eur, usd)
    assert.notEqual(czk, usd)
  })

  it('updates CZK hardcoded labels across CZK / EUR / USD', () => {
    const input = 'CZK 2,911.20'
    const czk = formatProductPrice(input, { currency: 'CZK', rates: RATES, locale: 'en-US' })
    const eur = formatProductPrice(input, { currency: 'EUR', rates: RATES, locale: 'en-US' })
    const usd = formatProductPrice(input, { currency: 'USD', rates: RATES, locale: 'en-US' })
    assert.match(czk, /2,911\.20/)
    assert.notEqual(czk, eur)
    assert.notEqual(eur, usd)
    assert.match(eur, /Approx/i)
  })

  it('parses EUR label when amount override omitted (API string path)', () => {
    const usd = formatProductPrice('EUR 115', {
      currency: 'USD',
      rates: RATES,
      locale: 'en-US',
    })
    assert.match(usd, /\$|USD/)
    assert.match(usd, /Approx/i)
  })

  it('does not change currency choice based on locale punctuation', () => {
    const en = formatProductPrice('EUR 115', {
      currency: 'CZK',
      rates: RATES,
      locale: 'en-US',
      amount: 115,
      sourceCurrency: 'EUR',
    })
    const cs = formatProductPrice('EUR 115', {
      currency: 'CZK',
      rates: RATES,
      locale: 'cs-CZ',
      amount: 115,
      sourceCurrency: 'EUR',
    })
    assert.match(en, /CZK|Kč/)
    assert.match(cs, /CZK|Kč/)
  })

  it('falls back to source currency when rates unavailable', () => {
    const label = formatProductPrice('EUR 115', {
      currency: 'USD',
      rates: null,
      locale: 'en-US',
      amount: 115,
      sourceCurrency: 'EUR',
    })
    assert.match(label, /€|EUR/)
    assert.doesNotMatch(label, /Approx/i)
  })
})
