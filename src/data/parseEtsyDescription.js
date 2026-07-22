/**
 * Safe Etsy description formatter for product detail pages.
 * Plain-text only — never returns HTML and never uses dangerouslySetInnerHTML.
 */

/** @typedef {{ type: 'paragraph' | 'list', text?: string, items?: string[] }} DescriptionBlock */
/** @typedef {{
 *   intro: string,
 *   features: string[],
 *   perfectFor: string[],
 *   whyEndGrain: string,
 *   whyThisPiece: string,
 *   dimensions: string,
 *   careInstructions: string,
 *   materials: string,
 *   handmade: string,
 *   shipping: string,
 *   importantNotes: string[],
 *   productDetails: string[],
 *   remaining: DescriptionBlock[],
 *   confidence: 'high' | 'low',
 * }} ParsedEtsyDescription */

const SECTION_DEFS = [
  {
    key: 'overview',
    kind: 'text',
    patterns: [
      /^overview\s*:?$/i,
      /^about\s+(this\s+)?(piece|board|product)\s*:?$/i,
      /^überblick\s*:?$/i,
      /^přehled\s*:?$/i,
    ],
  },
  {
    key: 'features',
    kind: 'list',
    patterns: [
      /^features\s*:?$/i,
      /^key\s+features\s*:?$/i,
      /^details\s*:?$/i,
      /^merkmale\s*:?$/i,
      /^eigenschaften\s*:?$/i,
      /^vlastnosti\s*:?$/i,
    ],
  },
  {
    key: 'perfectFor',
    kind: 'list',
    patterns: [
      /^perfect\s+for\s*:?$/i,
      /^ideal\s+for\s*:?$/i,
      /^ideal\s+für\s*:?$/i,
      /^ideální\s+pro\s*:?$/i,
    ],
  },
  {
    key: 'whyEndGrain',
    kind: 'text',
    patterns: [
      /^why\s+end\s+grain\s*\??\s*:?$/i,
      /^warum\s+hirnholz\s*\??\s*:?$/i,
      /^proč\s+čelní\s+dřevo\s*\??\s*:?$/i,
    ],
  },
  {
    key: 'whyThisPiece',
    kind: 'text',
    patterns: [
      /^why\s+this\s+piece\s*\??\s*:?$/i,
      /^warum\s+dieses\s+stück\s*\??\s*:?$/i,
      /^proč\s+(právě\s+)?tento\s+kus\s*\??\s*:?$/i,
    ],
  },
  {
    key: 'dimensions',
    kind: 'text',
    patterns: [
      /^dimensions?\s*:?$/i,
      /^size\s*:?$/i,
      /^measurements?\s*:?$/i,
      /^approximate\s+size\s*:?$/i,
      /^maße\s*:?$/i,
      /^(ungefähre\s+)?größe\s*:?$/i,
      /^rozměry\s*:?$/i,
      /^(přibližná\s+)?velikost\s*:?$/i,
    ],
  },
  {
    key: 'careInstructions',
    kind: 'text',
    patterns: [
      /^care\s+instructions?\s*:?$/i,
      /^care\s*&?\s*maintenance\s*:?$/i,
      /^care\s*:?$/i,
      /^maintenance\s*:?$/i,
      /^how\s+to\s+care\s*:?$/i,
      /^pflegehinweise\s*:?$/i,
      /^pflege\s*:?$/i,
      /^pokyny\s+k\s+údržbě\s*:?$/i,
      /^péče\s*:?$/i,
    ],
  },
  {
    key: 'materials',
    kind: 'text',
    patterns: [
      /^materials?\s*:?$/i,
      /^wood\s+type\s*:?$/i,
      /^wood\s*:?$/i,
      /^materialien\s*:?$/i,
      /^material\s*:?$/i,
      /^materiály\s*:?$/i,
      /^materiál\s*:?$/i,
    ],
  },
  {
    key: 'importantNotes',
    kind: 'list',
    patterns: [
      /^important(\s+notes?)?\s*:?$/i,
      /^please\s+note\s*:?$/i,
      /^notes?\s*:?$/i,
      /^wichtige\s+hinweise\s*:?$/i,
      /^důležité\s+poznámky\s*:?$/i,
    ],
  },
  {
    key: 'handmade',
    kind: 'text',
    patterns: [/^handmade\s*:?$/i, /^handgefertigt\s*:?$/i, /^ručně\s+vyrobeno\s*:?$/i],
  },
  {
    key: 'shipping',
    kind: 'text',
    patterns: [
      /^shipping\s*:?$/i,
      /^returns?\s*\/?\s*shipping\s*:?$/i,
      /^delivery\s*:?$/i,
      /^versand\s*:?$/i,
      /^doprava\s*:?$/i,
    ],
  },
]

