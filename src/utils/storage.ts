import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cycle, DoseLog, JournalEntry, UserSettings, ChatMessage, ScanRecord } from "../types";

const KEYS = {
  cycles: "@stackwise/cycles",
  doseLogs: "@stackwise/dose_logs",
  journal: "@stackwise/journal",
  settings: "@stackwise/settings",
  chatMessages: "@stackwise/chat_messages",
  scans: "@stackwise/scans",
};

const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: "lbs",
  notificationsEnabled: false,
  reminderTimes: ["08:00", "20:00"],
  savedPeptides: [],
  onboardingDone: false,
  disclaimerAccepted: false,
  displayName: "",
  profileImage: null,
};

async function load<T>(key: string, fallback: T): Promise<T> {
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
}

async function save<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export const appStorage = {
  async loadCycles(): Promise<Cycle[]> {
    return load(KEYS.cycles, []);
  },
  async saveCycles(cycles: Cycle[]): Promise<void> {
    return save(KEYS.cycles, cycles);
  },

  async loadDoseLogs(): Promise<DoseLog[]> {
    return load(KEYS.doseLogs, []);
  },
  async saveDoseLogs(logs: DoseLog[]): Promise<void> {
    return save(KEYS.doseLogs, logs);
  },

  async loadJournal(): Promise<JournalEntry[]> {
    return load(KEYS.journal, []);
  },
  async saveJournal(entries: JournalEntry[]): Promise<void> {
    return save(KEYS.journal, entries);
  },

  async loadSettings(): Promise<UserSettings> {
    return load(KEYS.settings, DEFAULT_SETTINGS);
  },
  async saveSettings(settings: UserSettings): Promise<void> {
    return save(KEYS.settings, settings);
  },

  async loadScans(): Promise<ScanRecord[]> {
    return load(KEYS.scans, []);
  },
  async saveScans(scans: ScanRecord[]): Promise<void> {
    return save(KEYS.scans, scans);
  },

  async loadChatMessages(): Promise<ChatMessage[]> {
    return load(KEYS.chatMessages, []);
  },
  async saveChatMessages(messages: ChatMessage[]): Promise<void> {
    return save(KEYS.chatMessages, messages);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
