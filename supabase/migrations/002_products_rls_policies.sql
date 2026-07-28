-- RLS policies for products table
-- Run in Supabase SQL Editor after 001_create_products_table.sql

-- ---------------------------------------------------------------------------
-- Public (anonymous) users: READ active, non-deleted products only
-- ---------------------------------------------------------------------------
CREATE POLICY "Anon users can view active products"
ON public.products
FOR SELECT
TO anon
USING (status = 'active' AND "delete" = false);

-- ---------------------------------------------------------------------------
-- Authenticated users: full CRUD
-- ---------------------------------------------------------------------------
CREATE POLICY "Authenticated users can view products"
ON public.products
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (auth.uid() IS NOT NULL);
