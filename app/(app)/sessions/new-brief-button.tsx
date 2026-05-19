"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBriefButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
      className="h-11 rounded-full px-5 text-[14px] font-semibold transition-colors disabled:opacity-50"
      style={{
        backgroundColor: "var(--color-accent)",
        color: "var(--color-text-inverted)",
      }}
    >
      {loading ? "Creating…" : "New Brief"}
    </button>
  );
}
