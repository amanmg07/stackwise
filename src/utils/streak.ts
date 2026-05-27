// ────────────────────────────────────────────────────────────────────
// Streak — the daily-habit retention primitive for StackWise.
//
// A day is "logged" if the user created ≥1 journal entry OR ≥1 dose
// log on that local-calendar date. The streak counts consecutive
// logged days walking backward from today. Today counts if logged;
// otherwise the streak walks back from yesterday — so the count stays
// alive *within* the current day, dropping to zero only at the next
// local midnight (which the user experiences as a clean daily reset).
//
// LOCAL TIME ONLY. Late-night and early-morning logs both land on the
// user's wall-clock day. Mixing UTC and local across this utility is
// the bug we are explicitly preventing — see streak.test.ts for the
// 23:59 / 00:01 boundary cases.
// ────────────────────────────────────────────────────────────────────

import { format, parseISO, subDays } from "date-fns";
import { JournalEntry, DoseLog } from "../types";

export interface StreakDay {
  /** YYYY-MM-DD in the user's local timezone. */
  date: string;
  /** True if ≥1 journal entry or dose log exists for this local date. */
  logged: boolean;
  /** True only for the rightmost cell — the in-progress current day. */
  isToday: boolean;
}

export interface StreakInfo {
  /** Consecutive logged days ending today (or yesterday if today not yet logged). */
  current: number;
  /** True if today has at least one log. */
  todayLogged: boolean;
  /** Oldest-first array of exactly 7 cells covering today and the previous 6 days. */
  last7: StreakDay[];
}

/** Format a Date as the local-timezone YYYY-MM-DD key used everywhere here. */
function localDateKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/**
 * Build a Set of local-date keys for every day with at least one log.
 *
 * Journal entries store `.date` as YYYY-MM-DD already (created via
 * date-fns local format) — used as-is.
 *
 * Dose logs store `.timestamp` as an ISO string with time component —
 * parsed and reformatted to the local date so a 23:59 log on Monday
 * never accidentally registers as Tuesday in UTC users.
 */
function loggedDaySet(journal: JournalEntry[], doseLogs: DoseLog[]): Set<string> {
  const out = new Set<string>();
  for (const e of journal) {
    if (e.date) out.add(e.date);
  }
  for (const l of doseLogs) {
    if (!l.timestamp) continue;
    try {
      out.add(localDateKey(parseISO(l.timestamp)));
    } catch {
      // Malformed timestamp — skip rather than crash the home screen.
    }
  }
  return out;
}

/**
 * Hard cap on the backward walk. Even a maximally devoted user logging
 * every day since the dawn of the App Store won't hit this; it exists
 * solely so a corrupted dataset (clock-skew, dupe rows) can't pin the
 * render thread in an infinite loop.
 */
const SAFE_MAX_STREAK = 3650;

export function computeStreak(
  journal: JournalEntry[],
  doseLogs: DoseLog[],
  today: Date = new Date(),
): StreakInfo {
  const logged = loggedDaySet(journal, doseLogs);
  const todayKey = localDateKey(today);
  const todayLogged = logged.has(todayKey);

  // 7-cell grid: 6 days ago → today (today is the rightmost cell).
  const last7: StreakDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(today, i);
    const key = localDateKey(d);
    last7.push({ date: key, logged: logged.has(key), isToday: i === 0 });
  }

  // Walk backward. If today isn't logged yet, the streak is the run of
  // days ending yesterday; today's empty dot is the prompt to extend.
  let cursor = todayLogged ? today : subDays(today, 1);
  let current = 0;
  while (current < SAFE_MAX_STREAK) {
    if (!logged.has(localDateKey(cursor))) break;
    current += 1;
    cursor = subDays(cursor, 1);
  }

  return { current, todayLogged, last7 };
}
