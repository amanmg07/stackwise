import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlanId, PlanLimits, UsageCounters } from "../types";
import { format, startOfDay, startOfWeek, isAfter } from "date-fns";

// ── Plan definitions ──────────────────────────────────────────────

export const PLAN_CONFIG: Record<PlanId, { name: string; price: string; limits: PlanLimits }> = {
  basic: {
    name: "Basic",
    price: "Free",
    limits: {
      aiQueriesPerDay: 5,
      peptidesPerCycle: 2,
      journalEntriesPerWeek: 3,
      selfScansPerWeek: 0,
      priorityAi: false,
    },
  },
  pro: {
    name: "Pro",
    price: "$4.99/mo",
    limits: {
      aiQueriesPerDay: -1,
      peptidesPerCycle: -1,
      journalEntriesPerWeek: -1,
      selfScansPerWeek: 2,
      priorityAi: false,
    },
  },
  elite: {
    name: "Elite",
    price: "$9.99/mo",
    limits: {
      aiQueriesPerDay: -1,
      peptidesPerCycle: -1,
      journalEntriesPerWeek: -1,
      selfScansPerWeek: -1,
      priorityAi: true,
    },
  },
};

// ── Feature descriptions for UI ───────────────────────────────────

export const PLAN_FEATURES: Record<PlanId, string[]> = {
  basic: [
    "5 AI queries per day",
    "Up to 2 compounds per cycle",
    "3 journal entries per week",
    "No Self Scan",
  ],
  pro: [
    "Unlimited AI chat",
    "Unlimited compounds per cycle",
    "Unlimited journal entries",
    "2 Self Scans per week",
  ],
  elite: [
    "Everything in Pro",
    "Unlimited Self Scans",
    "Priority AI responses",
  ],
};

// ── Storage keys ──────────────────────────────────────────────────

const PLAN_KEY = "stackwise_plan";
const USAGE_KEY = "stackwise_usage";
const DEV_OVERRIDE_KEY = "stackwise_dev_plan_override";

// ── Plan management ───────────────────────────────────────────────

export async function getCurrentPlan(): Promise<PlanId> {
  // Dev override for testing
  const override = await AsyncStorage.getItem(DEV_OVERRIDE_KEY);
  if (override === "elite" || override === "pro" || override === "basic") return override;

  const plan = await AsyncStorage.getItem(PLAN_KEY);
  if (plan === "pro" || plan === "elite") return plan;
  return "basic";
}

export async function setPlan(plan: PlanId): Promise<void> {
  await AsyncStorage.setItem(PLAN_KEY, plan);
}

/** Dev-only: override the plan for testing */
export async function setDevPlanOverride(plan: PlanId | null): Promise<void> {
  if (plan) {
    await AsyncStorage.setItem(DEV_OVERRIDE_KEY, plan);
  } else {
    await AsyncStorage.removeItem(DEV_OVERRIDE_KEY);
  }
}

// ── Usage tracking ────────────────────────────────────────────────

function todayStr(): string {
  return format(startOfDay(new Date()), "yyyy-MM-dd");
}

function weekStr(): string {
  return format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");
}

async function getUsage(): Promise<UsageCounters> {
  const raw = await AsyncStorage.getItem(USAGE_KEY);
  const defaults: UsageCounters = {
    aiQueries: { count: 0, resetDate: todayStr() },
    journalEntries: { count: 0, resetDate: weekStr() },
    selfScans: { count: 0, resetDate: weekStr() },
  };
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw) as UsageCounters;
    // Reset counters if period has passed
    if (parsed.aiQueries.resetDate !== todayStr()) {
      parsed.aiQueries = { count: 0, resetDate: todayStr() };
    }
    if (parsed.journalEntries.resetDate !== weekStr()) {
      parsed.journalEntries = { count: 0, resetDate: weekStr() };
    }
    if (parsed.selfScans.resetDate !== weekStr()) {
      parsed.selfScans = { count: 0, resetDate: weekStr() };
    }
    return parsed;
  } catch {
    return defaults;
  }
}

