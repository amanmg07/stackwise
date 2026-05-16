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

  // Regression: deep /products/<slug> links rotted to 404s across vendors
  // (Momentous discontinued its Huberman line, Shopify stores reshuffled
  // slugs). Supplement buy links must be search URLs, which never 404.
  it("uses search URLs (never deep product slugs) for supplement vendors", () => {
    const supplementPeptideIds = ["creatine_mono", "ashwagandha", "omega3", "collagen", "magnesium_glycinate"];
    for (const id of supplementPeptideIds) {
      const sources = getSourcesForPeptide(id);
      expect(sources.length).toBeGreaterThan(0);
      for (const s of sources) {
        expect(s.url).toMatch(/^https:\/\//);
        // Search endpoints carry a query param; a bare /products/<slug>
        // deep link (the thing that rotted) never does.
        expect(s.url).not.toMatch(/\/products\/[a-z]/i);
        expect(s.url).toMatch(/[?&](q|s|k|text)=/);
      }
    }
  });

  it("points magnesium_glycinate at glycinate, not threonate", () => {
    const sources = getSourcesForPeptide("magnesium_glycinate");
    for (const s of sources) {
      expect(decodeURIComponent(s.url).toLowerCase()).not.toContain("threonate");
    }
    expect(decodeURIComponent(sources[0].url).toLowerCase()).toContain("magnesium glycinate");
  });
});
