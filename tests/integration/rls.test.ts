// CR-001: Integration test — RLS isolation.
// Requires SUPABASE_TEST_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
// Skip locally unless a test Supabase project is configured.
//
// To run: SUPABASE_TEST_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run test:integration

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "@supabase/supabase-js";

const SKIP = !process.env.SUPABASE_TEST_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;

describe.skipIf(SKIP)("RLS isolation", () => {
  // Use service role client to set up test data (bypasses RLS)
  const admin = createClient(
    process.env.SUPABASE_TEST_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let userAId: string;
  let userBId: string;
  let sessionAId: string;

  beforeAll(async () => {
    // Create two test users via admin
    const { data: a } = await admin.auth.admin.createUser({
      email: `test-a-${Date.now()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
    });
    const { data: b } = await admin.auth.admin.createUser({
      email: `test-b-${Date.now()}@example.com`,
      password: "testpassword123",
      email_confirm: true,
    });
    userAId = a.user!.id;
    userBId = b.user!.id;

    // Create a session for user A via admin (bypasses RLS)
    const { data: session } = await admin
      .from("brief_sessions")
      .insert({ user_id: userAId, status: "in_progress" })
      .select()
      .single();
    sessionAId = session!.id;
  });

  afterAll(async () => {
    // Clean up test users (cascades to sessions)
    await admin.auth.admin.deleteUser(userAId);
    await admin.auth.admin.deleteUser(userBId);
  });

  it("User B cannot read User A's session", async () => {
    // Sign in as user B
    const clientB = createClient(
      process.env.SUPABASE_TEST_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_TEST_URL!
    );
    await clientB.auth.signInWithPassword({
      email: `test-b-${Date.now()}@example.com`,
      password: "testpassword123",
    });

    const { data, error } = await clientB
      .from("brief_sessions")
      .select()
      .eq("id", sessionAId)
      .single();

    // RLS should return null/empty, not the row
    expect(data).toBeNull();
  });
});
