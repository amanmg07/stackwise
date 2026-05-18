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
  /**
   * Alternate names this compound is searched/typed as — brand names,
   * full chemical names, common shorthand. Used by the synonym mapper
   * (utils/peptideMatch) so "Body Protection Compound", "Wegovy", etc.
   * resolve to the canonical id. Punctuation/spacing variants
   * ("BPC-157" vs "bpc 157" vs "bpc157") are handled by normalization
   * and do NOT need to be listed here.
   */
  aliases?: string[];
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
  // YYYY-MM-DD the peptide was added to the cycle. Optional for back-compat:
  // missing → treat as the cycle's start date.
  addedAt?: string;
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
  // Primary goals for THIS cycle. May differ from the user's
  // profile-level goals (someone whose profile says "muscle gain"
  // might run a recovery-focused cycle for an injury). Optional
  // for back-compat with cycles created before this field existed.
  goals?: Goal[];
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
  // Vendor / brand / lab name. Same compound from different sources
  // can have wildly different purity, so this is a real research
  // variable of concern, not free-text metadata. Optional — users
  // who don't know or don't care can leave it blank.
  source?: string;
}

/** Standardized check-in week numbers per the Architecture Spec. */
export type OutcomeWeek = 4 | 8 | 12 | 16;
export const OUTCOME_WEEKS: readonly OutcomeWeek[] = [4, 8, 12, 16] as const;

/**
 * Structured outcome check-in collected at a fixed cycle milestone
 * (week 4 / 8 / 12 / 16). These standardized intervals are what make
 * outcome data scientifically comparable across users — a buyer can
 * ask "what does week 8 of BPC-157 look like?" cleanly only because
 * every user answers the same questions on the same schedule.
 */
export interface CycleOutcome {
  id: string;
  cycleId: string;
  weekNumber: OutcomeWeek;
  overallScore: number;        // 1-10
  goalProgressScore: number;   // 1-10
  energyScore: number;         // 1-10
  recoveryScore: number;       // 1-10
  wouldRepeat: boolean;
  /** Side effects experienced this period (raw labels, normalized for analytics). */
  sideEffectsReported: string[];
  sideEffectSeverity: "none" | "mild" | "moderate" | "severe";
  notes: string;
  createdAt: string;
}

/**
 * Why a cycle ended. Granular reasons let buyers analyze churn by
 * cause — extremely valuable for safety research and product design.
 * Historical events used only `completed | ended_early`; treat the
 * legacy `ended_early` as "early stop, reason unspecified."
 */
export type CycleEndReason =
  | "completed"
  | "side_effects"
  | "goal_achieved"
  | "cost"
  | "other";

export type AdverseEventSeverity = "mild" | "moderate" | "severe";
export type AdverseEventDuration = "<1d" | "1-3d" | "4-7d" | "1+wk";

export interface AdverseEvent {
  effect: string; // human-readable label (normalized for analytics, raw here)
  severity?: AdverseEventSeverity;
  duration?: AdverseEventDuration;
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
  // Optional subjective metrics surfaced in the Additional Metrics section.
  // 1-10 scale where higher = better. Undefined when the user didn't rate.
  skinQuality?: number;
  jointComfort?: number;
  libido?: number;
  strength?: number;
  // Either the legacy string[] shape or the new structured AdverseEvent[].
  // Read with normalizeSideEffects() so callers always get AdverseEvent[].
  sideEffects?: string[] | AdverseEvent[];
  notes: string;
  createdAt: string;
  scaleV2?: boolean;
}

/** Coerce a JournalEntry.sideEffects value to the structured shape. */
export function normalizeSideEffects(raw: JournalEntry["sideEffects"]): AdverseEvent[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) =>
    typeof item === "string" ? { effect: item } : item
  );
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
  onboardingDone: boolean;
  demographicsDone: boolean;
  disclaimerAccepted: boolean;
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
  // Research data sharing — separate consent from internal analytics.
  // researchConsentDecided indicates the user has been prompted (true)
  // or is yet to be (false). researchDataConsent is their answer.
  researchConsentDecided: boolean;
  researchDataConsent: boolean;
  // Concurrent medications and supplements — major confounders for
  // any peptide effect. Users pick from a fixed list of categories
  // below; "other" lets them free-text anything not covered.
  coMedications?: string[];
  coMedicationsOther?: string;
}

