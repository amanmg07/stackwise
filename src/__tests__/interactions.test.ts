import { getInteractions, interactions } from "../data/interactions";
import { peptides } from "../data/peptides";

describe("Peptide Interactions", () => {
  it("should return empty for fewer than 2 peptides", () => {
    expect(getInteractions([])).toEqual([]);
    expect(getInteractions(["bpc157"])).toEqual([]);
  });

  it("should detect warning-level interactions", () => {
    const results = getInteractions(["semaglutide", "tirzepatide"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].severity).toBe("warning");
  });

  it("should detect synergies (info level)", () => {
    const results = getInteractions(["bpc157", "tb500"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].severity).toBe("info");
  });

  it("should detect caution-level interactions", () => {
    const results = getInteractions(["mk677", "ghrp6"]);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].severity).toBe("caution");
  });

  it("should return no interactions for unrelated peptides", () => {
    const results = getInteractions(["bpc157", "selank"]);
    expect(results.length).toBe(0);
  });

  it("should handle 3+ peptides and find all pairs", () => {
    const results = getInteractions(["bpc157", "tb500", "ghkcu"]);
    // bpc157+tb500, bpc157+ghkcu, tb500+ghkcu all have info interactions
    expect(results.length).toBe(3);
  });

  it("every interaction should reference valid peptide IDs", () => {
    const allIds = new Set(peptides.map((p) => p.id));
    for (const i of interactions) {
      expect(allIds).toContain(i.peptideIds[0]);
      expect(allIds).toContain(i.peptideIds[1]);
    }
  });

  it("every interaction should have required fields", () => {
    for (const i of interactions) {
      expect(i.peptideIds.length).toBe(2);
      expect(["warning", "caution", "info"]).toContain(i.severity);
      expect(i.title).toBeTruthy();
      expect(i.detail).toBeTruthy();
    }
  });
});
