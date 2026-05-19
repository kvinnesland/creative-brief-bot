// CR-002: Gap Finder — pure function, no AI call.
// Returns a list of required BriefState fields that are unfilled.

import type { BriefState, BriefStateField } from "@/lib/types/entities";

const REQUIRED_FIELDS: BriefStateField[] = [
  "business_goal",
  "target_audience",
  "core_message",
  "tone_of_voice",
  "visual_direction",
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
