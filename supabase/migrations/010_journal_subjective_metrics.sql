-- ============================================================
-- Surface skin_quality, joint_comfort, libido, strength in
-- research_journal_entries.
--
-- These are optional 1-10 self-ratings shown in the Additional
-- Metrics section. They're undefined when the user hasn't rated
-- them, so a null in the buyer view means "not rated" (not 0).
-- This is intentional — defaulting to 5 would silently fill the
-- dataset with neutral noise from users who never thought about
-- the metric.
--
-- Why these specifically:
--   skin_quality   — anti-aging compounds (GHK-Cu, BPC-157)
--   joint_comfort  — recovery / repair (BPC, TB-500, GHK-Cu)
--   libido         — hormonal peptides (PT-141, kisspeptin)
--   strength       — anabolic / GH peptides
-- ============================================================

DROP VIEW IF EXISTS research_journal_entries;
CREATE VIEW research_journal_entries AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  latest.log_date,
  (latest.payload->>'cycle_id')               AS cycle_id,
  (latest.payload->>'sleepQuality')::numeric  AS sleep_quality,
  (latest.payload->>'energyLevel')::numeric   AS energy_level,
  (latest.payload->>'recoveryScore')::numeric AS recovery_score,
  (latest.payload->>'mood')::numeric          AS mood,
  (latest.payload->>'weight')::numeric        AS weight,
  (latest.payload->>'weight_unit')            AS weight_unit,
  (latest.payload->>'body_fat')::numeric      AS body_fat,
  (latest.payload->>'skin_quality')::numeric  AS skin_quality,
  (latest.payload->>'joint_comfort')::numeric AS joint_comfort,
  (latest.payload->>'libido')::numeric        AS libido,
  (latest.payload->>'strength')::numeric      AS strength,
  (latest.payload->>'sleep_hours')::numeric   AS sleep_hours,
  latest.payload->'activePeptideIds'          AS active_peptide_ids,
  latest.payload->'sideEffects'               AS side_effects
FROM (
  SELECT DISTINCT ON (anon_id, created_at::date)
    anon_id,
    created_at::date AS log_date,
    payload,
    created_at
  FROM analytics_events
  WHERE event_type = 'journal_entry'
  ORDER BY anon_id, created_at::date, created_at DESC
) latest
JOIN user_profiles up ON up.anon_id = latest.anon_id
WHERE up.research_consent = true;

REVOKE ALL ON research_journal_entries FROM PUBLIC, authenticated, anon;
