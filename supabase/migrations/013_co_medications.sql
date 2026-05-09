-- ============================================================
-- Capture concurrent medications + supplements on user_profiles
-- so a buyer can control for them when analyzing peptide effects.
--
-- co_medications is a fixed-vocab text array (categories defined
-- in src/types/index.ts). co_medications_other is free-form text
-- for anything not covered by the categories.
-- ============================================================

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS co_medications TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS co_medications_other TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_co_medications
  ON user_profiles USING GIN(co_medications);

-- The four cycle/journal/dose/bloodwork research views already join
-- through user_profiles. Buyers can now query them with co_medications
-- in scope without any view changes:
--
--   SELECT * FROM research_dose_logs r
--   JOIN user_profiles up ON up.research_id = r.research_id
--   WHERE 'statins' = ANY(up.co_medications);
--
-- However, user_profiles.research_id is column-revoked from clients,
-- and the research_* views project research_id but no co_medications.
-- Add it to each so buyers don't need a side-channel join.

DROP VIEW IF EXISTS research_dose_logs;
CREATE VIEW research_dose_logs AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date              AS log_date,
  (e.payload->>'cycle_id')        AS cycle_id,
  (e.payload->>'peptide_id')      AS peptide_id,
  (e.payload->>'amount')::numeric AS amount,
  (e.payload->>'unit')            AS unit,
  (e.payload->>'route')           AS route,
  (e.payload->>'site')            AS site
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'dose_logged'
  AND up.research_consent = true;

DROP VIEW IF EXISTS research_journal_entries;
CREATE VIEW research_journal_entries AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
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

DROP VIEW IF EXISTS research_cycles_started;
CREATE VIEW research_cycles_started AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date                  AS log_date,
  (e.payload->>'cycle_id')            AS cycle_id,
  (e.payload->>'name')                AS cycle_name,
  (e.payload->>'goal')                AS goal,
  (e.payload->>'duration_weeks')::int AS duration_weeks,
  (e.payload->>'template_id')         AS template_id,
  e.payload->'compounds'              AS compounds,
  e.payload->'baseline'               AS baseline
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_created'
  AND up.research_consent = true
  AND EXISTS (
    SELECT 1 FROM analytics_events d
    WHERE d.event_type = 'dose_logged'
      AND d.payload->>'cycle_id' = e.payload->>'cycle_id'
      AND d.anon_id = e.anon_id
  );

DROP VIEW IF EXISTS research_cycles_ended;
CREATE VIEW research_cycles_ended AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  e.created_at::date                       AS log_date,
  (e.payload->>'cycle_id')                 AS cycle_id,
  (e.payload->>'reason')                   AS reason,
  (e.payload->>'durationDays')::int        AS duration_days,
  (e.payload->>'expected_days')::int       AS expected_days,
  (e.payload->>'completed_days')::int      AS completed_days,
  (e.payload->>'adherence_pct')::int       AS adherence_pct,
  (e.payload->>'total_doses_logged')::int  AS total_doses_logged,
  e.payload->'peptideIds'                  AS peptide_ids
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'cycle_ended'
  AND up.research_consent = true
  AND EXISTS (
    SELECT 1 FROM analytics_events d
    WHERE d.event_type = 'dose_logged'
      AND d.payload->>'cycle_id' = e.payload->>'cycle_id'
      AND d.anon_id = e.anon_id
  );

DROP VIEW IF EXISTS research_bloodwork;
CREATE VIEW research_bloodwork AS
SELECT
  up.research_id,
  up.age,
  up.gender,
  up.experience_level,
  up.co_medications,
  (e.payload->>'drawn_on')::date              AS drawn_on,
  e.created_at::date                          AS log_date,
  (e.payload->>'cycle_id')                    AS cycle_id,
  (e.payload->>'lab_name')                    AS lab_name,
  (e.payload->>'testosterone_total')::numeric AS testosterone_total_ng_dl,
  (e.payload->>'testosterone_free')::numeric  AS testosterone_free_pg_ml,
  (e.payload->>'estradiol')::numeric          AS estradiol_pg_ml,
  (e.payload->>'shbg')::numeric               AS shbg_nmol_l,
  (e.payload->>'igf1')::numeric               AS igf1_ng_ml,
  (e.payload->>'tsh')::numeric                AS tsh_miu_l,
  (e.payload->>'hba1c')::numeric              AS hba1c_pct,
  (e.payload->>'fasting_glucose')::numeric    AS fasting_glucose_mg_dl,
  (e.payload->>'fasting_insulin')::numeric    AS fasting_insulin_uiu_ml,
  (e.payload->>'total_cholesterol')::numeric  AS total_cholesterol_mg_dl,
  (e.payload->>'ldl')::numeric                AS ldl_mg_dl,
  (e.payload->>'hdl')::numeric                AS hdl_mg_dl,
  (e.payload->>'triglycerides')::numeric      AS triglycerides_mg_dl,
  (e.payload->>'hs_crp')::numeric             AS hs_crp_mg_l,
  (e.payload->>'alt')::numeric                AS alt_u_l,
  (e.payload->>'ast')::numeric                AS ast_u_l,
  (e.payload->>'creatinine')::numeric         AS creatinine_mg_dl
FROM analytics_events e
JOIN user_profiles up ON up.anon_id = e.anon_id
WHERE e.event_type = 'bloodwork_logged'
  AND up.research_consent = true;

REVOKE ALL ON research_dose_logs       FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_journal_entries FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_cycles_started  FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_cycles_ended    FROM PUBLIC, authenticated, anon;
REVOKE ALL ON research_bloodwork       FROM PUBLIC, authenticated, anon;
