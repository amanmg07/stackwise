import { format, addWeeks } from "date-fns";
import { Cycle, CyclePeptide, JournalEntry, Peptide, AdministrationRoute, Goal } from "../types";
import { generateId } from "./id";
import { trackCycleCreated, trackCycleUpdated, computeBaseline } from "../services/analyticsService";

// Shared "add a compound to the user's cycle" behavior. Used by the AI
// chat peptide cards; the Self Scan and PeptideDetail screens have
// their own inline copies (on separate branches) that should converge
// onto this once those land.

function parseDoseUnit(s?: string): "mcg" | "mg" | "g" | "IU" {
  if (!s) return "mg";
  if (/\biu\b/i.test(s)) return "IU";
  if (/\bmcg\b/i.test(s) || /\bμg\b/.test(s)) return "mcg";
  if (/\bg\b/i.test(s) && !/\bmg\b/i.test(s)) return "g";
  return "mg";
}

/** Derive a sensible default CyclePeptide from a compound's first protocol. */
export function buildCyclePeptide(pep: Peptide): CyclePeptide {
  const doseRange = pep.dosingProtocols?.[0]?.doseRange;
  const doseMatch = doseRange?.match(/([\d.,]+)/);
  return {
    peptideId: pep.id,
    doseAmount: doseMatch ? parseFloat(doseMatch[1].replace(/,/g, "")) : 0.25,
    doseUnit: parseDoseUnit(doseRange),
    frequency: pep.dosingProtocols?.[0]?.frequency || "daily",
    route: (pep.routes?.[0] || "subcutaneous") as AdministrationRoute,
    timeOfDay: ["morning"],
  };
}

interface AddDeps {
  cycles: Cycle[];
  addCycle: (c: Cycle) => void;
  updateCycle: (c: Cycle) => void;
  journal: JournalEntry[];
  goals?: Goal[];
  /** Where the add came from, used in the new-cycle note (e.g. "AI chat"). */
  sourceLabel: string;
}

/**
 * Add `pep` to the active cycle, or auto-create a new active cycle
 * containing just it when there's none. Returns a short status string
 * suitable for a toast.
 */
export function addCompoundToCycle(deps: AddDeps, pep: Peptide): string {
  const cp = buildCyclePeptide(pep);
  const startDate = new Date().toISOString().split("T")[0];
  const active = deps.cycles.find((c) => c.isActive);

  if (active) {
    if (active.peptides.some((p) => p.peptideId === pep.id)) {
      return `${pep.name} is already in "${active.name}"`;
    }
    const merged = [...active.peptides, { ...cp, addedAt: startDate }];
    deps.updateCycle({ ...active, peptides: merged });
    trackCycleUpdated(active.id, merged as any);
    return `Added ${pep.name} to "${active.name}"`;
  }

  const endDate = format(addWeeks(new Date(), 8), "yyyy-MM-dd");
  const cycleId = generateId();
  const goals = deps.goals || [];
  deps.addCycle({
    id: cycleId,
    name: pep.name,
    peptides: [cp],
    startDate,
    endDate,
    isActive: true,
    notes: `Started from ${deps.sourceLabel}`,
    createdAt: new Date().toISOString(),
    goals,
  });
  trackCycleCreated({
    cycleId,
    name: pep.name,
    peptides: [cp] as any,
    durationWeeks: 8,
    goals,
    baseline: computeBaseline(deps.journal),
    sourceScanId: undefined,
  });
  return `Started a cycle with ${pep.name}`;
}
