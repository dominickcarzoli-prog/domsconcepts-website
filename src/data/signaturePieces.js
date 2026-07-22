/**
 * Website-owned homepage Signature Work pieces — shared IDs/images, localized copy.
 */

/** @typedef {'en' | 'de' | 'cs'} Locale */

/**
 * @param {string} title
 * @param {string} description
 * @param {string} [subtitle]
 */
function L(title, description, subtitle = '') {
  return { title, description, subtitle }
}

export const signaturePiecesCatalog = [
  {
    id: 'american-walnut-media-console',
    image: '/images/signature/signature-tv-console.jpg',
    objectPosition: 'center center',
    imageScale: 0.92,
    galleryHash: 'american-walnut-media-console',
    featured: false,
    translations: {
      en: L(
        'American Walnut Media Console',
        'A custom media console featuring a solid American walnut top and steamed European walnut drawer fronts. The drawers use soft-close, push-to-open hardware for a clean exterior without visible handles.',
        'TV Table / Media Console',
      ),
      de: L(
        'Media-Konsole aus amerikanischem Nussbaum',
        'Eine individuelle Media-Konsole mit einer Platte aus amerikanischem Nussbaum und Schubladenfronten aus gedämpftem europäischem Nussbaum. Soft-Close- und Push-to-Open-Beschläge sorgen für eine klare Front ohne sichtbare Griffe.',
        'TV-Tisch / Media-Konsole',
      ),
      cs: L(
        'TV konzole z amerického ořechu',
        'Zakázková TV konzole s deskou z amerického ořechu a čely zásuvek z pařeného evropského ořechu. Soft-close a push-to-open kování zajišťují čistý vzhled bez viditelných úchytek.',
        'TV stolek / mediální konzole',
      ),
    },
  },
  {
    id: 'solid-oak-bed',
    image: '/images/signature/signature-oak-bed.jpg',
    objectPosition: 'center 42%',
    imageScale: 0.92,
    galleryHash: 'solid-oak-bed',
    featured: true,
    translations: {
      en: L(
        'Solid Oak Bed',
        'A 2 × 2 metre bed built around a custom-designed steel frame, fabricated and powder-coated before being clad in solid oak slabs. Selected live edges were preserved to add natural character and contrast to the clean steel structure.',
      ),
      de: L(
        'Massivholzbett aus Eiche',
        'Ein 2 × 2 Meter Bett um einen maßgefertigten Stahlrahmen, der vor der Verkleidung mit massiven Eichenplatten pulverbeschichtet wurde. Ausgewählte Naturkanten bleiben erhalten und setzen dem klaren Stahl einen natürlichen Kontrast entgegen.',
      ),
      cs: L(
        'Postel z masivního dubu',
        'Postel 2 × 2 m postavená kolem zakázkového ocelového rámu, který byl před obložením masivními dubovými deskami práškově lakován. Vybrané přírodní hrany zůstaly zachovány jako přírodní kontrast k čisté ocelové konstrukci.',
      ),
    },
  },
  {
    id: 'solid-black-walnut-dining-table',
    image: '/images/signature/signature-walnut-dining-table.jpg',
    objectPosition: 'center 55%',
    imageScale: 0.92,
    galleryHash: 'solid-black-walnut-dining-table',
    featured: true,
    translations: {
      en: L(
        'Solid Black Walnut Dining Table',
        'A solid black walnut dining table paired with custom powder-coated steel legs, designed to showcase the natural grain and warmth of the timber.',
      ),
      de: L(
        'Massivholztisch aus amerikanischem Schwarznussbaum',
        'Ein Massivholztisch aus amerikanischem Schwarznussbaum mit maßgefertigten, pulverbeschichteten Stahlbeinen — gestaltet, um Maserung und Wärme des Holzes zur Geltung zu bringen.',
      ),
      cs: L(
        'Jídelní stůl z masivního amerického černého ořechu',
        'Jídelní stůl z masivního amerického černého ořechu se zakázkovými práškově lakovanými ocelovými nohami — navržený tak, aby vynikla kresba a teplo dřeva.',
      ),
    },
  },
  {
    id: 'walnut-maple-chessboard',
    image: '/images/signature/signature-walnut-maple-chessboard.jpg',
    objectPosition: 'center center',
    imageScale: 1,
    galleryHash: 'walnut-maple-chessboard',
    featured: true,
    translations: {
      en: L(
        'Walnut & Maple Chessboard',
        'A handcrafted walnut and maple board-game piece with contrasting hardwoods, precise grid work, and a refined edge profile — built as a display piece and heirloom gift.',
      ),
      de: L(
        'Schachbrett aus Nussbaum und Ahorn',
        'Ein handgefertigtes Schachbrett aus Nussbaum und Ahorn mit kontrastierenden Harthölzern, präzisem Raster und feinem Kantenprofil — als Ausstellungsstück und Erbstück gedacht.',
      ),
      cs: L(
        'Šachovnice z ořechu a javoru',
        'Ručně vyrobená šachovnice z ořechu a javoru s kontrastními dřevinami, přesnou mřížkou a jemně zpracovanou hranou — jako výstavní kus i rodinný dárek.',
      ),
    },
  },
  {
    id: 'sakuro-knife-table',
    image: '/images/signature/signature-knife-table.jpg',
    objectPosition: 'center 58%',
    imageScale: 0.9,
    galleryHash: 'custom-knife-table-sakuro',
    featured: true,
    translations: {
      en: L(
        'Custom Knife Table for Sakuro.cz',
        'A one-of-one knife display table created for Sakuro.cz. A knife and sharpening tool were suspended inside an epoxy river running through a dark brown stained oak tabletop.',
      ),
      de: L(
        'Individueller Messertisch für Sakuro.cz',
        'Ein einzigartiger Messervitrinentisch für Sakuro.cz. Messer und Schleifwerkzeug schweben in einem Epoxid-River, der durch eine dunkelbraun gebeizte Eichenplatte führt.',
      ),
      cs: L(
        'Zakázkový stolek na nože pro Sakuro.cz',
        'Jedinečný stolek na vystavení nožů pro Sakuro.cz. Nůž a brousek jsou zavěšené v epoxidové řece, která prochází tmavě mořenou dubovou deskou.',
      ),
    },
  },
  {
    id: 'whiskey-wednesday-serving-tray',
    image: '/images/signature/signature-maxs-whiskey-tray.jpg',
    objectPosition: 'center center',
    imageScale: 0.92,
    galleryHash: 'whiskey-wednesday-serving-tray',
    featured: false,
    translations: {
      en: L(
        'Whiskey Wednesday Serving Tray',
        "A custom serving tray made for Max's Steakhouse and its Whiskey Wednesday club. The finished piece remains in use and can be seen in person at the restaurant.",
        "Max's Steakhouse",
      ),
      de: L(
        'Whiskey-Wednesday-Serviertablett',
        "Ein individuelles Serviertablett für Max's Steakhouse und den Whiskey-Wednesday-Club. Das fertige Stück ist weiterhin im Einsatz und vor Ort im Restaurant zu sehen.",
        "Max's Steakhouse",
      ),
      cs: L(
        'Servírovací tác Whiskey Wednesday',
        "Zakázkový servírovací tác pro Max's Steakhouse a klub Whiskey Wednesday. Hotový kus je stále v provozu a lze jej vidět přímo v restauraci.",
        "Max's Steakhouse",
      ),
    },
  },
]

