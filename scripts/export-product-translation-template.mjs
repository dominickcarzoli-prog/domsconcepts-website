#!/usr/bin/env node
/**
 * Export approved catalogue products as a translation worksheet.
 *
 * Usage:
 *   node scripts/export-product-translation-template.mjs
 *   node scripts/export-product-translation-template.mjs --remote
 *   node scripts/export-product-translation-template.mjs --local
 *
 * Output:
 *   data/product-translation-template.json
 */

import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { mapExportRow } from './lib/product-translations.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUTPUT = path.join(ROOT, 'data', 'product-translation-template.json')
const DB_NAME = 'domsconcepts-catalogue'

const args = new Set(process.argv.slice(2))
const useRemote = args.has('--remote') || !args.has('--local')

const SELECT_SQL = `
SELECT
  listing_id,
  title,
  description,
  custom_title,
  custom_description,
  custom_title_de,
  custom_description_de,
  seo_title_de,
  seo_description_de,
  custom_title_cs,
  custom_description_cs,
  seo_title_cs,
  seo_description_cs
FROM etsy_products
WHERE website_approved = 1
ORDER BY listing_id ASC;
`.trim()

function runWranglerQuery(sql) {
  const commandArgs = [
    'wrangler',
    'd1',
    'execute',
    DB_NAME,
    useRemote ? '--remote' : '--local',
    '--json',
    '--command',
    sql,
  ]

  const result = spawnSync('npx', commandArgs, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout || 'wrangler d1 execute failed')
    process.exit(result.status || 1)
  }

  let parsed
  try {
    parsed = JSON.parse(result.stdout)
  } catch {
    console.error('Could not parse wrangler JSON output.')
    console.error(result.stdout)
    process.exit(1)
  }

  // wrangler --json typically returns an array of result objects
  const blocks = Array.isArray(parsed) ? parsed : [parsed]
  for (const block of blocks) {
    if (block?.results) return block.results
    if (Array.isArray(block?.result)) {
      for (const item of block.result) {
        if (item?.results) return item.results
      }
    }
  }
  return []
}

async function main() {
  console.log(
    `Exporting approved products from ${DB_NAME} (${useRemote ? 'remote' : 'local'})…`,
  )
  const rows = runWranglerQuery(SELECT_SQL)
  const products = rows.map((row) => mapExportRow(row))

  await mkdir(path.dirname(OUTPUT), { recursive: true })
  await writeFile(OUTPUT, `${JSON.stringify(products, null, 2)}\n`, 'utf8')

  console.log(`Wrote ${products.length} products → ${path.relative(ROOT, OUTPUT)}`)
  console.log('Fill DE/CS fields manually, save as data/product-translations.json, then import.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
