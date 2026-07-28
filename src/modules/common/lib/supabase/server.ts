import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { assertSupabaseConfigured } from "./env";

/**
 * Cookie-aware Supabase client for authenticated admin requests.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export async function createSupabaseServerClient() {
  const { url, anonKey } = assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll can fail in Server Components; middleware refreshes sessions.
        }
      },
    },
  });
}

/**
 * Anonymous server client for public storefront reads.
 * Always uses the anon role so catalog queries stay consistent.
 */
export function createSupabaseAnonServerClient() {
  const { url, anonKey } = assertSupabaseConfigured();

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
