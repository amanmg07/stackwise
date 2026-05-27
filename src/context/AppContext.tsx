import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { AppState as RNAppState, AppStateStatus } from "react-native";
import { Cycle, DoseLog, JournalEntry, UserSettings, ScanRecord, Bloodwork, CycleOutcome } from "../types";
import {
  deleteCycleAnalytics,
  deleteDoseLogAnalytics,
  deleteJournalEntryAnalytics,
  deleteScanAnalytics,
  deleteOutcomeAnalytics,
  deleteBloodworkAnalytics,
} from "../services/analyticsService";
import {
  scheduleOutcomeReminders,
  cancelOutcomeRemindersForCycle,
  cancelOutcomeReminder,
  scheduleDailyReminderForState,
  parseReminderTimes,
  cancelAllStackwiseNotifications,
} from "../services/notificationsService";
import { File } from "expo-file-system";
import { appStorage } from "../utils/storage";
import { ensureAuth } from "../utils/supabase";
import * as Sentry from "@sentry/react-native";

interface AppState {
  cycles: Cycle[];
  doseLogs: DoseLog[];
  journal: JournalEntry[];
  scans: ScanRecord[];
  bloodwork: Bloodwork[];
  settings: UserSettings;
  loading: boolean;
  userId: string | null;
  // Cycles
  addCycle: (cycle: Cycle) => void;
  updateCycle: (cycle: Cycle) => void;
  deleteCycle: (id: string) => void;
  // Dose logs
  addDoseLog: (log: DoseLog) => void;
  deleteDoseLog: (id: string) => void;
  // Journal
  addJournalEntry: (entry: JournalEntry) => void;
  updateJournalEntry: (entry: JournalEntry) => void;
  deleteJournalEntry: (id: string) => void;
  // Scans
  addScan: (scan: ScanRecord) => void;
  updateScan: (scan: ScanRecord) => void;
  deleteScan: (id: string) => void;
  // Bloodwork
  addBloodwork: (entry: Bloodwork) => void;
  deleteBloodwork: (id: string) => void;
  // Cycle outcome check-ins (week 4/8/12/16)
  outcomes: CycleOutcome[];
  addOutcome: (entry: CycleOutcome) => void;
  deleteOutcome: (id: string) => void;
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  // Data
  clearAllData: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [bloodwork, setBloodwork] = useState<Bloodwork[]>([]);
  const [outcomes, setOutcomes] = useState<CycleOutcome[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    weightUnit: "lbs",
    notificationsEnabled: false,
    reminderTimes: ["08:00", "20:00"],
    onboardingDone: false,
    demographicsDone: false,
    disclaimerAccepted: false,
    displayName: "",
    profileImage: null,
    analyticsConsent: false,
    researchConsentDecided: false,
    researchDataConsent: false,
    coMedications: [],
    coMedicationsOther: "",
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load local data first, then show the app immediately
    (async () => {
      const [c, d, j, s, sc, bw, oc] = await Promise.all([
        appStorage.loadCycles(),
        appStorage.loadDoseLogs(),
        appStorage.loadJournal(),
        appStorage.loadSettings(),
        appStorage.loadScans(),
        appStorage.loadBloodwork(),
        appStorage.loadOutcomes(),
      ]);
      setCycles(c);
      setDoseLogs(d);
      setScans(sc);
      setBloodwork(bw);
      setOutcomes(oc);
      // Migrate journal entries from 1-5 scale to 1-10 scale
      const needsMigration = j.some((e: any) => !e.scaleV2 || e.soreness !== undefined);
      const migrated = needsMigration
        ? j.map((e: any) => {
            const { soreness, ...rest } = e;
            if (e.scaleV2) return rest;
            return {
              ...rest,
              sleepQuality: Math.min(10, e.sleepQuality * 2),
              energyLevel: Math.min(10, e.energyLevel * 2),
              recoveryScore: Math.min(10, e.recoveryScore * 2),
              mood: Math.min(10, e.mood * 2),
              scaleV2: true,
            };
          })
        : j;
      setJournal(migrated);
      if (needsMigration) appStorage.saveJournal(migrated);
      setSettings(s);
      setLoading(false);

      // Re-arm the daily reminder on launch with state-aware copy
      // (ticket 1.4 — was generic "Quick tap to log doses"). The OS
      // schedule isn't durable across reinstalls/OS clears, and copy
      // is baked in at schedule time, so re-arming on every launch
      // keeps the next morning's reminder current to the user's state.
      if (s.notificationsEnabled) {
        scheduleDailyReminderForState({
          times: parseReminderTimes(s.reminderTimes),
          journal: migrated,
          doseLogs: d,
          cycles: c,
        });
      }
    })();

    // Auth in background — don't block the UI on network requests
    (async () => {
      try {
        const uid = await ensureAuth();
        setUserId(uid);
        // Attach the anon_id to Sentry so crashes can be tied to a
        // user without leaking PII (anon_id is not PII).
        Sentry.setUser({ id: uid });
      } catch (e) {
        Sentry.captureException(e);
      }
    })();
  }, []);

  // ── Foreground re-arm (ticket 1.4) ─────────────────────────────
  // Daily-reminder copy is baked in at schedule time, so we re-arm
  // when the user re-opens the app to make the next morning's body
  // reflect current streak / yesterday-missed / new-cycle state.
  // Throttled at one re-arm per hour so a chatty user pulling down
  // the notification center repeatedly doesn't trigger constant
  // cancel+reschedule churn.
  //
  // Refs mirror state so the listener attaches once (empty deps)
  // and still reads fresh data each fire — re-registering on every
  // journal/doseLog state change would mean adding+removing the
  // OS listener constantly.
  const journalRef = useRef(journal);
  const doseLogsRef = useRef(doseLogs);
  const cyclesRef = useRef(cycles);
  useEffect(() => { journalRef.current = journal; }, [journal]);
  useEffect(() => { doseLogsRef.current = doseLogs; }, [doseLogs]);
  useEffect(() => { cyclesRef.current = cycles; }, [cycles]);

  useEffect(() => {
    const lastRearm = { value: 0 };
    const THROTTLE_MS = 60 * 60 * 1000;
    const sub = RNAppState.addEventListener("change", async (state: AppStateStatus) => {
      if (state !== "active") return;
      const now = Date.now();
      if (now - lastRearm.value < THROTTLE_MS) return;
      lastRearm.value = now;
      try {
        const s = await appStorage.loadSettings();
        if (!s.notificationsEnabled) return;
        await scheduleDailyReminderForState({
          times: parseReminderTimes(s.reminderTimes),
          journal: journalRef.current,
          doseLogs: doseLogsRef.current,
          cycles: cyclesRef.current,
        });
      } catch (e) {
        Sentry.captureException(e);
      }
    });
    return () => sub.remove();
  }, []);

  // Persist helpers
  const persistCycles = useCallback((c: Cycle[]) => { setCycles(c); appStorage.saveCycles(c); }, []);
  const persistLogs = useCallback((l: DoseLog[]) => { setDoseLogs(l); appStorage.saveDoseLogs(l); }, []);
  const persistJournal = useCallback((j: JournalEntry[]) => { setJournal(j); appStorage.saveJournal(j); }, []);
  const persistScans = useCallback((s: ScanRecord[]) => { setScans(s); appStorage.saveScans(s); }, []);
  const persistBloodwork = useCallback((b: Bloodwork[]) => { setBloodwork(b); appStorage.saveBloodwork(b); }, []);
  const persistOutcomes = useCallback((o: CycleOutcome[]) => { setOutcomes(o); appStorage.saveOutcomes(o); }, []);
  const persistSettings = useCallback((s: UserSettings) => { setSettings(s); appStorage.saveSettings(s); }, []);

  const value: AppState = {
    cycles,
    doseLogs,
    journal,
    scans,
    bloodwork,
    outcomes,
    settings,
    loading,
    userId,

    addCycle: (cycle) => {
      persistCycles([cycle, ...cycles]);
      // Auto-schedule the four outcome check-in reminders for this
      // cycle. No-op if user hasn't granted notification permission.
      scheduleOutcomeReminders(cycle);
    },
    updateCycle: (cycle) => persistCycles(cycles.map((c) => (c.id === cycle.id ? cycle : c))),
    deleteCycle: async (id) => {
      persistCycles(cycles.filter((c) => c.id !== id));
      persistLogs(doseLogs.filter((l) => l.cycleId !== id));
      // Also cancel any pending outcome reminders for this cycle.
      cancelOutcomeRemindersForCycle(id);
      // Awaited (was fire-and-forget) so the cascade-delete's
      // verification + orphaned-event telemetry actually runs instead
      // of failing silently. UI state already updated above, so this
      // doesn't block the user.
      await deleteCycleAnalytics(id);
    },

    addDoseLog: (log) => persistLogs([log, ...doseLogs]),
    deleteDoseLog: (id) => {
      persistLogs(doseLogs.filter((l) => l.id !== id));
      // Cascade so a mistake-deleted dose isn't permanent in the buyer dataset.
      deleteDoseLogAnalytics(id);
    },

    addJournalEntry: (entry) => persistJournal([entry, ...journal]),
    updateJournalEntry: (entry) => persistJournal(journal.map((e) => (e.id === entry.id ? entry : e))),
    deleteJournalEntry: (id) => {
      persistJournal(journal.filter((e) => e.id !== id));
      deleteJournalEntryAnalytics(id);
    },

    addScan: (scan) => persistScans([scan, ...scans]),
    updateScan: (scan) => persistScans(scans.map((s) => (s.id === scan.id ? scan : s))),
    deleteScan: (id) => {
      const scan = scans.find((s) => s.id === id);
      if (scan) {
        try {
          const file = new File(scan.imagePath);
          if (file.exists) file.delete();
        } catch (e) {
          if (__DEV__) console.warn("Failed to delete scan image:", e);
        }
      }
      persistScans(scans.filter((s) => s.id !== id));
      deleteScanAnalytics(id);
    },

    addBloodwork: (entry) => persistBloodwork([entry, ...bloodwork]),
    deleteBloodwork: (id) => {
      persistBloodwork(bloodwork.filter((b) => b.id !== id));
      deleteBloodworkAnalytics(id);
    },

    addOutcome: (entry) => {
      persistOutcomes([entry, ...outcomes]);
      // User completed this milestone — cancel its scheduled reminder.
      cancelOutcomeReminder(entry.cycleId, entry.weekNumber);
    },
    deleteOutcome: (id) => {
      persistOutcomes(outcomes.filter((o) => o.id !== id));
      deleteOutcomeAnalytics(id);
    },

    updateSettings: (partial) => persistSettings({ ...settings, ...partial }),

    clearAllData: () => {
      // Best-effort cleanup of scan images from disk
      for (const s of scans) {
        try {
          const file = new File(s.imagePath);
          if (file.exists) file.delete();
        } catch {}
      }
      persistCycles([]);
      persistLogs([]);
      persistJournal([]);
      persistScans([]);
      persistBloodwork([]);
      persistOutcomes([]);
      appStorage.clearAll();
      // Cancel scheduled reminders so the OS doesn't fire "Week 4
      // check-in for 'My Cycle'" for cycles the user just wiped
      // (audit finding F8). Fire-and-forget on purpose — the user
      // shouldn't wait for the OS notification cancel to return.
      cancelAllStackwiseNotifications();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
