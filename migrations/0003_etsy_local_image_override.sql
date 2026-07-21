-- Explicit website image override.
-- 0 = Etsy images first (default)
-- 1 = use local_images_json instead

ALTER TABLE etsy_products
ADD COLUMN website_use_local_images INTEGER NOT NULL DEFAULT 0;
