-- Add soft delete support to products table
-- Run in Supabase SQL Editor if the table already exists

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS "delete" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS products_delete_idx ON public.products ("delete");
