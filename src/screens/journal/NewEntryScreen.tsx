import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { generateId } from "../../utils/id";
import { format, parseISO } from "date-fns";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { colors, spacing, safeBottom } from "../../theme";
import { trackJournalEntry } from "../../services/analyticsService";
import { AdverseEvent, AdverseEventSeverity, AdverseEventDuration, normalizeSideEffects } from "../../types";

const SIDE_EFFECTS = [
  "Nausea", "Headache", "Fatigue", "Dizziness",
  "Injection site pain", "Flushing", "Water retention",
  "Appetite change", "Insomnia", "Joint pain",
  "Numbness/tingling", "Bloating", "Stomach upset",
  "Skin tingling", "Jitters", "Dry mouth",
];

// ────────────────────────────────────────────────────────────────────
// Quick-log presets (ticket 1.3).
//
// Each emoji maps to a 4-tuple of mood-keyed pre-fills for the four
// mandatory scores (sleep / energy / recovery / mood). Designed so the
// auto-fill is *believable* without being neutral:
//   - "Bad" lands in the 2–3 band, not a flat 1
//   - "Good" lands in the 7–8 band, not a flat 8
//   - the four scores are correlated but not identical so the data
//     doesn't look like obvious autofill in the buyer dataset.
//
// Every quick-log emission is tagged `entry_mode: "quick"` so buyer
// aggregates that need high-fidelity sliders can filter these out.
// See [[project_analytics_data_integrity]] for the data-moat rule.
// ────────────────────────────────────────────────────────────────────
interface QuickPreset {
  mood: number;
  sleep: number;
  energy: number;
  recovery: number;
  emoji: string;
  label: string;
}
const QUICK_PRESETS: QuickPreset[] = [
  { mood: 2,  sleep: 3, energy: 2, recovery: 3,  emoji: "😞", label: "Bad" },
  { mood: 5,  sleep: 5, energy: 5, recovery: 5,  emoji: "😐", label: "Meh" },
  { mood: 8,  sleep: 8, energy: 7, recovery: 8,  emoji: "🙂", label: "Good" },
  { mood: 10, sleep: 9, energy: 10, recovery: 9, emoji: "🤩", label: "Great" },
];

const SEVERITY_OPTIONS: AdverseEventSeverity[] = ["mild", "moderate", "severe"];
const DURATION_OPTIONS: AdverseEventDuration[] = ["<1d", "1-3d", "4-7d", "1+wk"];

// Map a 1–10 wellbeing score to the semantic palette so the value
// stands out and reads at a glance: low = red, mid = amber, high =
// green. Every metric on this screen is "higher is better"
// (Terrible→Best, Beat up→Fully recovered, …) so one scale fits all.
// Mirrors the goal-chip treatment (tinted pill + colored text).
function scoreColor(value: number): string {
  if (value <= 3) return colors.error;
  if (value <= 6) return colors.warning;
  return colors.success;
}

function RatingInput({ label, value, onChange, lowLabel, highLabel }: { label: string; value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string }) {
  const c = scoreColor(value);
  return (
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingLabel}>{label}</Text>
        <View style={[styles.valuePill, { backgroundColor: c + "18", borderColor: c + "55" }]}>
          <Text style={[styles.ratingValue, { color: c }]}>{value}<Text style={styles.ratingValueMax}>/10</Text></Text>
        </View>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={c}
        maximumTrackTintColor={colors.surface}
        thumbTintColor={c}
      />
      <View style={styles.ratingHints}>
        <Text style={styles.ratingHint}>{lowLabel}</Text>
        <Text style={styles.ratingHint}>{highLabel}</Text>
      </View>
    </View>
  );
}

/**
 * Like RatingInput but the value can be undefined ("not rated"). Tapping
 * the value resets it; tapping a still-unrated row activates it. We don't
 * default to 5 because that would silently fill the dataset with neutral
 * scores from users who never thought about the metric.
 */
