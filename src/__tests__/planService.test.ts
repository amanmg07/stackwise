import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, startOfDay, startOfWeek, subDays, subWeeks } from "date-fns";
import {
  PLAN_CONFIG,
  PLAN_FEATURES,
  getCurrentPlan,
  setPlan,
  setDevPlanOverride,
  checkFeature,
  trackUsage,
  canAddPeptideToCycle,
} from "../services/planService";
import { PlanId, UsageCounters } from "../types";

const PLAN_KEY = "stackwise_plan";
const USAGE_KEY = "stackwise_usage";
const DEV_OVERRIDE_KEY = "stackwise_dev_plan_override";

const todayStr = () => format(startOfDay(new Date()), "yyyy-MM-dd");
const weekStr = () => format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

// In-memory AsyncStorage backing so each test starts clean and writes are visible to reads.
function installMemoryStore() {
  const store = new Map<string, string>();
  (AsyncStorage.getItem as jest.Mock).mockImplementation((k: string) =>
    Promise.resolve(store.has(k) ? store.get(k)! : null),
  );
  (AsyncStorage.setItem as jest.Mock).mockImplementation((k: string, v: string) => {
    store.set(k, v);
    return Promise.resolve();
  });
  (AsyncStorage.removeItem as jest.Mock).mockImplementation((k: string) => {
    store.delete(k);
    return Promise.resolve();
  });
  return store;
}

async function seedUsage(usage: Partial<UsageCounters>) {
  const full: UsageCounters = {
    aiQueries: { count: 0, resetDate: todayStr() },
    journalEntries: { count: 0, resetDate: weekStr() },
    selfScans: { count: 0, resetDate: weekStr() },
    ...usage,
  };
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify(full));
}

let store: Map<string, string>;
beforeEach(() => {
  jest.clearAllMocks();
  store = installMemoryStore();
});

// ── PLAN_CONFIG sanity ────────────────────────────────────────────

describe("PLAN_CONFIG", () => {
  it("defines basic, pro, elite", () => {
    expect(Object.keys(PLAN_CONFIG).sort()).toEqual(["basic", "elite", "pro"]);
  });

  it("Basic plan: 2 compounds/cycle, 5 AI/day, 3 journal/week, no self-scan", () => {
    const l = PLAN_CONFIG.basic.limits;
    expect(l.peptidesPerCycle).toBe(2);
    expect(l.aiQueriesPerDay).toBe(5);
    expect(l.journalEntriesPerWeek).toBe(3);
    expect(l.selfScansPerWeek).toBe(0);
    expect(l.priorityAi).toBe(false);
  });

  it("Pro plan: unlimited compounds/AI/journal, 2 self-scans/week", () => {
    const l = PLAN_CONFIG.pro.limits;
    expect(l.peptidesPerCycle).toBe(-1);
    expect(l.aiQueriesPerDay).toBe(-1);
    expect(l.journalEntriesPerWeek).toBe(-1);
    expect(l.selfScansPerWeek).toBe(2);
    expect(l.priorityAi).toBe(false);
  });

  it("Elite plan: everything unlimited + priority AI", () => {
    const l = PLAN_CONFIG.elite.limits;
    expect(l.selfScansPerWeek).toBe(-1);
    expect(l.priorityAi).toBe(true);
  });

  it("PLAN_FEATURES has entries for every plan", () => {
    for (const id of Object.keys(PLAN_CONFIG) as PlanId[]) {
      expect(PLAN_FEATURES[id].length).toBeGreaterThan(0);
    }
  });
});

// ── Plan get/set ──────────────────────────────────────────────────

