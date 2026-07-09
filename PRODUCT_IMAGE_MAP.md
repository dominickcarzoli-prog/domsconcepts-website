# Dom's Concepts — Product Image Map

**Do not create new product image folders unless the product is added to `src/data/products.ts`.**

## Rules

- Product **id**, URL slug, and image **folder name** must match exactly.
- Upload photos into `public/images/products/{product.id}/`
- Use lowercase filenames: `01.jpg` through `08.jpg`
- Missing images show a “Photo coming soon” placeholder on the site.
- Do not delete images — move unused folders to `_archive/` or `_future/` instead.

## Active products (upload here)

These folders live directly under `public/images/products/`:

| Product name | Folder / product id |
|---|---|
| 2-in-1 Book Stand & Serving Board – Black Walnut, Maple and Mahogany | `two-in-one-book-stand-serving-board` |
| American Black Walnut, Oak, Maple & Padouk Cutting Board | `american-black-walnut-oak-maple-padouk-cutting-board` |
| American Walnut, Maple & Padouk/Mahogany Cutting Board | `american-walnut-maple-padouk-cutting-board` |
| Beeswax Wood Wax: Natural Wood Conditioner & Board Butter | `beeswax-wood-wax-natural-wood-conditioner` |
| European Oak & Lux Blue Epoxy Resin Serving Board | `european-oak-lux-blue-epoxy-serving-board` |
| European Walnut with Aztec Gold Epoxy Serving Board | `european-walnut-aztec-gold-epoxy-serving-board` |
| Handcrafted Oak Clock with Stormy Grey Epoxy Accents | `handcrafted-oak-clock-stormy-grey-epoxy` |
| Handcrafted Oak Cutting Board – Small Set | `handcrafted-oak-cutting-board-small-set` |
| Handmade Black Walnut & Maple End Grain Cutting Board | `handmade-black-walnut-maple-end-grain-cutting-board` |
| Handmade End Grain Walnut Breadboard | `handmade-end-grain-walnut-breadboard` |
| Handmade Oak & Epoxy LEGO Brick Serving Board | `handmade-oak-epoxy-lego-brick-serving-board` |
| Handmade Oak End Grain Cutting Board | `handmade-oak-end-grain-cutting-board` |
| Handmade Solid Oak Cutting Board | `handmade-solid-oak-cutting-board` |
| Handmade Walnut Steak Board with Two Cups | `handmade-walnut-steak-board-two-cups` |
| Maple with Blue Epoxy Coasters | `maple-blue-epoxy-coasters` |
| Natural Wood Butter: Beeswax Wood Finish Conditioner | `natural-wood-butter-beeswax` |
| Oak Cutting Board / Breadboard with Black Lines | `oak-cutting-board-breadboard-black-lines` |
| Oak, Maple & Mahogany Strip Cutting Board | `oak-maple-mahogany-strip-cutting-board` |
| Solid Oak Coat Hanger with Black Metal Hooks | `solid-oak-coat-hanger-black-metal-hooks` |
| Walnut Live Edge Charcuterie Board | `walnut-live-edge-charcuterie-board` |
| Walnut Wall Mount Bottle Opener | `walnut-wall-mount-bottle-opener` |
| Walnut & Maple Wall Mount Bottle Opener | `walnut-maple-wall-mount-bottle-opener` |

### Example

**Handmade Walnut Steak Board with Two Cups**

- Folder: `public/images/products/handmade-walnut-steak-board-two-cups/`
- Images: `01.jpg`, `02.jpg`, `03.jpg`, `04.jpg`, `05.jpg`, `06.jpg`, `07.jpg`, `08.jpg`
- URL: `/available-pieces/handmade-walnut-steak-board-two-cups`

## Made-to-order / future products (`_future/`)

Still listed on the site but photos are stored here until promoted to an active folder:

| Product name | Reference folder |
|---|---|
| Corporate Gift Boards | `public/images/products/_future/corporate-gift-boards/` |
| Custom Logo Board | `public/images/products/_future/custom-logo-board/` |
| Edge Grain Cutting Board | `public/images/products/_future/edge-grain-cutting-board/` |
| Handmade Oak End Grain Cutting Board — Made to Order | `public/images/products/_future/oak-end-grain-cutting-board-made-to-order/` |
| Restaurant Boards | `public/images/products/_future/restaurant-boards/` |

To go live: move the folder from `_future/` to `public/images/products/{product.id}/`.

## Archived samples (`_archive/`)

Old sample / duplicate folders — not linked from `products.ts`:

- `breadboard-set`
- `epoxy-serving-board`
- `serving-board`
- `wood-butter` (superseded by `natural-wood-butter-beeswax`)
