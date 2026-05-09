-- ============================================================
-- Phase 2: research_id — a rotatable handle decoupled from anon_id
-- ============================================================
--
-- Why this exists:
--   anon_id is the user's Supabase auth UUID. It's stable and
--   internally useful, but if we ever sell de-identified data to a
--   healthcare buyer we don't want them seeing anon_id (it's also
--   the foreign key into auth.users). research_id is a separate UUID
--   stamped per-user that:
--     - Is the ONLY id buyers ever see (via the export views below)
--     - Can be rotated for one user (incident response, user request)
--       without touching their data or breaking internal joins
--     - Is generated server-side; the mobile client never reads it
--
-- The mobile app keeps using anon_id end-to-end (no client changes
-- in this migration).
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS research_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Backfill any rows that existed before the DEFAULT (defensive — the
-- DEFAULT covers new rows; this catches edge cases where someone added
-- the column without a default in a different env).
UPDATE user_profiles
SET research_id = gen_random_uuid()
WHERE research_id IS NULL;

-- research_id must be unique (one per user) so buyer-side joins are safe.
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_research_id
  ON user_profiles(research_id);

-- ============================================================
-- Rotation: rotate_research_id(anon_uuid)
-- Use case: a buyer relationship ends and we want to invalidate the
-- handle they have, OR a user requests a fresh handle. Re-points the
-- user to a new research_id; the rest of their data is untouched.
-- ============================================================
CREATE OR REPLACE FUNCTION rotate_research_id(target_anon_id UUID)
RETURNS UUID AS $$
DECLARE
  new_id UUID := gen_random_uuid();
BEGIN
  UPDATE user_profiles
  SET research_id = new_id, updated_at = now()
  WHERE anon_id = target_anon_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No user_profiles row for anon_id %', target_anon_id;
  END IF;

  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Lock the function down — it should only be callable from the
-- service role (admin scripts / edge functions), never from the
-- client. The default Supabase policy on functions in `public` is
-- to grant EXECUTE to authenticated; we revoke it here.
REVOKE EXECUTE ON FUNCTION rotate_research_id(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION rotate_research_id(UUID) FROM authenticated;
REVOKE EXECUTE ON FUNCTION rotate_research_id(UUID) FROM anon;

-- RLS: research_id should NOT be readable by the client. Update the
-- existing policy so SELECT on user_profiles still works for the user
-- on their own row, but research_id is masked at the application
-- layer (we'll filter it out in the API). Postgres column-level
-- privileges are the cleanest way:
REVOKE SELECT (research_id) ON user_profiles FROM authenticated;
REVOKE SELECT (research_id) ON user_profiles FROM anon;
