import { supabase, getCurrentUserId } from "../utils/supabase";
import { appStorage } from "../utils/storage";
import * as Sentry from "@sentry/react-native";

/**
 * Send an anonymized analytics event to Supabase.
 * Only fires if the user opted in (analyticsConsent === true).
 * All events are keyed by anonymous user ID — no PII is sent.
 */
export async function trackEvent(
  eventType: string,
  payload: Record<string, any> = {}
) {
  try {
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

// Convenience wrappers for common events

export function trackCycleCreated(peptideIds: string[], goal?: string) {
  trackEvent("cycle_created", { peptide_ids: peptideIds, goal });
}

export function trackDoseLogged(peptideId: string, amount: number, unit: "mcg" | "mg" | "IU") {
  trackEvent("dose_logged", { peptide_id: peptideId, amount, unit });
}

export function trackCycleUpdated(peptideIds: string[]) {
  trackEvent("cycle_updated", { peptide_ids: peptideIds });
}

export function trackCycleEnded(data: {
  peptideIds: string[];
  durationDays: number;
  reason: "completed" | "ended_early";
}) {
  trackEvent("cycle_ended", data);
}

export function trackScanCompleted(recommendedCategories: string[]) {
  trackEvent("scan_completed", { recommended_categories: recommendedCategories });
}

export function trackScanCompared(data: {
  daysBetween: number;
  changesImproved: number;
  changesWorsened: number;
  changesUnchanged: number;
  workingPeptideIds: string[];
  recommendedCategories: string[];
}) {
  trackEvent("scan_compared", data);
}

export function trackJournalEntry(metrics: {
  sleepQuality: number;
  energyLevel: number;
  recoveryScore: number;
  mood: number;
  weight?: number;
  activePeptideIds: string[];
  sideEffects?: string[];
}) {
  trackEvent("journal_entry", metrics);
}
