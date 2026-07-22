/**
 * Website-owned gallery (past projects) — shared IDs/images, localized copy.
 * Filtering uses stable categoryId values, never translated labels.
 */

import availableSlugs from './past-projects-available.json' with { type: 'json' }

/** @typedef {'all' | 'furniture' | 'customPieces' | 'homeAccessories' | 'decor'} GalleryCategoryId */
/** @typedef {'en' | 'de' | 'cs'} Locale */

export const GALLERY_CATEGORY_IDS = /** @type {const} */ ([
  'all',
  'furniture',
  'customPieces',
  'homeAccessories',
  'decor',
])

/** @deprecated Prefer GALLERY_CATEGORY_IDS + translateGalleryCategoryLabel */
export const pastProjectCategories = [
  'All',
  'Furniture',
  'Custom Pieces',
  'Home Accessories',
  'Decor',
]

export const GALLERY_CATEGORY_LABEL_TO_ID = {
  All: 'all',
  Furniture: 'furniture',
  'Custom Pieces': 'customPieces',
  'Custom Piece': 'customPieces',
  'Home Accessories': 'homeAccessories',
  'Home Accessory': 'homeAccessories',
  Decor: 'decor',
}

export function normalizeGalleryCategoryId(labelOrId) {
  if (!labelOrId) return 'all'
  if (GALLERY_CATEGORY_IDS.includes(/** @type {GalleryCategoryId} */ (labelOrId))) {
    return /** @type {GalleryCategoryId} */ (labelOrId)
  }
  return GALLERY_CATEGORY_LABEL_TO_ID[labelOrId] || 'all'
}

const DISPLAY_ORDER = [
  'modern-oak-sideboard',
  'american-walnut-media-console',
  'solid-oak-bed',
  'black-walnut-table-combo',
  'black-walnut-smokey-grey-epoxy-table',
  'live-edge-mahogany-table',
  'solid-black-walnut-dining-table',
  'walnut-dining-table',
  'american-black-walnut-coffee-table-walnut-legs',
  'live-edge-olive-couch-table',
  'zebrano-side-tables',
  'custom-knife-table-sakuro',
  'whiskey-wednesday-serving-tray',
  'mixed-hardwood-bottle-openers',
  'walnut-maple-purpleheart-coasters',
  'golf-lisnice-board',
  'pig-roast-event-board',
  'walnut-maple-chessboard',
  'mahogany-maple-board-game',
  'superman-epoxy-wall-art',
]

