// Stub the Notifications and Sentry imports so requiring
// notificationsService doesn't drag in a native module under jest.
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DAILY: "daily", DATE: "date" },
}));
jest.mock("@sentry/react-native", () => ({ captureException: jest.fn(), captureMessage: jest.fn() }));
jest.mock("react-native", () => ({ Platform: { OS: "ios" } }));

import { pickReminderBody } from "../services/notificationsService";

describe("pickReminderBody", () => {
  const base = {
    streak: 0,
    yesterdayLogged: true,
    todayLogged: false,
    activeCycle: undefined,
  };

  it("returns the skipped-yesterday recovery copy when both days are missing", () => {
    const body = pickReminderBody({
      ...base,
      yesterdayLogged: false,
      todayLogged: false,
    });
    expect(body).toMatch(/skipped yesterday/i);
  });

  it("does NOT show recovery copy if today is already logged (we already won)", () => {
    const body = pickReminderBody({
      ...base,
      yesterdayLogged: false,
      todayLogged: true,
    });
    expect(body).not.toMatch(/skipped yesterday/i);
  });

  it("returns the streak copy when streak >= 3", () => {
    const body = pickReminderBody({ ...base, streak: 12 });
    expect(body).toMatch(/Day 12 of your streak/);
  });

  it("does NOT show streak copy for streak < 3 (too small to brag about)", () => {
    const body = pickReminderBody({ ...base, streak: 2 });
    expect(body).not.toMatch(/streak/i);
  });

  it("returns the new-cycle copy when active cycle is <7 days in", () => {
    const body = pickReminderBody({
      ...base,
      activeCycle: { name: "BPC-157 healing", daysIntoCycle: 3 },
    });
    expect(body).toContain("BPC-157 healing");
    expect(body).toMatch(/first week/i);
  });

  it("does NOT show new-cycle copy past day 7 of the cycle", () => {
    const body = pickReminderBody({
      ...base,
      activeCycle: { name: "BPC-157 healing", daysIntoCycle: 10 },
    });
    expect(body).not.toMatch(/first week/i);
  });

  it("does NOT show new-cycle copy for negative daysIntoCycle (cycle hasn't started)", () => {
    const body = pickReminderBody({
      ...base,
      activeCycle: { name: "Future", daysIntoCycle: -2 },
    });
    expect(body).not.toMatch(/first week/i);
  });

  it("falls back to the default body when nothing special applies", () => {
    expect(pickReminderBody(base)).toMatch(/quick tap/i);
  });

  it("priority: skipped-yesterday wins over a long streak when both apply", () => {
    // Edge case: streak is N (yesterday logged in last7), but the
    // caller hands us inconsistent inputs claiming yesterday missed.
    // Recovery copy is the safety-first choice when both apply.
    const body = pickReminderBody({
      streak: 12,
      yesterdayLogged: false,
      todayLogged: false,
      activeCycle: undefined,
    });
    expect(body).toMatch(/skipped yesterday/i);
  });

  it("priority: streak copy wins over new-cycle copy", () => {
    const body = pickReminderBody({
      streak: 5,
      yesterdayLogged: true,
      todayLogged: false,
      activeCycle: { name: "Stack", daysIntoCycle: 2 },
    });
    expect(body).toMatch(/streak/i);
    expect(body).not.toMatch(/first week/i);
  });
});
