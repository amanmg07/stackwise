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

function isValidPayload(eventType: string, payload: Record<string, any>): boolean {
  switch (eventType) {
    case "dose_logged":
      return (
        typeof payload.cycle_id === "string" && payload.cycle_id.length > 0 &&
        typeof payload.peptide_id === "string" && payload.peptide_id.length > 0 &&
        typeof payload.amount === "number" &&
        Number.isFinite(payload.amount) &&
        payload.amount > MIN_DOSE &&
        payload.amount < MAX_DOSE
      );
    case "cycle_created":
    case "cycle_updated":
    case "cycle_ended":
      return typeof payload.cycle_id === "string" && payload.cycle_id.length > 0;
    case "journal_entry":
      return (
        typeof payload.sleepQuality === "number" && payload.sleepQuality >= 1 && payload.sleepQuality <= 10 &&
        typeof payload.energyLevel === "number" && payload.energyLevel >= 1 && payload.energyLevel <= 10
      );
    default:
      // Lightweight events (peptide_viewed, chat_question, etc.)
      // don't have hard validation. Allow them through.
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

    await supabase.from("analytics_events").insert({
      anon_id: userId,
      event_type: eventType,
      payload,
    });
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

    // RLS limits this to the caller's own rows by anon_id, so we don't
    // need to filter explicitly here.
    await supabase
      .from("analytics_events")
      .delete()
      .in("event_type", ["cycle_created", "cycle_updated", "cycle_ended", "dose_logged"])
      .eq("anon_id", userId)
      .filter("payload->>cycle_id", "eq", cycleId);
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
    await supabase
      .from("analytics_events")
      .delete()
      .in("event_type", ["scan_completed", "scan_compared"])
      .eq("anon_id", userId)
      .filter("payload->>scan_id", "eq", scanId);
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

interface CycleCreatedInput {
  cycleId: string;
  name: string;
  peptides: CyclePeptide[];
  durationWeeks: number;
  templateId?: string;
  goal?: string;
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
    goal: input.goal,
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
  });
}

export function trackScanCompleted(scanId: string, recommendedCategories: string[]) {
  trackEvent("scan_completed", {
    scan_id: scanId,
    recommended_categories: recommendedCategories,
  });
}

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

export function trackPeptideViewed(peptideId: string) {
  trackEvent("peptide_viewed", { peptide_id: peptideId });
}

export function trackPeptideBookmarked(peptideId: string, action: "saved" | "removed") {
  trackEvent("peptide_bookmarked", { peptide_id: peptideId, action });
}

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