/** Common drug/supplement categories that can confound peptide effects. */
export const CO_MEDICATION_CATEGORIES = [
  "ssri_snri",            // antidepressants
  "benzodiazepines",
  "stimulants_adhd",
  "statins",
  "antihypertensives",
  "beta_blockers",
  "metformin",
  "insulin",
  "trt",                  // testosterone replacement
  "thyroid_hormone",
  "oral_contraceptives",
  "ppi",                  // proton pump inhibitors
  "nsaids_daily",
  "creatine",
  "protein_supplement",
  "multivitamin",
  "vitamin_d",
  "omega_3",
  "magnesium",
  "ashwagandha",
  "alcohol_regular",
  "nicotine",
  "thc_cbd",
] as const;

export type CoMedicationCategory = (typeof CO_MEDICATION_CATEGORIES)[number];

export const CO_MEDICATION_LABELS: Record<CoMedicationCategory, string> = {
  ssri_snri: "SSRI / SNRI",
  benzodiazepines: "Benzodiazepines",
  stimulants_adhd: "ADHD stimulants",
  statins: "Statins",
  antihypertensives: "Blood pressure meds",
  beta_blockers: "Beta blockers",
  metformin: "Metformin",
  insulin: "Insulin",
  trt: "Testosterone (TRT)",
  thyroid_hormone: "Thyroid hormone",
  oral_contraceptives: "Oral contraceptives",
  ppi: "PPI (acid reducer)",
  nsaids_daily: "Daily NSAIDs",
  creatine: "Creatine",
  protein_supplement: "Protein powder",
  multivitamin: "Multivitamin",
  vitamin_d: "Vitamin D",
  omega_3: "Omega-3",
  magnesium: "Magnesium",
  ashwagandha: "Ashwagandha",
  alcohol_regular: "Alcohol (regular)",
  nicotine: "Nicotine",
  thc_cbd: "THC / CBD",
};

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
  // Set when the user tapped "Add to Cycle" from this scan and a
  // cycle was created from its recommendations. Lets us measure the
  // scan → cycle conversion funnel.
  resultingCycleId?: string;
}

/**
 * Bloodwork snapshot. All fields are optional because users will only
 * log markers their lab actually tested. Units are fixed per field
 * (documented in the UI label and the buyer-facing data dictionary)
 * so values across users are directly comparable.
 *
 * Units shipped:
 *   testosterone_total: ng/dL
 *   testosterone_free:  pg/mL
 *   estradiol:          pg/mL
 *   shbg:               nmol/L
 *   igf1:               ng/mL
 *   tsh:                mIU/L
 *   hba1c:              %
 *   fasting_glucose:    mg/dL
 *   fasting_insulin:    µIU/mL
 *   total_cholesterol:  mg/dL
 *   ldl:                mg/dL
 *   hdl:                mg/dL
 *   triglycerides:      mg/dL
 *   hs_crp:             mg/L
 *   alt:                U/L
 *   ast:                U/L
 *   creatinine:         mg/dL
 */
export interface Bloodwork {
  id: string;
  date: string; // YYYY-MM-DD when blood was drawn
  cycleId?: string; // active cycle at draw time (best-effort)
  labName?: string;
  // Hormones
  testosterone_total?: number;
  testosterone_free?: number;
  estradiol?: number;
  shbg?: number;
  igf1?: number;
  tsh?: number;
  // Metabolic
  hba1c?: number;
  fasting_glucose?: number;
  fasting_insulin?: number;
  // Lipids
  total_cholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  // Inflammation
  hs_crp?: number;
  // Liver / kidney
  alt?: number;
  ast?: number;
  creatinine?: number;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  peptideRefs?: string[];
}

