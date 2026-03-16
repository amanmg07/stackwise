import { getSourcesForPeptide } from "../data/peptideSources";
import { peptides } from "../data/peptides";

describe("Peptide Sources", () => {
  it("should return sources for a regular peptide", () => {
    const sources = getSourcesForPeptide("bpc157");
    expect(sources.length).toBeGreaterThan(0);
    expect(sources[0].name).toBeTruthy();
    expect(sources[0].url).toBeTruthy();
  });

  it("should include all research vendors for non-Rx peptides", () => {
    const sources = getSourcesForPeptide("bpc157");
    const names = sources.map((s) => s.name);
    expect(names).toContain("Peptide Sciences");
    expect(names).toContain("Neuro Labs");
    expect(names).toContain("Onyx Research");
    expect(names).toContain("Ascend Peptides");
  });

  it("should handle Rx peptides differently", () => {
    const sources = getSourcesForPeptide("semaglutide");
    // Semaglutide is Rx, should have prescription source
    expect(sources.length).toBeGreaterThan(0);
  });

  it("should return sources for all peptides without error", () => {
    for (const p of peptides) {
      const sources = getSourcesForPeptide(p.id);
      expect(sources).toBeDefined();
      expect(Array.isArray(sources)).toBe(true);
    }
  });
});