export const pastProjectsCatalog = [
  {
    "id": "modern-oak-sideboard",
    "slug": "modern-oak-sideboard",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/modern-oak-sideboard.jpg",
    "modalImage": "/images/projects/modal/modern-oak-sideboard-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 58%",
    "modalObjectPosition": "center 58%",
    "featured": true,
    "translations": {
      "en": {
        "title": "Modern Oak Sideboard",
        "materials": "Solid oak",
        "description": "A clean modern sideboard in solid oak."
      },
      "de": {
        "title": "Modernes Sideboard aus Eiche",
        "materials": "Massive Eiche",
        "description": "Ein klares modernes Sideboard aus massiver Eiche."
      },
      "cs": {
        "title": "Moderní dubová komoda",
        "materials": "Masivní dub",
        "description": "Čistá moderní komoda z masivního dubu."
      }
    }
  },
  {
    "id": "american-walnut-media-console",
    "slug": "american-walnut-media-console",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/signature/signature-tv-console.jpg",
    "modalImage": "/images/signature/signature-tv-console.jpg",
    "cardObjectPosition": "center 45%",
    "modalObjectPosition": "center 45%",
    "translations": {
      "en": {
        "title": "American Walnut Media Console",
        "materials": "American walnut + steamed European walnut",
        "description": "A custom media console with a solid American walnut top and steamed European walnut drawer fronts."
      },
      "de": {
        "title": "Media-Konsole aus amerikanischem Nussbaum",
        "materials": "Amerikanischer Nussbaum und gedämpfter europäischer Nussbaum",
        "description": "Eine individuelle Media-Konsole mit einer Platte aus amerikanischem Nussbaum und Schubladenfronten aus gedämpftem europäischem Nussbaum."
      },
      "cs": {
        "title": "TV konzole z amerického ořechu",
        "materials": "Americký ořech a pařený evropský ořech",
        "description": "Zakázková TV konzole s deskou z amerického ořechu a čely zásuvek z pařeného evropského ořechu."
      }
    }
  },
  {
    "id": "solid-oak-bed",
    "slug": "solid-oak-bed",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/signature/signature-oak-bed.jpg",
    "modalImage": "/images/signature/signature-oak-bed.jpg",
    "cardObjectPosition": "center 40%",
    "modalObjectPosition": "center 40%",
    "translations": {
      "en": {
        "title": "Solid Oak Bed",
        "materials": "Solid oak + powder-coated steel",
        "description": "A 2 × 2 metre bed built around a custom steel frame, clad in solid oak slabs with selected live edges preserved."
      },
      "de": {
        "title": "Massivholzbett aus Eiche",
        "materials": "Massive Eiche und pulverbeschichteter Stahl",
        "description": "Ein 2 × 2 Meter Bett um einen maßgefertigten Stahlrahmen, verkleidet mit massiven Eichenplatten und ausgewählten Naturkanten."
      },
      "cs": {
        "title": "Postel z masivního dubu",
        "materials": "Masivní dub a práškově lakovaná ocel",
        "description": "Postel 2 × 2 m postavená kolem zakázkového ocelového rámu, obložená masivními dubovými deskami s vybranými přírodními hranami."
      }
    }
  },
  {
    "id": "black-walnut-table-combo",
    "slug": "black-walnut-table-combo",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/black-walnut-table-combo.jpg",
    "modalImage": "/images/projects/modal/black-walnut-table-combo-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 55%",
    "modalObjectPosition": "center 55%",
    "featured": true,
    "translations": {
      "en": {
        "title": "Black Walnut Dining and Couch Table Combo",
        "materials": "Black walnut + powder-coated steel",
        "description": "A matching dining and couch table set in black walnut with powder-coated steel."
      },
      "de": {
        "title": "Ess- und Couchtisch-Set aus Schwarznussbaum",
        "materials": "Amerikanischer Schwarznussbaum und pulverbeschichteter Stahl",
        "description": "Ein abgestimmtes Ess- und Couchtisch-Set aus Schwarznussbaum mit pulverbeschichtetem Stahl."
      },
      "cs": {
        "title": "Sada jídelního a konferenčního stolu z černého ořechu",
        "materials": "Americký černý ořech a práškově lakovaná ocel",
        "description": "Sladěná sada jídelního a konferenčního stolu z černého ořechu s práškově lakovanou ocelí."
      }
    }
  },
  {
    "id": "black-walnut-smokey-grey-epoxy-table",
    "slug": "black-walnut-smokey-grey-epoxy-table",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/black-walnut-smokey-grey-epoxy-table.jpg",
    "modalImage": "/images/projects/modal/black-walnut-smokey-grey-epoxy-table-modal.jpg",
    "sourceIsScreenshot": true,
    "translations": {
      "en": {
        "title": "Black Walnut and Smokey Grey Epoxy Coffee Table",
        "materials": "Black walnut + smokey grey epoxy + steel",
        "description": "A coffee table pairing black walnut with a smokey grey epoxy detail and steel."
      },
      "de": {
        "title": "Couchtisch aus Schwarznussbaum und rauchgrauem Epoxidharz",
        "materials": "Amerikanischer Schwarznussbaum, rauchgraues Epoxidharz und Stahl",
        "description": "Ein Couchtisch aus Schwarznussbaum mit rauchgrauem Epoxiddetail und Stahl."
      },
      "cs": {
        "title": "Konferenční stolek z černého ořechu a kouřově šedé epoxidové pryskyřice",
        "materials": "Americký černý ořech, kouřově šedá epoxidová pryskyřice a ocel",
        "description": "Konferenční stolek spojující černý ořech s kouřově šedým epoxidovým detailem a ocelí."
      }
    }
  },
  {
    "id": "live-edge-mahogany-table",
    "slug": "live-edge-mahogany-table",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/live-edge-mahogany-table.jpg",
    "modalImage": "/images/projects/modal/live-edge-mahogany-table-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 50%",
    "modalObjectPosition": "center 50%",
    "translations": {
      "en": {
        "title": "Live Edge Mahogany Slabs Table",
        "materials": "Live-edge mahogany + steel",
        "description": "A table built from live-edge mahogany slabs with a steel base."
      },
      "de": {
        "title": "Tisch aus Mahagoni-Bohlen mit Naturkante",
        "materials": "Mahagoni mit Naturkante und Stahl",
        "description": "Ein Tisch aus Mahagoni-Bohlen mit Naturkante und Stahlgestell."
      },
      "cs": {
        "title": "Stůl z mahagonových fošen s přírodní hranou",
        "materials": "Mahagon s přírodní hranou a ocel",
        "description": "Stůl z mahagonových fošen s přírodní hranou a ocelovou podnoží."
      }
    }
  },
  {
    "id": "solid-black-walnut-dining-table",
    "slug": "solid-black-walnut-dining-table",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/signature/signature-walnut-dining-table.jpg",
    "modalImage": "/images/signature/signature-walnut-dining-table.jpg",
    "cardObjectPosition": "center 42%",
    "modalObjectPosition": "center 42%",
    "translations": {
      "en": {
        "title": "Solid Black Walnut Dining Table",
        "materials": "Solid black walnut + powder-coated steel",
        "description": "A solid black walnut dining table paired with custom powder-coated steel legs."
      },
      "de": {
        "title": "Massivholztisch aus amerikanischem Schwarznussbaum",
        "materials": "Massiver amerikanischer Schwarznussbaum und pulverbeschichteter Stahl",
        "description": "Ein Massivholztisch aus amerikanischem Schwarznussbaum mit maßgefertigten, pulverbeschichteten Stahlbeinen."
      },
      "cs": {
        "title": "Jídelní stůl z masivního amerického černého ořechu",
        "materials": "Masivní americký černý ořech a práškově lakovaná ocel",
        "description": "Jídelní stůl z masivního amerického černého ořechu s zakázkovými práškově lakovanými ocelovými nohami."
      }
    }
  },
  {
    "id": "walnut-dining-table",
    "slug": "walnut-dining-table",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/walnut-dining-table-steel-base.jpg",
    "modalImage": "/images/projects/modal/walnut-dining-table-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 55%",
    "modalObjectPosition": "center 55%",
    "translations": {
      "en": {
        "title": "Walnut Dining Table",
        "materials": "Walnut + powder-coated steel",
        "description": "A walnut dining table on powder-coated steel legs."
      },
      "de": {
        "title": "Esstisch aus Nussbaum",
        "materials": "Nussbaum und pulverbeschichteter Stahl",
        "description": "Ein Esstisch aus Nussbaum auf pulverbeschichteten Stahlbeinen."
      },
      "cs": {
        "title": "Jídelní stůl z ořechu",
        "materials": "Ořech a práškově lakovaná ocel",
        "description": "Jídelní stůl z ořechu na práškově lakovaných ocelových nohách."
      }
    }
  },
  {
    "id": "custom-knife-table-sakuro",
    "slug": "custom-knife-table-sakuro",
    "categoryIds": [
      "customPieces"
    ],
    "image": "/images/signature/signature-knife-table.jpg",
    "modalImage": "/images/signature/signature-knife-table.jpg",
    "cardObjectPosition": "center 35%",
    "modalObjectPosition": "center 35%",
    "translations": {
      "en": {
        "title": "Custom Knife Table for Sakuro.cz",
        "materials": "Dark oak + epoxy river",
        "description": "A one-of-one knife display table for Sakuro.cz with a knife and sharpening tool suspended in an epoxy river."
      },
      "de": {
        "title": "Individueller Messertisch für Sakuro.cz",
        "materials": "Dunkle Eiche und Epoxid-River",
        "description": "Ein einzigartiger Messervitrinentisch für Sakuro.cz — Messer und Schleifwerkzeug schweben in einem Epoxid-River."
      },
      "cs": {
        "title": "Zakázkový stolek na nože pro Sakuro.cz",
        "materials": "Tmavý dub a epoxidová řeka",
        "description": "Jedinečný stolek na vystavení nožů pro Sakuro.cz — nůž a brousek jsou zavěšené v epoxidové řece."
      }
    }
  },
  {
    "id": "whiskey-wednesday-serving-tray",
    "slug": "whiskey-wednesday-serving-tray",
    "categoryIds": [
      "customPieces"
    ],
    "image": "/images/signature/signature-maxs-whiskey-tray.jpg",
    "modalImage": "/images/signature/signature-maxs-whiskey-tray.jpg",
    "cardObjectPosition": "center 42%",
    "modalObjectPosition": "center 42%",
    "translations": {
      "en": {
        "title": "Whiskey Wednesday Serving Tray",
        "materials": "Custom tray for Max's Steakhouse",
        "description": "A custom serving tray made for Max's Steakhouse and its Whiskey Wednesday club."
      },
      "de": {
        "title": "Whiskey-Wednesday-Serviertablett",
        "materials": "Individuelles Tablett für Max's Steakhouse",
        "description": "Ein individuelles Serviertablett für Max's Steakhouse und den Whiskey-Wednesday-Club."
      },
      "cs": {
        "title": "Servírovací tác Whiskey Wednesday",
        "materials": "Zakázkový tác pro Max's Steakhouse",
        "description": "Zakázkový servírovací tác pro Max's Steakhouse a klub Whiskey Wednesday."
      }
    }
  },
  {
    "id": "walnut-maple-chessboard",
    "slug": "walnut-maple-chessboard",
    "categoryIds": [
      "customPieces"
    ],
    "image": "/images/signature/signature-walnut-maple-chessboard.jpg",
    "modalImage": "/images/signature/signature-walnut-maple-chessboard.jpg",
    "cardObjectPosition": "center 48%",
    "modalObjectPosition": "center 48%",
    "translations": {
      "en": {
        "title": "Walnut & Maple Chessboard",
        "materials": "Walnut + maple",
        "description": "A handcrafted walnut and maple board-game piece with contrasting hardwoods and precise grid work."
      },
      "de": {
        "title": "Schachbrett aus Nussbaum und Ahorn",
        "materials": "Nussbaum und Ahorn",
        "description": "Ein handgefertigtes Schachbrett aus Nussbaum und Ahorn mit kontrastierenden Harthölzern und präzisem Raster."
      },
      "cs": {
        "title": "Šachovnice z ořechu a javoru",
        "materials": "Ořech a javor",
        "description": "Ručně vyrobená šachovnice z ořechu a javoru s kontrastními dřevinami a přesnou mřížkou."
      }
    }
  },
  {
    "id": "american-black-walnut-coffee-table-walnut-legs",
    "slug": "american-black-walnut-coffee-table-walnut-legs",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/american-black-walnut-coffee-table-walnut-legs.jpg",
    "modalImage": "/images/projects/modal/american-black-walnut-coffee-table-walnut-legs-modal.jpg",
    "sourceIsScreenshot": true,
    "thumbnailScale": 1.45,
    "cardObjectPosition": "center 52%",
    "modalObjectPosition": "center 52%",
    "translations": {
      "en": {
        "title": "American Black Walnut Coffee Table with Walnut Legs",
        "materials": "American black walnut",
        "description": "A coffee table in American black walnut with matching walnut legs."
      },
      "de": {
        "title": "Couchtisch aus amerikanischem Schwarznussbaum mit Nussbaumbeinen",
        "materials": "Amerikanischer Schwarznussbaum",
        "description": "Ein Couchtisch aus amerikanischem Schwarznussbaum mit passenden Nussbaumbeinen."
      },
      "cs": {
        "title": "Konferenční stolek z amerického černého ořechu s ořechovými nohami",
        "materials": "Americký černý ořech",
        "description": "Konferenční stolek z amerického černého ořechu se sladěnými ořechovými nohami."
      }
    }
  },
  {
    "id": "live-edge-olive-couch-table",
    "slug": "live-edge-olive-couch-table",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/live-edge-olive-couch-table.jpg",
    "modalImage": "/images/projects/modal/live-edge-olive-couch-table-modal.jpg",
    "sourceIsScreenshot": true,
    "thumbnailScale": 1.45,
    "cardObjectPosition": "center 50%",
    "modalObjectPosition": "center 50%",
    "translations": {
      "en": {
        "title": "Live Edge Olive Couch Table with Epoxy",
        "materials": "Live-edge olive wood + epoxy + steel",
        "description": "A live-edge olive wood couch table with epoxy detail and steel."
      },
      "de": {
        "title": "Couchtisch aus Olivenholz mit Naturkante und Epoxid",
        "materials": "Olivenholz mit Naturkante, Epoxidharz und Stahl",
        "description": "Ein Couchtisch aus Olivenholz mit Naturkante, Epoxiddetail und Stahl."
      },
      "cs": {
        "title": "Konferenční stolek z olivového dřeva s přírodní hranou a epoxidem",
        "materials": "Olivové dřevo s přírodní hranou, epoxid a ocel",
        "description": "Konferenční stolek z olivového dřeva s přírodní hranou, epoxidovým detailem a ocelí."
      }
    }
  },
  {
    "id": "zebrano-side-tables",
    "slug": "zebrano-side-tables",
    "categoryIds": [
      "furniture"
    ],
    "image": "/images/gallery/past-projects/zebrano-side-tables.jpg",
    "modalImage": "/images/projects/modal/zebrano-side-tables-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 58%",
    "modalObjectPosition": "center 58%",
    "translations": {
      "en": {
        "title": "Zebrano Side Tables",
        "materials": "Zebrano + metal",
        "description": "A pair of zebrano side tables with metal bases."
      },
      "de": {
        "title": "Zebrano-Beistelltische",
        "materials": "Zebrano und Metall",
        "description": "Ein Paar Beistelltische aus Zebrano mit Metallgestell."
      },
      "cs": {
        "title": "Odkládací stolky ze zebrana",
        "materials": "Zebrano a kov",
        "description": "Dvojice odkládacích stolků ze zebrana s kovovou podnoží."
      }
    }
  },
  {
    "id": "mixed-hardwood-bottle-openers",
    "slug": "mixed-hardwood-bottle-openers",
    "categoryIds": [
      "homeAccessories"
    ],
    "image": "/images/gallery/past-projects/mixed-hardwood-bottle-openers.jpg",
    "modalImage": "/images/projects/modal/mixed-hardwood-bottle-openers-modal.jpg",
    "sourceIsScreenshot": true,
    "translations": {
      "en": {
        "title": "Mixed Hardwood Wall-Mounted Bottle Openers",
        "materials": "Mixed hardwood + metal",
        "description": "Wall-mounted bottle openers in mixed hardwoods with metal hardware."
      },
      "de": {
        "title": "Wandflaschenöffner aus gemischten Harthölzern",
        "materials": "Gemischte Harthölzer und Metall",
        "description": "Wandmontierte Flaschenöffner aus gemischten Harthölzern mit Metallbeschlägen."
      },
      "cs": {
        "title": "Nástěnné otvíráky z různých tvrdých dřev",
        "materials": "Smíšená tvrdá dřeva a kov",
        "description": "Nástěnné otvíráky lahví ze smíšených tvrdých dřev s kovovým kováním."
      }
    }
  },
  {
    "id": "walnut-maple-purpleheart-coasters",
    "slug": "walnut-maple-purpleheart-coasters",
    "categoryIds": [
      "homeAccessories"
    ],
    "image": "/images/gallery/past-projects/walnut-maple-purpleheart-coasters.jpg",
    "modalImage": "/images/projects/modal/walnut-maple-purpleheart-coasters-modal.jpg",
    "sourceIsScreenshot": true,
    "translations": {
      "en": {
        "title": "Walnut, Maple and Purpleheart Coaster Set",
        "materials": "Walnut + maple + purpleheart",
        "description": "A coaster set combining walnut, maple and purpleheart."
      },
      "de": {
        "title": "Untersetzer-Set aus Nussbaum, Ahorn und Amaranthholz",
        "materials": "Nussbaum, Ahorn und Amaranthholz",
        "description": "Ein Untersetzer-Set aus Nussbaum, Ahorn und Amaranthholz."
      },
      "cs": {
        "title": "Sada podtácků z ořechu, javoru a amarantového dřeva",
        "materials": "Ořech, javor a amarantové dřevo",
        "description": "Sada podtácků kombinující ořech, javor a amarantové dřevo."
      }
    }
  },
  {
    "id": "golf-lisnice-board",
    "slug": "golf-lisnice-board",
    "categoryIds": [
      "customPieces"
    ],
    "image": "/images/projects/golf-lisnice-board-card.jpg",
    "modalImage": "/images/projects/modal/golf-lisnice-board-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 55%",
    "modalObjectPosition": "center 55%",
    "translations": {
      "en": {
        "title": "Golf Lišnice Board with Added Golf Ball",
        "materials": "Oak",
        "description": "A custom oak board created for Golf Lišnice, finished with an added golf ball detail."
      },
      "de": {
        "title": "Golf-Lišnice-Brett mit Golfball",
        "materials": "Eiche",
        "description": "Ein individuelles Eichenbrett für Golf Lišnice mit einem eingearbeiteten Golfball-Detail."
      },
      "cs": {
        "title": "Prkénko Golf Lišnice s golfovým míčkem",
        "materials": "Dub",
        "description": "Zakázkové dubové prkénko pro Golf Lišnice s detalem golfového míčku."
      }
    }
  },
  {
    "id": "pig-roast-event-board",
    "slug": "pig-roast-event-board",
    "categoryIds": [
      "customPieces"
    ],
    "image": "/images/gallery/past-projects/pig-roast-event-board.jpg",
    "modalImage": "/images/projects/modal/pig-roast-event-board-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 55%",
    "modalObjectPosition": "center 55%",
    "translations": {
      "en": {
        "title": "Pig Roast Event Board",
        "materials": "Solid oak",
        "description": "A large solid oak serving board made for a pig roast event."
      },
      "de": {
        "title": "Event-Brett für das Schweinebraten-Fest",
        "materials": "Massive Eiche",
        "description": "Ein großes Servierbrett aus massiver Eiche für ein Schweinebraten-Event."
      },
      "cs": {
        "title": "Prkénko na pečení prasete",
        "materials": "Masivní dub",
        "description": "Velké servírovací prkénko z masivního dubu pro event pečení prasete."
      }
    }
  },
  {
    "id": "mahogany-maple-board-game",
    "slug": "mahogany-maple-board-game",
    "categoryIds": [
      "customPieces"
    ],
    "image": "/images/gallery/past-projects/mahogany-maple-board-game.jpg",
    "translations": {
      "en": {
        "title": "Mahogany and Maple Board Game",
        "materials": "Mahogany + maple",
        "description": "A handcrafted board game in mahogany and maple."
      },
      "de": {
        "title": "Brettspiel aus Mahagoni und Ahorn",
        "materials": "Mahagoni und Ahorn",
        "description": "Ein handgefertigtes Brettspiel aus Mahagoni und Ahorn."
      },
      "cs": {
        "title": "Desková hra z mahagonu a javoru",
        "materials": "Mahagon a javor",
        "description": "Ručně vyrobená desková hra z mahagonu a javoru."
      }
    }
  },
  {
    "id": "superman-epoxy-wall-art",
    "slug": "superman-epoxy-wall-art",
    "categoryIds": [
      "decor"
    ],
    "image": "/images/gallery/past-projects/superman-epoxy-wall-art.jpg",
    "modalImage": "/images/projects/modal/superman-epoxy-wall-art-modal.jpg",
    "sourceIsScreenshot": true,
    "cardObjectPosition": "center 55%",
    "modalObjectPosition": "center 55%",
    "translations": {
      "en": {
        "title": "Superman Epoxy Wall Art",
        "materials": "European walnut + epoxy resin",
        "description": "Wall art in European walnut with an epoxy Superman motif."
      },
      "de": {
        "title": "Superman-Wandkunst aus Epoxidharz",
        "materials": "Europäischer Nussbaum und Epoxidharz",
        "description": "Wandkunst aus europäischem Nussbaum mit Superman-Motiv in Epoxidharz."
      },
      "cs": {
        "title": "Nástěnná dekorace Superman z epoxidu",
        "materials": "Evropský ořech a epoxidová pryskyřice",
        "description": "Nástěnná dekorace z evropského ořechu s motivem Superman v epoxidu."
      }
    }
  }
]

