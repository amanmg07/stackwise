import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, startOfDay } from "date-fns";

export type LimitedFeature = "ai_chat" | "self_scan";

export const DAILY_LIMITS: Record<LimitedFeature, number> = {
  ai_chat: 10,
  self_scan: 3,
};

const FEATURE_LABELS: Record<LimitedFeature, string> = {
  ai_chat: "AI chat messages",
  self_scan: "Self Scans",
};

const STORAGE_KEY = "stackwise_usage_v2";
const DEV_BYPASS_KEY = "stackwise_usage_bypass";

interface DailyCounter {
  count: number;
  resetDate: string;
}

type UsageState = Record<LimitedFeature, DailyCounter>;

function todayStr(): string {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

function defaults(): UsageState {
  const today = todayStr();
  return {
    ai_chat: { count: 0, resetDate: today },
    self_scan: { count: 0, resetDate: today },
  };
}

async function getState(): Promise<UsageState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  const today = todayStr();
  if (!raw) return defaults();
  try {
    const parsed = JSON.parse(raw) as Partial<UsageState>;
    const state = defaults();
    for (const f of Object.keys(DAILY_LIMITS) as LimitedFeature[]) {
      const entry = parsed[f];
      if (entry && entry.resetDate === today) state[f] = entry;
    }
    return state;
  } catch {
    return defaults();
  }
}

async function saveState(state: UsageState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export interface LimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  message?: string;
}

export async function checkLimit(feature: LimitedFeature): Promise<LimitResult> {
  // Dev bypass for testing without burning quota
  const bypass = await AsyncStorage.getItem(DEV_BYPASS_KEY);
  if (bypass === "1") {
    return { allowed: true, remaining: -1, limit: DAILY_LIMITS[feature] };
  }

  const limit = DAILY_LIMITS[feature];
  const state = await getState();
  const used = state[feature].count;
  const remaining = Math.max(0, limit - used);
  if (used >= limit) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      message: `You've used all ${limit} ${FEATURE_LABELS[feature]} for today. Resets at midnight.`,
    };
  }
  return { allowed: true, remaining, limit };
}

export async function trackUsage(feature: LimitedFeature): Promise<void> {
  const bypass = await AsyncStorage.getItem(DEV_BYPASS_KEY);
  if (bypass === "1") return;

  const state = await getState();
  state[feature].count += 1;
  await saveState(state);
}

/** Dev-only: bypass all limits. Pass false to clear. */
export async function setDevBypass(enabled: boolean): Promise<void> {
  if (enabled) {
    await AsyncStorage.setItem(DEV_BYPASS_KEY, "1");
  } else {
    await AsyncStorage.removeItem(DEV_BYPASS_KEY);
  }
}
