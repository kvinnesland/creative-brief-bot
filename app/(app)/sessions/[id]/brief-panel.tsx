"use client";

import { useState } from "react";
import type { BriefState } from "@/lib/types/entities";

interface Props {
  sessionId: string;
  briefState: BriefState | null;
}

const SECTIONS: { label: string; key: keyof BriefState }[] = [
  { label: "Business goal",    key: "business_goal" },
  { label: "Target audience",  key: "target_audience" },
  { label: "Core message",     key: "core_message" },
  { label: "Tone of voice",    key: "tone_of_voice" },
  { label: "Visual direction", key: "visual_direction" },
];

export function BriefPanel({ sessionId, briefState }: Props) {
  const [exporting, setExporting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const confidence = briefState?.confidence_scores as Record<string, number> | null;

  const deliverables = briefState?.deliverables ?? [];
  const constraints = briefState?.constraints ?? [];
  const openQuestions = briefState?.open_questions ?? [];

  const totalFilled =
    SECTIONS.filter(({ key }) => briefState?.[key] != null).length +
    (deliverables.length > 0 ? 1 : 0) +
    (constraints.length > 0 ? 1 : 0);

  const completionPct = Math.round((totalFilled / 7) * 100);
  const canExport = totalFilled > 0;

  async function handleShare() {
    if (!canExport || sharing) return;
    setSharing(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/share`, { method: "POST" });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Silent — user can retry.
    } finally {
      setSharing(false);
    }
  }

  async function handleExport() {
    if (!canExport || exporting) return;
    setExporting(true);
    try {
      const res = await fetch(`/api/sessions/${sessionId}/export/pdf`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? "creative-brief.pdf";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Silent — export is non-critical.
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      {/* Header */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Brief Progress
          </p>
          <span
            style={{
              fontSize: "11px",
              color: completionPct > 0 ? "var(--accent-primary)" : "var(--text-muted)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {completionPct}%
          </span>
        </div>

        {/* Progress bar — thin, elegant */}
        <div
          style={{
            height: "2px",
            background: "var(--border-subtle)",
            borderRadius: "1px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${completionPct}%`,
              background: completionPct === 100
                ? "linear-gradient(90deg, var(--accent-primary), var(--accent-hover))"
                : "var(--accent-primary)",
              borderRadius: "1px",
              transition: "width 600ms cubic-bezier(0.16, 1, 0.3, 1)",
              boxShadow: completionPct > 0 ? "0 0 8px rgba(212,175,55,0.4)" : "none",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "0",
        }}
      >
        {SECTIONS.map(({ label, key }, index) => {
          const value = briefState?.[key] as string | null | undefined;
          const conf = confidence?.[key as string] ?? 0;
          const isLast = index === SECTIONS.length - 1 && deliverables.length === 0 && constraints.length === 0 && openQuestions.length === 0;

          return (
            <BriefSection
              key={key as string}
              label={label}
              value={value}
              confidence={conf}
              isLast={isLast}
            />
          );
        })}

        {deliverables.length > 0 && (
          <ListSection
            label="Deliverables"
            items={deliverables}
            isLast={constraints.length === 0 && openQuestions.length === 0}
          />
        )}

        {constraints.length > 0 && (
          <ListSection
            label="Constraints"
            items={constraints}
            isLast={openQuestions.length === 0}
          />
        )}

        {openQuestions.length > 0 && (
          <ListSection
            label="Open questions"
            items={openQuestions}
            isLast
            accent="warning"
          />
        )}

        {!briefState && (
          <div
            style={{
              padding: "24px 0",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: "14px",
                color: "var(--text-muted)",
                lineHeight: 1.6,
                fontStyle: "italic",
              }}
            >
              The brief will take shape as your conversation unfolds.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid var(--border-subtle)",
          flexShrink: 0,
          display: "flex",
          gap: "8px",
        }}
      >
        <OutlineButton
          onClick={handleShare}
          disabled={!canExport || sharing}
        >
          {copied ? "Copied!" : sharing ? "Sharing…" : "Share"}
        </OutlineButton>
        <PrimaryButton
          onClick={handleExport}
          disabled={!canExport || exporting}
        >
          {exporting ? "Exporting…" : "Export"}
        </PrimaryButton>
      </div>
    </>
  );
}

