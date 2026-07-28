"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/modules/common/lib/supabase/server";

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
