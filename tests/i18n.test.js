/**
 * Phase 1 EN/DE/CS i18n tests — locale paths, dictionaries, public product mapping.
 */

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { readFile } from 'node:fs/promises'

import { mapPublicProductRow } from '../functions/api/_public_products.js'
import { validateUpdateBody } from '../functions/api/admin/_products.js'
import {
  detectBrowserLocale,
  localizePath,
  parseLocaleFromPathname,
  readStoredLocale,
  resolveActiveLocale,
  switchLocalePath,
  writeStoredLocale,
} from '../src/i18n/localePaths.js'
import { translate, translateCategoryLabel } from '../src/i18n/translate.js'

describe('locale paths', () => {
  it('keeps English routes without a required prefix', () => {
    assert.deepEqual(parseLocaleFromPathname('/available-pieces'), {
      locale: 'en',
      pathnameWithoutLocale: '/available-pieces',
      hasLocalePrefix: false,
    })
    assert.equal(localizePath('/available-pieces', 'en'), '/available-pieces')
    assert.equal(localizePath('/', 'en'), '/')
  })

  it('parses German and Czech prefixes', () => {
    assert.deepEqual(parseLocaleFromPathname('/de/available-pieces'), {
      locale: 'de',
      pathnameWithoutLocale: '/available-pieces',
      hasLocalePrefix: true,
    })
    assert.deepEqual(parseLocaleFromPathname('/cs/available-pieces'), {
      locale: 'cs',
      pathnameWithoutLocale: '/available-pieces',
      hasLocalePrefix: true,
    })
    assert.deepEqual(parseLocaleFromPathname('/cs'), {
      locale: 'cs',
      pathnameWithoutLocale: '/',
      hasLocalePrefix: true,
    })
  })

  it('localizes homepage and catalogue paths for DE and CS', () => {
    assert.equal(localizePath('/', 'de'), '/de')
    assert.equal(localizePath('/', 'cs'), '/cs')
    assert.equal(localizePath('/available-pieces', 'de'), '/de/available-pieces')
    assert.equal(localizePath('/available-pieces', 'cs'), '/cs/available-pieces')
  })

  it('switches locale while preserving the current page and product slug', () => {
    assert.equal(
      switchLocalePath('/available-pieces/oak-end-grain-cutting-board', 'de'),
      '/de/available-pieces/oak-end-grain-cutting-board',
    )
    assert.equal(
      switchLocalePath('/de/available-pieces/oak-end-grain-cutting-board', 'cs'),
      '/cs/available-pieces/oak-end-grain-cutting-board',
    )
    assert.equal(
      switchLocalePath('/cs/available-pieces/oak-end-grain-cutting-board', 'en'),
      '/available-pieces/oak-end-grain-cutting-board',
    )
    assert.equal(
      switchLocalePath('/en/gallery?x=1#top', 'cs'),
      '/cs/gallery?x=1#top',
    )
  })

  it('supports direct refresh paths for /de and /cs routes', () => {
    assert.equal(parseLocaleFromPathname('/de/gallery').locale, 'de')
    assert.equal(parseLocaleFromPathname('/cs/about').locale, 'cs')
    assert.equal(parseLocaleFromPathname('/de/available-pieces/oak-board').pathnameWithoutLocale, '/available-pieces/oak-board')
    assert.equal(parseLocaleFromPathname('/cs/available-pieces/oak-board').pathnameWithoutLocale, '/available-pieces/oak-board')
  })

  it('detects German and Czech browser languages', () => {
    assert.equal(detectBrowserLocale(['de-DE', 'en-US']), 'de')
    assert.equal(detectBrowserLocale(['cs-CZ', 'en']), 'cs')
    assert.equal(detectBrowserLocale(['sk-SK']), 'cs')
    assert.equal(detectBrowserLocale(['fr-FR', 'en-US']), 'en')
    assert.equal(detectBrowserLocale([]), 'en')
  })

  it('stores and reads language preference; unsupported falls back to English', () => {
    const store = new Map()
    const storage = {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, value),
    }
    writeStoredLocale(storage, 'cs')
    assert.equal(readStoredLocale(storage), 'cs')
    store.set('domsconcepts-locale', 'fr')
    assert.equal(readStoredLocale(storage), null)
    assert.equal(detectBrowserLocale(['ja-JP']), 'en')
  })

  it('resolves locale with explicit route > stored > browser > English', () => {
    assert.equal(
      resolveActiveLocale({
        routeLocale: 'de',
        hasLocalePrefix: true,
        storedLocale: 'en',
        browserLanguages: ['cs-CZ'],
      }),
      'de',
    )
    assert.equal(
      resolveActiveLocale({
        routeLocale: 'cs',
        hasLocalePrefix: true,
        storedLocale: 'de',
        browserLanguages: ['en-US'],
      }),
      'cs',
    )
    assert.equal(
      resolveActiveLocale({
        routeLocale: 'en',
        hasLocalePrefix: false,
        storedLocale: 'de',
        browserLanguages: ['cs-CZ'],
      }),
      'de',
    )
    assert.equal(
      resolveActiveLocale({
        routeLocale: 'en',
        hasLocalePrefix: false,
        storedLocale: null,
        browserLanguages: ['cs-CZ', 'en'],
      }),
      'cs',
    )
    assert.equal(
      resolveActiveLocale({
        routeLocale: 'en',
        hasLocalePrefix: false,
        storedLocale: null,
        browserLanguages: ['fr-FR'],
      }),
      'en',
    )
  })

  it('never lets stored or browser locale override an explicit /de or /cs route', () => {
    assert.equal(
      resolveActiveLocale({
        routeLocale: parseLocaleFromPathname('/de').locale,
        hasLocalePrefix: parseLocaleFromPathname('/de').hasLocalePrefix,
        storedLocale: 'en',
        browserLanguages: ['en-US'],
      }),
      'de',
    )
    assert.equal(
      resolveActiveLocale({
        routeLocale: parseLocaleFromPathname('/cs/about').locale,
        hasLocalePrefix: parseLocaleFromPathname('/cs/about').hasLocalePrefix,
        storedLocale: 'de',
        browserLanguages: ['de-DE'],
      }),
      'cs',
    )
    assert.equal(
      resolveActiveLocale({
        routeLocale: parseLocaleFromPathname('/de/gallery').locale,
        hasLocalePrefix: true,
        storedLocale: 'cs',
        browserLanguages: ['cs'],
      }),
      'de',
    )
  })
})

