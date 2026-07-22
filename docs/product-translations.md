# Product translations (EN / DE / CS)

Website-owned German and Czech product copy is stored in D1 and edited manually.
There is no paid translation API and no runtime AI translation.

Translations are stored on the website and are never overwritten by Etsy sync.

## Fields

- `custom_title_de` / `custom_description_de`
- `seo_title_de` / `seo_description_de`
- `custom_title_cs` / `custom_description_cs`
- `seo_title_cs` / `seo_description_cs`

Public pages fall back to English when a locale field is empty.

## New product workflow

1. Create or update the listing on Etsy.
2. Run Etsy catalogue sync.
3. Approve / show the item in `/admin/catalogue`.
4. Add German and Czech title and description (admin editor or JSON import).
5. Save.
6. Verify `/de/available-pieces/…` and `/cs/available-pieces/…`.

## Export template

```bash
node scripts/export-product-translation-template.mjs --remote
```

Writes `data/product-translation-template.json` with approved products:

- `listing_id`
- `english_title`
- `english_description`
- current German and Czech fields

## Import translations

Edit a copy as `data/product-translations.json`:

```json
[
  {
    "listing_id": "123456789",
    "custom_title_de": "…",
    "custom_description_de": "…",
    "custom_title_cs": "…",
    "custom_description_cs": "…",
    "seo_title_de": "…",
    "seo_description_de": "…",
    "seo_title_cs": "…",
    "seo_description_cs": "…"
  }
]
```

Dry run (no writes):

```bash
node scripts/import-product-translations.mjs --dry-run --remote
```

Import (preserves existing non-empty translations):

```bash
node scripts/import-product-translations.mjs --remote
```

Overwrite existing translation fields from the file:

```bash
node scripts/import-product-translations.mjs --remote --overwrite
```

Import only updates translation columns. It never changes images, price, inventory, approval, visibility, slug, or Etsy fields. Missing `listing_id` values are skipped and counted.
