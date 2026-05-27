// Mock the modules pulled in transitively by weeklyDigest so jest
// doesn't try to load native modules.
jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    multiRemove: jest.fn(),
    getAllKeys: jest.fn(),
  },
}));
jest.mock("@sentry/react-native", () => ({ captureException: jest.fn() }));
jest.mock("expo-notifications", () => ({}));
jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));
jest.mock("../services/chatService", () => ({ generateWeeklyDigest: jest.fn() }));

import { currentDigestKey, entriesInWindow } from "../services/weeklyDigest";
import { JournalEntry } from "../types";

function localDate(y: number, m: number, d: number, h = 12, min = 0): Date {
  return new Date(y, m - 1, d, h, min);
}

function entry(date: string): JournalEntry {
  return {
    id: date,
    date,
    sleepQuality: 7,
    energyLevel: 7,
    recoveryScore: 7,
    mood: 7,
    notes: "",
    createdAt: `${date}T12:00:00.000Z`,
  };
}

describe("currentDigestKey", () => {
  it("returns today's local YYYY-MM-DD", () => {
    expect(currentDigestKey(localDate(2026, 5, 31))).toBe("2026-05-31");
  });

  it("rolls over only at local midnight, not based on hour", () => {
    // Same calendar day, different times → same key.
    expect(currentDigestKey(localDate(2026, 5, 31, 0, 1))).toBe("2026-05-31");
    expect(currentDigestKey(localDate(2026, 5, 31, 23, 59))).toBe("2026-05-31");
  });
});

describe("entriesInWindow", () => {
  const today = localDate(2026, 5, 31);

  it("returns entries from the past 7 days inclusive of today", () => {
    const entries = [
      entry("2026-05-31"), // today
      entry("2026-05-30"),
      entry("2026-05-25"), // 6 days ago, edge of window
      entry("2026-05-24"), // 7 days ago, OUT
      entry("2026-05-01"), // way out
    ];
    const result = entriesInWindow(entries, today);
    expect(result.map((e) => e.date).sort()).toEqual([
      "2026-05-25", "2026-05-30", "2026-05-31",
    ]);
  });

  it("returns [] when no entries fall in the window", () => {
    const entries = [entry("2026-04-01"), entry("2026-03-15")];
    expect(entriesInWindow(entries, today)).toEqual([]);
  });

  it("handles an entry from today even when nothing else exists", () => {
    expect(entriesInWindow([entry("2026-05-31")], today)).toHaveLength(1);
  });
});