function BriefSection({
  label,
  value,
  confidence,
  isLast,
}: {
  label: string;
  value?: string | null;
  confidence: number;
  isLast?: boolean;
}) {
  return (
    <div
      style={{
        paddingTop: "14px",
        paddingBottom: "14px",
        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: value ? "var(--text-muted)" : "rgba(122,122,120,0.5)",
          }}
        >
          {label}
        </p>
        {confidence > 0 && (
          <span
            style={{
              fontSize: "10px",
              color: "var(--accent-primary)",
              fontWeight: 600,
              letterSpacing: "0.04em",
              opacity: 0.8,
            }}
          >
            {Math.round(confidence * 100)}%
          </span>
        )}
      </div>

      {confidence > 0 && (
        <div
          style={{
            height: "1px",
            background: "var(--border-subtle)",
            borderRadius: "0.5px",
            marginBottom: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${confidence * 100}%`,
              background: "var(--accent-primary)",
              borderRadius: "0.5px",
              transition: "width 600ms cubic-bezier(0.16, 1, 0.3, 1)",
              opacity: 0.7,
            }}
          />
        </div>
      )}

      <p
        style={{
          fontSize: "13px",
          lineHeight: 1.7,
          color: value ? "var(--text-secondary)" : "rgba(122,122,120,0.45)",
          fontStyle: value ? "normal" : "italic",
        }}
      >
        {value ?? "Not yet defined"}
      </p>
    </div>
  );
}

function ListSection({
  label,
  items,
  isLast,
  accent,
}: {
  label: string;
  items: string[];
  isLast?: boolean;
  accent?: "warning";
}) {
  return (
    <div
      style={{
        paddingTop: "14px",
        paddingBottom: "14px",
        borderBottom: isLast ? "none" : "1px solid var(--border-subtle)",
      }}
    >
      <p
        style={{
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: accent === "warning" ? "rgba(183,121,31,0.9)" : "var(--text-muted)",
          marginBottom: "8px",
        }}
      >
        {label}
      </p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "5px" }}>
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: "13px",
              lineHeight: 1.7,
              color: "var(--text-secondary)",
              display: "flex",
              gap: "8px",
            }}
          >
            <span style={{ color: "var(--border-strong)", flexShrink: 0 }}>—</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        height: "40px",
        borderRadius: "999px",
        border: "none",
        fontSize: "13px",
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        background: disabled
          ? "rgba(212,175,55,0.2)"
          : hovered
          ? "var(--accent-hover)"
          : "var(--accent-primary)",
        color: disabled ? "var(--text-muted)" : "#111111",
        opacity: disabled ? 0.5 : 1,
        transition: "background 180ms ease, box-shadow 180ms ease",
        boxShadow: !disabled && hovered ? "0 0 16px rgba(212,175,55,0.28)" : "none",
      }}
    >
      {children}
    </button>
  );
}

function OutlineButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        height: "40px",
        borderRadius: "999px",
        border: `1px solid ${hovered && !disabled ? "var(--accent-primary)" : "var(--border-strong)"}`,
        fontSize: "13px",
        fontWeight: 600,
        cursor: disabled ? "default" : "pointer",
        background: hovered && !disabled ? "var(--accent-soft)" : "transparent",
        color: disabled ? "var(--text-muted)" : hovered ? "var(--accent-primary)" : "var(--text-secondary)",
        opacity: disabled ? 0.4 : 1,
        transition: "border-color 180ms ease, color 180ms ease, background 180ms ease",
      }}
    >
      {children}
    </button>
  );
}
