-- Rollback 004: Remove extended brief fields.
ALTER TABLE brief_states
  DROP COLUMN IF EXISTS background,
  DROP COLUMN IF EXISTS problem_statement,
  DROP COLUMN IF EXISTS communication_goal,
  DROP COLUMN IF EXISTS insight,
  DROP COLUMN IF EXISTS reasons_to_believe;
