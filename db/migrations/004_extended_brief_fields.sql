-- Migration 004: Extend brief_states with the full 8-section creative brief framework.
-- Adds: background, problem_statement, communication_goal, insight, reasons_to_believe
-- Existing columns (business_goal, target_audience, core_message, tone_of_voice,
-- visual_direction, deliverables, constraints) are preserved for backward compatibility.

ALTER TABLE brief_states
  ADD COLUMN IF NOT EXISTS background TEXT,
  ADD COLUMN IF NOT EXISTS problem_statement TEXT,
  ADD COLUMN IF NOT EXISTS communication_goal TEXT,
  ADD COLUMN IF NOT EXISTS insight TEXT,
  ADD COLUMN IF NOT EXISTS reasons_to_believe TEXT;
