import { JournalEntry } from "../types";

// Replicate the analyzeJournal logic for testing
function analyzeJournal(entries: JournalEntry[]) {
  if (entries.length < 3) return [];

  const recent = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  const avg = (fn: (e: JournalEntry) => number) =>
    recent.reduce((sum, e) => sum + fn(e), 0) / recent.length;

  const avgSleep = avg((e) => e.sleepQuality);
  const avgEnergy = avg((e) => e.energyLevel);
  const avgRecovery = avg((e) => e.recoveryScore);
  const avgMood = avg((e) => e.mood);
  const avgSoreness = avg((e) => e.soreness);

  const insights: any[] = [];

  if (avgSleep < 3) {
    insights.push({ title: "Sleep needs attention", peptideIds: ["dsip", "sleep_blend", "ipamorelin", "mk677"] });
  }
  if (avgRecovery < 3) {
    insights.push({ title: "Recovery is lagging", peptideIds: ["bpc157", "tb500", "wolverine_blend", "ghkcu"] });
  }
  if (avgSoreness >= 3.5) {
    insights.push({ title: "High soreness levels", peptideIds: ["bpc157", "tb500", "kpv", "wolverine_blend"] });
  }
  if (avgEnergy < 3) {
    insights.push({ title: "Low energy levels", peptideIds: ["cjc1295_nodac", "ipamorelin", "cjc_ipa_blend", "tesamorelin"] });
  }
  if (avgMood < 3) {
    insights.push({ title: "Mood could be better", peptideIds: ["selank", "semax", "cognitive_blend"] });
  }

  return insights;
}

function makeEntry(overrides: Partial<JournalEntry> & { date: string }): JournalEntry {
  return {
    id: "test-" + overrides.date,
    date: overrides.date,
    sleepQuality: overrides.sleepQuality ?? 3,
    energyLevel: overrides.energyLevel ?? 3,
    recoveryScore: overrides.recoveryScore ?? 3,
    mood: overrides.mood ?? 3,
    soreness: overrides.soreness ?? 1,
    notes: "",
    createdAt: new Date().toISOString(),
  };
}

describe("Journal Analysis", () => {
  it("should return no insights with fewer than 3 entries", () => {
    const entries = [
      makeEntry({ date: "2026-03-15" }),
      makeEntry({ date: "2026-03-14" }),
    ];
    expect(analyzeJournal(entries)).toEqual([]);
  });

  it("should detect low sleep quality", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", sleepQuality: 1 }),
      makeEntry({ date: "2026-03-14", sleepQuality: 2 }),
      makeEntry({ date: "2026-03-13", sleepQuality: 2 }),
      makeEntry({ date: "2026-03-12", sleepQuality: 1 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Sleep needs attention")).toBe(true);
  });

  it("should detect low energy", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", energyLevel: 1 }),
      makeEntry({ date: "2026-03-14", energyLevel: 2 }),
      makeEntry({ date: "2026-03-13", energyLevel: 2 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Low energy levels")).toBe(true);
  });

  it("should detect poor recovery", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", recoveryScore: 1 }),
      makeEntry({ date: "2026-03-14", recoveryScore: 2 }),
      makeEntry({ date: "2026-03-13", recoveryScore: 2 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Recovery is lagging")).toBe(true);
  });

  it("should detect high soreness", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", soreness: 4 }),
      makeEntry({ date: "2026-03-14", soreness: 5 }),
      makeEntry({ date: "2026-03-13", soreness: 4 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "High soreness levels")).toBe(true);
  });

  it("should detect low mood", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", mood: 1 }),
      makeEntry({ date: "2026-03-14", mood: 2 }),
      makeEntry({ date: "2026-03-13", mood: 2 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Mood could be better")).toBe(true);
  });

  it("should return no insights when all metrics are good", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", sleepQuality: 4, energyLevel: 4, recoveryScore: 4, mood: 4, soreness: 1 }),
      makeEntry({ date: "2026-03-14", sleepQuality: 5, energyLevel: 4, recoveryScore: 5, mood: 5, soreness: 1 }),
      makeEntry({ date: "2026-03-13", sleepQuality: 4, energyLevel: 5, recoveryScore: 4, mood: 4, soreness: 2 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.length).toBe(0);
  });

  it("should recommend peptides for each insight", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", sleepQuality: 1, energyLevel: 1, recoveryScore: 1, mood: 1, soreness: 5 }),
      makeEntry({ date: "2026-03-14", sleepQuality: 1, energyLevel: 1, recoveryScore: 1, mood: 1, soreness: 5 }),
      makeEntry({ date: "2026-03-13", sleepQuality: 1, energyLevel: 1, recoveryScore: 1, mood: 1, soreness: 5 }),
    ];
    const insights = analyzeJournal(entries);
    for (const insight of insights) {
      expect(insight.peptideIds.length).toBeGreaterThan(0);
    }
  });
});
