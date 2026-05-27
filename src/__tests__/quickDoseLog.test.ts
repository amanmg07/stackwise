import { buildQuickDoseLogs } from "../utils/quickDoseLog";
import { Cycle, DoseLog } from "../types";

function localDate(y: number, m: number, d: number, h = 12, min = 0): Date {
  return new Date(y, m - 1, d, h, min);
}

const baseCycle: Cycle = {
  id: "cyc-1",
  name: "Recovery stack",
  startDate: "2026-05-01",
  endDate: "2026-07-01",
  isActive: true,
  notes: "",
  createdAt: "2026-05-01T00:00:00.000Z",
  peptides: [
    { peptideId: "bpc157", doseAmount: 250, doseUnit: "mcg", frequency: "1x daily", route: "subcutaneous", timeOfDay: ["morning"] },
    { peptideId: "tb500",  doseAmount: 2,   doseUnit: "mg",  frequency: "2x weekly", route: "subcutaneous", timeOfDay: ["morning"] },
    { peptideId: "ghkcu",  doseAmount: 1,   doseUnit: "mg",  frequency: "1x daily", route: "subcutaneous", timeOfDay: ["evening"] },
  ],
};

function dose(peptideId: string, ts: string, cycleId = "cyc-1"): DoseLog {
  return {
    id: peptideId + "-" + ts,
    cycleId,
    peptideId,
    amount: 100,
    unit: "mcg",
    route: "subcutaneous",
    timestamp: ts,
  };
}

describe("buildQuickDoseLogs", () => {
  const today = localDate(2026, 5, 27);

  it("creates a log for every peptide when none have been logged today", () => {
    const out = buildQuickDoseLogs(baseCycle, [], today);
    expect(out).toHaveLength(3);
    expect(out.map((l) => l.peptideId).sort()).toEqual(["bpc157", "ghkcu", "tb500"]);
    expect(out.every((l) => l.quickLogged === true)).toBe(true);
    expect(out.every((l) => l.cycleId === "cyc-1")).toBe(true);
  });

  it("inherits the cycle's amount + unit + route for each peptide", () => {
    const out = buildQuickDoseLogs(baseCycle, [], today);
    const bpc = out.find((l) => l.peptideId === "bpc157")!;
    expect(bpc.amount).toBe(250);
    expect(bpc.unit).toBe("mcg");
    expect(bpc.route).toBe("subcutaneous");

    const tb = out.find((l) => l.peptideId === "tb500")!;
    expect(tb.amount).toBe(2);
    expect(tb.unit).toBe("mg");
  });

  it("skips peptides that already have a log today", () => {
    const existing = [
      dose("bpc157", "2026-05-27T09:15:00"),
      dose("tb500", "2026-05-27T09:16:00"),
    ];
    const out = buildQuickDoseLogs(baseCycle, existing, today);
    expect(out.map((l) => l.peptideId)).toEqual(["ghkcu"]);
  });

  it("returns [] when every peptide already has a log today", () => {
    const existing = [
      dose("bpc157", "2026-05-27T09:00:00"),
      dose("tb500", "2026-05-27T09:00:00"),
      dose("ghkcu", "2026-05-27T09:00:00"),
    ];
    expect(buildQuickDoseLogs(baseCycle, existing, today)).toEqual([]);
  });

  it("doesn't count yesterday's logs as 'today logged'", () => {
    const existing = [
      dose("bpc157", "2026-05-26T23:00:00"),
      dose("tb500",  "2026-05-26T09:00:00"),
    ];
    const out = buildQuickDoseLogs(baseCycle, existing, today);
    // All three should be created — yesterday's logs don't satisfy today.
    expect(out).toHaveLength(3);
  });

  it("ignores logs from a different cycle", () => {
    const existing = [
      dose("bpc157", "2026-05-27T09:00:00", "other-cycle"),
    ];
    const out = buildQuickDoseLogs(baseCycle, existing, today);
    expect(out).toHaveLength(3); // other cycle doesn't shield this cycle's peptide
  });

  it("survives a malformed timestamp on an existing log", () => {
    const existing = [
      { ...dose("bpc157", "2026-05-27T09:00:00"), timestamp: "garbage" } as DoseLog,
    ];
    expect(() => buildQuickDoseLogs(baseCycle, existing, today)).not.toThrow();
    // Malformed log is ignored → bpc157 not registered as logged → all 3 generated.
    const out = buildQuickDoseLogs(baseCycle, existing, today);
    expect(out).toHaveLength(3);
  });

  it("returns [] for a cycle with no peptides", () => {
    const empty: Cycle = { ...baseCycle, peptides: [] };
    expect(buildQuickDoseLogs(empty, [], today)).toEqual([]);
  });
});
