import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { generateId } from "../../utils/id";
import { colors, spacing, safeBottom } from "../../theme";
import { CycleOutcome, OutcomeWeek } from "../../types";
import { trackOutcome } from "../../services/analyticsService";

const SIDE_EFFECTS = [
  "Nausea", "Headache", "Fatigue", "Dizziness",
  "Injection site pain", "Flushing", "Water retention",
  "Appetite change", "Insomnia", "Joint pain",
  "Numbness/tingling", "Bloating", "Stomach upset",
  "Skin tingling", "Jitters", "Dry mouth",
];

const SEVERITY_OPTIONS: Array<CycleOutcome["sideEffectSeverity"]> = [
  "none", "mild", "moderate", "severe",
];

function ScoreSlider({
  label, value, onChange, lowLabel, highLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <View style={styles.scoreRow}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{value}<Text style={styles.scoreValueMax}>/10</Text></Text>
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
      <View style={styles.scoreHints}>
        <Text style={styles.scoreHint}>{lowLabel}</Text>
        <Text style={styles.scoreHint}>{highLabel}</Text>
      </View>
    </View>
  );
}

export default function OutcomeCheckInScreen({ route, navigation }: any) {
  const cycleId: string = route.params?.cycleId;
  const weekNumber: OutcomeWeek = route.params?.weekNumber;
  const { cycles, addOutcome, scans } = useApp();
  const { showToast } = useToast();
  const cycle = cycles.find((c) => c.id === cycleId);

  const [overallScore, setOverallScore] = useState(7);
  const [goalProgressScore, setGoalProgressScore] = useState(7);
  const [energyScore, setEnergyScore] = useState(7);
  const [recoveryScore, setRecoveryScore] = useState(7);
  const [wouldRepeat, setWouldRepeat] = useState(true);
  const [sideEffects, setSideEffects] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState<CycleOutcome["sideEffectSeverity"]>("none");
  const [notes, setNotes] = useState("");

  if (!cycle) {
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorText}>Cycle not found</Text>
      </View>
    );
  }

  const toggleSideEffect = (e: string) => {
    setSideEffects((prev) => {
      const next = new Set(prev);
      if (next.has(e)) next.delete(e);
      else next.add(e);
      return next;
    });
  };

  const save = () => {
    const entry: CycleOutcome = {
      id: generateId(),
      cycleId,
      weekNumber,
      overallScore,
      goalProgressScore,
      energyScore,
      recoveryScore,
      wouldRepeat,
      sideEffectsReported: [...sideEffects],
      sideEffectSeverity: severity,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };
    addOutcome(entry);
    trackOutcome(entry);
    showToast(`Week ${weekNumber} check-in saved!`);

    // Ticket 2.2: piggyback on the outcome-completion peak moment to
    // re-prompt for the Self Scan. Scans are StackWise's most
    // visceral "wow" surface and they've had zero scheduled
    // re-engagement until now. Two variants:
    //   - User scanned during this cycle → "Take a new scan to see
    //     visible changes since cycle start." Tap routes to scanner
    //     where the existing ScanCompareScreen surfaces the diff.
    //   - User hasn't scanned yet → "Take a baseline now so the next
    //     check-in can show changes." Sets up the next milestone.
    // 'Skip' navigates back as before; the prompt is opt-in.
    const cycleStartScans = scans.filter((s) => s.date >= cycle.startDate);
    const hasBaseline = cycleStartScans.length > 0;
    Alert.alert(
      hasBaseline ? "See what's changed?" : "Take a baseline scan?",
      hasBaseline
        ? `Take a new scan and compare it side-by-side with your week-${cycleStartScans.length > 1 ? cycleStartScans.length - 1 : 0}-of-cycle baseline. ~30 seconds.`
        : "A scan now means the next check-in can show you side-by-side visible changes. ~30 seconds.",
      [
        { text: "Skip", style: "cancel", onPress: () => navigation.goBack() },
        {
          text: "Scan now",
          onPress: () => {
            // Pop the outcome check-in first so back-from-scanner doesn't
            // return here, then cross-tab into the scanner.
            navigation.goBack();
            navigation.getParent()?.navigate("ScannerTab");
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
        <Text style={styles.title}>Week {weekNumber} Check-In</Text>
        <Text style={styles.subtitle}>{cycle.name}</Text>
        <Text style={styles.intro}>
          A standardized check-in at week {weekNumber} so your progress can be compared meaningfully across cycles. Takes ~60 seconds.
        </Text>

        <Text style={styles.sectionTitle}>How are things going?</Text>
        <ScoreSlider
          label="Overall wellbeing"
          value={overallScore}
          onChange={setOverallScore}
          lowLabel="Bad"
          highLabel="Excellent"
        />
        <ScoreSlider
          label="Progress toward goal"
          value={goalProgressScore}
          onChange={setGoalProgressScore}
          lowLabel="No change"
          highLabel="Major progress"
        />
        <ScoreSlider
          label="Energy"
          value={energyScore}
          onChange={setEnergyScore}
          lowLabel="Drained"
          highLabel="Charged"
        />
        <ScoreSlider
          label="Recovery"
          value={recoveryScore}
          onChange={setRecoveryScore}
          lowLabel="Beat up"
          highLabel="Bouncing back"
        />

        <Text style={styles.sectionTitle}>Side effects this period</Text>
        <Text style={styles.helpText}>Tap any you experienced</Text>
        <View style={styles.chipRow}>
          {SIDE_EFFECTS.map((e) => {
            const active = sideEffects.has(e);
            return (
              <TouchableOpacity
                key={e}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleSideEffect(e)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{e}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {sideEffects.size > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 18 }]}>Overall severity</Text>
            <View style={styles.severityRow}>
              {SEVERITY_OPTIONS.map((s) => {
                const on = severity === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.severityBtn, on && styles.severityBtnActive]}
                    onPress={() => setSeverity(s)}
                  >
                    <Text style={[styles.severityText, on && styles.severityTextActive]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Would you run this cycle again?</Text>
        <View style={styles.wouldRepeatRow}>
          <TouchableOpacity
            style={[styles.wouldRepeatBtn, wouldRepeat && styles.wouldRepeatBtnYes]}
            onPress={() => setWouldRepeat(true)}
          >
            <Ionicons name="checkmark" size={18} color={wouldRepeat ? colors.background : colors.success} />
            <Text style={[styles.wouldRepeatText, wouldRepeat && { color: colors.background }]}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.wouldRepeatBtn, !wouldRepeat && styles.wouldRepeatBtnNo]}
            onPress={() => setWouldRepeat(false)}
          >
            <Ionicons name="close" size={18} color={!wouldRepeat ? colors.background : colors.error} />
            <Text style={[styles.wouldRepeatText, !wouldRepeat && { color: colors.background }]}>No</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Notes (optional, stays on device)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
          value={notes}
          onChangeText={setNotes}
          multiline
          placeholder="Anything else worth noting?"
          placeholderTextColor={colors.textSecondary}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={save}>
          <Ionicons name="checkmark" size={20} color={colors.background} />
          <Text style={styles.saveBtnText}>Save Week {weekNumber} Check-In</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: spacing.md },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 16, color: colors.accent, fontWeight: "600", marginTop: 2, marginBottom: 12 },
  intro: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  helpText: { fontSize: 12, color: colors.textSecondary, marginBottom: 10 },
  scoreRow: { marginBottom: 16 },
  scoreHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 },
  scoreLabel: { fontSize: 14, color: colors.text },
  scoreValue: { fontSize: 20, fontWeight: "800", color: colors.accent },
  scoreValueMax: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  scoreHints: { flexDirection: "row", justifyContent: "space-between", marginTop: 2 },
  scoreHint: { fontSize: 10, color: colors.textSecondary },
  slider: { width: "100%", height: 40 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.error + "18", borderColor: colors.error + "50" },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.error },
  severityRow: { flexDirection: "row", gap: 8 },
  severityBtn: {
    flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  severityBtnActive: { backgroundColor: colors.error + "18", borderColor: colors.error + "50" },
  severityText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, textTransform: "capitalize" },
  severityTextActive: { color: colors.error },
  wouldRepeatRow: { flexDirection: "row", gap: 8 },
  wouldRepeatBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  wouldRepeatBtnYes: { backgroundColor: colors.success, borderColor: colors.success },
  wouldRepeatBtnNo: { backgroundColor: colors.error, borderColor: colors.error },
  wouldRepeatText: { fontSize: 15, fontWeight: "700", color: colors.text },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.lg, marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
    marginTop: spacing.xl,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  errorText: { color: colors.textSecondary, fontSize: 16 },
});
