-- CR-003: Add share_token to brief_sessions for public brief sharing.

ALTER TABLE brief_sessions
  ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT NULL;

-- Allow anyone (anon key) to read sessions that have been explicitly shared.
CREATE POLICY "Public read shared sessions"
  ON brief_sessions FOR SELECT
  USING (share_token IS NOT NULL);

-- Allow anyone to read brief_states for shared sessions.
CREATE POLICY "Public read shared brief states"
  ON brief_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM brief_sessions bs
      WHERE bs.id = brief_states.session_id
        AND bs.share_token IS NOT NULL
    )
  );
