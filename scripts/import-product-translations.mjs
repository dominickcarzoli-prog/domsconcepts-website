#!/usr/bin/env node
/**
 * Import static DE/CS product translations into D1.
 * Updates translation fields only. Never touches price, stock, images, slug,
 * approval, visibility, or Etsy fields.
 *
 * Usage:
 *   node scripts/import-product-translations.mjs --dry-run
 *   node scripts/import-product-translations.mjs --dry-run --remote
 *   node scripts/import-product-translations.mjs --remote
 *   node scripts/import-product-translations.mjs --remote --overwrite
 *
 * Input (default):
 *   data/product-translations.json
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import {
  TRANSLATION_FIELDS,
  buildTranslationUpdateSql,
  parseTranslationEntry,
  planTranslationUpdates,
} from './lib/product-translations.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DEFAULT_INPUT = path.join(ROOT, 'data', 'product-translations.json')
const DB_NAME = 'domsconcepts-catalogue'

function parseArgs(argv) {
  const args = {
    dryRun: false,
    overwrite: false,
    remote: true,
    input: DEFAULT_INPUT,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === '--dry-run') args.dryRun = true
    else if (arg === '--overwrite') args.overwrite = true
    else if (arg === '--remote') args.remote = true
    else if (arg === '--local') args.remote = false
    else if (arg === '--input') {
      args.input = path.resolve(argv[i + 1] || '')
      i += 1
    } else if (arg.startsWith('--input=')) {
      args.input = path.resolve(arg.slice('--input='.length))
    }
  }

  return args
}

function runWrangler(commandArgs) {
  const result = spawnSync('npx', ['wrangler', ...commandArgs], {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  if (result.status !== 0) {
    const message = result.stderr || result.stdout || 'wrangler command failed'
    throw new Error(message.trim())
  }
  return result.stdout
}

function runWranglerJson(sql, remote) {
  const stdout = runWrangler([
    'd1',
    'execute',
    DB_NAME,
    remote ? '--remote' : '--local',
    '--json',
    '--command',
    sql,
  ])

  let parsed
  try {
    parsed = JSON.parse(stdout)
  } catch {
    throw new Error(`Could not parse wrangler JSON output:\n${stdout}`)
  }

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

async function loadExistingRows(listingIds, remote) {
  /** @type {Map<number, Record<string, unknown>>} */
  const map = new Map()
  if (!listingIds.length) return map

  // Chunk to keep commands reasonably sized
  const chunkSize = 40
  for (let i = 0; i < listingIds.length; i += chunkSize) {
    const chunk = listingIds.slice(i, i + chunkSize)
    const columns = ['listing_id', ...TRANSLATION_FIELDS].join(', ')
    const sql = `SELECT ${columns} FROM etsy_products WHERE listing_id IN (${chunk.join(',')});`
    const rows = runWranglerJson(sql, remote)
    for (const row of rows) {
      map.set(Number(row.listing_id), row)
    }
  }
  return map
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const raw = await readFile(args.input, 'utf8')
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    console.error(`Invalid JSON in ${args.input}`)
    process.exit(1)
  }

  if (!Array.isArray(parsed)) {
    console.error('Input must be a JSON array of product translation objects.')
    process.exit(1)
  }

  /** @type {ReturnType<typeof parseTranslationEntry>[]} */
  const entries = parsed.map(parseTranslationEntry)
  const valid = entries.filter((entry) => entry.ok)
  const invalid = entries.filter((entry) => !entry.ok)

  const listingIds = [...new Set(valid.map((entry) => entry.listingId))]
  console.log(
    `Importing ${valid.length} translation rows into ${DB_NAME} (${args.remote ? 'remote' : 'local'})${args.dryRun ? ' [dry-run]' : ''}${args.overwrite ? ' [overwrite]' : ' [preserve existing]'}…`,
  )

  const existingMap = await loadExistingRows(listingIds, args.remote)

  let updated = 0
  let skipped = 0
  let missing = 0
  let failed = 0
  /** @type {string[]} */
  const updateStatements = []

  for (const entry of valid) {
    const existing = existingMap.get(entry.listingId)
    if (!existing) {
      missing += 1
      console.warn(`skip missing listing_id=${entry.listingId}`)
      continue
    }

    const plan = planTranslationUpdates({
      incoming: entry.fields,
      existing: /** @type {Record<string, string | null | undefined>} */ (existing),
      overwrite: args.overwrite,
    })

    if (!Object.keys(plan.updates).length) {
      skipped += 1
      continue
    }

    const sql = buildTranslationUpdateSql(entry.listingId, plan.updates)
    if (!sql) {
      skipped += 1
      continue
    }

    updateStatements.push(sql)
    updated += 1
  }

  failed += invalid.length
  for (const entry of invalid) {
    console.warn(`skip invalid entry: ${entry.error}`)
  }

  if (args.dryRun) {
    console.log('Dry run — no changes written.')
  } else if (updateStatements.length) {
    const tmpDir = path.join(ROOT, 'data')
    await mkdir(tmpDir, { recursive: true })
    const sqlPath = path.join(tmpDir, '.import-product-translations.tmp.sql')
    await writeFile(sqlPath, `${updateStatements.join('\n')}\n`, 'utf8')
    try {
      runWrangler([
        'd1',
        'execute',
        DB_NAME,
        args.remote ? '--remote' : '--local',
        '--file',
        sqlPath,
      ])
    } finally {
      // best-effort cleanup
      try {
        const { unlink } = await import('node:fs/promises')
        await unlink(sqlPath)
      } catch {
        // ignore
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: failed === 0,
        dryRun: args.dryRun,
        overwrite: args.overwrite,
        requested: parsed.length,
        updated,
        skipped,
        missing,
        failed,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
