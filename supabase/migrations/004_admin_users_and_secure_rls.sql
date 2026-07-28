-- Admin users whitelist and secure product RLS
-- Run in Supabase SQL Editor after 002_products_rls_policies.sql

-- ---------------------------------------------------------------------------
-- Admin users table (whitelist)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read own admin row"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- Helper: only whitelisted admins
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- Replace broad authenticated policies with admin-only policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

CREATE POLICY "Admins can view products"
ON public.products
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- After creating your first auth user in Supabase Dashboard, run:
--
-- INSERT INTO public.admin_users (id, email)
-- VALUES ('YOUR_USER_UUID', 'admin@example.com');
-- ---------------------------------------------------------------------------
