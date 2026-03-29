import AsyncStorage from "@react-native-async-storage/async-storage";
import { Cycle, DoseLog, JournalEntry, UserSettings, CommunityPost } from "../types";

const KEYS = {
  cycles: "@stackwise/cycles",
  doseLogs: "@stackwise/dose_logs",
  journal: "@stackwise/journal",
  settings: "@stackwise/settings",
  communityPosts: "@stackwise/community_posts",
  likedPosts: "@stackwise/liked_posts",
};

const DEFAULT_SETTINGS: UserSettings = {
  weightUnit: "lbs",
  notificationsEnabled: false,
  reminderTimes: ["08:00", "20:00"],
  savedPeptides: [],
  onboardingDone: false,
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

  async loadCommunityPosts(): Promise<CommunityPost[]> {
    return load(KEYS.communityPosts, []);
  },
  async saveCommunityPosts(posts: CommunityPost[]): Promise<void> {
    return save(KEYS.communityPosts, posts);
  },

  async loadLikedPosts(): Promise<string[]> {
    return load(KEYS.likedPosts, []);
  },
  async saveLikedPosts(ids: string[]): Promise<void> {
    return save(KEYS.likedPosts, ids);
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