describe("getCurrentPlan / setPlan", () => {
  it("defaults to basic when nothing stored", async () => {
    expect(await getCurrentPlan()).toBe("basic");
  });

  it("returns the persisted plan", async () => {
    await setPlan("pro");
    expect(await getCurrentPlan()).toBe("pro");
    await setPlan("elite");
    expect(await getCurrentPlan()).toBe("elite");
  });

  it("treats unknown stored values as basic", async () => {
    store.set(PLAN_KEY, "unknown_tier");
    expect(await getCurrentPlan()).toBe("basic");
  });

  it("dev override takes precedence over real plan", async () => {
    await setPlan("basic");
    await setDevPlanOverride("elite");
    expect(await getCurrentPlan()).toBe("elite");
  });

  it("clearing dev override falls back to real plan", async () => {
    await setPlan("pro");
    await setDevPlanOverride("elite");
    await setDevPlanOverride(null);
    expect(await getCurrentPlan()).toBe("pro");
  });
});

// ── canAddPeptideToCycle ──────────────────────────────────────────

describe("canAddPeptideToCycle", () => {
  it("basic: allows up to 2, blocks the 3rd", async () => {
    await setPlan("basic");
    expect((await canAddPeptideToCycle(0)).allowed).toBe(true);
    expect((await canAddPeptideToCycle(1)).allowed).toBe(true);
    const blocked = await canAddPeptideToCycle(2);
    expect(blocked.allowed).toBe(false);
    expect(blocked.upgradeRequired).toBe("pro");
    expect(blocked.limit).toBe(2);
    expect(blocked.message).toMatch(/2 compounds/);
  });

  it("basic: also blocks beyond the limit (defensive)", async () => {
    await setPlan("basic");
    expect((await canAddPeptideToCycle(99)).allowed).toBe(false);
  });

  it("basic: returns correct remaining count", async () => {
    await setPlan("basic");
    expect((await canAddPeptideToCycle(0)).remaining).toBe(2);
    expect((await canAddPeptideToCycle(1)).remaining).toBe(1);
  });

  it("pro: unlimited", async () => {
    await setPlan("pro");
    const r = await canAddPeptideToCycle(50);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(-1);
  });

  it("elite: unlimited", async () => {
    await setPlan("elite");
    const r = await canAddPeptideToCycle(50);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(-1);
  });
});

// ── checkFeature: ai_chat ─────────────────────────────────────────

