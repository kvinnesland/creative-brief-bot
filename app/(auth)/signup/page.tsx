"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client created inside handler so it is never called during SSR pre-rendering.
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/sessions");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--color-bg-app)" }}
    >
      <div
        className="w-full max-w-[420px] rounded-3xl p-8"
        style={{
          backgroundColor: "var(--color-surface-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="mb-8">
          <h1
            className="text-[28px] font-[650] leading-9 tracking-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            Creative Brief
          </h1>
          <p className="mt-1 text-[15px]" style={{ color: "var(--color-text-secondary)" }}>
            Create your account
          </p>
        </div>

        <form onSubmit={handleSignup} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-11 rounded-xl px-4 text-[15px] outline-none transition-colors"
            style={{
              border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
              backgroundColor: "var(--color-surface-primary)",
              color: "var(--color-text-primary)",
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="h-11 rounded-xl px-4 text-[15px] outline-none transition-colors"
            style={{
              border: `1px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
              backgroundColor: "var(--color-surface-primary)",
              color: "var(--color-text-primary)",
            }}
          />

          {error && (
            <p className="text-[13px]" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-1 h-11 rounded-full text-[14px] font-semibold transition-colors disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-accent)",
              color: "var(--color-text-inverted)",
            }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p
          className="mt-6 text-center text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
