// ────────────────────────────────────────────────────────────────────
// Quick-dose-log helper (ticket 1.6).
//
// When the user long-presses the daily reminder and taps the
// "✓ I took today's doses" notification action, the system invokes a
// background handler that batch-creates a DoseLog for every peptide
// in the active cycle that doesn't already have a log today (local
// TZ). Each log carries quickLogged=true so the buyer dataset can
// filter notification-tap doses out of high-fidelity dose-response
// aggregates.
//
// Defaults come from the cycle's prescribed config (amount / unit /
// route) — same values the in-app dose-log screen pre-fills. The
// system never assumes a site, source, or notes.
//
// Pure function (no I/O); the AppContext caller does the persistence
// + analytics emission. This file is tested independently.
// ────────────────────────────────────────────────────────────────────

import { format, parseISO } from "date-fns";
import { Cycle, DoseLog } from "../types";
import { generateId } from "./id";

/**
 * Return the DoseLog rows to create when the user taps the
 * notification's "I took today's doses" action. May be empty if every
 * peptide in the cycle already has a log today.
 */
export function buildQuickDoseLogs(
  cycle: Cycle,
  existingDoseLogs: DoseLog[],
  now: Date = new Date(),
): DoseLog[] {
  const todayKey = format(now, "yyyy-MM-dd");

  const loggedToday = new Set<string>();
  for (const l of existingDoseLogs) {
    if (l.cycleId !== cycle.id) continue;
    try {
      if (format(parseISO(l.timestamp), "yyyy-MM-dd") === todayKey) {
        loggedToday.add(l.peptideId);
      }
    } catch {
      // Malformed timestamp — skip rather than crash.
    }
  }

  const out: DoseLog[] = [];
  for (const cp of cycle.peptides) {
    if (loggedToday.has(cp.peptideId)) continue;
    out.push({
      id: generateId(),
      cycleId: cycle.id,
      peptideId: cp.peptideId,
      amount: cp.doseAmount,
      unit: cp.doseUnit,
      route: cp.route,
      timestamp: now.toISOString(),
      quickLogged: true,
    });
  }
  return out;
}