describe("checkFeature(ai_chat)", () => {
  it("basic: allows under daily limit, returns remaining", async () => {
    await setPlan("basic");
    await seedUsage({ aiQueries: { count: 2, resetDate: todayStr() } });
    const r = await checkFeature("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(3);
    expect(r.limit).toBe(5);
  });

  it("basic: blocks once daily limit is reached", async () => {
    await setPlan("basic");
    await seedUsage({ aiQueries: { count: 5, resetDate: todayStr() } });
    const r = await checkFeature("ai_chat");
    expect(r.allowed).toBe(false);
    expect(r.upgradeRequired).toBe("pro");
    expect(r.message).toMatch(/5 AI queries/);
  });

  it("pro: unlimited", async () => {
    await setPlan("pro");
    await seedUsage({ aiQueries: { count: 500, resetDate: todayStr() } });
    const r = await checkFeature("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(-1);
  });
});

// ── checkFeature: journal_entry ───────────────────────────────────

describe("checkFeature(journal_entry)", () => {
  it("basic: allows under weekly limit", async () => {
    await setPlan("basic");
    await seedUsage({ journalEntries: { count: 1, resetDate: weekStr() } });
    const r = await checkFeature("journal_entry");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("basic: blocks at weekly limit", async () => {
    await setPlan("basic");
    await seedUsage({ journalEntries: { count: 3, resetDate: weekStr() } });
    const r = await checkFeature("journal_entry");
    expect(r.allowed).toBe(false);
    expect(r.upgradeRequired).toBe("pro");
  });

  it("pro: unlimited", async () => {
    await setPlan("pro");
    await seedUsage({ journalEntries: { count: 999, resetDate: weekStr() } });
    expect((await checkFeature("journal_entry")).allowed).toBe(true);
  });
});

// ── checkFeature: self_scan ───────────────────────────────────────

describe("checkFeature(self_scan)", () => {
  it("basic: blocked entirely (limit 0), suggests Pro", async () => {
    await setPlan("basic");
    const r = await checkFeature("self_scan");
    expect(r.allowed).toBe(false);
    expect(r.limit).toBe(0);
    expect(r.upgradeRequired).toBe("pro");
  });

  it("pro: allows 2/week, blocks the 3rd, suggests Elite", async () => {
    await setPlan("pro");
    await seedUsage({ selfScans: { count: 2, resetDate: weekStr() } });
    const r = await checkFeature("self_scan");
    expect(r.allowed).toBe(false);
    expect(r.upgradeRequired).toBe("elite");
  });

  it("pro: allows 1st scan", async () => {
    await setPlan("pro");
    const r = await checkFeature("self_scan");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("elite: unlimited", async () => {
    await setPlan("elite");
    await seedUsage({ selfScans: { count: 100, resetDate: weekStr() } });
    expect((await checkFeature("self_scan")).allowed).toBe(true);
  });
});

// ── checkFeature: cycle_create ────────────────────────────────────

describe("checkFeature(cycle_create)", () => {
  it("always allowed (gating moved to canAddPeptideToCycle)", async () => {
    await setPlan("basic");
    expect((await checkFeature("cycle_create")).allowed).toBe(true);
    await setPlan("pro");
    expect((await checkFeature("cycle_create")).allowed).toBe(true);
  });
});

// ── trackUsage ────────────────────────────────────────────────────

describe("trackUsage", () => {
  it("increments aiQueries count", async () => {
    await trackUsage("ai_chat");
    await trackUsage("ai_chat");
    const raw = JSON.parse(store.get(USAGE_KEY)!) as UsageCounters;
    expect(raw.aiQueries.count).toBe(2);
  });

  it("increments journalEntries count", async () => {
    await trackUsage("journal_entry");
    const raw = JSON.parse(store.get(USAGE_KEY)!) as UsageCounters;
    expect(raw.journalEntries.count).toBe(1);
  });

  it("increments selfScans count", async () => {
    await trackUsage("self_scan");
    const raw = JSON.parse(store.get(USAGE_KEY)!) as UsageCounters;
    expect(raw.selfScans.count).toBe(1);
  });

  it("does not increment for cycle_create", async () => {
    await trackUsage("cycle_create");
    const raw = store.get(USAGE_KEY);
    const parsed = JSON.parse(raw!) as UsageCounters;
    expect(parsed.aiQueries.count).toBe(0);
    expect(parsed.journalEntries.count).toBe(0);
    expect(parsed.selfScans.count).toBe(0);
  });
});

// ── Usage period resets ───────────────────────────────────────────

describe("usage period resets", () => {
  it("resets aiQueries when stored date is yesterday", async () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    await seedUsage({ aiQueries: { count: 99, resetDate: yesterday } });
    await setPlan("basic");
    const r = await checkFeature("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(5);
  });

  it("resets journalEntries when stored date is last week", async () => {
    const lastWeek = format(subWeeks(new Date(), 1), "yyyy-MM-dd");
    await seedUsage({ journalEntries: { count: 99, resetDate: lastWeek } });
    await setPlan("basic");
    const r = await checkFeature("journal_entry");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(3);
  });

  it("resets selfScans when stored date is last week", async () => {
    const lastWeek = format(subWeeks(new Date(), 1), "yyyy-MM-dd");
    await seedUsage({ selfScans: { count: 2, resetDate: lastWeek } });
    await setPlan("pro");
    const r = await checkFeature("self_scan");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(2);
  });

  it("recovers from corrupted JSON in storage", async () => {
    store.set(USAGE_KEY, "{not json");
    await setPlan("basic");
    const r = await checkFeature("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(5);
  });
});
