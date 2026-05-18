import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";
import { addDays, parseISO } from "date-fns";
import { Cycle } from "../types";

// All scheduled notifications fire as alerts in the system tray.
// Sounds + badges off by default — opt-in via OS settings if the user
// wants them. Banners alone are enough for an engagement reminder.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DAILY_REMINDER_PREFIX = "stackwise.daily";

export type DailyTime = { hour: number; minute: number };

const pad2 = (n: number) => String(n).padStart(2, "0");
const dailyId = (t: DailyTime) => `${DAILY_REMINDER_PREFIX}.${pad2(t.hour)}${pad2(t.minute)}`;

/**
 * Parse stored "HH:MM" reminder strings into {hour,minute}. Invalid
 * entries are dropped; if nothing valid remains, falls back to the
 * 8 AM + 8 PM default so a reminder is always scheduled.
 */
export function parseReminderTimes(times?: string[]): DailyTime[] {
  const FALLBACK: DailyTime[] = [
    { hour: 8, minute: 0 },
    { hour: 20, minute: 0 },
  ];
  if (!times || times.length === 0) return FALLBACK;
  const parsed = times
    .map((t) => {
      const [h, m] = String(t).split(":").map((x) => parseInt(x, 10));
      return { hour: h, minute: Number.isFinite(m) ? m : 0 };
    })
    .filter((t) => Number.isInteger(t.hour) && t.hour >= 0 && t.hour <= 23 && t.minute >= 0 && t.minute <= 59);
  return parsed.length ? parsed : FALLBACK;
}
const OUTCOME_REMINDER_PREFIX = "stackwise.outcome.";
const ANDROID_CHANNEL_ID = "default";

/**
 * Android 8+ drops any notification posted to a channel that doesn't
 * exist. The scheduling code references channelId "default", so the
 * channel must be created before anything is scheduled. Idempotent —
 * setNotificationChannelAsync is safe to call repeatedly. No-op on iOS.
 */
async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
  });
}

/**
 * Ask the OS for notification permission. Returns true if granted.
 * Safe to call repeatedly — a no-op if already granted.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.status === "granted") return true;
    if (!existing.canAskAgain) return false;
    const result = await Notifications.requestPermissionsAsync();
    return result.status === "granted";
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

/**
 * Schedule a recurring reminder at EACH given time (e.g. 8 AM and
 * 8 PM). Idempotent: clears all existing daily reminders first, then
 * schedules one per time with a stable per-time identifier.
 *
 * Returns true only if, after scheduling, the OS reports EVERY
 * requested reminder as queued — so a silent drop is detectable
 * instead of looking identical to success (the "says 8:00 but never
 * pings" class of failure).
 */
export async function scheduleDailyReminder(times: DailyTime[]): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    await cancelDailyReminder();
    if (times.length === 0) return true;

    for (const t of times) {
      await Notifications.scheduleNotificationAsync({
        identifier: dailyId(t),
        content: {
          title: "Log today's protocol",
          body: "Quick tap to log doses or how you're feeling — keeps your trends accurate.",
          sound: false,
        },
        // expo-notifications (SDK 54) requires an explicit trigger
        // `type`. DAILY repeats at hour/minute by definition.
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: t.hour,
          minute: t.minute,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    }

    // Verify the OS actually queued all of them.
    const all = await Notifications.getAllScheduledNotificationsAsync();
    const wanted = new Set(times.map(dailyId));
    const present = all.filter(
      (n) => typeof n.identifier === "string" && wanted.has(n.identifier),
    ).length;
    const ok = present === wanted.size;
    if (!ok) {
      Sentry.captureMessage(
        "scheduleDailyReminder: not all reminders present after scheduling",
        { level: "warning", extra: { wanted: wanted.size, present, scheduledCount: all.length } },
      );
    }
    return ok;
  } catch (e) {
    Sentry.captureException(e);
    return false;
  }
}

/**
 * On-device ground truth for "why isn't my reminder firing": OS
 * permission status, whether our daily reminder is actually queued,
 * and when it should next fire (computed from hour/minute, since a
 * DAILY trigger has no concrete date until it fires).
 */
