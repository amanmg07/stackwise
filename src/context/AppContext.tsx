import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cycle, DoseLog, JournalEntry, UserSettings } from "../types";
import { appStorage } from "../utils/storage";
import { ensureAuth } from "../utils/supabase";

interface AppState {
  cycles: Cycle[];
  doseLogs: DoseLog[];
  journal: JournalEntry[];
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
  const [settings, setSettings] = useState<UserSettings>({
    weightUnit: "lbs",
    notificationsEnabled: false,
    reminderTimes: ["08:00", "20:00"],
    savedPeptides: [],
    onboardingDone: false,
    disclaimerAccepted: false,
    displayName: "",
    profileImage: null,
  });
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load local data first, then show the app immediately
    (async () => {
      const [c, d, j, s] = await Promise.all([
        appStorage.loadCycles(),
        appStorage.loadDoseLogs(),
        appStorage.loadJournal(),
        appStorage.loadSettings(),
      ]);
      setCycles(c);
      setDoseLogs(d);
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
      } catch (e) {
        console.warn("Auth failed:", e);
      }
    })();
  }, []);

  // Persist helpers
  const persistCycles = useCallback((c: Cycle[]) => { setCycles(c); appStorage.saveCycles(c); }, []);
  const persistLogs = useCallback((l: DoseLog[]) => { setDoseLogs(l); appStorage.saveDoseLogs(l); }, []);
  const persistJournal = useCallback((j: JournalEntry[]) => { setJournal(j); appStorage.saveJournal(j); }, []);
  const persistSettings = useCallback((s: UserSettings) => { setSettings(s); appStorage.saveSettings(s); }, []);

  const value: AppState = {
    cycles,
    doseLogs,
    journal,
    settings,
    loading,
    userId,

    addCycle: (cycle) => persistCycles([cycle, ...cycles]),
    updateCycle: (cycle) => persistCycles(cycles.map((c) => (c.id === cycle.id ? cycle : c))),
    deleteCycle: (id) => {
      persistCycles(cycles.filter((c) => c.id !== id));
      persistLogs(doseLogs.filter((l) => l.cycleId !== id));
    },

    addDoseLog: (log) => persistLogs([log, ...doseLogs]),
    deleteDoseLog: (id) => persistLogs(doseLogs.filter((l) => l.id !== id)),

    addJournalEntry: (entry) => persistJournal([entry, ...journal]),
    updateJournalEntry: (entry) => persistJournal(journal.map((e) => (e.id === entry.id ? entry : e))),
    deleteJournalEntry: (id) => persistJournal(journal.filter((e) => e.id !== id)),

    updateSettings: (partial) => persistSettings({ ...settings, ...partial }),

    clearAllData: () => {
      persistCycles([]);
      persistLogs([]);
      persistJournal([]);
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
