// CR-005: Server-side signup gate — validates email domain before creating account.
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAllowedDomain } from "@/lib/auth/domain-allowlist";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 }
    );
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let allowed: boolean;
  try {
    allowed = await isAllowedDomain(email, supabase);
  } catch {
    return NextResponse.json(
      { error: "Unable to verify email domain. Please try again." },
      { status: 500 }
    );
  }

  if (!allowed) {
    return NextResponse.json(
      { error: "This email domain is not authorised. Please use your work email address." },
      { status: 403 }
    );
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
