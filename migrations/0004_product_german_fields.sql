-- German website-managed catalogue fields (Phase 1 i18n).
-- Etsy sync must NOT overwrite these columns.

ALTER TABLE etsy_products ADD COLUMN custom_title_de TEXT;
ALTER TABLE etsy_products ADD COLUMN custom_description_de TEXT;
ALTER TABLE etsy_products ADD COLUMN seo_title_de TEXT;
ALTER TABLE etsy_products ADD COLUMN seo_description_de TEXT;
