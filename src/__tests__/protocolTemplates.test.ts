import { protocolTemplates } from "../data/protocolTemplates";
import { peptides } from "../data/peptides";

describe("Protocol Templates", () => {
  it("should have templates loaded", () => {
    expect(protocolTemplates.length).toBeGreaterThan(0);
  });

  it("every template should have required fields", () => {
    for (const t of protocolTemplates) {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.goals.length).toBeGreaterThan(0);
      expect(t.description).toBeTruthy();
      expect(t.peptides.length).toBeGreaterThan(0);
      expect(t.cycleDuration).toBeTruthy();
      expect(["beginner", "intermediate", "advanced"]).toContain(t.difficulty);
    }
  });

  it("every template should have unique id", () => {
    const ids = protocolTemplates.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every template peptide should reference a valid peptide", () => {
    const allIds = new Set(peptides.map((p) => p.id));
    for (const t of protocolTemplates) {
      for (const tp of t.peptides) {
        expect(allIds).toContain(tp.peptideId);
      }
    }
  });

  it("every template peptide should have dosing info", () => {
    for (const t of protocolTemplates) {
      for (const tp of t.peptides) {
        expect(tp.role).toBeTruthy();
        expect(tp.suggestedDose).toBeTruthy();
        expect(tp.suggestedFrequency).toBeTruthy();
        expect(tp.suggestedDuration).toBeTruthy();
      }
    }
  });

  it("no template should have mcg in suggested doses", () => {
    for (const t of protocolTemplates) {
      for (const tp of t.peptides) {
        expect(tp.suggestedDose).not.toMatch(/\d+\s*mcg/);
      }
    }
  });

  it("should have a template for muscle_gain + anti_aging combo", () => {
    const combo = protocolTemplates.find(
      (t) => t.goals.includes("muscle_gain") && t.goals.includes("anti_aging")
    );
    expect(combo).toBeDefined();
  });

  it("protocol scoring should rank multi-goal matches higher", () => {
    const goals = ["muscle_gain", "anti_aging"] as const;
    const scored = protocolTemplates
      .map((t) => ({
        template: t,
        score: t.goals.filter((g) => goals.includes(g as any)).length,
      }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    expect(scored.length).toBeGreaterThan(0);
    expect(scored[0].score).toBe(2); // Top result matches both goals
  });
});
