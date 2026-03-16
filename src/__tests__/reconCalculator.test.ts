// Test the reconstitution calculator math independently

const SYRINGE_SIZES = [
  { label: "1 mL (100 units)", totalUnits: 100, totalMl: 1 },
  { label: "0.5 mL (50 units)", totalUnits: 50, totalMl: 0.5 },
  { label: "0.3 mL (30 units)", totalUnits: 30, totalMl: 0.3 },
];

function calculate(vialMg: number, waterMl: number, targetDoseMg: number, syringeIndex: number) {
  if (vialMg <= 0 || waterMl <= 0 || targetDoseMg <= 0) return null;

  const syringe = SYRINGE_SIZES[syringeIndex];
  const concentrationMgPerMl = vialMg / waterMl;
  const doseVolumeMl = targetDoseMg / concentrationMgPerMl;
  const doseUnits = (doseVolumeMl / syringe.totalMl) * syringe.totalUnits;
  const dosesPerVial = Math.floor(vialMg / targetDoseMg);

  return {
    concentrationMgPerMl,
    doseVolumeMl,
    doseUnits: Math.round(doseUnits * 10) / 10,
    dosesPerVial,
  };
}

describe("Reconstitution Calculator", () => {
  it("should return null for zero inputs", () => {
    expect(calculate(0, 2, 0.25, 0)).toBeNull();
    expect(calculate(5, 0, 0.25, 0)).toBeNull();
    expect(calculate(5, 2, 0, 0)).toBeNull();
  });

  it("should calculate concentration correctly", () => {
    const result = calculate(5, 2, 0.25, 0);
    expect(result!.concentrationMgPerMl).toBe(2.5);
  });

  it("should calculate dose volume correctly", () => {
    // 5mg vial + 2mL water = 2.5mg/mL concentration
    // 0.25mg dose / 2.5mg/mL = 0.1mL
    const result = calculate(5, 2, 0.25, 0);
    expect(result!.doseVolumeMl).toBe(0.1);
  });

  it("should calculate syringe units for 1mL syringe", () => {
    // 0.1mL / 1mL * 100 units = 10 units
    const result = calculate(5, 2, 0.25, 0);
    expect(result!.doseUnits).toBe(10);
  });

  it("should calculate syringe units for 0.5mL syringe", () => {
    // 0.1mL / 0.5mL * 50 units = 10 units
    const result = calculate(5, 2, 0.25, 1);
    expect(result!.doseUnits).toBe(10);
  });

  it("should calculate syringe units for 0.3mL syringe", () => {
    // 0.1mL / 0.3mL * 30 units = 10 units
    const result = calculate(5, 2, 0.25, 2);
    expect(result!.doseUnits).toBe(10);
  });

  it("should calculate doses per vial correctly", () => {
    // 5mg vial / 0.25mg dose = 20 doses
    const result = calculate(5, 2, 0.25, 0);
    expect(result!.dosesPerVial).toBe(20);
  });

  it("should handle a 10mg vial with 3mL water", () => {
    // 10/3 = 3.333 mg/mL
    // 0.5 / 3.333 = 0.15 mL
    // 0.15 / 1 * 100 = 15 units
    // 10 / 0.5 = 20 doses
    const result = calculate(10, 3, 0.5, 0);
    expect(result!.concentrationMgPerMl).toBeCloseTo(3.333, 2);
    expect(result!.doseVolumeMl).toBeCloseTo(0.15, 2);
    expect(result!.doseUnits).toBe(15);
    expect(result!.dosesPerVial).toBe(20);
  });

  it("should floor doses per vial (no partial doses)", () => {
    // 5mg / 0.3mg = 16.66 → 16
    const result = calculate(5, 2, 0.3, 0);
    expect(result!.dosesPerVial).toBe(16);
  });
});