async function saveUsage(usage: UsageCounters): Promise<void> {
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(usage));
}

// ── Limit checks ──────────────────────────────────────────────────

export type FeatureGate = "ai_chat" | "cycle_create" | "journal_entry" | "self_scan";

export interface GateResult {
  allowed: boolean;
  remaining?: number; // -1 = unlimited
  limit?: number;
  upgradeRequired?: PlanId; // minimum plan needed
  message?: string;
}

export async function checkFeature(feature: FeatureGate): Promise<GateResult> {
  const plan = await getCurrentPlan();
  const limits = PLAN_CONFIG[plan].limits;
  const usage = await getUsage();

  switch (feature) {
    case "ai_chat": {
      if (limits.aiQueriesPerDay === -1) return { allowed: true, remaining: -1 };
      const remaining = limits.aiQueriesPerDay - usage.aiQueries.count;
      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          limit: limits.aiQueriesPerDay,
          upgradeRequired: "pro",
          message: `You've used all ${limits.aiQueriesPerDay} AI queries for today. Upgrade to Pro for unlimited.`,
        };
      }
      return { allowed: true, remaining, limit: limits.aiQueriesPerDay };
    }
    case "cycle_create": {
      // No longer gated here — peptide count is checked via canAddPeptideToCycle
      return { allowed: true, remaining: -1 };
    }
    case "journal_entry": {
      if (limits.journalEntriesPerWeek === -1) return { allowed: true, remaining: -1 };
      const remaining = limits.journalEntriesPerWeek - usage.journalEntries.count;
      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          limit: limits.journalEntriesPerWeek,
          upgradeRequired: "pro",
          message: `You've used all ${limits.journalEntriesPerWeek} journal entries this week. Upgrade to Pro for unlimited.`,
        };
      }
      return { allowed: true, remaining, limit: limits.journalEntriesPerWeek };
    }
    case "self_scan": {
      if (limits.selfScansPerWeek === -1) return { allowed: true, remaining: -1 };
      if (limits.selfScansPerWeek === 0) {
        return {
          allowed: false,
          remaining: 0,
          limit: 0,
          upgradeRequired: "pro",
          message: "Self Scan is available on Pro and Elite plans.",
        };
      }
      const remaining = limits.selfScansPerWeek - usage.selfScans.count;
      if (remaining <= 0) {
        return {
          allowed: false,
          remaining: 0,
          limit: limits.selfScansPerWeek,
          upgradeRequired: "elite",
          message: `You've used all ${limits.selfScansPerWeek} Self Scans this week. Upgrade to Elite for unlimited.`,
        };
      }
      return { allowed: true, remaining, limit: limits.selfScansPerWeek };
    }
  }
}

export async function trackUsage(feature: FeatureGate): Promise<void> {
  const usage = await getUsage();
  switch (feature) {
    case "ai_chat":
      usage.aiQueries.count++;
      break;
    case "journal_entry":
      usage.journalEntries.count++;
      break;
    case "self_scan":
      usage.selfScans.count++;
      break;
  }
  await saveUsage(usage);
}

/** Check if adding another peptide/supplement to a cycle is allowed */
export async function canAddPeptideToCycle(currentCount: number): Promise<GateResult> {
  const plan = await getCurrentPlan();
  const limits = PLAN_CONFIG[plan].limits;
  if (limits.peptidesPerCycle === -1) return { allowed: true, remaining: -1 };
  if (currentCount >= limits.peptidesPerCycle) {
    return {
      allowed: false,
      remaining: 0,
      limit: limits.peptidesPerCycle,
      upgradeRequired: "pro",
      message: `Basic plan allows up to ${limits.peptidesPerCycle} compounds per cycle. Upgrade to Pro for unlimited.`,
    };
  }
  return { allowed: true, remaining: limits.peptidesPerCycle - currentCount, limit: limits.peptidesPerCycle };
}
