-- ============================================================
-- One-time cleanup of legacy events that predate phase-1 schema
-- enrichment. These rows have no cycle_id in their payload, so
-- they're already invisible to research_* views (which require
-- cycle_id) but they pollute analytics_events and skew totals.
--
-- We delete:
--   - cycle_created / cycle_updated / cycle_ended without cycle_id
--   - dose_logged without cycle_id
--
-- We DO NOT delete journal_entry events without cycle_id, because
-- some are legitimate off-cycle baseline entries the user logged
-- before starting any protocol.
--
-- Safe to re-run: matches zero rows after the first execution.
-- ============================================================

DELETE FROM analytics_events
WHERE event_type IN ('cycle_created', 'cycle_updated', 'cycle_ended')
  AND payload->>'cycle_id' IS NULL;

DELETE FROM analytics_events
WHERE event_type = 'dose_logged'
  AND payload->>'cycle_id' IS NULL;