export async function getNotificationDiagnostics(): Promise<{
  permission: string;
  canAskAgain: boolean;
  dailyScheduled: boolean;
  dailyCount: number;
  totalScheduled: number;
  nextFire: Date | null;
}> {
  try {
    const perm = await Notifications.getPermissionsAsync();
    const all = await Notifications.getAllScheduledNotificationsAsync();
    const daily = all.filter(
      (n) => typeof n.identifier === "string" && n.identifier.startsWith(DAILY_REMINDER_PREFIX),
    );
    let nextFire: Date | null = null;
    for (const n of daily) {
      const trig: any = n.trigger;
      if (trig && typeof trig.hour === "number" && typeof trig.minute === "number") {
        const d = new Date();
        d.setHours(trig.hour, trig.minute, 0, 0);
        if (d.getTime() <= Date.now()) d.setDate(d.getDate() + 1);
        if (!nextFire || d.getTime() < nextFire.getTime()) nextFire = d;
      }
    }
    return {
      permission: perm.status,
      canAskAgain: perm.canAskAgain,
      dailyScheduled: daily.length > 0,
      dailyCount: daily.length,
      totalScheduled: all.length,
      nextFire,
    };
  } catch (e) {
    Sentry.captureException(e);
    return { permission: "unknown", canAskAgain: false, dailyScheduled: false, dailyCount: 0, totalScheduled: 0, nextFire: null };
  }
}

/** Cancel every daily reminder (all per-time entries). */
export async function cancelDailyReminder(): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      all
        .filter((n) => typeof n.identifier === "string" && n.identifier.startsWith(DAILY_REMINDER_PREFIX))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch {
    /* nothing scheduled yet — fine */
  }
}

/**
 * One-off reminder for a cycle's week 4/8/12/16 outcome check-in.
 * The reminder fires on the morning of that milestone day.
 *
 * Identifier scheme: stackwise.outcome.<cycleId>.<weekNumber>
 * makes it cancelable when the cycle is deleted or the user
 * completes the check-in early.
 */
export async function scheduleOutcomeReminders(cycle: Cycle): Promise<void> {
  try {
    await ensureAndroidChannel();
    const start = parseISO(cycle.startDate + "T00:00:00");
    const now = new Date();
    for (const week of [4, 8, 12, 16] as const) {
      const fireAt = addDays(start, week * 7);
      // Set reminder for 9 AM on the milestone day.
      fireAt.setHours(9, 0, 0, 0);
      // Skip milestones already in the past.
      if (fireAt <= now) continue;
      await Notifications.scheduleNotificationAsync({
        identifier: `${OUTCOME_REMINDER_PREFIX}${cycle.id}.${week}`,
        content: {
          title: `Week ${week} check-in for "${cycle.name}"`,
          body: "60 seconds — helps make your protocol data scientifically meaningful.",
          sound: false,
        },
        // Same SDK 54 requirement: one-off date triggers need an
        // explicit DATE type or they silently never fire.
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireAt,
          channelId: ANDROID_CHANNEL_ID,
        },
      });
    }
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cancel all outcome reminders for a cycle (e.g. when it's deleted). */
export async function cancelOutcomeRemindersForCycle(cycleId: string): Promise<void> {
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    const matching = all.filter((n) =>
      typeof n.identifier === "string" && n.identifier.startsWith(`${OUTCOME_REMINDER_PREFIX}${cycleId}.`),
    );
    await Promise.all(
      matching.map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  } catch (e) {
    Sentry.captureException(e);
  }
}

/** Cancel a single outcome reminder once that week's check-in is complete. */
export async function cancelOutcomeReminder(cycleId: string, weekNumber: number): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(
      `${OUTCOME_REMINDER_PREFIX}${cycleId}.${weekNumber}`,
    );
  } catch {
    /* fine */
  }
}

/** Wipe everything we've scheduled. Used on opt-out. */
export async function cancelAllStackwiseNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    Sentry.captureException(e);
  }
}
