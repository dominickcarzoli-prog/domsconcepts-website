#!/usr/bin/env node
/**
 * Scans public/images/products/ for numbered gallery files (01.jpg …),
 * including nested category folders (oak/, walnut/, epoxy/, wood-care/, specialties/).
 * Writes src/data/product-image-inventory.json keyed by relative folder path
 * (e.g. "oak/solid-oak-cutting-board") with real image paths.
 *
 * Real image heuristic:
 * - File exists and matches /^\d{2}\.(jpe?g|png|webp)$/i
 * - Not the brown placeholder frame (~54838 bytes, 1600×1000)
 * - Path/name does not include placeholder / coming-soon tokens
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PRODUCTS_DIR = path.join(ROOT, 'public/images/products')
const OUTPUT = path.join(ROOT, 'src/data/product-image-inventory.json')
const FOLDERS_MAP = path.join(ROOT, 'src/data/products.ts')

const PLACEHOLDER_BYTE_SIZE = 54838
const PLACEHOLDER_PATH_RE = /placeholder|coming-soon|photo-coming/i
const NUMBERED_IMAGE_RE = /^\d{2}\.(jpe?g|png|webp)$/i
const CATEGORY_DIRS = new Set(['oak', 'walnut', 'epoxy', 'wood-care', 'specialties'])

function isRealImageFile(filePath) {
  const base = path.basename(filePath)
  if (!NUMBERED_IMAGE_RE.test(base)) return false
  if (PLACEHOLDER_PATH_RE.test(filePath)) return false

  const stat = fs.statSync(filePath)
  if (stat.size === PLACEHOLDER_BYTE_SIZE) return false

  return true
}

function numericFilenameValue(fileName) {
  const match = path.basename(fileName).match(/(\d+)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

function scanProductFolder(relativeFolder) {
  const folder = path.join(PRODUCTS_DIR, relativeFolder)
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    return []
  }

  return fs
    .readdirSync(folder)
    .filter((file) => NUMBERED_IMAGE_RE.test(file))
    .filter((file) => isRealImageFile(path.join(folder, file)))
    .sort((a, b) => numericFilenameValue(a) - numericFilenameValue(b))
    .map((file) => `/images/products/${relativeFolder.replace(/\\/g, '/')}/${file}`)
}

/** Parse productImageFolders map from products.ts (id → nested folder). */
function loadPreferredFolders() {
  if (!fs.existsSync(FOLDERS_MAP)) return {}
  const source = fs.readFileSync(FOLDERS_MAP, 'utf8')
  const block = source.match(
    /export const productImageFolders: Record<string, string> = \{([\s\S]*?)\n\}/,
  )
  if (!block) return {}

  const map = {}
  const re = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]+)['"]/g
  let match
  while ((match = re.exec(block[1])) !== null) {
    map[match[1]] = match[2]
  }
  return map
}

function collectScanTargets(preferredFolders) {
  const targets = new Set()

  for (const folder of Object.values(preferredFolders)) {
    targets.add(folder)
  }

  if (!fs.existsSync(PRODUCTS_DIR)) return [...targets]

  const topEntries = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })
  for (const entry of topEntries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue

    if (CATEGORY_DIRS.has(entry.name)) {
      const categoryPath = path.join(PRODUCTS_DIR, entry.name)
      for (const child of fs.readdirSync(categoryPath, { withFileTypes: true })) {
        if (!child.isDirectory()) continue
        if (child.name.startsWith('.') || child.name.startsWith('_')) continue
        targets.add(`${entry.name}/${child.name}`)
      }
      continue
    }

    // Legacy flat product folders (kept during migration)
    targets.add(entry.name)
  }

  return [...targets]
}

function main() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error(`Missing products image directory: ${PRODUCTS_DIR}`)
    process.exit(1)
  }

  const preferredFolders = loadPreferredFolders()
  const inventory = {}
  const targets = collectScanTargets(preferredFolders)

  for (const relativeFolder of targets) {
    const images = scanProductFolder(relativeFolder)
    if (images.length > 0) {
      inventory[relativeFolder] = images
    }
  }

  // Prefer nested folder paths for product-id keys (overrides legacy flat scans).
  for (const [productId, imageFolder] of Object.entries(preferredFolders)) {
    if (inventory[imageFolder]) {
      inventory[productId] = inventory[imageFolder]
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(`${OUTPUT}`, `${JSON.stringify(inventory, null, 2)}\n`)

  const productCount = Object.keys(inventory).length
  const imageCount = Object.values(inventory).reduce((sum, list) => sum + list.length, 0)
  console.log(`Wrote ${productCount} folder keys (${imageCount} path entries) → ${OUTPUT}`)
}

main()
