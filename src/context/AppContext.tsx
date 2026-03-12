import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Cycle, DoseLog, JournalEntry, UserSettings } from "../types";
import { appStorage } from "../utils/storage";

interface AppState {
  cycles: Cycle[];
  doseLogs: DoseLog[];
  journal: JournalEntry[];
  settings: UserSettings;
  loading: boolean;
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [c, d, j, s] = await Promise.all([
        appStorage.loadCycles(),
        appStorage.loadDoseLogs(),
        appStorage.loadJournal(),
        appStorage.loadSettings(),
      ]);
      setCycles(c);
      setDoseLogs(d);
      setJournal(j);
      setSettings(s);
      setLoading(false);
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

    addCycle: (cycle) => persistCycles([cycle, ...cycles]),
    updateCycle: (cycle) => persistCycles(cycles.map((c) => (c.id === cycle.id ? cycle : c))),
    deleteCycle: (id) => persistCycles(cycles.filter((c) => c.id !== id)),

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
