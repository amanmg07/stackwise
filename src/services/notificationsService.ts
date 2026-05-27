import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Sentry from "@sentry/react-native";
import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import { Cycle, DoseLog, JournalEntry } from "../types";
import { computeStreak } from "../utils/streak";

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
const WEEKLY_DIGEST_ID = "stackwise.weekly_digest";
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
/** Default reminder body — used when no state-aware wrapper is called. */
const DEFAULT_REMINDER_BODY =
  "Quick tap to log doses or how you're feeling — keeps your trends accurate.";

/**
 * Notification category for the daily reminder (ticket 1.6). Attached
 * via categoryIdentifier so the long-press / drop-down on iOS exposes
 * the "✓ I took today's doses" action button. On Android the action
 * shows as an inline button under the body.
 *
 * opensAppToForeground: false — the system handles the action without
 * launching the app to foreground; AppContext's response listener
 * processes it on next foreground (or immediately if app is already
 * running). The undo card on Home is the safety net.
 */
export const DAILY_CATEGORY = "stackwise.daily";
export const ACTION_LOG_DOSES = "LOG_DOSES";

/**
 * Register the daily-reminder notification category. Call once at app
 * startup. Categories are idempotent — re-registration overwrites
 * with the same shape, no leftover state.
 */
export async function setupNotificationCategories(): Promise<void> {
  try {
    await Notifications.setNotificationCategoryAsync(DAILY_CATEGORY, [
      {
        identifier: ACTION_LOG_DOSES,
        buttonTitle: "✓ I took today's doses",
        options: {
          opensAppToForeground: false,
          // Doses aren't destructive (we tag quickLogged + undo card),
          // so this stays default-style. Not authentication-required
          // — peptide tracking isn't sensitive enough to gate behind
          // Face ID on every tap.
        },
      },
    ]);
  } catch (e) {
    Sentry.captureException(e);
  }
}

export async function scheduleDailyReminder(
  times: DailyTime[],
  body: string = DEFAULT_REMINDER_BODY,
): Promise<boolean> {
  try {
    await ensureAndroidChannel();
    await cancelDailyReminder();
    if (times.length === 0) return true;

    for (const t of times) {
      await Notifications.scheduleNotificationAsync({
        identifier: dailyId(t),
        content: {
          title: "Log today's cycle",
          body,
          sound: false,
          // Attach the dose-action category so the long-press drop-down
          // exposes the "✓ I took today's doses" button (ticket 1.6).
          categoryIdentifier: DAILY_CATEGORY,
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
          body: "60 seconds — helps make your cycle data scientifically meaningful.",
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

// ────────────────────────────────────────────────────────────────────
// Weekly digest reminder (ticket 2.1) — Sunday 9 AM local.
//
// Fires once per week regardless of the user's daily-reminder times.
// Tap opens the app to wherever they last were; the digest card on
// Home is what they're actually looking for — natural app behavior
// is good enough (deep-link routing can come later if conversion is
// weak).
//
// Idempotent: cancels the existing one first, so re-scheduling on
// every launch is safe.
// ────────────────────────────────────────────────────────────────────
export async function scheduleWeeklyDigestReminder(): Promise<void> {
  try {
    await ensureAndroidChannel();
    await Notifications.cancelScheduledNotificationAsync(WEEKLY_DIGEST_ID).catch(() => {});
    await Notifications.scheduleNotificationAsync({
      identifier: WEEKLY_DIGEST_ID,
      content: {
        title: "Your week in StackWise",
        body: "3 quick observations from this past week — tap to see them.",
        sound: false,
      },
      // WEEKLY repeats on the same weekday + hour + minute.
      // expo-notifications uses 1=Sunday for the weekday field.
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 9,
        minute: 0,
        channelId: ANDROID_CHANNEL_ID,
      },
    });
  } catch (e) {
    Sentry.captureException(e);
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

// ────────────────────────────────────────────────────────────────────
// Personalized reminder copy (ticket 1.4).
//
// The daily reminder used to fire the same generic string every day.
// Users learn to mute generic reminders within ~3 days. State-aware
// copy keeps the reminder feeling like the app pays attention:
//
//   1. Yesterday missed (high-leverage recovery prompt — the moment
//      users decide whether to come back or churn)
//   2. Streak ≥ 3 (loss-aversion reinforcement)
//   3. New cycle, less than 7 days in (curiosity hook on a fresh stack)
//   4. Default
//
// Copy is baked in at schedule time — local OS notifications can't be
// re-written between schedule and fire. AppContext re-arms on app
// foreground (throttled ≤ once/hour) so the next morning's reminder
// reflects current state.
// ────────────────────────────────────────────────────────────────────

export interface ReminderState {
  /** Current consecutive logged-day count from computeStreak. */
  streak: number;
  /** True if there was ≥1 journal or dose log on the local yesterday. */
  yesterdayLogged: boolean;
  /** True if there's ≥1 log today already. */
  todayLogged: boolean;
  /** Active cycle context, when one exists. */
  activeCycle?: { name: string; daysIntoCycle: number };
}

/** Pure body-picker — extracted for unit testing. */
export function pickReminderBody(state: ReminderState): string {
  // Recovery prompt fires only when both yesterday and today are
  // missing — if today is logged we already won, no need to nag.
  if (!state.yesterdayLogged && !state.todayLogged) {
    return "You skipped yesterday. Tap to log how today's going.";
  }
  if (state.streak >= 3) {
    return `Day ${state.streak} of your streak — keep it going.`;
  }
  if (
    state.activeCycle &&
    state.activeCycle.daysIntoCycle >= 0 &&
    state.activeCycle.daysIntoCycle < 7
  ) {
    return `How's the first week of "${state.activeCycle.name}" going?`;
  }
  return DEFAULT_REMINDER_BODY;
}

/**
 * Wrapper around scheduleDailyReminder that derives state-aware copy
 * from the current journal / doseLogs / cycles. Existing callers can
 * keep using scheduleDailyReminder(times) for backward compat — only
 * the personalized path goes through here.
 */
export async function scheduleDailyReminderForState(input: {
  times: DailyTime[];
  journal: JournalEntry[];
  doseLogs: DoseLog[];
  cycles: Cycle[];
  now?: Date;
}): Promise<boolean> {
  const now = input.now ?? new Date();
  const streakInfo = computeStreak(input.journal, input.doseLogs, now);
  // last7 is oldest-first, today is index 6 → yesterday is index 5.
  const yesterdayLogged = streakInfo.last7[5]?.logged ?? false;

  const activeCycle = input.cycles.find((c) => c.isActive);
  const activeCycleInfo = activeCycle
    ? {
        name: activeCycle.name,
        daysIntoCycle: differenceInCalendarDays(
          now,
          parseISO(activeCycle.startDate + "T00:00:00"),
        ),
      }
    : undefined;

  const body = pickReminderBody({
    streak: streakInfo.current,
    yesterdayLogged,
    todayLogged: streakInfo.todayLogged,
    activeCycle: activeCycleInfo,
  });
  return scheduleDailyReminder(input.times, body);
}
