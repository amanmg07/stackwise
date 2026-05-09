-- ============================================================
-- Surface weight_unit in research_journal_entries.
--
-- Without this, a buyer seeing weight=175 doesn't know if it's
-- pounds or kilograms — that's a 30%+ difference, big enough to
-- corrupt downstream analysis. Now the unit travels alongside the
-- value.
--
-- Old rows (recorded before this fix) will have a null weight_unit;
-- buyers should treat null as "unknown unit" and skip those rows in
-- weight-sensitive queries.
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
