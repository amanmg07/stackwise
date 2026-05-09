// Stub modules that the service imports so we can test pure helpers
// without spinning up Supabase or Sentry.
jest.mock("../utils/supabase", () => ({
  supabase: { from: () => ({ insert: () => Promise.resolve({}), upsert: () => Promise.resolve({ error: null }) }) },
  getCurrentUserId: () => Promise.resolve("test-user"),
}));
jest.mock("@sentry/react-native", () => ({ captureException: jest.fn() }));

import { normalizeSideEffect, computeBaseline } from "../services/analyticsService";
import { JournalEntry } from "../types";
import { format, subDays } from "date-fns";

describe("normalizeSideEffect", () => {
  it("snake-cases single-word labels", () => {
    expect(normalizeSideEffect("Nausea")).toBe("nausea");
    expect(normalizeSideEffect("Headache")).toBe("headache");
  });

  it("collapses spaces and punctuation to underscores", () => {
    expect(normalizeSideEffect("Injection site pain")).toBe("injection_site_pain");
    expect(normalizeSideEffect("Numbness/tingling")).toBe("numbness_tingling");
    expect(normalizeSideEffect("Stomach upset")).toBe("stomach_upset");
  });

  it("trims leading/trailing underscores", () => {
    expect(normalizeSideEffect(" .Dry mouth.")).toBe("dry_mouth");
  });

  it("is idempotent on already-normalized strings", () => {
    expect(normalizeSideEffect("dry_mouth")).toBe("dry_mouth");
  });
});

describe("computeBaseline", () => {
  const today = new Date();
  const dayStr = (n: number) => format(subDays(today, n), "yyyy-MM-dd");

  const entry = (overrides: Partial<JournalEntry>): JournalEntry => ({
    id: "x",
    date: dayStr(0),
    sleepQuality: 7,
    energyLevel: 7,
    recoveryScore: 7,
    mood: 7,
    notes: "",
    createdAt: new Date().toISOString(),
    ...overrides,
  });

  it("returns null fields and 0 entry_count when no entries", () => {
    const b = computeBaseline([]);
    expect(b.entry_count).toBe(0);
    expect(b.sleep_quality).toBeNull();
    expect(b.weight).toBeNull();
  });

  it("averages metrics over the last 7 days by default", () => {
    const entries = [
      entry({ date: dayStr(1), sleepQuality: 6, energyLevel: 5, recoveryScore: 7, mood: 8, weight: 180 }),
      entry({ date: dayStr(3), sleepQuality: 8, energyLevel: 7, recoveryScore: 9, mood: 6, weight: 178 }),
    ];
    const b = computeBaseline(entries);
    expect(b.entry_count).toBe(2);
    expect(b.sleep_quality).toBe(7);
    expect(b.weight).toBe(179);
  });

  it("ignores entries outside the window", () => {
    const entries = [
      entry({ date: dayStr(1), sleepQuality: 6 }),
      entry({ date: dayStr(30), sleepQuality: 10 }), // outside 7-day window
    ];
    const b = computeBaseline(entries, 7);
    expect(b.entry_count).toBe(1);
    expect(b.sleep_quality).toBe(6);
  });

  it("nulls metrics that no entry in-window provides", () => {
    const entries = [entry({ date: dayStr(1), sleepQuality: 6, energyLevel: 5, recoveryScore: 7, mood: 8 })];
    const b = computeBaseline(entries);
    expect(b.weight).toBeNull(); // none of the entries have weight
  });
});