describe('dictionaries', () => {
  it('translates key UI strings without mixing locales', () => {
    assert.equal(translate('product.availablePieces', 'en'), 'Available Pieces')
    assert.equal(translate('product.availablePieces', 'de'), 'Verfügbare Einzelstücke')
    assert.equal(translate('product.availablePieces', 'cs'), 'Dostupné originály')
    assert.equal(translate('actions.buyOnEtsy', 'de'), 'Auf Etsy kaufen')
    assert.equal(translate('actions.buyOnEtsy', 'cs'), 'Koupit na Etsy')
    assert.equal(translate('actions.requestSimilar', 'cs'), 'Poptat podobný výrobek')
    assert.equal(translate('availability.onlyOneLeft', 'de'), 'Nur noch ein Stück verfügbar')
    assert.equal(translate('availability.onlyOneLeft', 'cs'), 'Zbývá pouze jeden kus')
    assert.equal(translate('availability.sold', 'cs'), 'Prodáno')
    assert.equal(translate('availability.available', 'cs'), 'Dostupné')
    assert.equal(translate('product.careInstructions', 'cs'), 'Pokyny k údržbě')
    assert.equal(translate('product.materials', 'cs'), 'Materiály')
    assert.equal(translate('product.photos', 'cs'), 'Fotografie')
    assert.equal(translate('product.handSelectedHardwoods', 'cs'), 'Pečlivě vybraná tvrdá dřeva')
    assert.equal(translate('product.finish', 'en'), 'Finish')
    assert.equal(translate('product.finish', 'de'), 'Oberfläche')
    assert.equal(translate('product.finish', 'cs'), 'Povrchová úprava')
    assert.equal(translate('product.construction', 'en'), 'Construction')
    assert.equal(translate('product.construction', 'de'), 'Konstruktion')
    assert.equal(translate('product.construction', 'cs'), 'Konstrukce')
    assert.equal(translate('product.includedHardware', 'en'), 'Included hardware')
    assert.equal(translate('product.woodSpecies', 'en'), 'Wood species')
    assert.equal(translate('product.woodSpecies', 'de'), 'Holzart')
    assert.equal(translate('product.woodSpecies', 'cs'), 'Dřevina')
    assert.equal(translate('product.dimensions', 'de'), 'Maße')
    assert.equal(translate('product.dimensions', 'cs'), 'Rozměry')
    assert.equal(translate('product.previousPhoto', 'en'), 'Previous product photo')
    assert.equal(translate('product.nextPhoto', 'de'), 'Nächstes Produktfoto')
    assert.equal(translate('shipping.calculatedShort', 'cs'), 'Doprava bude vypočítána na Etsy')
    assert.equal(translate('nav.customOrders', 'cs'), 'Zakázková výroba')
    assert.equal(translate('nav.about', 'cs'), 'O značce')
    assert.equal(translate('nav.gallery', 'cs'), 'Galerie')
    assert.equal(translate('nav.contact', 'cs'), 'Kontakt')
  })

  it('translates category labels without changing stored English values', () => {
    const tCs = (key) => translate(key, 'cs')
    const tDe = (key) => translate(key, 'de')
    assert.equal(translateCategoryLabel('Cutting Boards', tCs), 'Krájecí prkénka')
    assert.equal(translateCategoryLabel('End Grain Boards', tCs), 'Čelní krájecí prkénka')
    assert.equal(translateCategoryLabel('Serving Boards', tCs), 'Servírovací prkénka')
    assert.equal(translateCategoryLabel('Epoxy Pieces', tCs), 'Výrobky z epoxidu')
    assert.equal(translateCategoryLabel('Furniture', tCs), 'Nábytek')
    assert.equal(translateCategoryLabel('Wood Care', tCs), 'Péče o dřevo')
    assert.equal(translateCategoryLabel('Accessories', tCs), 'Doplňky')
    assert.equal(translateCategoryLabel('Other', tCs), 'Ostatní')
    assert.equal(translateCategoryLabel('Cutting Boards', tDe), 'Schneidebretter')
    assert.equal(translateCategoryLabel('End Grain Boards', tDe), 'Stirnholzbretter')
  })
})

