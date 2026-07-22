/**
 * Website-owned Instagram workshop cards — shared media URLs, localized titles/descriptions.
 * Platform labels ("Instagram", "Instagram Reel") stay in UI dictionaries.
 */

/** @typedef {'en' | 'de' | 'cs'} Locale */

/**
 * @param {string} title
 * @param {string} description
 */
function L(title, description) {
  return { title, description }
}

export const instagramVideosCatalog = [
  {
    id: 'workshop',
    instagramUrl: 'https://www.instagram.com/p/DXETjBLDG2m/',
    thumbnail: '/images/instagram/workshop.jpg',
    featured: true,
    translations: {
      en: L('Come Have a Look Inside My Small Workshop', 'Where big ideas come to life.'),
      de: L('Ein Blick in meine kleine Werkstatt', 'Wo große Ideen Wirklichkeit werden.'),
      cs: L('Nahlédněte do mé malé dílny', 'Kde velké nápady dostávají skutečnou podobu.'),
    },
  },
  {
    id: 'board-care',
    instagramUrl: 'https://www.instagram.com/p/DRg3PWIDCJv/',
    thumbnail: '/images/instagram/board-care.jpg',
    featured: true,
    translations: {
      en: L('Board Care Tips', 'See how I keep every board looking its best.'),
      de: L('Tipps zur Pflege von Schneidebrettern', 'So bleiben meine Schneidebretter lange schön.'),
      cs: L('Tipy pro péči o prkénka', 'Podívejte se, jak udržuji každé prkénko v nejlepším stavu.'),
    },
  },
  {
    id: 'finished-piece',
    instagramUrl: 'https://www.instagram.com/p/DNAbjJ1IEkE/',
    thumbnail: '/images/instagram/finished-piece.jpg',
    featured: true,
    translations: {
      en: L('Finished Piece', 'Watch the final reveal.'),
      de: L('Fertiges Einzelstück', 'Sehen Sie sich das fertige Ergebnis an.'),
      cs: L('Hotový výrobek', 'Podívejte se na finální výsledek.'),
    },
  },
]

/**
 * @param {typeof instagramVideosCatalog[number]} video
 * @param {Locale | string} [locale]
 */
export function localizeInstagramVideo(video, locale = 'en') {
  const loc = locale === 'de' || locale === 'cs' ? locale : 'en'
  const copy = video.translations?.[loc] || video.translations?.en || {}
  return {
    ...video,
    title: copy.title || video.id,
    description: copy.description || '',
  }
}

/**
 * @param {Locale | string} [locale]
 */
export function getInstagramVideos(locale = 'en') {
  return instagramVideosCatalog.map((video) => localizeInstagramVideo(video, locale))
}

/** @deprecated Prefer getInstagramVideos(locale) */
export const instagramVideos = getInstagramVideos('en')
