import { computeStreak } from "../utils/streak";
import { JournalEntry, DoseLog } from "../types";

// All tests pin `today` to a fixed local date so they don't drift with
// the wall clock. We construct Date objects via the `new Date(y, m, d)`
// local-constructor on purpose — these are local-timezone Dates, which
// is what the streak utility must use end-to-end.

function localDate(y: number, m: number, d: number, h = 12, min = 0): Date {
  // Note: month is 0-indexed in the JS Date constructor.
  return new Date(y, m - 1, d, h, min);
}

function journal(date: string, id = date): JournalEntry {
  return {
    id,
    date,
    sleepQuality: 7,
    energyLevel: 7,
    recoveryScore: 7,
    mood: 7,
    notes: "",
    createdAt: `${date}T12:00:00.000Z`,
  };
}

function dose(timestamp: string, id = timestamp): DoseLog {
  return {
    id,
    cycleId: "c1",
    peptideId: "bpc-157",
    amount: 250,
    unit: "mcg",
    route: "subcutaneous",
    timestamp,
  };
}

describe("computeStreak", () => {
  const today = localDate(2026, 5, 27); // Wed 2026-05-27, local noon

  it("empty inputs → zero streak, all 7 dots empty, today not logged", () => {
    const s = computeStreak([], [], today);
    expect(s.current).toBe(0);
    expect(s.todayLogged).toBe(false);
    expect(s.last7).toHaveLength(7);
    expect(s.last7.every((d) => !d.logged)).toBe(true);
    expect(s.last7[6].isToday).toBe(true);
    expect(s.last7[6].date).toBe("2026-05-27");
    expect(s.last7[0].date).toBe("2026-05-21");
  });

  it("single journal entry today → streak of 1", () => {
    const s = computeStreak([journal("2026-05-27")], [], today);
    expect(s.current).toBe(1);
    expect(s.todayLogged).toBe(true);
    expect(s.last7[6].logged).toBe(true);
  });

  it("7 consecutive days ending today → streak of 7, all dots filled", () => {
    const entries = [
      "2026-05-21",
      "2026-05-22",
      "2026-05-23",
      "2026-05-24",
      "2026-05-25",
      "2026-05-26",
      "2026-05-27",
    ].map((d) => journal(d));
    const s = computeStreak(entries, [], today);
    expect(s.current).toBe(7);
    expect(s.last7.every((d) => d.logged)).toBe(true);
  });

  it("today not logged but yesterday extends back 12 days → streak alive at 12", () => {
    const entries: JournalEntry[] = [];
    // Logged yesterday (5-26) back through 5-15 (12 days, including yesterday).
    for (let day = 26; day >= 15; day--) {
      entries.push(journal(`2026-05-${String(day).padStart(2, "0")}`));
    }
    const s = computeStreak(entries, [], today);
    expect(s.todayLogged).toBe(false);
    expect(s.current).toBe(12);
    // Today's dot is still the "not yet" cell — outlined ring in the UI.
    expect(s.last7[6].isToday).toBe(true);
    expect(s.last7[6].logged).toBe(false);
  });

  it("gap in the middle breaks the streak", () => {
    // Logged Mon/Tue/Wed of last week, then skipped Thu+Fri+Sat+Sun+Mon,
    // re-logged yesterday (Tue 5-26). Today not logged. Streak counts
    // back from yesterday and stops at the first miss → just 1.
    const entries = ["2026-05-18", "2026-05-19", "2026-05-20", "2026-05-26"].map((d) => journal(d));
    const s = computeStreak(entries, [], today);
    expect(s.current).toBe(1);
  });

  it("multiple entries on the same day still count as one logged day", () => {
    const entries = [journal("2026-05-27", "a"), journal("2026-05-27", "b")];
    const s = computeStreak(entries, [], today);
    expect(s.current).toBe(1);
  });

  it("dose logs alone (no journal) light up days", () => {
    const logs = [dose("2026-05-27T08:30:00")];
    const s = computeStreak([], logs, today);
    expect(s.current).toBe(1);
    expect(s.todayLogged).toBe(true);
  });

  it("dose + journal on the same day still count as one day", () => {
    const s = computeStreak(
      [journal("2026-05-27")],
      [dose("2026-05-27T08:30:00")],
      today,
    );
    expect(s.current).toBe(1);
  });

  it("late-night dose (23:59 local) registers on today, not tomorrow", () => {
    // A dose logged at 11:59 PM local on 5-27. Today is also 5-27.
    // This protects against a UTC-only formatter shifting it into 5-28.
    const lateNight = new Date(2026, 5 - 1, 27, 23, 59, 0).toISOString();
    const s = computeStreak([], [dose(lateNight)], today);
    expect(s.todayLogged).toBe(true);
    expect(s.current).toBe(1);
  });

  it("malformed dose timestamp does not throw", () => {
    expect(() =>
      computeStreak([], [dose("not-a-real-iso-string")], today),
    ).not.toThrow();
  });

  it("a 30-day streak terminates at the first gap and doesn't run forever", () => {
    const entries: JournalEntry[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      entries.push(journal(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`));
    }
    const s = computeStreak(entries, [], today);
    expect(s.current).toBe(30);
  });

  it("last7 is in chronological order, oldest first, today last", () => {
    const s = computeStreak([], [], today);
    const dates = s.last7.map((d) => d.date);
    expect(dates).toEqual([
      "2026-05-21",
      "2026-05-22",
      "2026-05-23",
      "2026-05-24",
      "2026-05-25",
      "2026-05-26",
      "2026-05-27",
    ]);
  });
});
