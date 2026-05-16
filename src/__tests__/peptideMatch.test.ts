import {
  extractPeptideIds,
  normalizeCompact,
  matchesQuery,
} from "../utils/peptideMatch";
import { peptides } from "../data/peptides";

const ids = (text: string) => extractPeptideIds(text, peptides);
const byId = (id: string) => peptides.find((p) => p.id === id)!;

describe("normalizeCompact", () => {
  it("strips punctuation, spacing and case", () => {
    expect(normalizeCompact("BPC-157")).toBe("bpc157");
    expect(normalizeCompact("bpc 157")).toBe("bpc157");
    expect(normalizeCompact("  B.P.C_157 ")).toBe("bpc157");
  });
});

describe("extractPeptideIds — spacing / punctuation variants", () => {
  // The exact class of input that was producing empty peptide_ids_queried
  // in production before the synonym mapper.
  it.each([
    "BPC-157",
    "bpc157",
    "bpc 157",
    "BPC 157",
    "how much bpc-157 should i take",
  ])("resolves %p to bpc157", (q) => {
    expect(ids(q)).toContain("bpc157");
  });

  it.each(["TB-500", "tb 500", "tb500"])("resolves %p to tb500", (q) => {
    expect(ids(q)).toContain("tb500");
  });
});

describe("extractPeptideIds — aliases (brand / chemical names)", () => {
  it("maps full chemical name to canonical id", () => {
    expect(ids("is Body Protection Compound safe")).toContain("bpc157");
    expect(ids("thymosin beta 4 dosing")).toContain("tb500");
  });

  it("maps brand names to canonical id", () => {
    expect(ids("can I stack Wegovy with anything")).toContain("semaglutide");
    expect(ids("Ozempic vs Mounjaro")).toEqual(
      expect.arrayContaining(["semaglutide", "tirzepatide"])
    );
    expect(ids("Egrifta results")).toContain("tesamorelin");
  });

  it("maps supplement synonyms", () => {
    expect(ids("eurycoma longifolia for test")).toContain("tongkat_ali");
    expect(ids("hericium erinaceus")).toContain("lions_mane");
  });
});

describe("extractPeptideIds — precision", () => {
  it("does not false-positive short tokens inside unrelated words", () => {
    // "kp" (Kisspeptin) must not match inside "workplace",
    // "hn" (Humanin) must not match inside "anyhow then".
    const out = ids("my workplace routine, anyhow then I sleep");
    expect(out).not.toContain("kisspeptin");
    expect(out).not.toContain("humanin");
  });

  it("matches a standalone short token as a whole word", () => {
    expect(ids("starting KPV this week")).toContain("kpv");
  });

  it("returns nothing for text with no compounds", () => {
    expect(ids("what time should I work out today")).toEqual([]);
  });

  it("de-duplicates and finds multiple compounds in one query", () => {
    const out = ids("stacking BPC-157 with tb 500 and ghk-cu");
    expect(out).toEqual(expect.arrayContaining(["bpc157", "tb500", "ghkcu"]));
    expect(new Set(out).size).toBe(out.length);
  });

  it("handles empty / whitespace input", () => {
    expect(ids("")).toEqual([]);
    expect(ids("   ")).toEqual([]);
  });
});

describe("matchesQuery — search-as-you-type", () => {
  const bpc = byId("bpc157");
  const sema = byId("semaglutide");
  const ghk = byId("ghkcu");

  it("matches partial / prefix typing", () => {
    expect(matchesQuery(bpc, "bpc")).toBe(true);
    expect(matchesQuery(sema, "sem")).toBe(true);
    expect(matchesQuery(sema, "ozemp")).toBe(true); // partial alias
  });

  it("is separator-insensitive", () => {
    expect(matchesQuery(bpc, "bpc 157")).toBe(true);
    expect(matchesQuery(bpc, "BPC-157")).toBe(true);
    expect(matchesQuery(ghk, "ghk cu")).toBe(true);
  });

  it("matches via brand / chemical aliases", () => {
    expect(matchesQuery(sema, "Wegovy")).toBe(true);
    expect(matchesQuery(bpc, "body protection")).toBe(true);
  });

  it("empty query matches everything (no filter)", () => {
    expect(matchesQuery(bpc, "")).toBe(true);
    expect(matchesQuery(bpc, "   ")).toBe(true);
  });

  it("does not match unrelated queries", () => {
    expect(matchesQuery(bpc, "tirzepatide")).toBe(false);
    expect(matchesQuery(sema, "creatine")).toBe(false);
  });
});
