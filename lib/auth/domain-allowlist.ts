// CR-005: Domain allowlist — queries allowed_domains table via service role client.
import type { SupabaseClient } from "@supabase/supabase-js";

export function extractDomain(email: string): string | null {
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return null;
  return email.slice(at + 1).toLowerCase();
}

export async function isAllowedDomain(
  email: string,
  supabase: SupabaseClient
): Promise<boolean> {
  const domain = extractDomain(email);
  if (!domain) return false;

  const { data, error } = await supabase
    .from("allowed_domains")
    .select("id")
    .eq("domain", domain)
    .maybeSingle();

  if (error) throw error;
  return data !== null;
}
