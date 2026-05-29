import { supabase, getCurrentUserId } from "../utils/supabase";
import { appStorage } from "../utils/storage";
import * as Sentry from "@sentry/react-native";
import { CyclePeptide, JournalEntry, AdministrationRoute, AdverseEvent, Bloodwork, CycleOutcome } from "../types";

// Toggleable per-build: in __DEV__ we never write to the production
// analytics tables, so dev/test sessions don't pollute the dataset.
// Override with EXPO_PUBLIC_FORCE_ANALYTICS=1 if you specifically want
// to verify the analytics pipeline end-to-end during development.
const ANALYTICS_ENABLED_IN_DEV =
  typeof process !== "undefined" &&
  process.env?.EXPO_PUBLIC_FORCE_ANALYTICS === "1";

/**
 * Validate an event payload before it leaves the device. Drops the
 * event if it's clearly malformed — empty/missing required fields,
 * non-finite numbers, etc. Better to skip than to send garbage that
 * would later have to be cleaned out of the buyer dataset.
 */
// Sanity bounds for any peptide/supplement dose. Far below normal mcg
// dosing on the low end, far above any conceivable real-world dose on
// the high end. Anything outside this range is a typo or garbage.
const MIN_DOSE = 0.0001;
const MAX_DOSE = 100000;

// Number must be present, finite, and within [lo, hi].
const inRange = (v: any, lo: number, hi: number): boolean =>
  typeof v === "number" && Number.isFinite(v) && v >= lo && v <= hi;
// Same, but absent (undefined/null) is also OK — for optional fields.
const optInRange = (v: any, lo: number, hi: number): boolean =>
  v === undefined || v === null || inRange(v, lo, hi);
// Optional finite, non-negative (for lab values where negatives are
// biologically impossible and NaN/Infinity are pure garbage).
const optNonNeg = (v: any): boolean =>
  v === undefined || v === null ||
  (typeof v === "number" && Number.isFinite(v) && v >= 0);

const BLOODWORK_NUMERIC_FIELDS = [
  "testosterone_total", "testosterone_free", "estradiol", "shbg",
  "igf1", "tsh", "hba1c", "fasting_glucose", "fasting_insulin",
  "total_cholesterol", "ldl", "hdl", "triglycerides", "hs_crp",
  "alt", "ast", "creatinine",
] as const;

