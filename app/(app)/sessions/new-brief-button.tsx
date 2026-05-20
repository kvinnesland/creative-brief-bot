"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBriefButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create session");
      const session = await res.json();
      router.push(`/sessions/${session.id}`);
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: "40px",
        borderRadius: "999px",
        padding: "0 20px",
        fontSize: "13px",
        fontWeight: 600,
        letterSpacing: "0.01em",
        border: "none",
        cursor: loading ? "default" : "pointer",
        background: hovered && !loading ? "var(--accent-hover)" : "var(--accent-primary)",
        color: "#111111",
        opacity: loading ? 0.6 : 1,
        transition: "background 180ms ease, box-shadow 180ms ease",
        boxShadow: hovered && !loading ? "0 0 20px rgba(212,175,55,0.28)" : "none",
      }}
    >
      {loading ? "Oppretter…" : "Ny brief"}
    </button>
  );
}
