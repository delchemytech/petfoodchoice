-- Products table for affiliate store admin
-- Run this in Supabase SQL Editor or via Supabase CLI

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_url TEXT NOT NULL,
  image_url TEXT,
  name TEXT NOT NULL,
  brand TEXT,
  store TEXT NOT NULL,
  category TEXT NOT NULL,
  current_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  original_price NUMERIC(12, 2),
  discount_percentage NUMERIC(5, 2) DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  rating NUMERIC(3, 2),
  total_reviews INTEGER DEFAULT 0,
  short_description TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  "delete" BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS products_delete_idx ON public.products ("delete");
CREATE INDEX IF NOT EXISTS products_status_idx ON public.products (status);
CREATE INDEX IF NOT EXISTS products_store_idx ON public.products (store);
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products (category);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products (created_at DESC);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_set_updated_at ON public.products;

CREATE TRIGGER products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read for active products (storefront — enable when needed)
-- CREATE POLICY "Public can read active products"
-- ON public.products
-- FOR SELECT
-- USING (status = 'active');

-- Authenticated admin writes use the anon key with a logged-in user session.
-- Add authenticated admin policies when auth is implemented.