/**
 * Strip leading emoji / pictographs from a line (common in Etsy listings).
 * @param {string} line
 */
export function stripLeadingEmoji(line) {
  return String(line || '')
    .replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, '')
    .trim()
}

/**
 * Strip tags and decode a few common entities without interpreting HTML.
 * @param {string} raw
 */
export function stripHtmlToText(raw) {
  if (raw == null) return ''
  let text = String(raw)
  text = text.replace(/<\s*br\s*\/?>/gi, '\n')
  text = text.replace(/<\/\s*p\s*>/gi, '\n\n')
  text = text.replace(/<\/\s*li\s*>/gi, '\n')
  text = text.replace(/<\s*li[^>]*>/gi, '• ')
  text = text.replace(/<[^>]+>/g, '')
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
  return text.replace(/\n{3,}/g, '\n\n').trim()
}

/**
 * Remove decorative asterisk runs while keeping normal punctuation.
 * Converts both line-start and inline `* item` markers into bullet lines
 * so Etsy marketplace copy does not collapse into one raw paragraph.
 * @param {string} text
 */
export function cleanSeparatorAsterisks(text) {
  if (!text) return ''
  let cleaned = String(text)
  // Section separators like *** or * * * become paragraph breaks first.
  cleaned = cleaned.replace(/\s*\*{2,}\s*/g, '\n\n')
  cleaned = cleaned.replace(/(?:^|\n)\s*(?:\*\s*){2,}\s*(?=\n|$)/g, '\n\n')
  // Any remaining "* item" marker (start of line or inline) becomes a bullet line.
  cleaned = cleaned.replace(/\s*\*\s+(?=\S)/g, '\n• ')
  // Drop lines that are only decorative separators.
  cleaned = cleaned.replace(/^[ \t]*[*•·\-–—]+[ \t]*$/gm, '')
  // No literal asterisks should remain in visible product copy.
  cleaned = cleaned.replace(/\*/g, '')
  cleaned = cleaned.replace(/[ \t]+\n/g, '\n')
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')
  return cleaned.trim()
}

/**
 * Final safety scrub for display strings — never show marketplace asterisks.
 * @param {string} text
 */
