-- Multiple product image URLs (gallery)
-- Run in Supabase SQL Editor

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Backfill existing rows from single image_url
UPDATE public.products
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND btrim(image_url) <> ''
  AND cardinality(image_urls) = 0;

-- Keep image_url in sync as the primary thumbnail
UPDATE public.products
SET image_url = image_urls[1]
WHERE cardinality(image_urls) > 0
  AND (image_url IS NULL OR btrim(image_url) = '');