function OptionalRating({
  label, value, onChange, lowLabel, highLabel,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  lowLabel: string;
  highLabel: string;
}) {
  const isSet = typeof value === "number";
  // Only colorize once the user has actually set a value — an unset
  // metric stays muted grey so "not rated" remains visually distinct
  // and we don't imply a score the user never gave.
  const c = isSet ? scoreColor(value as number) : colors.textSecondary;
  return (
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingLabel}>{label}</Text>
        {isSet ? (
          <TouchableOpacity onPress={() => onChange(undefined)}>
            <View style={[styles.valuePill, { backgroundColor: c + "18", borderColor: c + "55" }]}>
              <Text style={[styles.ratingValue, { color: c }]}>{value}<Text style={styles.ratingValueMax}>/10 ✕</Text></Text>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={styles.ratingValueMuted}>not rated</Text>
        )}
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={isSet ? value : 5}
        onValueChange={(v) => onChange(v)}
        minimumTrackTintColor={isSet ? c : colors.border}
        maximumTrackTintColor={colors.surface}
        thumbTintColor={isSet ? c : colors.textSecondary}
      />
      <View style={styles.ratingHints}>
        <Text style={styles.ratingHint}>{lowLabel}</Text>
        <Text style={styles.ratingHint}>{highLabel}</Text>
      </View>
    </View>
  );
}

