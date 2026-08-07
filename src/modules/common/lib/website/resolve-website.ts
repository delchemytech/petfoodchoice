import { headers } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, WebsiteRow } from "@/modules/common/types/database";

export function normalizeDomain(host: string): string {
  return host.split(":")[0].toLowerCase();
}

export async function getRequestDomain(): Promise<string> {
  const headerStore = await headers();
  const host =
    headerStore.get("x-forwarded-host") ??
    headerStore.get("host") ??
    "localhost";

  return normalizeDomain(host);
}

function getDomainCandidates(domain: string): string[] {
  const normalized = normalizeDomain(domain);
  const candidates = new Set<string>([normalized]);

  if (normalized.startsWith("www.")) {
    candidates.add(normalized.slice(4));
  } else {
    candidates.add(`www.${normalized}`);
  }

  return [...candidates];
}

export async function resolveWebsiteByDomain(
  supabase: SupabaseClient<Database>,
  domain: string,
): Promise<WebsiteRow | null> {
  for (const candidate of getDomainCandidates(domain)) {
    const { data, error } = await supabase
      .from("websites")
      .select("*")
      .eq("domain", candidate)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (data) {
      return data as WebsiteRow;
    }
  }

  return null;
}

export async function resolveWebsiteId(
  supabase: SupabaseClient<Database>,
): Promise<string> {
  const domain = await getRequestDomain();
  const website = await resolveWebsiteByDomain(supabase, domain);

  if (!website) {
    throw new Error(
      `No website found for domain "${domain}". Add a row in the websites table with this domain.`,
    );
  }

  return website.id;
}
