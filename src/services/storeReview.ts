// ────────────────────────────────────────────────────────────────────
// App Store rate prompt (ticket 2.5).
//
// Fires the OS-native review request via expo-store-review. Called
// exactly once per user from AppContext.addOutcome the first time
// they save an outcome check-in — by far the highest-positivity
// moment in the app (they just spent 60 seconds describing what
// went well in their cycle). Apple caps the system prompt at 3
// times per user per year regardless of our call frequency, so the
// hasRequestedReview flag exists to keep our budget reserved for
// the right moment instead of burning it on first-launch or
// post-dose-log.
// ────────────────────────────────────────────────────────────────────

import * as StoreReview from "expo-store-review";
import * as Sentry from "@sentry/react-native";

/**
 * Returns true only if the OS confirmed it would surface the prompt
 * and we asked. The caller uses this to decide whether to flip the
 * persisted hasRequestedReview flag — if hasAction said no (e.g.
 * Expo Go, simulator, Apple's per-year cap already hit), we want
 * the next outcome check-in to try again.
 */
export async function tryRequestStoreReview(): Promise<boolean> {
  try {
    const ok = await StoreReview.hasAction();
    if (!ok) return false;
    await StoreReview.requestReview();
    return true;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}
