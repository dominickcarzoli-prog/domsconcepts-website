/**
 * Static product translation import helpers + sync preservation.
 */

import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { describe, it } from 'node:test'

import {
  TRANSLATION_FIELDS,
  buildTranslationUpdateSql,
  mapExportRow,
  parseTranslationEntry,
  planTranslationUpdates,
} from '../scripts/lib/product-translations.mjs'
import { validateUpdateBody } from '../functions/api/admin/_products.js'

describe('static translation import planning', () => {
  it('parses listing_id and translation fields only', () => {
    const parsed = parseTranslationEntry({
      listing_id: '123456789',
      custom_title_de: 'Deutscher Titel',
      custom_description_de: 'Beschreibung',
      title: 'ignored etsy title',
      price: 99,
    })
    assert.equal(parsed.ok, true)
    assert.equal(parsed.listingId, 123456789)
    assert.equal(parsed.fields.custom_title_de, 'Deutscher Titel')
    assert.equal('title' in parsed.fields, false)
    assert.equal('price' in parsed.fields, false)
  })

  it('preserves existing translations unless overwrite is set', () => {
    const preserve = planTranslationUpdates({
      incoming: {
        custom_title_de: 'New DE',
        custom_description_de: 'New DE body',
        custom_title_cs: 'New CS',
      },
      existing: {
        custom_title_de: 'Existing DE',
        custom_description_de: null,
        custom_title_cs: null,
      },
      overwrite: false,
    })
    assert.deepEqual(preserve.updates, {
      custom_description_de: 'New DE body',
      custom_title_cs: 'New CS',
    })
    assert.ok(preserve.skipped.includes('custom_title_de'))

    const overwrite = planTranslationUpdates({
      incoming: {
        custom_title_de: 'New DE',
      },
      existing: {
        custom_title_de: 'Existing DE',
      },
      overwrite: true,
    })
    assert.deepEqual(overwrite.updates, { custom_title_de: 'New DE' })
  })

  it('builds SQL that only updates translation columns', () => {
    const sql = buildTranslationUpdateSql(42, {
      custom_title_de: "Nuss'brett",
      custom_title_cs: null,
    })
    assert.match(sql, /^UPDATE etsy_products SET /)
    assert.match(sql, /custom_title_de = 'Nuss''brett'/)
    assert.match(sql, /custom_title_cs = NULL/)
    assert.match(sql, /WHERE listing_id = 42;/)
    assert.doesNotMatch(sql, /price_|quantity|primary_image|slug|website_approved|title =/)
  })

  it('maps export rows with english source priority', () => {
    const row = mapExportRow({
      listing_id: 9,
      title: 'Etsy title',
      description: 'Etsy description',
      custom_title: 'Custom title',
      custom_description: null,
      custom_title_de: 'DE',
      custom_description_de: null,
      seo_title_de: null,
      seo_description_de: null,
      custom_title_cs: null,
      custom_description_cs: null,
      seo_title_cs: null,
      seo_description_cs: null,
    })
    assert.equal(row.listing_id, 9)
    assert.equal(row.english_title, 'Custom title')
    assert.equal(row.english_description, 'Etsy description')
    assert.equal(row.custom_title_de, 'DE')
    assert.equal(row.custom_title_cs, null)
  })
})

describe('admin save still accepts translation fields', () => {
  it('explicit save updates only website-managed translation fields', () => {
    const result = validateUpdateBody({
      custom_title_de: 'Deutscher Titel',
      custom_description_de: 'Deutsche Beschreibung',
      seo_title_de: 'SEO DE',
      seo_description_de: 'SEO DE body',
      custom_title_cs: 'Český název',
      custom_description_cs: 'Český popis',
      seo_title_cs: 'SEO CS',
      seo_description_cs: 'SEO CS body',
    })
    assert.equal(result.ok, true)
    for (const field of TRANSLATION_FIELDS) {
      assert.ok(field in result.fields)
    }
    assert.equal('title' in result.fields, false)
    assert.equal('description' in result.fields, false)
    assert.equal('price_amount' in result.fields, false)
  })
})

describe('etsy sync never overwrites translations', () => {
  it('ON CONFLICT UPDATE omits all DE/CS translation columns', async () => {
    const source = await readFile(
      new URL('../functions/api/etsy/_catalogue.js', import.meta.url),
      'utf8',
    )
    const conflict = source.slice(source.indexOf('ON CONFLICT(listing_id) DO UPDATE SET'))
    const updateBlock = conflict.slice(0, conflict.indexOf('`,'))

    for (const field of TRANSLATION_FIELDS) {
      assert.match(source, new RegExp(field))
      assert.doesNotMatch(updateBlock, new RegExp(field))
    }

    assert.doesNotMatch(updateBlock, /custom_title\s*=/)
    assert.doesNotMatch(updateBlock, /custom_description\s*=/)
    assert.doesNotMatch(updateBlock, /slug\s*=/)
    assert.doesNotMatch(updateBlock, /website_approved\s*=/)
  })

  it('documents that translations are website-managed', async () => {
    const source = await readFile(
      new URL('../functions/api/etsy/_catalogue.js', import.meta.url),
      'utf8',
    )
    assert.match(source, /preserves website-managed columns/i)
    assert.match(source, /custom_title_de/)
    assert.match(source, /seo_description_cs/)
  })
})

describe('paid translation API removed', () => {
  it('does not ship translate endpoint or provider env vars in admin code', async () => {
    const adminApi = await readFile(new URL('../src/admin/adminApi.js', import.meta.url), 'utf8')
    const catalogue = await readFile(
      new URL('../src/admin/AdminCataloguePage.jsx', import.meta.url),
      'utf8',
    )
    assert.doesNotMatch(adminApi, /translateProducts|TRANSLATION_API_KEY/)
    assert.doesNotMatch(catalogue, /Generate German|Generate Czech|translateProducts/)
    assert.match(
      catalogue,
      /Translations are stored on the website and are never overwritten by Etsy sync/,
    )
  })
})
