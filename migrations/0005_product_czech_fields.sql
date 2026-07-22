-- Czech website-managed catalogue fields (Phase 1 i18n).
-- Etsy sync must NOT overwrite these columns.
-- German fields were added in 0004_product_german_fields.sql.

ALTER TABLE etsy_products ADD COLUMN custom_title_cs TEXT;
ALTER TABLE etsy_products ADD COLUMN custom_description_cs TEXT;
ALTER TABLE etsy_products ADD COLUMN seo_title_cs TEXT;
ALTER TABLE etsy_products ADD COLUMN seo_description_cs TEXT;
