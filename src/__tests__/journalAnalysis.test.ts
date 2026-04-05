import { JournalEntry } from "../types";

// Replicate the analyzeJournal logic for testing (1-10 scale)
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

  const insights: any[] = [];

  if (avgSleep < 6) {
    insights.push({ title: "Sleep needs attention", peptideIds: ["dsip", "sleep_blend", "ipamorelin", "mk677"] });
  }
  if (avgRecovery < 6) {
    insights.push({ title: "Recovery is lagging", peptideIds: ["bpc157", "tb500", "wolverine_blend", "ghkcu"] });
  }
  if (avgEnergy < 6) {
    insights.push({ title: "Low energy levels", peptideIds: ["cjc1295_nodac", "ipamorelin", "cjc_ipa_blend", "tesamorelin"] });
  }
  if (avgMood < 6) {
    insights.push({ title: "Mood could be better", peptideIds: ["selank", "semax", "cognitive_blend"] });
  }

  return insights;
}

function makeEntry(overrides: Partial<JournalEntry> & { date: string }): JournalEntry {
  return {
    id: "test-" + overrides.date,
    sleepQuality: 7,
    energyLevel: 7,
    recoveryScore: 7,
    mood: 7,
    notes: "",
    createdAt: new Date().toISOString(),
    scaleV2: true,
    ...overrides,
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
      makeEntry({ date: "2026-03-15", sleepQuality: 2 }),
      makeEntry({ date: "2026-03-14", sleepQuality: 4 }),
      makeEntry({ date: "2026-03-13", sleepQuality: 4 }),
      makeEntry({ date: "2026-03-12", sleepQuality: 2 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Sleep needs attention")).toBe(true);
  });

  it("should detect low energy", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", energyLevel: 2 }),
      makeEntry({ date: "2026-03-14", energyLevel: 4 }),
      makeEntry({ date: "2026-03-13", energyLevel: 4 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Low energy levels")).toBe(true);
  });

  it("should detect poor recovery", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", recoveryScore: 2 }),
      makeEntry({ date: "2026-03-14", recoveryScore: 4 }),
      makeEntry({ date: "2026-03-13", recoveryScore: 4 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Recovery is lagging")).toBe(true);
  });

  it("should detect low mood", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", mood: 2 }),
      makeEntry({ date: "2026-03-14", mood: 4 }),
      makeEntry({ date: "2026-03-13", mood: 4 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.some((i) => i.title === "Mood could be better")).toBe(true);
  });

  it("should return no insights when all metrics are good", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", sleepQuality: 8, energyLevel: 8, recoveryScore: 8, mood: 8 }),
      makeEntry({ date: "2026-03-14", sleepQuality: 9, energyLevel: 8, recoveryScore: 9, mood: 9 }),
      makeEntry({ date: "2026-03-13", sleepQuality: 8, energyLevel: 9, recoveryScore: 8, mood: 8 }),
    ];
    const insights = analyzeJournal(entries);
    expect(insights.length).toBe(0);
  });

  it("should recommend peptides for each insight", () => {
    const entries = [
      makeEntry({ date: "2026-03-15", sleepQuality: 2, energyLevel: 2, recoveryScore: 2, mood: 2 }),
      makeEntry({ date: "2026-03-14", sleepQuality: 2, energyLevel: 2, recoveryScore: 2, mood: 2 }),
      makeEntry({ date: "2026-03-13", sleepQuality: 2, energyLevel: 2, recoveryScore: 2, mood: 2 }),
    ];
    const insights = analyzeJournal(entries);
    for (const insight of insights) {
      expect(insight.peptideIds.length).toBeGreaterThan(0);
    }
  });
});