function isValidPayload(eventType: string, payload: Record<string, any>): boolean {
  switch (eventType) {
    case "dose_logged":
      // quick_logged (added with ticket 1.6 notification quick-log)
      // is the capture-fidelity tag for dose logs — true means
      // notification-action batch-log (no site/source/notes review),
      // false/undefined means hand-entered. Validated as boolean if
      // present; older payloads without the field still pass.
      return (
        typeof payload.cycle_id === "string" && payload.cycle_id.length > 0 &&
        typeof payload.peptide_id === "string" && payload.peptide_id.length > 0 &&
        typeof payload.amount === "number" &&
        Number.isFinite(payload.amount) &&
        payload.amount > MIN_DOSE &&
        payload.amount < MAX_DOSE &&
        (payload.quick_logged === undefined || typeof payload.quick_logged === "boolean")
      );
    case "cycle_created":
    case "cycle_updated":
    case "cycle_ended":
      return typeof payload.cycle_id === "string" && payload.cycle_id.length > 0;
    case "journal_entry":
      // Broadened: every core score validated 1-10 (was only sleep+
      // energy); subjective metrics validated if present; weight /
      // body_fat / sleep_hours bounded if present. Weight range covers
      // both lbs and kg so the unit-tracking column stays the source
      // of truth.
      //
      // entry_mode (added with ticket 1.3 quick-log) is the
      // capture-fidelity tag — "quick" means mood-keyed pre-fills
      // (lower fidelity), "full" means the user moved each slider.
      // Buyer aggregates that need high-fidelity data must filter on
      // entry_mode = 'full' or dedupe to the latest event per
      // journal_entry_id. Validated as one of the two values if
      // present; older payloads without the field still pass.
      return (
        inRange(payload.sleepQuality, 1, 10) &&
        inRange(payload.energyLevel, 1, 10) &&
        inRange(payload.recoveryScore, 1, 10) &&
        inRange(payload.mood, 1, 10) &&
        optInRange(payload.skin_quality, 1, 10) &&
        optInRange(payload.joint_comfort, 1, 10) &&
        optInRange(payload.libido, 1, 10) &&
        optInRange(payload.strength, 1, 10) &&
        optInRange(payload.weight, 20, 700) &&
        optInRange(payload.body_fat, 0, 70) &&
        optInRange(payload.sleep_hours, 0, 24) &&
        (payload.entry_mode === undefined ||
          payload.entry_mode === "quick" ||
          payload.entry_mode === "full")
      );
    case "cycle_outcome":
      return (
        typeof payload.cycle_id === "string" && payload.cycle_id.length > 0 &&
        [4, 8, 12, 16].includes(payload.week_number) &&
        inRange(payload.overall_score, 1, 10) &&
        inRange(payload.goal_progress_score, 1, 10) &&
        inRange(payload.energy_score, 1, 10) &&
        inRange(payload.recovery_score, 1, 10) &&
        typeof payload.would_repeat === "boolean" &&
        ["none", "mild", "moderate", "severe"].includes(payload.side_effect_severity)
      );
    case "bloodwork_logged":
      // All lab fields optional; if present they must be finite and
      // non-negative. Domain-specific upper bounds are deliberately
      // not enforced here — extreme-but-real lab values are real
      // signal buyers want to see; pure garbage (NaN/Infinity/strings/
      // negatives) is what we filter.
      return BLOODWORK_NUMERIC_FIELDS.every((k) => optNonNeg(payload[k]));
    default:
      // Lightweight events (chat_question, etc.) don't have hard
      // validation. Allow them through.
      return true;
  }
}

/**
 * Send an anonymized analytics event to Supabase.
 * Only fires if the user opted in (analyticsConsent === true).
 * All events are keyed by anonymous user ID — no PII is sent.
 *
 * Skipped silently when:
 *   - the user hasn't opted into analytics
 *   - the build is __DEV__ (unless EXPO_PUBLIC_FORCE_ANALYTICS=1)
 *   - the payload is structurally invalid
 */
export async function trackEvent(
  eventType: string,
  payload: Record<string, any> = {}
) {
  try {
    if (typeof __DEV__ !== "undefined" && __DEV__ && !ANALYTICS_ENABLED_IN_DEV) {
      return;
    }
    if (!isValidPayload(eventType, payload)) return;

    const settings = await appStorage.loadSettings();
    if (!settings.analyticsConsent) return;

    const userId = await getCurrentUserId();
    if (!userId) return;

    // Capture the insert response so RLS-denied or otherwise failing
    // inserts don't silently disappear (audit finding F10). The
    // insert itself doesn't throw on RLS denial — it resolves with an
    // error in the response — so without this check, server-side
    // ingest failures are invisible.
    const { error: insertError } = await supabase.from("analytics_events").insert({
      anon_id: userId,
      event_type: eventType,
      payload,
    });
    if (insertError) {
      Sentry.captureException(insertError, {
        extra: { where: "trackEvent", eventType },
      });
    }
  } catch (e) {
    // Analytics should never crash the app
    Sentry.captureException(e);
  }
}

/**
 * Cascade-delete all analytics events tied to a cycle. Called when the
 * user deletes a cycle in the app — keeps the buyer-facing dataset
 * free of "user created cycle then realized it was a mistake" noise.
 *
 * Safe to call on cycles that were never sent to analytics (e.g. dev
 * builds, opted-out users) — the DELETE simply matches zero rows.
 */