const FEATURED_IDS = [
  'solid-black-walnut-dining-table',
  'solid-oak-bed',
  'walnut-maple-chessboard',
  'sakuro-knife-table',
]

/**
 * @param {typeof signaturePiecesCatalog[number]} piece
 * @param {Locale | string} [locale]
 */
export function localizeSignaturePiece(piece, locale = 'en') {
  const loc = locale === 'de' || locale === 'cs' ? locale : 'en'
  const copy = piece.translations?.[loc] || piece.translations?.en || {}
  return {
    ...piece,
    name: copy.title || piece.id,
    title: copy.title || piece.id,
    description: copy.description || '',
    subtitle: copy.subtitle || '',
  }
}

/**
 * @param {Locale | string} [locale]
 */
export function getFeaturedSignaturePieces(locale = 'en') {
  return FEATURED_IDS.map((id) => signaturePiecesCatalog.find((piece) => piece.id === id))
    .filter(Boolean)
    .map((piece) => localizeSignaturePiece(piece, locale))
}

/** @deprecated Prefer getFeaturedSignaturePieces(locale) */
export const signaturePieces = signaturePiecesCatalog.map((piece) =>
  localizeSignaturePiece(piece, 'en'),
)

/** @deprecated Prefer getFeaturedSignaturePieces(locale) */
export const featuredSignaturePieces = getFeaturedSignaturePieces('en')
