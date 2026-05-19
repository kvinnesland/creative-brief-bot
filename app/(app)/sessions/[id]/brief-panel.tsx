"use client";

// CR-002: Brief panel — live brief state display, refreshes after each turn.

import type { BriefState } from "@/lib/types/entities";

interface Props {
  briefState: BriefState | null;
}

const SECTIONS: { label: string; key: keyof BriefState }[] = [
  { label: "Business goal",    key: "business_goal" },
  { label: "Target audience",  key: "target_audience" },
  { label: "Core message",     key: "core_message" },
  { label: "Tone of voice",    key: "tone_of_voice" },
  { label: "Visual direction", key: "visual_direction" },
];

export function BriefPanel({ briefState }: Props) {
  const confidence = briefState?.confidence_scores as Record<string, number> | null;

  const deliverables = briefState?.deliverables ?? [];
  const constraints = briefState?.constraints ?? [];
  const openQuestions = briefState?.open_questions ?? [];

  const totalFilled = SECTIONS.filter(
    ({ key }) => briefState?.[key] != null
  ).length + (deliverables.length > 0 ? 1 : 0) + (constraints.length > 0 ? 1 : 0);

  const completionPct = Math.round((totalFilled / 7) * 100);

  return (
    <>
      {/* Header */}
      <div
        className="flex-none px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-between mb-2">
          <h2
            className="text-[18px] font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Brief
          </h2>
          <span className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            {completionPct}%
          </span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: "var(--color-surface-secondary)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${completionPct}%`,
              backgroundColor: "var(--color-accent)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {SECTIONS.map(({ label, key }) => {
          const value = briefState?.[key] as string | null | undefined;
          const conf = confidence?.[key as string] ?? 0;

          return (
            <div key={key as string}>
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {label}
                </span>
                {conf > 0 && (
                  <span className="text-[12px]" style={{ color: "var(--color-text-muted)" }}>
                    {Math.round(conf * 100)}%
                  </span>
                )}
              </div>
              {conf > 0 && (
                <div
                  className="h-0.5 rounded-full mb-2 overflow-hidden"
                  style={{ backgroundColor: "var(--color-surface-secondary)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${conf * 100}%`,
                      backgroundColor: "var(--color-accent)",
                    }}
                  />
                </div>
              )}
              <p
                className="text-[13px] leading-relaxed"
                style={{
                  color: value ? "var(--color-text-primary)" : "var(--color-text-muted)",
                }}
              >
                {value ?? "Not yet defined"}
              </p>
            </div>
          );
        })}

        {deliverables.length > 0 && (
          <div>
            <span
              className="text-[13px] font-semibold block mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Deliverables
            </span>
            <ul className="flex flex-col gap-1">
              {deliverables.map((d, i) => (
                <li key={i} className="text-[13px]" style={{ color: "var(--color-text-primary)" }}>
                  · {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {constraints.length > 0 && (
          <div>
            <span
              className="text-[13px] font-semibold block mb-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Constraints
            </span>
            <ul className="flex flex-col gap-1">
              {constraints.map((c, i) => (
                <li key={i} className="text-[13px]" style={{ color: "var(--color-text-primary)" }}>
                  · {c}
                </li>
              ))}
            </ul>
          </div>
        )}

        {openQuestions.length > 0 && (
          <div>
            <span
              className="text-[13px] font-semibold block mb-1"
              style={{ color: "var(--color-warning, #b45309)" }}
            >
              Open questions
            </span>
            <ul className="flex flex-col gap-1">
              {openQuestions.map((q, i) => (
                <li key={i} className="text-[13px]" style={{ color: "var(--color-text-secondary)" }}>
                  · {q}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!briefState && (
          <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
            Brief state will appear here as the conversation progresses.
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex-none px-4 py-4 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        <button
          disabled={completionPct < 100}
          className="w-full h-11 rounded-full text-[14px] font-semibold transition-opacity"
          style={{
            backgroundColor: "var(--color-accent)",
            color: "var(--color-text-inverted)",
            opacity: completionPct < 100 ? 0.4 : 1,
          }}
        >
          Export Brief
        </button>
      </div>
    </>
  );
}
