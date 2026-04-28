export type PeptideCategory =
  | "recovery"
  | "fat_loss"
  | "muscle_gain"
  | "anti_aging"
  | "cognitive"
  | "sleep"
  | "immune"
  | "sexual_health"
  | "hormone";

export type AdministrationRoute = "subcutaneous" | "intramuscular" | "oral" | "topical" | "nasal";

export type CompoundType = "peptide" | "supplement";

export interface DosingProtocol {
  purpose: string;
  doseRange: string;
  frequency: string;
  cycleDuration: string;
  timing: string;
}

export interface PeptideSource {
  name: string;
  url: string;
}

export interface Peptide {
  id: string;
  name: string;
  abbreviation?: string;
  compoundType?: CompoundType; // "peptide" (default) or "supplement"
  categories: PeptideCategory[];
  description: string;
  mechanism: string;
  routes: AdministrationRoute[];
  dosingProtocols: DosingProtocol[];
  sideEffects: string[];
  stacksWith: string[];
  halfLife: string;
  storage: string;
  notes: string;
  isBlend?: boolean;
}

export interface CyclePeptide {
  peptideId: string;
  doseAmount: number;
  doseUnit: "mcg" | "mg" | "g" | "IU";
  frequency: string;
  route: AdministrationRoute;
  timeOfDay: string[];
}

export interface Cycle {
  id: string;
  name: string;
  peptides: CyclePeptide[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
}

export interface DoseLog {
  id: string;
  cycleId: string;
  peptideId: string;
  amount: number;
  unit: "mcg" | "mg" | "g" | "IU";
  route: AdministrationRoute;
  timestamp: string;
  site?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  cycleId?: string;
  date: string;
  weight?: number;
  bodyFat?: number;
  sleepHours?: number;
  sleepQuality: number;
  energyLevel: number;
  recoveryScore: number;
  mood: number;
  sideEffects?: string[];
  notes: string;
  createdAt: string;
  scaleV2?: boolean;
}

export type Goal = "recovery" | "fat_loss" | "muscle_gain" | "anti_aging" | "sleep" | "cognitive" | "immune" | "sexual_health" | "hormone";

export interface ProtocolTemplate {
  id: string;
  name: string;
  goals: Goal[];
  description: string;
  peptides: {
    peptideId: string;
    role: string;
    suggestedDose: string;
    suggestedFrequency: string;
    suggestedDuration: string;
  }[];
  cycleDuration: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  notes: string;
}

export type Gender = "male" | "female" | "other";
export type ExperienceLevel = "new" | "some" | "experienced";

export interface UserSettings {
  weightUnit: "lbs" | "kg";
  notificationsEnabled: boolean;
  reminderTimes: string[];
  savedPeptides: string[];
  onboardingDone: boolean;
  demographicsDone: boolean;
  disclaimerAccepted: boolean;
  planPicked: boolean;
  displayName: string;
  profileImage: string | null;
  // Demographics
  age?: number;
  gender?: Gender;
  goals?: Goal[];
  experienceLevel?: ExperienceLevel;
  preferredRoutes?: AdministrationRoute[];
  // Analytics
  analyticsConsent: boolean;
}

export interface ScanObservation {
  category: PeptideCategory;
  observation: string;
  confidence: "high" | "medium" | "low";
}

export interface ScanResultData {
  strengths: ScanObservation[];
  improvements: ScanObservation[];
  recommendedCategories: PeptideCategory[];
  summary: string;
}

export interface ScanChange {
  category: PeptideCategory;
  change: string;
  direction: "improved" | "worsened" | "unchanged";
}

export interface WorkingPeptide {
  peptideId: string;
  reason: string;
}

export interface ScanRecommendation {
  category: PeptideCategory;
  observation: string;
  suggestedPeptideIds: string[];
}

export interface ScanComparison {
  summary: string;
  changes: ScanChange[];
  workingPeptides: WorkingPeptide[];
  newRecommendations: ScanRecommendation[];
}

export interface ScanRecord {
  id: string;
  date: string; // ISO timestamp
  imagePath: string; // file:// URI in documentDirectory
  result: ScanResultData;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  peptideRefs?: string[];
}

// Subscription plans
export type PlanId = "basic" | "pro" | "elite";

export interface PlanLimits {
  aiQueriesPerDay: number; // -1 = unlimited
  peptidesPerCycle: number; // -1 = unlimited
  journalEntriesPerWeek: number;
  selfScansPerWeek: number;
  priorityAi: boolean;
}

export interface UsageCounters {
  aiQueries: { count: number; resetDate: string }; // daily reset
  journalEntries: { count: number; resetDate: string }; // weekly reset
  selfScans: { count: number; resetDate: string }; // weekly reset
}