const availableSlugSet = new Set(availableSlugs)
const orderIndex = Object.fromEntries(DISPLAY_ORDER.map((slug, index) => [slug, index]))

function isProjectVisible(project) {
  return Boolean(project.image) && availableSlugSet.has(project.slug)
}

function sortByDisplayOrder(projects) {
  return [...projects].sort((left, right) => {
    const leftIndex = orderIndex[left.slug] ?? Number.MAX_SAFE_INTEGER
    const rightIndex = orderIndex[right.slug] ?? Number.MAX_SAFE_INTEGER
    return leftIndex - rightIndex
  })
}

export function localizeGalleryProject(project, locale = 'en') {
  const loc = locale === 'de' || locale === 'cs' ? locale : 'en'
  const copy = project.translations?.[loc] || project.translations?.en || {}
  const categoryIds = project.categoryIds || []
  return {
    ...project,
    name: copy.title || project.id,
    title: copy.title || project.id,
    material: copy.materials || '',
    materials: copy.materials || '',
    description: copy.description || '',
    categoryIds,
    categories: categoryIds.map((id) => legacyCategoryLabel(id)),
    category: legacyCategoryLabel(categoryIds[0] || 'furniture'),
  }
}

function legacyCategoryLabel(id) {
  const map = {
    all: 'All',
    furniture: 'Furniture',
    customPieces: 'Custom Pieces',
    homeAccessories: 'Home Accessories',
    decor: 'Decor',
  }
  return map[id] || 'Furniture'
}

export function getVisibleGalleryProjects(locale = 'en') {
  return sortByDisplayOrder(pastProjectsCatalog.filter(isProjectVisible)).map((project) =>
    localizeGalleryProject(project, locale),
  )
}

export function getPastProjectBySlug(slug, locale = 'en') {
  return getVisibleGalleryProjects(locale).find((project) => project.slug === slug)
}
