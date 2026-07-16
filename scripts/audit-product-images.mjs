#!/usr/bin/env node
/**
 * Scans public/images/products/{id}/ for numbered gallery files (01.jpg …).
 * Writes src/data/product-image-inventory.json with real image paths per product id.
 *
 * Real image heuristic:
 * - File exists and matches /^\d{2}\.jpg$/
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

const PLACEHOLDER_BYTE_SIZE = 54838
const PLACEHOLDER_PATH_RE = /placeholder|coming-soon|photo-coming/i

function isRealImageFile(filePath) {
  const base = path.basename(filePath)
  if (!/^\d{2}\.jpg$/i.test(base)) return false
  if (PLACEHOLDER_PATH_RE.test(filePath)) return false

  const stat = fs.statSync(filePath)
  if (stat.size === PLACEHOLDER_BYTE_SIZE) return false

  return true
}

function numericFilenameValue(fileName) {
  const match = path.basename(fileName).match(/(\d+)/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

function scanProductFolder(productId) {
  const folder = path.join(PRODUCTS_DIR, productId)
  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    return []
  }

  return fs
    .readdirSync(folder)
    .filter((file) => /^\d{2}\.jpg$/i.test(file))
    .filter((file) => isRealImageFile(path.join(folder, file)))
    .sort((a, b) => numericFilenameValue(a) - numericFilenameValue(b))
    .map((file) => `/images/products/${productId}/${file}`)
}

function main() {
  if (!fs.existsSync(PRODUCTS_DIR)) {
    console.error(`Missing products image directory: ${PRODUCTS_DIR}`)
    process.exit(1)
  }

  const inventory = {}
  const entries = fs.readdirSync(PRODUCTS_DIR, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue

    const images = scanProductFolder(entry.name)
    if (images.length > 0) {
      inventory[entry.name] = images
    }
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(`${OUTPUT}`, `${JSON.stringify(inventory, null, 2)}\n`)

  const productCount = Object.keys(inventory).length
  const imageCount = Object.values(inventory).reduce((sum, list) => sum + list.length, 0)
  console.log(`Wrote ${productCount} products (${imageCount} images) → ${OUTPUT}`)
}

main()
