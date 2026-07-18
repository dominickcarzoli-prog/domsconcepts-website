# Dom's Concepts — Product Image Map

**Do not create new product image folders unless the product is added to `src/data/products.ts`.**

## Rules

- Product **id** / URL **slug** stay stable (public URLs do not change).
- Image folders live under `public/images/products/{imageFolder}/` and may be nested by category.
- Map id → folder in `productImageFolders` inside `src/data/products.ts`.
- Use numbered filenames: `01.jpg` (also `.jpeg` / `.png` / `.webp`).
- Missing images show a “Photo coming soon” placeholder on the site.
- Do not delete images until migration is verified — move unused folders to `_archive/` or `_future/` instead.

## Category layout

```
public/images/products/
├── oak/
├── walnut/
├── epoxy/
├── wood-care/
├── specialties/
├── _archive/
└── _future/
```

## Active products (upload here)

| Product name | Product id (URL slug) | Image folder |
|---|---|---|
| Handmade Solid Oak Cutting Board | `handmade-solid-oak-cutting-board` | `oak/solid-oak-cutting-board` |
| Handmade Oak End Grain Cutting Board | `handmade-oak-end-grain-cutting-board` | `oak/oak-end-grain-cutting-board` |
| Oak Cutting Board / Breadboard with Black Lines | `oak-cutting-board-breadboard-black-lines` | `oak/oak-breadboard-black-lines` |
| Oak, Maple & Mahogany Strip Cutting Board | `oak-maple-mahogany-strip-cutting-board` | `oak/oak-maple-mahogany-strip` |
| Handmade End Grain Walnut Breadboard | `handmade-end-grain-walnut-breadboard` | `walnut/end-grain-walnut-breadboard` |
| American Black Walnut & Maple End Grain Cutting Board | `handmade-black-walnut-maple-end-grain-cutting-board` | `walnut/black-walnut-maple-end-grain` |
| American Walnut, Maple & Padouk/Mahogany Cutting Board | `american-walnut-maple-padouk-cutting-board` | `walnut/walnut-maple-padouk` |
| American Black Walnut, Oak, Maple & Padouk Cutting Board | `american-black-walnut-oak-maple-padouk-cutting-board` | `walnut/walnut-oak-maple-padouk` |
| European Oak & Lux Blue Epoxy Resin Serving Board | `european-oak-lux-blue-epoxy-serving-board` | `epoxy/oak-lux-blue-epoxy` |
| European Walnut with Aztec Gold Epoxy Serving Board | `european-walnut-aztec-gold-epoxy-serving-board` | `epoxy/walnut-aztec-gold-epoxy` |
| Handmade Oak & Epoxy LEGO Brick Serving Board | `handmade-oak-epoxy-lego-brick-serving-board` | `epoxy/oak-epoxy-lego-brick` |
| Walnut Live Edge Charcuterie Board | `walnut-live-edge-charcuterie-board` | `epoxy/walnut-live-edge-charcuterie` |
| Natural Wood Butter: Beeswax Wood Finish Conditioner | `natural-wood-butter-beeswax` | `wood-care/natural-wood-butter` |
| Beeswax Wood Wax: Natural Wood Conditioner & Board Butter | `beeswax-wood-wax-natural-wood-conditioner` | `wood-care/beeswax-wood-wax` |
| Solid Oak Coat Hanger with Black Metal Hooks | `solid-oak-coat-hanger-black-metal-hooks` | `specialties/solid-oak-coat-hanger` |
| Walnut Wall Mount Bottle Opener | `walnut-wall-mount-bottle-opener` | `specialties/walnut-bottle-opener` |
| Walnut & Maple Wall Mount Bottle Opener | `walnut-maple-wall-mount-bottle-opener` | `specialties/walnut-maple-bottle-opener` |
| Maple with Blue Epoxy Coasters | `maple-blue-epoxy-coasters` | `specialties/maple-blue-epoxy-coasters` |
| Handmade Walnut Steak Board with Two Cups | `handmade-walnut-steak-board-two-cups` | `specialties/walnut-steak-board-two-cups` |
| 2-in-1 Book Stand & Serving Board – Black Walnut, Maple and Mahogany | `two-in-one-book-stand-serving-board` | `specialties/book-stand-serving-board` |
| Handcrafted Oak Clock with Stormy Grey Epoxy Accents | `handcrafted-oak-clock-stormy-grey-epoxy` | `specialties/oak-clock-stormy-grey` |

### Example

**Handmade Walnut Steak Board with Two Cups**

- Folder: `public/images/products/specialties/walnut-steak-board-two-cups/`
- Images: `01.jpg`, `02.jpg`, …
- URL (unchanged): `/available-pieces/handmade-walnut-steak-board-two-cups`

## Made-to-order / future products (`_future/`)

Still listed on the site but photos are stored here until promoted:

| Product name | Reference folder |
|---|---|
| Corporate Gift Boards | `public/images/products/_future/corporate-gift-boards/` |
| Custom Logo Board | `public/images/products/_future/custom-logo-board/` |
| Edge Grain Cutting Board | `public/images/products/_future/edge-grain-cutting-board/` |
| Handmade Oak End Grain Cutting Board — Made to Order | `public/images/products/_future/oak-end-grain-cutting-board-made-to-order/` |
| Restaurant Boards | `public/images/products/_future/restaurant-boards/` |

## Archived samples (`_archive/`)

Old sample / duplicate folders — not linked from active nested paths:

- `breadboard-set`
- `epoxy-serving-board`
- `serving-board`
- `wood-butter` (superseded by `wood-care/natural-wood-butter`)
