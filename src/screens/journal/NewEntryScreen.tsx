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

const SEVERITY_OPTIONS: AdverseEventSeverity[] = ["mild", "moderate", "severe"];
const DURATION_OPTIONS: AdverseEventDuration[] = ["<1d", "1-3d", "4-7d", "1+wk"];

function RatingInput({ label, value, onChange, lowLabel, highLabel }: { label: string; value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string }) {
  return (
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingLabel}>{label}</Text>
        <Text style={styles.ratingValue}>{value}<Text style={styles.ratingValueMax}>/10</Text></Text>
      </View>
      <Slider
        style={styles.slider}
        minimumValue={1}
        maximumValue={10}
        step={1}
        value={value}
        onValueChange={onChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.surface}
        thumbTintColor={colors.accent}
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
  return (
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingLabel}>{label}</Text>
        {isSet ? (
          <TouchableOpacity onPress={() => onChange(undefined)}>
            <Text style={styles.ratingValue}>{value}<Text style={styles.ratingValueMax}>/10 ✕</Text></Text>
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
        minimumTrackTintColor={isSet ? colors.accent : colors.border}
        maximumTrackTintColor={colors.surface}
        thumbTintColor={isSet ? colors.accent : colors.textSecondary}
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
    const entry = {
      id: existing?.id || generateId(),
      cycleId: activeCycle?.id,
      date: existing?.date || format(new Date(), "yyyy-MM-dd"),
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

    if (existing) {
      updateJournalEntry(entry);
      trackJournalEntry({
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
      });
      showToast("Entry updated!");
    } else {
      addJournalEntry(entry);
      trackJournalEntry({
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
      });
      showToast("Entry saved!");
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      <Text style={styles.dateText}>
        {existing ? format(parseISO(existing.date), "EEEE, MMMM d") : format(new Date(), "EEEE, MMMM d")}
      </Text>

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
        <Text style={styles.saveBtnText}>{existing ? "Update Entry" : "Save Entry"}</Text>
      </TouchableOpacity>
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
  ratingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  ratingLabel: { fontSize: 14, color: colors.text },
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
});
