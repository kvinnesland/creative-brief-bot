// CR-005: Unit tests for domain allowlist helpers.

import { describe, it, expect } from "vitest";
import { extractDomain, isAllowedDomain } from "@/lib/auth/domain-allowlist";
import type { SupabaseClient } from "@supabase/supabase-js";

function mockSupabase(row: { id: string } | null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: row, error: null }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

describe("extractDomain", () => {
  it("extracts domain from a valid email", () => {
    expect(extractDomain("user@bas.no")).toBe("bas.no");
  });

  it("lowercases the domain", () => {
    expect(extractDomain("user@BAS.NO")).toBe("bas.no");
  });

  it("returns null when there is no @", () => {
    expect(extractDomain("notanemail")).toBeNull();
  });

  it("returns null when @ is the last character", () => {
    expect(extractDomain("user@")).toBeNull();
  });

  it("returns null when @ is the first character", () => {
    expect(extractDomain("@bas.no")).toBeNull();
  });
});

describe("isAllowedDomain", () => {
  it("returns true when domain is in the allowlist", async () => {
    const supabase = mockSupabase({ id: "abc" });
    expect(await isAllowedDomain("user@bas.no", supabase)).toBe(true);
  });

  it("returns false when domain is not in the allowlist", async () => {
    const supabase = mockSupabase(null);
    expect(await isAllowedDomain("user@gmail.com", supabase)).toBe(false);
  });

  it("returns false for a malformed email with no @", async () => {
    const supabase = mockSupabase(null);
    expect(await isAllowedDomain("notanemail", supabase)).toBe(false);
  });
});
