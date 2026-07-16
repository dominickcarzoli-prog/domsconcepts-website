#!/usr/bin/env node
/**
 * Verifies past project images in public/images/gallery/past-projects/.
 * Writes src/data/past-projects-available.json with slugs that have real files.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pastProjectsCatalog } from '../src/data/pastProjects.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PROJECTS_DIR = path.join(ROOT, 'public/images/gallery/past-projects')
const OUTPUT = path.join(ROOT, 'src/data/past-projects-available.json')

const PLACEHOLDER_PATH_RE = /placeholder|coming-soon|photo-coming/i

function isRealImageFile(filePath) {
  if (!fs.existsSync(filePath)) return false
  if (PLACEHOLDER_PATH_RE.test(filePath)) return false

  const stat = fs.statSync(filePath)
  return stat.isFile() && stat.size > 0
}

function imagePathToFile(imagePath) {
  return path.join(ROOT, 'public', imagePath.replace(/^\/images\//, 'images/'))
}

function main() {
  fs.mkdirSync(PROJECTS_DIR, { recursive: true })

  const availableSlugs = pastProjectsCatalog
    .filter(({ image }) => isRealImageFile(imagePathToFile(image)))
    .map(({ slug }) => slug)

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true })
  fs.writeFileSync(OUTPUT, `${JSON.stringify(availableSlugs, null, 2)}\n`)

  console.log(
    `Past project images: ${availableSlugs.length}/${pastProjectsCatalog.length} available → ${OUTPUT}`,
  )
}

main()
