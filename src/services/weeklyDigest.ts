// ────────────────────────────────────────────────────────────────────
// Weekly digest orchestration (ticket 2.1).
//
// On Sundays, the daily-reminder cadence is supplemented by a weekly
// reminder that opens to a 3-bullet "Your week in StackWise" card on
// Home. The card is AI-generated via chatService.generateWeeklyDigest
// in digest mode, then cached per-week in AsyncStorage so it doesn't
// regenerate on every open.
//
// The cache key is the digest's Sunday-date (YYYY-MM-DD), so each
// week's digest survives independently and old digests can be pruned
// later if desired.
//
// Per the plan: skip generation entirely if the user has <3 journal
// entries in the past 7 days. The digest would have nothing to say
// and would feel padded / hollow.
// ────────────────────────────────────────────────────────────────────

import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, parseISO, subDays, startOfDay } from "date-fns";
import * as Sentry from "@sentry/react-native";
import {
  Cycle, JournalEntry, DoseLog, ScanRecord, UserSettings, CycleOutcome,
} from "../types";
import { generateWeeklyDigest } from "./chatService";

const CACHE_PREFIX = "stackwise.weekly_digest.";
const DISMISSED_PREFIX = "stackwise.weekly_digest.dismissed.";
const MIN_ENTRIES_TO_DIGEST = 3;
const DIGEST_WINDOW_DAYS = 7;

/**
 * Key for the digest that summarizes the 7 days ending today.
 * Uses local date so the cache rolls over at the user's wall-clock
 * midnight, not UTC midnight.
 */
export function currentDigestKey(now: Date = new Date()): string {
  return format(startOfDay(now), "yyyy-MM-dd");
}

async function loadCachedDigest(key: string): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(CACHE_PREFIX + key)) ?? null;
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
}

async function saveCachedDigest(key: string, content: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_PREFIX + key, content);
  } catch (e) {
    Sentry.captureException(e);
  }
}

export async function loadDigestDismissed(key: string): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(DISMISSED_PREFIX + key)) === "1";
  } catch {
    return false;
  }
}

export async function markDigestDismissed(key: string): Promise<void> {
  try {
    await AsyncStorage.setItem(DISMISSED_PREFIX + key, "1");
  } catch (e) {
    Sentry.captureException(e);
  }
}

/**
 * Journal entries from the past 7 local days, inclusive of today.
 * Used both for the >=3 gate and for the chat-context payload.
 */
export function entriesInWindow(
  journal: JournalEntry[],
  now: Date = new Date(),
): JournalEntry[] {
  const startKey = format(subDays(now, DIGEST_WINDOW_DAYS - 1), "yyyy-MM-dd");
  return journal.filter((e) => e.date >= startKey);
}

export interface DigestResult {
  weekKey: string;
  content: string;
}

/**
 * Returns the cached digest for the current week if present, else
 * generates a fresh one (gated on >=3 entries in the past 7 days),
 * caches it, and returns. Returns null when generation is skipped
 * (insufficient data) — the caller hides the card.
 */
export async function getOrGenerateWeeklyDigest(input: {
  journal: JournalEntry[];
  doseLogs: DoseLog[];
  cycles: Cycle[];
  scans: ScanRecord[];
  outcomes: CycleOutcome[];
  settings: UserSettings;
  now?: Date;
}): Promise<DigestResult | null> {
  const now = input.now ?? new Date();
  const weekKey = currentDigestKey(now);

  // Cache hit — fast path. Avoids re-spending Groq tokens on every
  // home-screen mount.
  const cached = await loadCachedDigest(weekKey);
  if (cached) return { weekKey, content: cached };

  // Gate on data sufficiency. <3 entries → no digest this week.
  const windowEntries = entriesInWindow(input.journal, now);
  if (windowEntries.length < MIN_ENTRIES_TO_DIGEST) return null;

  try {
    const content = await generateWeeklyDigest({
      activeCycle: input.cycles.find((c) => c.isActive) || null,
      recentJournal: windowEntries,
      pastCycles: input.cycles.filter((c) => !c.isActive).slice(0, 3),
      scans: input.scans.slice(0, 2),
      settings: input.settings,
    });
    if (!content) return null;
    await saveCachedDigest(weekKey, content);
    return { weekKey, content };
  } catch (e) {
    Sentry.captureException(e);
    return null;
  }
}

/**
 * Prune cached digests older than 4 weeks. Optional housekeeping —
 * digests are tiny strings, but no reason to let them accumulate
 * for years. Call lazily, not on the hot path.
 */
export async function pruneOldDigests(now: Date = new Date()): Promise<void> {
  try {
    const cutoffKey = format(subDays(now, 28), "yyyy-MM-dd");
    const keys = await AsyncStorage.getAllKeys();
    const stale = keys.filter((k) => {
      if (!k.startsWith(CACHE_PREFIX) && !k.startsWith(DISMISSED_PREFIX)) return false;
      const dateKey = k.replace(CACHE_PREFIX, "").replace(DISMISSED_PREFIX, "");
      return dateKey < cutoffKey;
    });
    if (stale.length > 0) await AsyncStorage.multiRemove(stale);
  } catch (e) {
    Sentry.captureException(e);
  }
}
