"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magicEmail, setMagicEmail] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client created inside handlers so it is never called during SSR pre-rendering.
  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/sessions");
    router.refresh();
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: magicEmail,
      options: { emailRedirectTo: `${window.location.origin}/sessions` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setMagicSent(true);
    setLoading(false);
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
            Sign in to your account
          </p>
        </div>

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-3">
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
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        ) : magicSent ? (
          <div
            className="rounded-xl p-4 text-[14px]"
            style={{
              backgroundColor: "var(--color-accent-soft)",
              color: "var(--color-accent)",
            }}
          >
            Check your email — we sent a sign-in link to{" "}
            <strong>{magicEmail}</strong>.
          </div>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              placeholder="Email"
              value={magicEmail}
              onChange={(e) => setMagicEmail(e.target.value)}
              required
              className="h-11 rounded-xl px-4 text-[15px] outline-none transition-colors"
              style={{
                border: "1px solid var(--color-border)",
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
              {loading ? "Sending…" : "Send magic link"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <div
            className="border-t pt-4 text-center text-[13px]"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
          >
            {mode === "password" ? (
              <button
                onClick={() => { setMode("magic"); setError(null); }}
                className="underline underline-offset-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Sign in with magic link instead
              </button>
            ) : (
              <button
                onClick={() => { setMode("password"); setError(null); setMagicSent(false); }}
                className="underline underline-offset-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Sign in with password instead
              </button>
            )}
          </div>

          <p
            className="text-center text-[13px]"
            style={{ color: "var(--color-text-muted)" }}
          >
            No account?{" "}
            <Link
              href="/signup"
              className="underline underline-offset-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
