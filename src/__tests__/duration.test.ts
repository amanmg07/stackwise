import { parseDurationWeeks } from "../utils/duration";

describe("parseDurationWeeks", () => {
  it("range: returns the upper bound", () => {
    expect(parseDurationWeeks("6-8 weeks")).toBe(8);
    expect(parseDurationWeeks("4-6 weeks")).toBe(6);
    expect(parseDurationWeeks("8-12 weeks")).toBe(12);
    expect(parseDurationWeeks("4-8 weeks")).toBe(8);
  });

  it("range with extra text after still returns the upper", () => {
    expect(parseDurationWeeks("4-6 weeks (GHK-Cu daily, Epithalon in a short burst within)")).toBe(6);
    expect(parseDurationWeeks("2-4 weeks on, 2 weeks off")).toBe(4);
  });

  it("'N+ weeks' returns N", () => {
    expect(parseDurationWeeks("16+ weeks")).toBe(16);
    expect(parseDurationWeeks("8+ weeks")).toBe(8);
  });

  it("single 'N weeks' returns N", () => {
    expect(parseDurationWeeks("12 weeks")).toBe(12);
    expect(parseDurationWeeks("3 weeks")).toBe(3);
  });

  it("unparseable input falls back", () => {
    expect(parseDurationWeeks("ongoing")).toBe(8);
    expect(parseDurationWeeks("")).toBe(8);
    expect(parseDurationWeeks(undefined)).toBe(8);
    expect(parseDurationWeeks("ongoing", 12)).toBe(12);
  });

  it("case-insensitive", () => {
    expect(parseDurationWeeks("6-8 WEEKS")).toBe(8);
    expect(parseDurationWeeks("12 Weeks")).toBe(12);
  });
});
