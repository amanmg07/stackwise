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

const DAILY_REMINDER_TAG = "stackwise.daily";
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
 * Schedule a recurring daily reminder at the chosen hour/minute.
 * Idempotent: cancels any existing daily reminder first.
 */
export async function scheduleDailyReminder(hour: number, minute: number): Promise<void> {
  try {
    await ensureAndroidChannel();
    await cancelDailyReminder();
    await Notifications.scheduleNotificationAsync({
      identifier: DAILY_REMINDER_TAG,
      content: {
        title: "Log today's protocol",
        body: "Quick tap to log doses or how you're feeling — keeps your trends accurate.",
        sound: false,
      },
      // expo-notifications (SDK 54) requires an explicit trigger `type`.
      // The legacy `{ hour, minute, repeats: true }` shorthand is no
      // longer recognized and silently never fires. DAILY repeats by
      // definition, so no `repeats` flag. Works on iOS + Android.
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  } catch (e) {
    Sentry.captureException(e);
  }
}

export async function cancelDailyReminder(): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(DAILY_REMINDER_TAG);
  } catch {
    /* may not exist yet — fine */
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