export function scrubAsterisks(text) {
  return String(text || '')
    .replace(/\*/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/**
 * Keep overview short — first 1–2 sentences, hard cap.
 * @param {string} text
 * @param {number} [maxChars]
 */
export function shortenOverview(text, maxChars = 220) {
  const cleaned = String(text || '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  const sentences = cleaned.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [cleaned]
  let out = ''
  for (const sentence of sentences.slice(0, 2)) {
    const next = `${out}${sentence}`.trim()
    if (next.length > maxChars && out) break
    out = next
    if (out.length >= maxChars * 0.7) break
  }
  if (out.length > maxChars) {
    return `${out.slice(0, maxChars - 1).trim()}…`
  }
  return out
}

/**
 * @param {string} line
 */
export function isBulletLine(line) {
  return /^\s*(?:[•·▪◦●]|[-–—]|\*)\s+\S/.test(line)
}

/**
 * @param {string} line
 */
export function stripBulletPrefix(line) {
  return String(line)
    .replace(/^\s*(?:[•·▪◦●]|[-–—]|\*)\s+/, '')
    .trim()
}

/**
 * @param {string} line
 * @returns {{ key: string, kind: 'list' | 'text', inlineRest?: string } | null}
 */
export function matchSectionHeading(line) {
  const trimmed = stripLeadingEmoji(String(line || '').trim())
  if (!trimmed || trimmed.length > 56) return null

  for (const def of SECTION_DEFS) {
    if (def.patterns.some((re) => re.test(trimmed))) {
      return { key: def.key, kind: def.kind }
    }
  }

  for (const def of SECTION_DEFS) {
    for (const re of def.patterns) {
      const source = re.source.replace(/\$/, '')
      const inline = new RegExp(`^${source}\\s*(.+)$`, 'i')
      const match = trimmed.match(inline)
      if (match && match[1] && !/^[:\s]*$/.test(match[1])) {
        return { key: def.key, kind: def.kind, inlineRest: match[1].trim() }
      }
    }
  }
  return null
}

/**
 * @param {string[]} lines
 * @returns {DescriptionBlock[]}
 */
function linesToBlocks(lines) {
  /** @type {DescriptionBlock[]} */
  const blocks = []
  /** @type {string[]} */
  let listBuffer = []
  /** @type {string[]} */
  let paraBuffer = []

  const flushList = () => {
    if (!listBuffer.length) return
    blocks.push({ type: 'list', items: [...listBuffer] })
    listBuffer = []
  }
  const flushPara = () => {
    if (!paraBuffer.length) return
    const text = paraBuffer.join(' ').replace(/\s+/g, ' ').trim()
    if (text) blocks.push({ type: 'paragraph', text })
    paraBuffer = []
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) {
      flushList()
      flushPara()
      continue
    }
    if (isBulletLine(trimmed)) {
      flushPara()
      listBuffer.push(stripBulletPrefix(trimmed))
      continue
    }
    flushList()
    paraBuffer.push(trimmed)
  }
  flushList()
  flushPara()
  return blocks
}

/**
 * @param {DescriptionBlock[]} blocks
 */
function blocksToPlainText(blocks) {
  return blocks
    .map((block) => {
      if (block.type === 'list') return (block.items || []).join('\n')
      return block.text || ''
    })
    .filter(Boolean)
    .join('\n\n')
    .trim()
}

/**
 * Split unstructured text into compact detail bullets (never a wall of text).
 * @param {string} text
 * @returns {string[]}
 */
export function extractProductDetailBullets(text) {
  const cleaned = cleanSeparatorAsterisks(stripHtmlToText(text))
  if (!cleaned) return []

  const fromBullets = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => isBulletLine(line))
    .map(stripBulletPrefix)
    .filter(Boolean)

  if (fromBullets.length >= 2) {
    return fromBullets.slice(0, 10)
  }

  const phrases = cleaned
    .split(/\n+|;\s+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter((part) => part.length >= 12 && part.length <= 140)
    .filter((part) => !matchSectionHeading(part))

  const unique = []
  for (const phrase of phrases) {
    if (!unique.includes(phrase)) unique.push(phrase)
    if (unique.length >= 8) break
  }
  return unique
}

/**
 * Infer materials from a product title when description lacks a Materials section.
 * @param {string | null | undefined} title
 */
export function extractMaterialsFromTitle(title) {
  const t = String(title || '')
  if (!t.trim()) return null

  if (/black\s+walnut.*maple|walnut\s*[&+/and]+\s*maple|maple\s*[&+/and]+\s*walnut/i.test(t)) {
    return 'Black walnut and hard maple'
  }
  if (/walnut/i.test(t) && /maple/i.test(t)) {
    return 'Black walnut and hard maple'
  }
  if (/oak\s+butcher|butcher\s+block.*oak|solid\s+oak|oak\s+end\s+grain|\boak\b/i.test(t)) {
    return 'Solid oak'
  }
  if (/epoxy/i.test(t) && /black\s+walnut|american\s+black\s+walnut/i.test(t)) {
    return 'Black walnut and epoxy resin'
  }
  if (/epoxy/i.test(t) && /european\s+walnut/i.test(t)) {
    return 'European walnut and epoxy resin'
  }
  if (/epoxy/i.test(t) && /\bwalnut\b/i.test(t)) {
    return 'Black walnut and epoxy resin'
  }
  if (/epoxy/i.test(t) && /european\s+oak/i.test(t)) {
    return 'European oak and epoxy resin'
  }
  if (/epoxy/i.test(t) && /\boak\b/i.test(t)) {
    return 'Oak and epoxy resin'
  }
  if (/european\s+oak/i.test(t)) return 'European oak'
  if (/black\s+walnut|\bwalnut\b/i.test(t)) return 'Black walnut'
  if (/\bmaple\b/i.test(t)) return 'Hard maple'
  return null
}

/**
 * @returns {ParsedEtsyDescription}
 */
function emptyParsed() {
  return {
    intro: '',
    features: [],
    perfectFor: [],
    whyEndGrain: '',
    whyThisPiece: '',
    dimensions: '',
    careInstructions: '',
    materials: '',
    handmade: '',
    shipping: '',
    importantNotes: [],
    productDetails: [],
    remaining: [],
    confidence: 'low',
  }
}

/**
 * Parse a raw Etsy / website description into structured display sections.
 * @param {unknown} rawDescription
 * @param {{ title?: string }} [options]
 * @returns {ParsedEtsyDescription}
 */
export function parseEtsyDescription(rawDescription, options = {}) {
  const stripped = stripHtmlToText(rawDescription)
  const cleaned = cleanSeparatorAsterisks(stripped)
  if (!cleaned) {
    return emptyParsed()
  }

  const lines = cleaned.split(/\r?\n/)
  /** @type {ParsedEtsyDescription} */
  const result = emptyParsed()
  /** @type {string[]} */
  const introLines = []
  /** @type {string | null} */
  let currentKey = null
  /** @type {string[]} */
  let currentLines = []
  let headingCount = 0

  const commitSection = () => {
    if (!currentKey) return
    const blocks = linesToBlocks(currentLines)
    const text = blocksToPlainText(blocks)
    const listItems = blocks
      .filter((b) => b.type === 'list')
      .flatMap((b) => b.items || [])
    const paraItems = blocks
      .filter((b) => b.type === 'paragraph')
      .map((b) => b.text || '')
      .filter(Boolean)

    const asList = () =>
      listItems.length
        ? listItems
        : paraItems.flatMap((p) =>
            p.includes(';')
              ? p
                  .split(/\s*;\s*/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [p],
          )

    switch (currentKey) {
      case 'overview':
        result.intro = shortenOverview(text)
        break
      case 'features':
        result.features = asList()
        break
      case 'perfectFor':
        result.perfectFor = asList()
        break
      case 'whyEndGrain':
        result.whyEndGrain = text
        break
      case 'whyThisPiece':
        result.whyThisPiece = text
        break
      case 'dimensions':
        result.dimensions = sanitizeDimensionsText(text).dimensions || text
        break
      case 'careInstructions':
        result.careInstructions = text
        break
      case 'materials':
        result.materials = text
        break
      case 'importantNotes':
        result.importantNotes = asList()
        break
      case 'handmade':
        result.handmade = text
        break
      case 'shipping':
        result.shipping = text
        break
      default:
        break
    }
    currentKey = null
    currentLines = []
  }

  for (const line of lines) {
    const heading = matchSectionHeading(line)
    if (heading) {
      commitSection()
      headingCount += 1
      currentKey = heading.key
      currentLines = []
      if (heading.inlineRest) {
        currentLines.push(
          heading.kind === 'list' && !isBulletLine(heading.inlineRest)
            ? `• ${heading.inlineRest}`
            : heading.inlineRest,
        )
      }
      continue
    }
    if (currentKey) {
      currentLines.push(line)
    } else {
      introLines.push(line)
    }
  }
  commitSection()

  if (!result.intro) {
    result.intro = shortenOverview(blocksToPlainText(linesToBlocks(introLines)))
  } else {
    result.intro = shortenOverview(result.intro)
  }

  const hasStructured =
    headingCount >= 2 ||
    result.features.length > 0 ||
    result.perfectFor.length > 0 ||
    Boolean(result.whyEndGrain) ||
    Boolean(result.dimensions) ||
    Boolean(result.careInstructions) ||
    Boolean(result.materials)

  result.confidence = hasStructured ? 'high' : 'low'

  if (result.confidence === 'low') {
    // Never dump the original wall of text — short overview + detail bullets only.
    if (!result.intro) {
      result.intro = shortenOverview(cleaned)
    }
    result.productDetails = extractProductDetailBullets(cleaned).filter(
      (item) => item !== result.intro && !result.intro.startsWith(item.slice(0, 40)),
    )
    result.remaining = []
  }

  if (!result.materials) {
    const fromTitle = extractMaterialsFromTitle(options.title)
    if (fromTitle) result.materials = fromTitle
  }

  if (
    !result.intro &&
    !result.features.length &&
    !result.perfectFor.length &&
    !result.productDetails.length &&
    !result.dimensions &&
    !result.careInstructions
  ) {
    result.intro = shortenOverview(cleaned)
    result.productDetails = extractProductDetailBullets(cleaned)
    result.confidence = 'low'
  }

  result.intro = scrubAsterisks(result.intro)
  result.features = result.features.map(scrubAsterisks).filter(Boolean)
  result.perfectFor = result.perfectFor.map(scrubAsterisks).filter(Boolean)
  result.whyEndGrain = scrubAsterisks(result.whyEndGrain)
  result.whyThisPiece = scrubAsterisks(result.whyThisPiece)
  result.dimensions = scrubAsterisks(result.dimensions)
  result.careInstructions = scrubAsterisks(result.careInstructions)
  result.materials = scrubAsterisks(result.materials)
  result.handmade = scrubAsterisks(result.handmade)
  result.shipping = scrubAsterisks(result.shipping)
  result.importantNotes = result.importantNotes.map(scrubAsterisks).filter(Boolean)
  result.productDetails = result.productDetails.map(scrubAsterisks).filter(Boolean)

  return result
}

/**
 * Flatten parsed description to a single plain string (e.g. meta description).
 * @param {ParsedEtsyDescription} parsed
 */
export function parsedDescriptionPlainText(parsed) {
  if (!parsed) return ''
  const parts = [
    parsed.intro,
    parsed.features.length ? `Features: ${parsed.features.join('; ')}` : '',
    parsed.perfectFor.length ? `Perfect for: ${parsed.perfectFor.join('; ')}` : '',
    parsed.whyEndGrain,
    parsed.dimensions,
    parsed.careInstructions,
    parsed.productDetails.join('; '),
  ]
  return parts.filter(Boolean).join('\n\n').trim()
}

/**
 * Resolve materials label for product meta cards.
 * @param {{ materials?: string, woodType?: string, name?: string, title?: string }} product
 * @param {ParsedEtsyDescription} parsed
 */
const GENERIC_MATERIALS =
  /^(selected(\s+materials|\s+hardwoods)?|hand[- ]?selected\s+hardwoods|carefully\s+selected\s+hardwoods|sorgfältig\s+ausgewählte\s+harthölzer|pečlivě\s+vybraná\s+tvrdá\s+dřeva|wood(\s+and\s+epoxy(\s+resin)?)?|wood\s*[·•]\s*.+|materials|holz|dřevo)$/i

/**
 * Strip marketing / battery / options noise from a dimensions field.
 * Returns measurement-only text plus optional extracted extras.
 * @param {string | null | undefined} raw
 * @returns {{
 *   dimensions: string,
 *   battery: string,
 *   options: string,
 *   capacity: string,
 * }}
 */
export function sanitizeDimensionsText(raw) {
  let text = scrubAsterisks(stripHtmlToText(raw))
  if (!text || /^details coming soon$/i.test(text)) {
    return { dimensions: '', battery: '', options: '', capacity: '' }
  }

  text = text.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, ' ').replace(/\s+/g, ' ').trim()

  let battery = ''
  const batteryPatterns = [
    /(?:^|[.;•\n]|,\s*)\s*((?:1\s*[×x]\s*)?AA\s*batter(?:y|ies)[^.;\n]*)/i,
    /(?:^|[.;•\n]|,\s*)\s*(batter(?:y|ies)\s*(?:included|incl\.?)[^.;\n]*)/i,
    /(?:^|[.;•\n]|,\s*)\s*((?:1\s*[×x]\s*)?AA(?:-Batterie| baterie)[^.;\n]*)/i,
  ]
  for (const re of batteryPatterns) {
    const match = text.match(re)
    if (match) {
      battery = scrubAsterisks(match[1]).replace(/^[,;.\s]+/, '').trim()
      text = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim()
      break
    }
  }

  let options = ''
  const optionsPatterns = [
    /(?:^|[.;•\n])\s*((?:custom\s+sizing|custom\s+sizes?|personalisation|personalization|engraving)[^.;\n]*)/i,
    /(?:^|[.;•\n])\s*((?:maßanfertigung|gravur|personalisierung)[^.;\n]*)/i,
    /(?:^|[.;•\n])\s*((?:zakázkové?\s+rozměry|gravírování|personalizace)[^.;\n]*)/i,
  ]
  for (const re of optionsPatterns) {
    const match = text.match(re)
    if (match) {
      options = scrubAsterisks(match[1]).replace(/^[,;.\s]+/, '').trim()
      text = text.replace(match[0], ' ').replace(/\s+/g, ' ').trim()
      break
    }
  }

  let capacity = ''
  const capacityMatch = text.match(
    /(?:^|[.;•\n])\s*((?:capacity|holds?|fasst|kapacita)\s*[:\-–]?\s*[^.;\n]+)/i,
  )
  if (capacityMatch) {
    capacity = scrubAsterisks(capacityMatch[1]).replace(/^[,;.\s]+/, '').trim()
    text = text.replace(capacityMatch[0], ' ').replace(/\s+/g, ' ').trim()
  }

  // Drop gift / marketing sentences that are not measurements.
  const segments = text
    .split(/(?<=[.!?])\s+|;\s+|•\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const measurementLike = (part) =>
    /\d/.test(part) &&
    /(cm|mm|m\b|inch|in\b|"|′|″|×|x\s*\d|diameter|durchmesser|průměr|ø|⌀)/i.test(part)

  const marketingLike = (part) =>
    /\b(gift|foodies?|home\s*chefs?|book\s*lovers?|thoughtful|perfect\s+for|ideal\s+for|wedding|housewarming|geschenk|dárek|milovník)/i.test(
      part,
    ) && !measurementLike(part)

  const kept = segments.filter((part) => !marketingLike(part))
  const measured = kept.filter(measurementLike)
  let dimensions = (measured.length ? measured : kept).join('; ').trim()

  // Soft cleanup of leftover separators / empty junk.
  dimensions = dimensions
    .replace(/\s*[.;]\s*[.;]\s*/g, '; ')
    .replace(/^[,;.\s–—-]+/, '')
    .replace(/[,;.\s–—-]+$/, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  if (dimensions && !measurementLike(dimensions) && marketingLike(dimensions)) {
    dimensions = ''
  }

  return { dimensions, battery, options, capacity }
}

/**
 * Prefer specific species + epoxy phrasing over vague workshop copy.
 * @param {string} value
 */
export function normalizeMaterialsDisplay(value) {
  const text = scrubAsterisks(String(value || '').trim())
  if (!text) return text
  if (/american\s+black\s+walnut.*epoxy/i.test(text) || /black\s+walnut.*epoxy/i.test(text)) {
    return 'Black walnut and epoxy resin'
  }
  if (/european\s+walnut.*epoxy/i.test(text)) {
    return 'European walnut and epoxy resin'
  }
  if (/european\s+oak.*epoxy/i.test(text)) {
    return 'European oak and epoxy resin'
  }
  if (/^oak\s+and\s+epoxy(\s+resin)?$/i.test(text) || /\boak\b.*\bepoxy\b/i.test(text)) {
    if (/lego/i.test(text)) return 'Oak and epoxy resin'
    if (!/walnut|maple|european/i.test(text)) return 'Oak and epoxy resin'
  }
  if (/maple.*epoxy|epoxy.*maple/i.test(text)) {
    return 'Maple and epoxy resin'
  }
  return text
}

/**
 * True when a materials string is too generic to show over specific woodType data.
 * @param {string | null | undefined} value
 */
export function isGenericMaterialsLabel(value) {
  const text = String(value || '').trim()
  if (!text) return true
  return GENERIC_MATERIALS.test(text)
}

export function resolveMaterialsLabel(product, parsed, options = {}) {
  const fallback =
    typeof options.fallback === 'string' && options.fallback.trim()
      ? options.fallback.trim()
      : 'Hand-selected hardwoods'

  const candidates = [
    product?.materials,
    product?.woodType,
    parsed?.materials,
    extractMaterialsFromTitle(product?.name || product?.title),
    extractMaterialsFromTitle(product?.slug || product?.id),
  ]

  for (const candidate of candidates) {
    const trimmed = typeof candidate === 'string' ? candidate.trim() : ''
    if (!trimmed || isGenericMaterialsLabel(trimmed)) continue
    return normalizeMaterialsDisplay(trimmed)
  }

  return fallback
}

/**
 * Guard used in tests — display layer must never inject HTML.
 * @param {unknown} value
 */
export function containsDangerousHtmlIntent(value) {
  return /dangerouslySetInnerHTML\s*=/i.test(String(value || ''))
}
