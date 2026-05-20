// Pure function — no AI call. Returns required brief fields that are unfilled.

import type { BriefState, BriefStateField } from "@/lib/types/entities";

const REQUIRED_FIELDS: BriefStateField[] = [
  "background",
  "problem_statement",
  "business_goal",
  "communication_goal",
  "target_audience",
  "insight",
  "core_message",
  "reasons_to_believe",
  "tone_of_voice",
  "deliverables",
  "constraints",
];

export function findGaps(briefState: BriefState): BriefStateField[] {
  return REQUIRED_FIELDS.filter((field) => {
    const value = briefState[field];
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) return value.length === 0;
    return false;
  });
}
