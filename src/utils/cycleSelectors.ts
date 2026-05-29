// ────────────────────────────────────────────────────────────────────
// Shared cycle selectors. Lifted out of CycleTrackerScreen so Home
// (ticket 1.1) can reuse the same "today's dose state" + milestone
// math without copying the logic. Local-date precision throughout —
// see [[project_analytics_data_integrity]] and the timezone-audit
// note in src/utils/streak.ts.
// ────────────────────────────────────────────────────────────────────

import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Cycle, CycleOutcome, DoseLog, OUTCOME_WEEKS, OutcomeWeek } from "../types";

/** Local-date YYYY-MM-DD key (used instead of UTC for any per-day comparison). */
export function todayLocalKey(today: Date = new Date()): string {
  return format(today, "yyyy-MM-dd");
}

/**
 * The earliest milestone week (4/8/12/16) that is currently DUE for
 * this cycle and not yet answered. Returns null if none are due.
 */
export function computeDueWeek(
  cycle: Cycle,
  outcomes: CycleOutcome[],
  today: Date = new Date(),
): OutcomeWeek | null {
  const start = parseISO(cycle.startDate + "T00:00:00");
  const daysSinceStart = differenceInCalendarDays(today, start);
  const completed = new Set(
    outcomes.filter((o) => o.cycleId === cycle.id).map((o) => o.weekNumber),
  );
  return (
    OUTCOME_WEEKS.find((w) => daysSinceStart >= w * 7 && !completed.has(w)) ?? null
  );
}

/**
 * The next milestone that is NOT yet due, with the days-away count.
 * Returns null if every remaining milestone is either due-now (use
 * computeDueWeek) or already answered.
 */
export function computeNextMilestone(
  cycle: Cycle,
  outcomes: CycleOutcome[],
  today: Date = new Date(),
): { week: OutcomeWeek; daysAway: number } | null {
  const start = parseISO(cycle.startDate + "T00:00:00");
  const daysSinceStart = differenceInCalendarDays(today, start);
  const completed = new Set(
    outcomes.filter((o) => o.cycleId === cycle.id).map((o) => o.weekNumber),
  );
  const upcoming = OUTCOME_WEEKS.find(
    (w) => daysSinceStart < w * 7 && !completed.has(w),
  );
  if (!upcoming) return null;
  return { week: upcoming, daysAway: upcoming * 7 - daysSinceStart };
}

/**
 * Dose logs in this cycle whose timestamp falls on today (local TZ).
 * Used by the Home "Today's doses" card and the cycle tracker — both
 * must agree on what "today" means, otherwise the streak strip and
 * the dose-row checkmarks drift apart at the day boundary.
 */
export function selectTodayDoseLogs(
  cycle: Cycle,
  allDoseLogs: DoseLog[],
  today: Date = new Date(),
): DoseLog[] {
  const key = todayLocalKey(today);
  return allDoseLogs.filter((l) => {
    if (l.cycleId !== cycle.id) return false;
    try {
      return format(parseISO(l.timestamp), "yyyy-MM-dd") === key;
    } catch {
      return false;
    }
  });
}

/** Set of peptide IDs from the active cycle that have ≥1 dose logged today. */
export function selectPeptidesDosedToday(
  cycle: Cycle,
  allDoseLogs: DoseLog[],
  today: Date = new Date(),
): Set<string> {
  return new Set(selectTodayDoseLogs(cycle, allDoseLogs, today).map((l) => l.peptideId));
}

/**
 * Day-N of the cycle (1-indexed, capped at total length). Cycles that
 * haven't started yet return 0. Floored at 1 once the cycle has
 * started so we don't render "Day 0 of N" on the start date.
 */
export function cycleDayNumber(cycle: Cycle, today: Date = new Date()): number {
  const start = parseISO(cycle.startDate + "T00:00:00");
  const days = differenceInCalendarDays(today, start);
  if (days < 0) return 0;
  const total = cycleTotalDays(cycle);
  // Math.max(1, ...) so we never show "Day 0" on the start date —
  // a brand-new cycle reads as "Day 1 of N", not "Day 0 of N".
  return Math.max(1, Math.min(days + 1, total));
}

/**
 * Total planned cycle length in days. Floored at 1 so a cycle
 * with startDate === endDate (1-day cycle) or a corrupted record
 * with endDate < startDate never produces a "Day 1 of 0" garbage
 * display on Home or CycleTracker.
 */
export function cycleTotalDays(cycle: Cycle): number {
  const start = parseISO(cycle.startDate + "T00:00:00");
  const end = parseISO(cycle.endDate + "T00:00:00");
  return Math.max(1, differenceInCalendarDays(end, start));
}