describe('public product locale mapping', () => {
  const row = {
    listing_id: 1,
    slug: 'oak-end-grain-cutting-board',
    title: 'Etsy Oak Title',
    custom_title: 'English Custom Title',
    description: 'Etsy description',
    custom_description: 'English custom description',
    custom_title_de: 'Deutsche Eichen-Hirnholzbrett',
    custom_description_de: 'Deutsche Beschreibung',
    seo_title_de: 'SEO DE',
    seo_description_de: 'SEO desc DE',
    custom_title_cs: 'České dubové prkénko',
    custom_description_cs: 'Český popis',
    seo_title_cs: 'SEO CS',
    seo_description_cs: 'SEO desc CS',
    etsy_state: 'active',
    website_status: 'available',
    quantity: 2,
    price_amount: 250000,
    price_divisor: 100,
    price_currency: 'CZK',
    website_category: 'Cutting Boards',
    website_featured: 0,
    website_use_local_images: 0,
    primary_image_url: 'https://i.etsystatic.com/example.jpg',
    image_urls_json: '["https://i.etsystatic.com/example.jpg"]',
    local_images_json: null,
    etsy_url: 'https://www.etsy.com/listing/1',
  }

  it('keeps English mapping unchanged by default', () => {
    const mapped = mapPublicProductRow(row)
    assert.equal(mapped.title, 'English Custom Title')
    assert.equal(mapped.description, 'English custom description')
    assert.equal(mapped.locale, 'en')
    assert.equal(mapped.slug, 'oak-end-grain-cutting-board')
  })

  it('prefers German custom fields when locale=de', () => {
    const mapped = mapPublicProductRow(row, { locale: 'de' })
    assert.equal(mapped.title, 'Deutsche Eichen-Hirnholzbrett')
    assert.equal(mapped.description, 'Deutsche Beschreibung')
    assert.equal(mapped.seoTitle, 'SEO DE')
    assert.equal(mapped.hasGermanTranslation, true)
  })

  it('prefers Czech custom fields when locale=cs', () => {
    const mapped = mapPublicProductRow(row, { locale: 'cs' })
    assert.equal(mapped.title, 'České dubové prkénko')
    assert.equal(mapped.description, 'Český popis')
    assert.equal(mapped.seoTitle, 'SEO CS')
    assert.equal(mapped.seoDescription, 'SEO desc CS')
    assert.equal(mapped.hasCzechTranslation, true)
    assert.equal(mapped.slug, 'oak-end-grain-cutting-board')
  })

  it('falls back to English when German fields are missing', () => {
    const mapped = mapPublicProductRow(
      { ...row, custom_title_de: null, custom_description_de: null, seo_title_de: null },
      { locale: 'de' },
    )
    assert.equal(mapped.title, 'English Custom Title')
    assert.equal(mapped.description, 'English custom description')
    assert.equal(mapped.hasGermanTranslation, false)
  })

  it('falls back to English when Czech fields are missing', () => {
    const mapped = mapPublicProductRow(
      {
        ...row,
        custom_title_cs: null,
        custom_description_cs: null,
        seo_title_cs: null,
        seo_description_cs: null,
      },
      { locale: 'cs' },
    )
    assert.equal(mapped.title, 'English Custom Title')
    assert.equal(mapped.description, 'English custom description')
    assert.equal(mapped.hasCzechTranslation, false)
  })

  it('preserves identical image fields across en/de/cs', () => {
    const en = mapPublicProductRow(row, { locale: 'en' })
    const de = mapPublicProductRow(row, { locale: 'de' })
    const cs = mapPublicProductRow(row, { locale: 'cs' })
    assert.deepEqual(de.imageUrls, en.imageUrls)
    assert.deepEqual(cs.imageUrls, en.imageUrls)
    assert.equal(de.primaryImageUrl, en.primaryImageUrl)
    assert.equal(cs.primaryImageUrl, en.primaryImageUrl)
  })
})

