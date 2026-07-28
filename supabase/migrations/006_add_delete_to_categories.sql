-- Soft delete support for categories table
-- Run in Supabase SQL Editor

ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS "delete" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS categories_delete_idx ON public.categories ("delete");

-- Only expose non-deleted categories to public reads
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;

CREATE POLICY "Anyone can view active categories"
ON public.categories
FOR SELECT
TO anon, authenticated
USING ("delete" = false);

CREATE POLICY "Admins can view all categories"
ON public.categories
FOR SELECT
TO authenticated
USING (public.is_admin());
