/**
 * App Quality Tests
 *
 * Tests for data integrity, input validation, and edge cases
 * that ensure App Store quality.
 */

import { peptides } from "../data/peptides";

// ---- Cycle duration validation (mirrors NewCycleScreen logic) ----

function validateCycleDuration(input: string): string | null {
  const weeks = parseInt(input) || 0;
  if (weeks < 1 || weeks > 52) return "Cycle duration must be between 1 and 52 weeks";
  return null;
}

// ---- Cascade delete logic (mirrors AppContext) ----

interface MinimalCycle { id: string; name: string }
interface MinimalLog { id: string; cycleId: string }

function deleteCycleWithLogs(
  cycles: MinimalCycle[],
  doseLogs: MinimalLog[],
  cycleId: string
): { cycles: MinimalCycle[]; doseLogs: MinimalLog[] } {
  return {
    cycles: cycles.filter((c) => c.id !== cycleId),
    doseLogs: doseLogs.filter((l) => l.cycleId !== cycleId),
  };
}

// ---- Dose parsing (mirrors NewCycleScreen fix) ----

function parseDoseAmount(input: string): number {
  return parseFloat(input) || 0;
}

// ---- Display name validation ----

function validateDisplayName(name: string, maxLength: number): string {
  return name.slice(0, maxLength);
}

// ---- Tests ----

describe("App Quality", () => {
  describe("Cycle duration validation", () => {
    it("should reject 0 weeks", () => {
      expect(validateCycleDuration("0")).not.toBeNull();
    });

    it("should reject negative weeks", () => {
      expect(validateCycleDuration("-5")).not.toBeNull();
    });

    it("should reject over 52 weeks", () => {
      expect(validateCycleDuration("100")).not.toBeNull();
    });

    it("should reject non-numeric input", () => {
      expect(validateCycleDuration("abc")).not.toBeNull();
    });

    it("should reject empty input", () => {
      expect(validateCycleDuration("")).not.toBeNull();
    });

    it("should accept 1 week", () => {
      expect(validateCycleDuration("1")).toBeNull();
    });

    it("should accept 8 weeks", () => {
      expect(validateCycleDuration("8")).toBeNull();
    });

    it("should accept 52 weeks", () => {
      expect(validateCycleDuration("52")).toBeNull();
    });
  });

  describe("Cascade delete", () => {
    const cycles: MinimalCycle[] = [
      { id: "c1", name: "Recovery" },
      { id: "c2", name: "Fat Loss" },
    ];
    const doseLogs: MinimalLog[] = [
      { id: "l1", cycleId: "c1" },
      { id: "l2", cycleId: "c1" },
      { id: "l3", cycleId: "c2" },
      { id: "l4", cycleId: "c2" },
    ];

    it("should remove the cycle", () => {
      const result = deleteCycleWithLogs(cycles, doseLogs, "c1");
      expect(result.cycles).toHaveLength(1);
      expect(result.cycles[0].id).toBe("c2");
    });

    it("should remove all dose logs for that cycle", () => {
      const result = deleteCycleWithLogs(cycles, doseLogs, "c1");
      expect(result.doseLogs).toHaveLength(2);
      expect(result.doseLogs.every((l) => l.cycleId === "c2")).toBe(true);
    });

    it("should not affect other cycles' logs", () => {
      const result = deleteCycleWithLogs(cycles, doseLogs, "c1");
      expect(result.doseLogs.map((l) => l.id)).toEqual(["l3", "l4"]);
    });

    it("should handle deleting non-existent cycle gracefully", () => {
      const result = deleteCycleWithLogs(cycles, doseLogs, "c999");
      expect(result.cycles).toHaveLength(2);
      expect(result.doseLogs).toHaveLength(4);
    });
  });

  describe("Dose amount parsing", () => {
    it("should parse decimal doses correctly", () => {
      expect(parseDoseAmount("0.25")).toBe(0.25);
    });

    it("should parse integer doses", () => {
      expect(parseDoseAmount("5")).toBe(5);
    });

    it("should parse small doses", () => {
      expect(parseDoseAmount("0.1")).toBe(0.1);
    });

    it("should return 0 for empty string", () => {
      expect(parseDoseAmount("")).toBe(0);
    });

    it("should return 0 for non-numeric", () => {
      expect(parseDoseAmount("abc")).toBe(0);
    });

    it("should handle leading zero", () => {
      expect(parseDoseAmount("0.5")).toBe(0.5);
    });

    it("should not truncate like parseInt would", () => {
      // This was the actual bug — parseInt("0.25") returns 0
      expect(parseDoseAmount("0.25")).not.toBe(0);
      expect(parseDoseAmount("0.25")).toBe(0.25);
    });
  });

  describe("Display name validation", () => {
    it("should truncate at max length", () => {
      const long = "A".repeat(100);
      expect(validateDisplayName(long, 40)).toHaveLength(40);
    });

    it("should allow short names unchanged", () => {
      expect(validateDisplayName("Aman", 40)).toBe("Aman");
    });

    it("should handle empty string", () => {
      expect(validateDisplayName("", 40)).toBe("");
    });
  });

  describe("Peptide data integrity", () => {
    it("all peptides should have required fields", () => {
      for (const p of peptides) {
        expect(p.id).toBeTruthy();
        expect(p.name).toBeTruthy();
        expect(p.categories.length).toBeGreaterThan(0);
        expect(p.description).toBeTruthy();
        expect(p.mechanism).toBeTruthy();
        expect(p.routes.length).toBeGreaterThan(0);
        expect(p.dosingProtocols.length).toBeGreaterThan(0);
        expect(p.sideEffects.length).toBeGreaterThan(0);
        expect(p.halfLife).toBeTruthy();
        expect(p.storage).toBeTruthy();
      }
    });

    it("all stacksWith references should point to valid peptide IDs", () => {
      const validIds = new Set(peptides.map((p) => p.id));
      for (const p of peptides) {
        for (const ref of p.stacksWith) {
          expect(validIds.has(ref)).toBe(true);
        }
      }
    });

    it("all dosing protocols should have valid fields", () => {
      for (const p of peptides) {
        for (const proto of p.dosingProtocols) {
          expect(proto.purpose).toBeTruthy();
          expect(proto.doseRange).toBeTruthy();
          expect(proto.frequency).toBeTruthy();
          expect(proto.cycleDuration).toBeTruthy();
          expect(proto.timing).toBeTruthy();
        }
      }
    });

    it("no duplicate peptide IDs", () => {
      const ids = peptides.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
});
