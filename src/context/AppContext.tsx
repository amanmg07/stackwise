import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cycle, DoseLog, JournalEntry, UserSettings, ScanRecord, Bloodwork } from "../types";
import {
  deleteCycleAnalytics,
  deleteDoseLogAnalytics,
  deleteJournalEntryAnalytics,
  deleteScanAnalytics,
} from "../services/analyticsService";
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
  deleteScan: (id: string) => void;
  // Bloodwork
  addBloodwork: (entry: Bloodwork) => void;
  deleteBloodwork: (id: string) => void;
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
  const [settings, setSettings] = useState<UserSettings>({
    weightUnit: "lbs",
    notificationsEnabled: false,
    reminderTimes: ["08:00", "20:00"],
    savedPeptides: [],
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
      const [c, d, j, s, sc, bw] = await Promise.all([
        appStorage.loadCycles(),
        appStorage.loadDoseLogs(),
        appStorage.loadJournal(),
        appStorage.loadSettings(),
        appStorage.loadScans(),
        appStorage.loadBloodwork(),
      ]);
      setCycles(c);
      setDoseLogs(d);
      setScans(sc);
      setBloodwork(bw);
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

  // Persist helpers
  const persistCycles = useCallback((c: Cycle[]) => { setCycles(c); appStorage.saveCycles(c); }, []);
  const persistLogs = useCallback((l: DoseLog[]) => { setDoseLogs(l); appStorage.saveDoseLogs(l); }, []);
  const persistJournal = useCallback((j: JournalEntry[]) => { setJournal(j); appStorage.saveJournal(j); }, []);
  const persistScans = useCallback((s: ScanRecord[]) => { setScans(s); appStorage.saveScans(s); }, []);
  const persistBloodwork = useCallback((b: Bloodwork[]) => { setBloodwork(b); appStorage.saveBloodwork(b); }, []);
  const persistSettings = useCallback((s: UserSettings) => { setSettings(s); appStorage.saveSettings(s); }, []);

  const value: AppState = {
    cycles,
    doseLogs,
    journal,
    scans,
    bloodwork,
    settings,
    loading,
    userId,

    addCycle: (cycle) => persistCycles([cycle, ...cycles]),
    updateCycle: (cycle) => persistCycles(cycles.map((c) => (c.id === cycle.id ? cycle : c))),
    deleteCycle: (id) => {
      persistCycles(cycles.filter((c) => c.id !== id));
      persistLogs(doseLogs.filter((l) => l.cycleId !== id));
      // Cascade to server-side events so a mistake-deleted cycle
      // never reaches the buyer-facing dataset.
      deleteCycleAnalytics(id);
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
    deleteBloodwork: (id) => persistBloodwork(bloodwork.filter((b) => b.id !== id)),

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
      appStorage.clearAll();
    },
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
