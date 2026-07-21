-- Etsy catalogue sync tables (read-only listing mirror + sync run log).
-- Shop ID cache is a single-row table (id must always be 1).

CREATE TABLE etsy_shop_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  shop_id TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE etsy_products (
  listing_id INTEGER PRIMARY KEY,
  etsy_url TEXT NOT NULL,
  etsy_state TEXT NOT NULL,
  website_status TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price_amount INTEGER,
  price_divisor INTEGER,
  price_currency TEXT,
  quantity INTEGER DEFAULT 0,
  primary_image_url TEXT,
  image_urls_json TEXT,
  inventory_json TEXT,
  etsy_updated_at INTEGER,
  synced_at INTEGER NOT NULL,
  website_category TEXT,
  website_featured INTEGER DEFAULT 0,
  website_hidden INTEGER DEFAULT 1,
  website_approved INTEGER DEFAULT 0,
  custom_title TEXT,
  custom_description TEXT,
  local_images_json TEXT,
  slug TEXT UNIQUE
);

CREATE TABLE etsy_sync_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at INTEGER NOT NULL,
  finished_at INTEGER,
  status TEXT NOT NULL,
  listings_found INTEGER NOT NULL DEFAULT 0,
  listings_created INTEGER NOT NULL DEFAULT 0,
  listings_updated INTEGER NOT NULL DEFAULT 0,
  error_message TEXT
);