export async function deleteCycleAnalytics(cycleId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;

    // .select() makes the DELETE return the rows it actually removed
    // (RETURNING). RLS (anon_id = auth.uid()) only lets a session
    // delete events it owns, so events written under a PRIOR anonymous
    // identity are silently left behind and this returns 0 rows with no
    // error. Capturing the count lets us detect that instead of the
    // delete failing invisibly. (A separate re-count would be useless —
    // it'd be RLS-blind to the orphaned rows for the same reason.)
    const { data, error } = await supabase
      .from("analytics_events")
      .delete()
      // cycle_outcome + bloodwork_logged are also tied to a cycle by
      // payload.cycle_id; without them the cycle's check-ins and
      // labs orphan in research_cycle_outcomes / research_bloodwork
      // after the cycle itself is gone (audit finding F3).
      //
      // journal_entry added in the post-Phase-2 audit pass — entries
      // logged with cycleId in scope (most are, since we autotag the
      // active cycle on save) were orphaning to the deleted cycle in
      // research_journal_entries until this list included them.
      // NOTE: this only deletes the analytics-event row; the local
      // JournalEntry object stays in AsyncStorage (the user keeps
      // their entry — only the server-side aggregation reference
      // is cleaned).
      .in("event_type", ["cycle_created", "cycle_updated", "cycle_ended", "dose_logged", "cycle_outcome", "bloodwork_logged", "journal_entry"])
      .eq("anon_id", userId)
      .filter("payload->>cycle_id", "eq", cycleId)
      .select("id");

    if (error) {
      Sentry.captureException(error, {
        extra: { where: "deleteCycleAnalytics", cycleId, currentUserId: userId },
      });
      return;
    }

    // 0 rows deleted while analytics consent is on is the signature of
    // orphaned events (the anon identity rotated since the cycle was
    // created). We can't recover them client-side; this telemetry
    // quantifies how often it happens in prod so we can decide whether
    // the durable fix (stable client id + server-side delete) is
    // warranted. Can't fully distinguish this from "cycle never had
    // events," but the consent-on aggregate frequency is the signal.
    if ((data?.length ?? 0) === 0) {
      const settings = await appStorage.loadSettings();
      if (settings.analyticsConsent) {
        Sentry.captureMessage(
          "deleteCycleAnalytics removed 0 rows — likely orphaned events (anon identity divergence)",
          { level: "warning", extra: { cycleId, currentUserId: userId } },
        );
      }
    }
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cascade-delete the single dose_logged event for a deleted dose log. */
export async function deleteDoseLogAnalytics(doseLogId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase
      .from("analytics_events")
      .delete()
      .eq("event_type", "dose_logged")
      .eq("anon_id", userId)
      .filter("payload->>dose_log_id", "eq", doseLogId);
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cascade-delete the single journal_entry event for a deleted journal entry. */
export async function deleteJournalEntryAnalytics(journalEntryId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase
      .from("analytics_events")
      .delete()
      .eq("event_type", "journal_entry")
      .eq("anon_id", userId)
      .filter("payload->>journal_entry_id", "eq", journalEntryId);
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cascade-delete the bloodwork_logged event for a deleted bloodwork entry. */
export async function deleteBloodworkAnalytics(bloodworkId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase
      .from("analytics_events")
      .delete()
      .eq("event_type", "bloodwork_logged")
      .eq("anon_id", userId)
      .filter("payload->>bloodwork_id", "eq", bloodworkId);
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cascade-delete the cycle_outcome event for a deleted check-in. */
export async function deleteOutcomeAnalytics(outcomeId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    await supabase
      .from("analytics_events")
      .delete()
      .eq("event_type", "cycle_outcome")
      .eq("anon_id", userId)
      .filter("payload->>outcome_id", "eq", outcomeId);
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cascade-delete scan_completed + scan_compared events for a deleted scan. */
export async function deleteScanAnalytics(scanId: string): Promise<void> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return;
    // 1) Events keyed to this scan as its primary (scan_id).
    await supabase
      .from("analytics_events")
      .delete()
      .in("event_type", ["scan_completed", "scan_compared"])
      .eq("anon_id", userId)
      .filter("payload->>scan_id", "eq", scanId);
    // 2) scan_compared events that reference this scan as the
    // *earlier* point (audit finding F4). Without this, deleting an
    // earlier scan leaves dangling earlier_scan_id references in the
    // later scans' comparison events.
    await supabase
      .from("analytics_events")
      .delete()
      .eq("event_type", "scan_compared")
      .eq("anon_id", userId)
      .filter("payload->>earlier_scan_id", "eq", scanId);
  } catch (e) {
    Sentry.captureException(e);
  }
}

/**
 * Upsert the user's anonymous profile (demographics) to Supabase.
 * Called once after the demographics screen.
 */
export async function syncUserProfile(demographics: {
  age?: number;
  gender?: string;
  goals?: string[];
  experienceLevel?: string;
}): Promise<boolean> {
  try {
    const settings = await appStorage.loadSettings();
    if (!settings.analyticsConsent) return true;

    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase.from("user_profiles").upsert({
      anon_id: userId,
      age: demographics.age || null,
      gender: demographics.gender || null,
      goals: demographics.goals || [],
      experience_level: demographics.experienceLevel || null,
      analytics_consent: settings.analyticsConsent,
      research_consent: settings.researchDataConsent,
      research_consent_at: settings.researchDataConsent ? new Date().toISOString() : null,
      co_medications: settings.coMedications || [],
      co_medications_other: settings.coMedicationsOther || null,
    });
    if (error) {
      Sentry.captureException(error);
      return false;
    }
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

/**
 * Push the user's co-medications list to the server. Called after the
 * user edits the list in their profile.
 */
export async function syncCoMedications(
  categories: string[],
  other: string,
): Promise<boolean> {
  try {
    // Same consent gate as syncUserProfile — co-medications are
    // sensitive health data and must not ship to the server when the
    // user has opted out of analytics. (Previously this function
    // upserted unconditionally, which leaked meds for opted-out users.)
    const settings = await appStorage.loadSettings();
    if (!settings.analyticsConsent) return true;

    const userId = await getCurrentUserId();
    if (!userId) return false;
    const { error } = await supabase.from("user_profiles").upsert({
      anon_id: userId,
      co_medications: categories,
      co_medications_other: other || null,
    });
    if (error) {
      Sentry.captureException(error);
      return false;
    }
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

/**
 * Push a research-consent decision to the server. Called whenever the
 * user toggles their decision (initial onboarding screen or the
 * Profile setting). Always tries to write — if a user previously had
 * analytics_consent=false and just opted into research, we still need
 * to record the row so the server-side filter knows to include them.
 */
export async function syncResearchConsent(consented: boolean): Promise<boolean> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return false;

    const { error } = await supabase.from("user_profiles").upsert({
      anon_id: userId,
      research_consent: consented,
      research_consent_at: consented ? new Date().toISOString() : null,
    });
    if (error) {
      Sentry.captureException(error);
      return false;
    }
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

// ── Pure helpers (exported for tests) ─────────────────────────────

/**
 * Convert a free-form side-effect label into a stable, snake_case enum
 * value. The UI shows "Injection site pain" but downstream buyers should
 * see "injection_site_pain" so they can aggregate without case/punctuation
 * surprises.
 */
export function normalizeSideEffect(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export interface BaselineMetrics {
  sleep_quality: number | null;
  energy_level: number | null;
  recovery_score: number | null;
  mood: number | null;
  weight: number | null;
  entry_count: number;
}

/**
 * Average the last `windowDays` of journal entries to get a baseline
 * snapshot. Returns null fields when there's no data — buyers can detect
 * cycles that started "cold" vs ones with prior history.
 */
export function computeBaseline(
  entries: JournalEntry[],
  windowDays: number = 7
): BaselineMetrics {
  if (entries.length === 0) {
    return {
      sleep_quality: null,
      energy_level: null,
      recovery_score: null,
      mood: null,
      weight: null,
      entry_count: 0,
    };
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - windowDays);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const recent = entries.filter((e) => e.date >= cutoffStr);
  if (recent.length === 0) {
    return {
      sleep_quality: null,
      energy_level: null,
      recovery_score: null,
      mood: null,
      weight: null,
      entry_count: 0,
    };
  }

  const avg = (fn: (e: JournalEntry) => number | undefined): number | null => {
    const vals = recent.map(fn).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return null;
    return Number((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2));
  };

  return {
    sleep_quality: avg((e) => e.sleepQuality),
    energy_level: avg((e) => e.energyLevel),
    recovery_score: avg((e) => e.recoveryScore),
    mood: avg((e) => e.mood),
    weight: avg((e) => e.weight),
    entry_count: recent.length,
  };
}

/** Serialize a CyclePeptide to the analytics-friendly snake_case shape. */
function serializeCompound(cp: CyclePeptide) {
  return {
    peptide_id: cp.peptideId,
    dose_amount: cp.doseAmount,
    dose_unit: cp.doseUnit,
    frequency: cp.frequency,
    route: cp.route,
    time_of_day: cp.timeOfDay,
    added_at: cp.addedAt || null,
  };
}

// ── Convenience wrappers ──────────────────────────────────────────
//
// Payload key-casing convention (audit finding F12):
//
// Event payloads are a HISTORICAL MIX of camelCase and snake_case
// — not a clean design. The split (and the matching view reads) is:
//
//   cycle_created / cycle_updated  → snake (cycle_id, peptide_ids,
//     duration_weeks, template_id, source_scan_id, compounds, ...)
//   cycle_ended    → MIX: snake (cycle_id, expected_days, ...) plus
//     legacy camelCase peptideIds + durationDays (kept for back-compat
//     with pre-rename views — DO NOT change without updating
//     research_cycles_ended and the analytics_insights retention
//     branches together).
//   dose_logged    → snake (every key).
//   journal_entry  → MIX: camelCase scores (sleepQuality, energyLevel,
//     recoveryScore, mood, activePeptideIds, sideEffects) + snake
//     metrics (weight_unit, body_fat, skin_quality, joint_comfort,
//     libido, strength, sleep_hours, journal_entry_id, cycle_id).
//   scan_compared  → MIX: snake ids (scan_id, earlier_scan_id) +
//     camelCase metrics (daysBetween, changesImproved, ...).
//   cycle_outcome / bloodwork_logged / chat_question  → snake (every
//     key) — all added after the convention split.
//
// When ADDING a new payload key:
//   1. Match the case of nearby keys in the same event_type.
//   2. Mirror the exact key in every view that reads it (research_*
//      and analytics_insights). Postgres is case-sensitive in
//      payload->>'key' lookups.
//   3. If unsure, snake_case is the project default; only use
//      camelCase when adding a sibling field to an existing
//      camelCase cluster (don't introduce new camelCase fields in
//      otherwise-snake events).
//
// A full normalization would require re-emitting every existing event
// type in snake_case AND rewriting every view to read both
// (COALESCE(payload->>'snake', payload->>'camel')) until historical
// rows age out. Deferred — not worth the migration risk for a
// cosmetic improvement.

interface CycleCreatedInput {
  cycleId: string;
  name: string;
  peptides: CyclePeptide[];
  durationWeeks: number;
  templateId?: string;
  goals?: string[];
  baseline?: BaselineMetrics;
  /** ID of the Self Scan that produced this cycle, if any. */
  sourceScanId?: string;
}

export function trackCycleCreated(input: CycleCreatedInput) {
  trackEvent("cycle_created", {
    cycle_id: input.cycleId,
    name: input.name,
    // Keep peptide_ids for back-compat with existing analytics_insights view.
    peptide_ids: input.peptides.map((p) => p.peptideId),
    goals: input.goals,
    duration_weeks: input.durationWeeks,
    template_id: input.templateId,
    compounds: input.peptides.map(serializeCompound),
    baseline: input.baseline,
    source_scan_id: input.sourceScanId,
  });
}

export function trackCycleUpdated(cycleId: string, peptides: CyclePeptide[]) {
  trackEvent("cycle_updated", {
    cycle_id: cycleId,
    peptide_ids: peptides.map((p) => p.peptideId),
    compounds: peptides.map(serializeCompound),
  });
}

interface CycleEndedInput {
  cycleId: string;
  peptideIds: string[];
  durationDays: number;
  /** Granular reasons added in 2026-05; legacy events used only completed|ended_early. */
  reason: "completed" | "side_effects" | "goal_achieved" | "cost" | "other";
  expectedDays: number;
  completedDays: number;
  totalDosesLogged: number;
}

export function trackCycleEnded(input: CycleEndedInput) {
  const adherencePct =
    input.expectedDays > 0
      ? Math.round((input.completedDays / input.expectedDays) * 100)
      : 0;
  trackEvent("cycle_ended", {
    cycle_id: input.cycleId,
    peptideIds: input.peptideIds, // back-compat
    durationDays: input.durationDays,
    reason: input.reason,
    expected_days: input.expectedDays,
    completed_days: input.completedDays,
    adherence_pct: adherencePct,
    total_doses_logged: input.totalDosesLogged,
  });
}

interface DoseLoggedInput {
  doseLogId: string;
  cycleId: string;
  peptideId: string;
  amount: number;
  unit: "mcg" | "mg" | "g" | "IU";
  route: AdministrationRoute;
  site?: string;
  /** Vendor / brand / lab — first-class confounder for outcome analysis. */
  source?: string;
  /** True for notification-action batch-logs (ticket 1.6). Default false. */
  quickLogged?: boolean;
}

export function trackDoseLogged(input: DoseLoggedInput) {
  trackEvent("dose_logged", {
    dose_log_id: input.doseLogId,
    cycle_id: input.cycleId,
    peptide_id: input.peptideId,
    amount: input.amount,
    unit: input.unit,
    route: input.route,
    site: input.site,
    source: input.source,
    quick_logged: input.quickLogged ?? false,
  });
}

interface JournalEntryInput {
  journalEntryId: string;
  cycleId?: string;
  sleepQuality: number;
  energyLevel: number;
  recoveryScore: number;
  mood: number;
  weight?: number;
  weightUnit?: "lbs" | "kg";
  bodyFat?: number;
  skinQuality?: number;
  jointComfort?: number;
  libido?: number;
  strength?: number;
  sleepHours?: number;
  activePeptideIds: string[];
  /** Either legacy string[] or structured AdverseEvent[]. */
  sideEffects?: string[] | AdverseEvent[];
  /**
   * Capture fidelity (ticket 1.3). "quick" = mood-keyed pre-fills from
   * the one-tap emoji row; "full" = user explicitly moved each slider.
   * Default for legacy callers is "full" — old emissions stay tagged
   * as the high-fidelity case so buyer aggregates aren't suddenly
   * polluted by historic data being miscategorized.
   */
  entryMode?: "quick" | "full";
}

export function trackJournalEntry(input: JournalEntryInput) {
  // Normalize to the structured shape so the buyer view sees a consistent
  // schema regardless of whether the caller sent strings or objects.
  const sideEffects = (input.sideEffects || []).map((item) => {
    if (typeof item === "string") return { effect: normalizeSideEffect(item) };
    return {
      effect: normalizeSideEffect(item.effect),
      severity: item.severity,
      duration: item.duration,
    };
  });
  trackEvent("journal_entry", {
    journal_entry_id: input.journalEntryId,
    cycle_id: input.cycleId,
    sleepQuality: input.sleepQuality,
    energyLevel: input.energyLevel,
    recoveryScore: input.recoveryScore,
    mood: input.mood,
    weight: input.weight,
    weight_unit: input.weight != null ? input.weightUnit : undefined,
    body_fat: input.bodyFat,
    skin_quality: input.skinQuality,
    joint_comfort: input.jointComfort,
    libido: input.libido,
    strength: input.strength,
    sleep_hours: input.sleepHours,
    activePeptideIds: input.activePeptideIds,
    // Structured: [{ effect, severity?, duration? }, ...]
    sideEffects,
    entry_mode: input.entryMode ?? "full",
  });
}

// Removed trackScanCompleted (audit finding F11): no view ever
// consumed this event, so it was pure privacy footprint with no
// buyer value. Legacy events stay in analytics_events until a scan
// is deleted (deleteScanAnalytics still cleans them up for backfill).

export function trackScanCompared(data: {
  scanId: string;
  earlierScanId?: string;
  daysBetween: number;
  changesImproved: number;
  changesWorsened: number;
  changesUnchanged: number;
  workingPeptideIds: string[];
  recommendedCategories: string[];
}) {
  trackEvent("scan_compared", {
    scan_id: data.scanId,
    earlier_scan_id: data.earlierScanId,
    daysBetween: data.daysBetween,
    changesImproved: data.changesImproved,
    changesWorsened: data.changesWorsened,
    changesUnchanged: data.changesUnchanged,
    workingPeptideIds: data.workingPeptideIds,
    recommendedCategories: data.recommendedCategories,
  });
}

// Removed trackPeptideViewed (audit finding F11+F13): no view
// consumed this event, and per-screen-view emissions accumulated as
// dead privacy footprint with no cycle_id anchor for cascade
// deletion. If buyers ever want this signal, re-add the emission
// alongside a paired research_* view (and decide whether per-view
// or per-session is the right granularity).

interface ChatQuestionInput {
  questionLength: number;
  activePeptideIds: string[];
  /** Keyword-classified intent: dosing / stacking / side_effects / comparison / cycle_planning / general. */
  queryCategory: string;
  /** Peptide IDs extracted from the query text itself (not from the active cycle). */
  peptideIdsQueried: string[];
}

export function trackChatQuestion(input: ChatQuestionInput) {
  trackEvent("chat_question", {
    question_length: input.questionLength,
    active_peptide_ids: input.activePeptideIds,
    query_category: input.queryCategory,
    peptide_ids_queried: input.peptideIdsQueried,
  });
}

/**
 * Standardized outcome check-in at week 4 / 8 / 12 / 16 of a cycle.
 * These structured-interval scores are what makes outcome data
 * scientifically comparable across users — buyers can ask "what does
 * week 8 of compound X look like" cleanly only because every user
 * answers the same questions on the same schedule.
 */
export function trackOutcome(input: CycleOutcome) {
  trackEvent("cycle_outcome", {
    outcome_id: input.id,
    cycle_id: input.cycleId,
    week_number: input.weekNumber,
    overall_score: input.overallScore,
    goal_progress_score: input.goalProgressScore,
    energy_score: input.energyScore,
    recovery_score: input.recoveryScore,
    would_repeat: input.wouldRepeat,
    side_effects_reported: (input.sideEffectsReported || []).map(normalizeSideEffect),
    side_effect_severity: input.sideEffectSeverity,
  });
}

/**
 * Ship a bloodwork snapshot. Each numeric field travels with the
 * unit baked into its column name (see Bloodwork interface in
 * types/index.ts), so buyers can compare across users without
 * unit conversions.
 */
export function trackBloodwork(input: Bloodwork) {
  trackEvent("bloodwork_logged", {
    bloodwork_id: input.id,
    cycle_id: input.cycleId,
    drawn_on: input.date,
    lab_name: input.labName,
    testosterone_total: input.testosterone_total,
    testosterone_free: input.testosterone_free,
    estradiol: input.estradiol,
    shbg: input.shbg,
    igf1: input.igf1,
    tsh: input.tsh,
    hba1c: input.hba1c,
    fasting_glucose: input.fasting_glucose,
    fasting_insulin: input.fasting_insulin,
    total_cholesterol: input.total_cholesterol,
    ldl: input.ldl,
    hdl: input.hdl,
    triglycerides: input.triglycerides,
    hs_crp: input.hs_crp,
    alt: input.alt,
    ast: input.ast,
    creatinine: input.creatinine,
  });
}
