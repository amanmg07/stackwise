import { supabase, getCurrentUserId } from "../utils/supabase";
import { appStorage } from "../utils/storage";

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
    console.warn("Analytics event failed:", e);
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
}) {
  try {
    const settings = await appStorage.loadSettings();
    if (!settings.analyticsConsent) return;

    const userId = await getCurrentUserId();
    if (!userId) return;

    await supabase.from("user_profiles").upsert({
      anon_id: userId,
      age: demographics.age || null,
      gender: demographics.gender || null,
      goals: demographics.goals || [],
      experience_level: demographics.experienceLevel || null,
    });
  } catch (e) {
    console.warn("Profile sync failed:", e);
  }
}

// Convenience wrappers for common events

export function trackCycleCreated(peptideIds: string[], goal?: string) {
  trackEvent("cycle_created", { peptide_ids: peptideIds, goal });
}

export function trackDoseLogged(peptideId: string) {
  trackEvent("dose_logged", { peptide_id: peptideId });
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
  activePeptideIds: string[];
}) {
  trackEvent("journal_entry", metrics);
}
