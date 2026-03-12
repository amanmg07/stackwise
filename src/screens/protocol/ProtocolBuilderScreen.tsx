import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { colors, spacing } from "../../theme";
import { Goal } from "../../types";

const GOALS: { key: Goal; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "recovery", label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  { key: "fat_loss", label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  { key: "muscle_gain", label: "Muscle Gain", icon: "barbell-outline", color: "#60a5fa" },
  { key: "anti_aging", label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  { key: "sleep", label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  { key: "cognitive", label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
];

const LEVELS = [
  { key: "beginner" as const, label: "Beginner", desc: "New to peptides" },
  { key: "intermediate" as const, label: "Intermediate", desc: "Some experience" },
  { key: "advanced" as const, label: "Advanced", desc: "Experienced user" },
];

const STEPS = ["goals", "level", "ready"] as const;

export default function ProtocolBuilderScreen({ navigation }: any) {
  const { cycles } = useApp();
  const activeCycle = cycles.find((c) => c.isActive);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [step, setStep] = useState<(typeof STEPS)[number]>("goals");

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Welcome header */}
      <Text style={styles.welcome}>StackWise</Text>
      <Text style={styles.motto}>Stop Guessing, Start StackWising.</Text>
      <Text style={styles.tagline}>Your peptide journey starts here</Text>

      {/* Active cycle quick card */}
      {activeCycle && (
        <TouchableOpacity
          style={styles.activeCycleCard}
          onPress={() => navigation.navigate("CycleTab")}
        >
          <View style={styles.activeCycleDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.activeCycleLabel}>Active Cycle</Text>
            <Text style={styles.activeCycleName}>{activeCycle.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Step indicator */}
      <View style={styles.stepsRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, (step === s || STEPS.indexOf(step) > i) && styles.stepDotActive]}>
              {STEPS.indexOf(step) > i ? (
                <Ionicons name="checkmark" size={12} color={colors.background} />
              ) : (
                <Text style={[styles.stepNum, (step === s) && styles.stepNumActive]}>{i + 1}</Text>
              )}
            </View>
            <Text style={[styles.stepLabel, step === s && styles.stepLabelActive]}>
              {s === "goals" ? "Goals" : s === "level" ? "Level" : "Build"}
            </Text>
          </View>
        ))}
      </View>

      {/* Step 1: Goals */}
      {step === "goals" && (
        <>
          <Text style={styles.sectionTitle}>What are your goals?</Text>
          <Text style={styles.sectionDesc}>Select one or more to get personalized recommendations</Text>
          <View style={styles.goalsGrid}>
            {GOALS.map((g) => {
              const selected = selectedGoals.includes(g.key);
              return (
                <TouchableOpacity
                  key={g.key}
                  style={[styles.goalCard, selected && { borderColor: g.color, backgroundColor: g.color + "15" }]}
                  onPress={() => toggleGoal(g.key)}
                >
                  <Ionicons name={g.icon} size={28} color={selected ? g.color : colors.textSecondary} />
                  <Text style={[styles.goalLabel, selected && { color: g.color }]}>{g.label}</Text>
                  {selected && (
                    <View style={[styles.goalCheck, { backgroundColor: g.color }]}>
                      <Ionicons name="checkmark" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.nextBtn, selectedGoals.length === 0 && styles.nextBtnDisabled]}
            disabled={selectedGoals.length === 0}
            onPress={() => setStep("level")}
          >
            <Text style={styles.nextBtnText}>Next: Experience Level</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.background} />
          </TouchableOpacity>
        </>
      )}

      {/* Step 2: Level */}
      {step === "level" && (
        <>
          <Text style={styles.sectionTitle}>Experience Level</Text>
          <Text style={styles.sectionDesc}>This helps us match the right protocols for you</Text>
          {LEVELS.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={[styles.levelRow, level === l.key && styles.levelRowActive]}
              onPress={() => setLevel(l.key)}
            >
              <View style={[styles.radio, level === l.key && styles.radioActive]}>
                {level === l.key && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.levelLabel, level === l.key && { color: colors.accent }]}>{l.label}</Text>
                <Text style={styles.levelDesc}>{l.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("goals")}>
              <Ionicons name="arrow-back" size={18} color={colors.accent} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, { flex: 1 }]}
              onPress={() => setStep("ready")}
            >
              <Text style={styles.nextBtnText}>See Recommendations</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Step 3: Ready */}
      {step === "ready" && (
        <>
          <Text style={styles.sectionTitle}>You're all set</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Your Goals</Text>
            <View style={styles.summaryChips}>
              {selectedGoals.map((g) => {
                const goal = GOALS.find((go) => go.key === g)!;
                return (
                  <View key={g} style={[styles.summaryChip, { borderColor: goal.color }]}>
                    <Ionicons name={goal.icon} size={14} color={goal.color} />
                    <Text style={[styles.summaryChipText, { color: goal.color }]}>{goal.label}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.summaryLabel, { marginTop: 16 }]}>Level</Text>
            <Text style={styles.summaryValue}>{level.charAt(0).toUpperCase() + level.slice(1)}</Text>
          </View>

          <TouchableOpacity
            style={styles.buildBtn}
            onPress={() => navigation.navigate("ProtocolResult", { goals: selectedGoals, level })}
          >
            <Ionicons name="flash" size={20} color={colors.background} />
            <Text style={styles.buildBtnText}>View Recommended Protocols</Text>
          </TouchableOpacity>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.backBtn} onPress={() => setStep("level")}>
              <Ionicons name="arrow-back" size={18} color={colors.accent} />
              <Text style={styles.backBtnText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setSelectedGoals([]);
                setStep("goals");
              }}
            >
              <Ionicons name="refresh" size={16} color={colors.accent} />
              <Text style={styles.secondaryBtnText}>Start Over</Text>
            </TouchableOpacity>
          </View>

          {/* Quick links */}
          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Or explore on your own</Text>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate("ExploreTab")}
          >
            <Ionicons name="compass-outline" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Explore Peptides</Text>
              <Text style={styles.linkDesc}>Chat with AI or browse the full database</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkRow}
            onPress={() => navigation.navigate("NewCycle")}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.linkTitle}>Build Custom Cycle</Text>
              <Text style={styles.linkDesc}>Skip recommendations and pick your own peptides</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: Platform.OS === "ios" ? 60 : spacing.md },
  welcome: { fontSize: 36, fontWeight: "900", color: colors.accent, marginTop: 8, letterSpacing: -0.5 },
  motto: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 4 },
  tagline: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 24 },
  activeCycleCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.success + "40", marginBottom: 24,
  },
  activeCycleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  activeCycleLabel: { fontSize: 11, color: colors.success, fontWeight: "600", textTransform: "uppercase" },
  activeCycleName: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 2 },
  stepsRow: { flexDirection: "row", justifyContent: "center", gap: 32, marginBottom: 28 },
  stepItem: { alignItems: "center", gap: 6 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  stepDotActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  stepNum: { fontSize: 12, fontWeight: "700", color: colors.textSecondary },
  stepNumActive: { color: colors.background },
  stepLabel: { fontSize: 11, color: colors.textSecondary },
  stepLabelActive: { color: colors.accent, fontWeight: "600" },
  sectionTitle: {
    fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 4,
  },
  sectionDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  goalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  goalCard: {
    width: "47%", backgroundColor: colors.surface, borderRadius: 14,
    padding: 18, alignItems: "center", gap: 8,
    borderWidth: 2, borderColor: colors.border,
  },
  goalLabel: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  goalCheck: {
    position: "absolute", top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center",
  },
  levelRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  levelRowActive: { borderColor: colors.accent },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 2, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  radioActive: { borderColor: colors.accent },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent },
  levelLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  levelDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  nextBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 16,
  },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  btnRow: { flexDirection: "row", gap: 12, marginTop: 16 },
  backBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18, paddingHorizontal: 24,
  },
  backBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  summaryCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 20,
    borderWidth: 1, borderColor: colors.border, marginTop: 12, marginBottom: 8,
  },
  summaryLabel: { fontSize: 11, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  summaryChips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  summaryChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  summaryChipText: { fontSize: 13, fontWeight: "600" },
  summaryValue: { fontSize: 16, fontWeight: "600", color: colors.text },
  buildBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 16,
  },
  buildBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  secondaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 18,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  linkRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  linkTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  linkDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