describe('admin translation fields', () => {
  it('accepts German website-managed fields', () => {
    const result = validateUpdateBody({
      custom_title_de: 'Deutscher Titel',
      custom_description_de: 'Deutsche Beschreibung',
      seo_title_de: 'SEO',
      seo_description_de: 'SEO text',
    })
    assert.equal(result.ok, true)
    assert.equal(result.fields.custom_title_de, 'Deutscher Titel')
    assert.equal(result.fields.custom_description_de, 'Deutsche Beschreibung')
  })

  it('accepts Czech website-managed fields', () => {
    const result = validateUpdateBody({
      custom_title_cs: 'Český název',
      custom_description_cs: 'Český popis',
      seo_title_cs: 'SEO CS',
      seo_description_cs: 'SEO text CS',
    })
    assert.equal(result.ok, true)
    assert.equal(result.fields.custom_title_cs, 'Český název')
    assert.equal(result.fields.custom_description_cs, 'Český popis')
    assert.equal(result.fields.seo_title_cs, 'SEO CS')
    assert.equal(result.fields.seo_description_cs, 'SEO text CS')
  })

  it('rejects Etsy title updates still', () => {
    const result = validateUpdateBody({ title: 'Hacked' })
    assert.equal(result.ok, false)
  })
})

describe('etsy sync translation field preservation', () => {
  it('does not overwrite German or Czech columns in ON CONFLICT UPDATE', async () => {
    const source = await readFile(
      new URL('../functions/api/etsy/_catalogue.js', import.meta.url),
      'utf8',
    )
    assert.match(source, /custom_title_de/)
    assert.match(source, /custom_title_cs/)
    const conflict = source.slice(source.indexOf('ON CONFLICT(listing_id) DO UPDATE SET'))
    const updateBlock = conflict.slice(0, conflict.indexOf('`,'))
    for (const field of [
      'custom_title_de',
      'custom_description_de',
      'seo_title_de',
      'seo_description_de',
      'custom_title_cs',
      'custom_description_cs',
      'seo_title_cs',
      'seo_description_cs',
    ]) {
      assert.doesNotMatch(updateBlock, new RegExp(field))
    }
  })
})

describe('SEO locale assets', () => {
  it('includes German and Czech sitemap URLs with hreflang en/de/cs/x-default', async () => {
    const sitemap = await readFile(new URL('../public/sitemap.xml', import.meta.url), 'utf8')
    assert.match(sitemap, /hreflang="en"/)
    assert.match(sitemap, /hreflang="de"/)
    assert.match(sitemap, /hreflang="cs"/)
    assert.match(sitemap, /hreflang="x-default"/)
    assert.match(sitemap, /https:\/\/domsconcepts\.com\/cs\/available-pieces/)
    assert.match(sitemap, /https:\/\/domsconcepts\.com\/de\/available-pieces/)
  })

  it('SPA fallback supports direct refresh on locale prefixes', async () => {
    const redirects = await readFile(new URL('../public/_redirects', import.meta.url), 'utf8')
    assert.match(redirects, /\/\* \/index\.html 200/)
  })
})

describe('language selector labels', () => {
  it('uses CZ display label for Czech', async () => {
    const { LOCALE_SELECTOR_LABELS, LOCALES } = await import('../src/i18n/localePaths.js')
    assert.deepEqual([...LOCALES], ['en', 'de', 'cs'])
    assert.equal(LOCALE_SELECTOR_LABELS.cs, 'CZ')
    assert.equal(LOCALE_SELECTOR_LABELS.de, 'DE')
    assert.equal(LOCALE_SELECTOR_LABELS.en, 'EN')
  })
})
