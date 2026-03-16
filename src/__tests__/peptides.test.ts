import { peptides } from "../data/peptides";

describe("Peptide Database", () => {
  it("should have peptides loaded", () => {
    expect(peptides.length).toBeGreaterThan(0);
  });

  it("every peptide should have required fields", () => {
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

  it("every peptide should have unique id", () => {
    const ids = peptides.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every peptide should have valid categories", () => {
    const validCats = [
      "recovery", "fat_loss", "muscle_gain", "anti_aging",
      "cognitive", "sleep", "immune", "sexual_health", "hormone",
    ];
    for (const p of peptides) {
      for (const cat of p.categories) {
        expect(validCats).toContain(cat);
      }
    }
  });

  it("every peptide should have valid routes", () => {
    const validRoutes = ["subcutaneous", "intramuscular", "oral", "topical", "nasal"];
    for (const p of peptides) {
      for (const route of p.routes) {
        expect(validRoutes).toContain(route);
      }
    }
  });

  it("dosing protocols should have all fields", () => {
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

  it("no peptide should have mcg in dose ranges", () => {
    for (const p of peptides) {
      for (const proto of p.dosingProtocols) {
        expect(proto.doseRange).not.toMatch(/\d+\s*mcg/);
      }
    }
  });

  it("stacksWith should reference valid peptide ids", () => {
    const allIds = new Set(peptides.map((p) => p.id));
    for (const p of peptides) {
      for (const stackId of p.stacksWith) {
        expect(allIds).toContain(stackId);
      }
    }
  });
});
