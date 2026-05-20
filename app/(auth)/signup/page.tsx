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

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Signup failed. Please try again.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/sessions");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Wordmark */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "13px",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--accent-primary)",
              marginBottom: "20px",
              fontWeight: 500,
            }}
          >
            Creative Brief
          </p>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "34px",
              fontWeight: 500,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Begin here.
          </h1>
          <p
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: 1.6,
            }}
          >
            Create your account to get started.
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "var(--surface-primary)",
            border: "1px solid var(--border-subtle)",
            borderRadius: "20px",
            padding: "32px",
          }}
        >
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <AuthInput
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              hasError={!!error}
              required
            />
            <AuthInput
              type="password"
              placeholder="Password (8+ characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              hasError={!!error}
              required
              minLength={8}
            />

            {error && (
              <p style={{ fontSize: "13px", color: "var(--color-error)", marginTop: "2px" }}>
                {error}
              </p>
            )}

            <PrimaryButton type="submit" disabled={loading} style={{ marginTop: "4px" }}>
              {loading ? "Creating account…" : "Create account"}
            </PrimaryButton>
          </form>

          <div
            style={{
              borderTop: "1px solid var(--border-subtle)",
              margin: "24px 0",
            }}
          />

          <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 500 }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthInput({
  type,
  placeholder,
  value,
  onChange,
  hasError,
  required,
  minLength,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean;
  required?: boolean;
  minLength?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      minLength={minLength}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        height: "46px",
        borderRadius: "12px",
        padding: "0 16px",
        fontSize: "14px",
        outline: "none",
        width: "100%",
        transition: "border-color 180ms ease, box-shadow 180ms ease",
        background: "rgba(255,255,255,0.03)",
        color: "var(--text-primary)",
        border: `1px solid ${hasError ? "var(--color-error)" : focused ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        boxShadow: focused && !hasError ? "0 0 0 3px rgba(212,175,55,0.12)" : "none",
      }}
    />
  );
}

function PrimaryButton({
  children,
  type,
  disabled,
  style,
}: {
  children: React.ReactNode;
  type?: "submit" | "button";
  disabled?: boolean;
  style?: React.CSSProperties;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type={type}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: "46px",
        borderRadius: "999px",
        background: hovered && !disabled ? "var(--accent-hover)" : "var(--accent-primary)",
        color: "#111111",
        border: "none",
        fontSize: "14px",
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "background 180ms ease, box-shadow 180ms ease",
        boxShadow: hovered && !disabled ? "0 0 24px rgba(212,175,55,0.3)" : "none",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