export default function NewEntryScreen({ route, navigation }: any) {
  const { journal, addJournalEntry, updateJournalEntry, settings, cycles } = useApp();
  const { showToast } = useToast();
  const entryId = route.params?.entryId;
  const existing = entryId ? journal.find((e) => e.id === entryId) : null;
  const activeCycle = cycles.find((c) => c.isActive);

  const [weight, setWeight] = useState(existing?.weight?.toString() || "");
  const [bodyFat, setBodyFat] = useState(existing?.bodyFat?.toString() || "");
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours?.toString() || "");
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality || 5);
  const [energyLevel, setEnergyLevel] = useState(existing?.energyLevel || 5);
  const [recoveryScore, setRecoveryScore] = useState(existing?.recoveryScore || 5);
  const [mood, setMood] = useState(existing?.mood || 5);
  // Additional metrics — start unset so a default of 5 doesn't pollute
  // the dataset for users who don't actively rate these.
  const [skinQuality, setSkinQuality] = useState<number | undefined>(existing?.skinQuality);
  const [jointComfort, setJointComfort] = useState<number | undefined>(existing?.jointComfort);
  const [libido, setLibido] = useState<number | undefined>(existing?.libido);
  const [strength, setStrength] = useState<number | undefined>(existing?.strength);
  const [showAdditional, setShowAdditional] = useState(
    existing?.skinQuality != null || existing?.jointComfort != null ||
    existing?.libido != null || existing?.strength != null,
  );
  const [sideEffects, setSideEffects] = useState<Map<string, AdverseEvent>>(() => {
    const initial = new Map<string, AdverseEvent>();
    for (const ev of normalizeSideEffects(existing?.sideEffects)) {
      initial.set(ev.effect, ev);
    }
    return initial;
  });
  const [notes, setNotes] = useState(existing?.notes || "");

  // ── Quick-log state machine (ticket 1.3) ─────────────────────────
  //  "quick"  → new entry, emoji row visible, full form hidden
  //  "saved"  → user just tapped an emoji; entry exists; "Add detail"
  //             button switches the screen into refine-mode
  //  "full"   → full slider form visible. Either the user explicitly
  //             skipped quick-log, opened a refine-flow from "saved",
  //             or is editing an existing entry (skips "quick"
  //             entirely so we never re-prompt for mood on something
  //             that's already been captured).
  type EntryMode = "quick" | "saved" | "full";
  const [entryMode, setEntryMode] = useState<EntryMode>(existing ? "full" : "quick");
  const [savedId, setSavedId] = useState<string | null>(existing?.id ?? null);
  const [savedPreset, setSavedPreset] = useState<QuickPreset | null>(null);
  // The entry's date is locked at mount so a session that straddles
  // midnight (user opens at 11:58 PM, refines past 12:00 AM) writes
  // the entry to its original local day, not the new one.
  const [currentEntryDate] = useState<string>(
    () => existing?.date || format(new Date(), "yyyy-MM-dd"),
  );

  const toggleSideEffect = (effect: string) => {
    setSideEffects((prev) => {
      const next = new Map(prev);
      if (next.has(effect)) next.delete(effect);
      else next.set(effect, { effect });
      return next;
    });
  };

  const setEventField = (
    effect: string,
    patch: Partial<Pick<AdverseEvent, "severity" | "duration">>
  ) => {
    setSideEffects((prev) => {
      const next = new Map(prev);
      const current = next.get(effect) || { effect };
      next.set(effect, { ...current, ...patch });
      return next;
    });
  };

  const save = () => {
    const parsedWeight = weight ? parseFloat(weight) : undefined;
    const parsedBodyFat = bodyFat ? parseFloat(bodyFat) : undefined;
    // savedId (set by quick-log) or existing.id both mean "we're updating
    // an entry that already exists in the journal store" — same code
    // path, same analytics tag ("full" — this code runs when the user
    // explicitly committed the slider form).
    const id = savedId || existing?.id || generateId();
    const isUpdate = !!(savedId || existing);
    const entry = {
      id,
      cycleId: activeCycle?.id,
      date: currentEntryDate,
      weight: parsedWeight,
      bodyFat: parsedBodyFat,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      sleepQuality,
      energyLevel,
      recoveryScore,
      mood,
      skinQuality,
      jointComfort,
      libido,
      strength,
      sideEffects: sideEffects.size > 0 ? [...sideEffects.values()] : undefined,
      notes,
      createdAt: existing?.createdAt || new Date().toISOString(),
      scaleV2: true,
    };

    const trackPayload = {
      journalEntryId: entry.id,
      cycleId: activeCycle?.id,
      sleepQuality,
      energyLevel,
      recoveryScore,
      mood,
      weight: parsedWeight,
      weightUnit: settings.weightUnit,
      bodyFat: parsedBodyFat,
      skinQuality,
      jointComfort,
      libido,
      strength,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      activePeptideIds: activeCycle?.peptides.map((p) => p.peptideId) || [],
      sideEffects: sideEffects.size > 0 ? [...sideEffects.values()] : undefined,
      entryMode: "full" as const,
    };

    if (isUpdate) {
      updateJournalEntry(entry);
      trackJournalEntry(trackPayload);
      showToast("Entry updated!");
    } else {
      addJournalEntry(entry);
      trackJournalEntry(trackPayload);
      showToast("Entry saved!");
    }
    // Always land on the Journal home page after save. goBack() is
    // unreliable here because cross-tab nav from Home (1.1) puts
    // NewEntry in the JournalStack without a Journal screen
    // underneath — goBack() then falls through to the tab
    // navigator's history and pops to whatever tab was last
    // (typically Explore). reset() forces the stack to a single
    // Journal route regardless of how we got here.
    navigation.reset({ index: 0, routes: [{ name: "Journal" }] });
  };

  // ── Quick-log auto-save ──────────────────────────────────────────
  // One-tap save with mood-keyed pre-fills. Entry is committed
  // immediately; the user can refine via "Add detail" or just leave.
  const quickLogSave = (preset: QuickPreset) => {
    // Push pre-fills into the form state so if the user opts to
    // refine, the sliders start where the emoji put them.
    setSleepQuality(preset.sleep);
    setEnergyLevel(preset.energy);
    setRecoveryScore(preset.recovery);
    setMood(preset.mood);

    const id = generateId();
    const entry = {
      id,
      cycleId: activeCycle?.id,
      date: currentEntryDate,
      sleepQuality: preset.sleep,
      energyLevel: preset.energy,
      recoveryScore: preset.recovery,
      mood: preset.mood,
      notes: "",
      createdAt: new Date().toISOString(),
      scaleV2: true,
    };
    addJournalEntry(entry);
    trackJournalEntry({
      journalEntryId: id,
      cycleId: activeCycle?.id,
      sleepQuality: preset.sleep,
      energyLevel: preset.energy,
      recoveryScore: preset.recovery,
      mood: preset.mood,
      weightUnit: settings.weightUnit,
      activePeptideIds: activeCycle?.peptides.map((p) => p.peptideId) || [],
      entryMode: "quick",
    });
    showToast(`Saved ${preset.emoji} — tap to add detail`);
    setSavedId(id);
    setSavedPreset(preset);
    setEntryMode("saved");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      <Text style={styles.dateText}>
        {existing ? format(parseISO(existing.date), "EEEE, MMMM d") : format(new Date(), "EEEE, MMMM d")}
      </Text>

      {/* ── Quick-log fast path (ticket 1.3) ────────────────────── */}
      {entryMode === "quick" && (
        <View style={styles.quickLogCard}>
          <Text style={styles.quickLogTitle}>How was today?</Text>
          <View style={styles.quickLogRow}>
            {QUICK_PRESETS.map((p) => (
              <TouchableOpacity
                key={p.label}
                style={styles.quickLogBtn}
                onPress={() => quickLogSave(p)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Log mood: ${p.label}`}
              >
                <Text style={styles.quickLogEmoji}>{p.emoji}</Text>
                <Text style={styles.quickLogLabel}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.quickLogSkipBtn}
            onPress={() => setEntryMode("full")}
          >
            <Text style={styles.quickLogSkipText}>Skip → log detailed entry</Text>
          </TouchableOpacity>
        </View>
      )}

      {entryMode === "saved" && savedPreset && (
        <View style={styles.savedCard}>
          <View style={styles.savedHeader}>
            <Text style={styles.savedEmoji}>{savedPreset.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.savedTitle}>Saved · {savedPreset.label}</Text>
              <Text style={styles.savedSubtitle}>
                Done in one tap. Want to refine? Add detail below.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.refineBtn}
            onPress={() => setEntryMode("full")}
          >
            <Ionicons name="create-outline" size={16} color={colors.accent} />
            <Text style={styles.refineBtnText}>Add detail to refine</Text>
          </TouchableOpacity>
        </View>
      )}

      {entryMode === "full" && <>
      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={styles.label}>Weight ({settings.weightUnit})</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.half}>
          <Text style={styles.label}>Body fat (%)</Text>
          <TextInput
            style={styles.input}
            value={bodyFat}
            onChangeText={setBodyFat}
            keyboardType="decimal-pad"
            placeholder="—"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      <Text style={styles.label}>Sleep (hours)</Text>
      <TextInput
        style={styles.input}
        value={sleepHours}
        onChangeText={setSleepHours}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.sectionTitle}>Ratings</Text>
      <RatingInput label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} lowLabel="Terrible" highLabel="Best sleep" />
      <RatingInput label="Energy Level" value={energyLevel} onChange={setEnergyLevel} lowLabel="Exhausted" highLabel="Fully charged" />
      <RatingInput label="Recovery" value={recoveryScore} onChange={setRecoveryScore} lowLabel="Beat up" highLabel="Fully recovered" />
      <RatingInput label="Mood" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />

      <TouchableOpacity
        style={styles.additionalToggle}
        onPress={() => setShowAdditional((v) => !v)}
      >
        <Text style={styles.additionalToggleText}>
          {showAdditional ? "− Hide additional metrics" : "+ Add metric (skin, joints, libido, strength)"}
        </Text>
      </TouchableOpacity>
      {showAdditional && (
        <>
          <OptionalRating
            label="Skin Quality"
            value={skinQuality}
            onChange={setSkinQuality}
            lowLabel="Rough"
            highLabel="Clear"
          />
          <OptionalRating
            label="Joint Comfort"
            value={jointComfort}
            onChange={setJointComfort}
            lowLabel="Painful"
            highLabel="Free moving"
          />
          <OptionalRating
            label="Libido"
            value={libido}
            onChange={setLibido}
            lowLabel="Low"
            highLabel="High"
          />
          <OptionalRating
            label="Strength"
            value={strength}
            onChange={setStrength}
            lowLabel="Weak"
            highLabel="Strong"
          />
        </>
      )}

      <Text style={styles.sectionTitle}>Side Effects</Text>
      <Text style={styles.sideEffectHint}>Tap any you experienced today</Text>
      <View style={styles.sideEffectRow}>
        {SIDE_EFFECTS.map((e) => {
          const active = sideEffects.has(e);
          return (
            <TouchableOpacity
              key={e}
              style={[styles.sideEffectChip, active && styles.sideEffectChipActive]}
              onPress={() => toggleSideEffect(e)}
            >
              <Text style={[styles.sideEffectText, active && styles.sideEffectTextActive]}>{e}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {sideEffects.size > 0 && (
        <View style={styles.aeDetailWrap}>
          <Text style={styles.aeDetailHeading}>Severity & duration (optional)</Text>
          {[...sideEffects.values()].map((ev) => (
            <View key={ev.effect} style={styles.aeRow}>
              <Text style={styles.aeRowTitle}>{ev.effect}</Text>
              <View style={styles.aeBtnRow}>
                {SEVERITY_OPTIONS.map((s) => {
                  const on = ev.severity === s;
                  return (
                    <TouchableOpacity
                      key={s}
                      style={[styles.aeBtn, on && styles.aeBtnActive]}
                      onPress={() => setEventField(ev.effect, { severity: on ? undefined : s })}
                    >
                      <Text style={[styles.aeBtnText, on && styles.aeBtnTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.aeBtnRow}>
                {DURATION_OPTIONS.map((d) => {
                  const on = ev.duration === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[styles.aeBtn, on && styles.aeBtnActive]}
                      onPress={() => setEventField(ev.effect, { duration: on ? undefined : d })}
                    >
                      <Text style={[styles.aeBtnText, on && styles.aeBtnTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="How are you feeling today?"
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Ionicons name="checkmark" size={20} color={colors.background} />
        <Text style={styles.saveBtnText}>{(savedId || existing) ? "Update Entry" : "Save Entry"}</Text>
      </TouchableOpacity>
      </>}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  dateText: { fontSize: 20, fontWeight: "700", color: colors.accent, marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 24,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  ratingContainer: { marginBottom: 18 },
  ratingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  ratingLabel: { fontSize: 14, color: colors.text },
  valuePill: {
    paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8,
    borderWidth: 1,
  },
  ratingValue: { fontSize: 20, fontWeight: "800", color: colors.accent },
  ratingValueMax: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  ratingValueMuted: { fontSize: 13, fontStyle: "italic", color: colors.textSecondary },
  additionalToggle: {
    paddingVertical: 10, alignItems: "center",
    marginTop: 4, marginBottom: 8,
  },
  additionalToggleText: { fontSize: 14, fontWeight: "600", color: colors.accent },
  ratingHints: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  ratingHint: { fontSize: 10, color: colors.textSecondary },
  slider: { width: "100%", height: 40 },
  sideEffectHint: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
  sideEffectRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  sideEffectChip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  sideEffectChipActive: { backgroundColor: colors.error + "18", borderColor: colors.error + "50" },
  sideEffectText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  sideEffectTextActive: { color: colors.error },
  aeDetailWrap: { marginTop: 14, gap: 10 },
  aeDetailHeading: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", marginBottom: 4 },
  aeRow: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border, gap: 8,
  },
  aeRowTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  aeBtnRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  aeBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8,
    backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border,
  },
  aeBtnActive: { backgroundColor: colors.error + "18", borderColor: colors.error + "50" },
  aeBtnText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, textTransform: "capitalize" },
  aeBtnTextActive: { color: colors.error },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 32,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },

  // ── Quick-log + saved-state UI (ticket 1.3) ─────────────────────
  quickLogCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  quickLogTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 16,
  },
  quickLogRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },
  quickLogBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  quickLogEmoji: { fontSize: 32 },
  quickLogLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickLogSkipBtn: {
    paddingVertical: 10,
    alignItems: "center",
  },
  quickLogSkipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  savedCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.success + "40",
    marginBottom: 24,
    gap: 14,
  },
  savedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  savedEmoji: { fontSize: 36 },
  savedTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  savedSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  refineBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.accent + "12",
    borderWidth: 1,
    borderColor: colors.accent + "30",
  },
  refineBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },
});
