/**
 * Fail if known public English UI phrases remain hardcoded in JSX/components
 * outside dictionaries, tests, admin, and localized content files.
 */

import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

import { translateMaterialsLabel } from '../src/i18n/materials.js'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcRoot = path.join(root, 'src')

const FORBIDDEN_PHRASES = [
  'Handmade hardwood pieces',
  'Explore Signature Work',
  'Shop Available Pieces',
  'Meet the Maker',
  'Care Instructions',
  'Request something similar',
  'Custom orders available',
  'Shipping calculated on Etsy',
  'Furniture',
  'Custom Pieces',
  'Home Accessories',
  'Decor',
  'Completed Project',
  'Solid Black Walnut Dining Table',
  'Solid Oak Bed',
  'Board Care Tips',
  'Finished Piece',
  'Come Have a Look Inside My Small Workshop',
]

const ALLOWED_PATH_PARTS = [
  `${path.sep}i18n${path.sep}dictionaries${path.sep}en.js`,
  `${path.sep}admin${path.sep}`,
  `${path.sep}data${path.sep}products.ts`,
  `${path.sep}data${path.sep}product-image-inventory`,
  `${path.sep}data${path.sep}past-projects`,
  `${path.sep}data${path.sep}pastProjects.js`,
  `${path.sep}data${path.sep}signaturePieces.js`,
  `${path.sep}data${path.sep}instagramVideos.js`,
]

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist') continue
      files.push(...(await walk(full)))
    } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Only flag phrases used as quoted string literals / JSX text,
 * not unquoted object keys (e.g. categories.Furniture → 'Möbel').
 */
function appearsAsQuotedCopy(source, phrase) {
  const escaped = escapeRegExp(phrase)
  const asLiteral = new RegExp(`(['"\`])${escaped}\\1`)
  if (asLiteral.test(source)) return true
  const asJsxText = new RegExp(`>[\\s]*${escaped}[\\s]*<`)
  return asJsxText.test(source)
}

function isAllowed(filePath) {
  return ALLOWED_PATH_PARTS.some((part) => filePath.includes(part))
}

describe('no hardcoded public English UI strings', () => {
  it('does not embed forbidden phrases outside English dictionaries and localized content', async () => {
    const files = await walk(srcRoot)
    /** @type {{ file: string, phrase: string }[]} */
    const hits = []

    for (const file of files) {
      if (isAllowed(file)) continue
      const source = await readFile(file, 'utf8')
      for (const phrase of FORBIDDEN_PHRASES) {
        if (appearsAsQuotedCopy(source, phrase)) {
          hits.push({ file: path.relative(root, file), phrase })
        }
      }
    }

    assert.deepEqual(
      hits,
      [],
      `Hardcoded English UI phrases found:\n${hits
        .map((h) => `- ${h.phrase} in ${h.file}`)
        .join('\n')}`,
    )
  })
})

describe('material display translation', () => {
  it('translates known materials without changing English source meaning', () => {
    assert.equal(
      translateMaterialsLabel('Black walnut, maple and purpleheart', 'de'),
      'Amerikanischer Schwarznussbaum, Ahorn und Amaranthholz',
    )
    assert.equal(
      translateMaterialsLabel('Black walnut, maple and purpleheart', 'cs'),
      'Americký černý ořech, javor a amarantové dřevo',
    )
    assert.equal(translateMaterialsLabel('Oak', 'de'), 'Eiche')
    assert.equal(translateMaterialsLabel('Epoxy resin', 'cs'), 'Epoxidová pryskyřice')
    assert.equal(translateMaterialsLabel('Black walnut', 'en'), 'Black walnut')
  })
})
