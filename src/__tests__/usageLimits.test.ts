import AsyncStorage from "@react-native-async-storage/async-storage";
import { format, startOfDay, subDays } from "date-fns";
import {
  DAILY_LIMITS,
  checkLimit,
  trackUsage,
  setDevBypass,
} from "../services/usageLimits";

const STORAGE_KEY = "stackwise_usage_v2";

const todayStr = () => format(startOfDay(new Date()), "yyyy-MM-dd");

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

let store: Map<string, string>;
beforeEach(() => {
  jest.clearAllMocks();
  store = installMemoryStore();
});

describe("DAILY_LIMITS", () => {
  it("ai_chat is 20/day, self_scan is 3/day", () => {
    expect(DAILY_LIMITS.ai_chat).toBe(20);
    expect(DAILY_LIMITS.self_scan).toBe(3);
  });
});

describe("checkLimit", () => {
  it("ai_chat: allows 1st call, reports correct remaining", async () => {
    const r = await checkLimit("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(20);
    expect(r.limit).toBe(20);
  });

  it("ai_chat: blocks once 20 are used", async () => {
    for (let i = 0; i < 20; i++) await trackUsage("ai_chat");
    const r = await checkLimit("ai_chat");
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.message).toMatch(/20 AI chat messages/);
  });

  it("self_scan: blocks at 3", async () => {
    await trackUsage("self_scan");
    await trackUsage("self_scan");
    await trackUsage("self_scan");
    const r = await checkLimit("self_scan");
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.message).toMatch(/3 Self Scans/);
  });

  it("remaining decreases as usage tracked", async () => {
    await trackUsage("ai_chat");
    await trackUsage("ai_chat");
    expect((await checkLimit("ai_chat")).remaining).toBe(18);
  });

  it("ai_chat usage doesn't affect self_scan budget", async () => {
    for (let i = 0; i < 20; i++) await trackUsage("ai_chat");
    const scan = await checkLimit("self_scan");
    expect(scan.allowed).toBe(true);
    expect(scan.remaining).toBe(3);
  });
});

describe("daily reset", () => {
  it("yesterday's count is ignored, today resets to full budget", async () => {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    store.set(
      STORAGE_KEY,
      JSON.stringify({
        ai_chat: { count: 999, resetDate: yesterday },
        self_scan: { count: 999, resetDate: yesterday },
      }),
    );
    const chat = await checkLimit("ai_chat");
    const scan = await checkLimit("self_scan");
    expect(chat.allowed).toBe(true);
    expect(chat.remaining).toBe(20);
    expect(scan.allowed).toBe(true);
    expect(scan.remaining).toBe(3);
  });

  it("trackUsage stamps today's date so persisted count survives same-day", async () => {
    await trackUsage("ai_chat");
    const raw = JSON.parse(store.get(STORAGE_KEY)!);
    expect(raw.ai_chat.resetDate).toBe(todayStr());
    expect(raw.ai_chat.count).toBe(1);
  });

  it("recovers from corrupted JSON in storage", async () => {
    store.set(STORAGE_KEY, "{not json");
    const r = await checkLimit("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(20);
  });
});

describe("setDevBypass", () => {
  it("when enabled, allows past the daily cap and does not increment", async () => {
    for (let i = 0; i < 20; i++) await trackUsage("ai_chat");
    expect((await checkLimit("ai_chat")).allowed).toBe(false);

    await setDevBypass(true);
    const r = await checkLimit("ai_chat");
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(-1);

    // trackUsage should be a no-op while bypassed
    const before = JSON.parse(store.get(STORAGE_KEY)!).ai_chat.count;
    await trackUsage("ai_chat");
    const after = JSON.parse(store.get(STORAGE_KEY)!).ai_chat.count;
    expect(after).toBe(before);
  });

  it("disabling bypass restores normal gating", async () => {
    await setDevBypass(true);
    await setDevBypass(false);
    for (let i = 0; i < 20; i++) await trackUsage("ai_chat");
    expect((await checkLimit("ai_chat")).allowed).toBe(false);
  });
});
