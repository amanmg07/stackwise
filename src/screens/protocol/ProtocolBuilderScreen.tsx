import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

export default function ProtocolBuilderScreen({ navigation }: any) {
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Build Your Protocol</Text>
      <Text style={styles.subtitle}>Select your goals and experience level</Text>

      <Text style={styles.sectionTitle}>What are your goals?</Text>
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

      <Text style={styles.sectionTitle}>Experience Level</Text>
      {LEVELS.map((l) => (
        <TouchableOpacity
          key={l.key}
          style={[styles.levelRow, level === l.key && styles.levelRowActive]}
          onPress={() => setLevel(l.key)}
        >
          <View style={[styles.radio, level === l.key && styles.radioActive]} />
          <View>
            <Text style={[styles.levelLabel, level === l.key && { color: colors.accent }]}>{l.label}</Text>
            <Text style={styles.levelDesc}>{l.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.buildBtn, selectedGoals.length === 0 && styles.buildBtnDisabled]}
        disabled={selectedGoals.length === 0}
        onPress={() => navigation.navigate("ProtocolResult", { goals: selectedGoals, level })}
      >
        <Ionicons name="flash" size={20} color={colors.background} />
        <Text style={styles.buildBtnText}>Build Protocol</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
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
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
  },
  radioActive: { borderColor: colors.accent, backgroundColor: colors.accent },
  levelLabel: { fontSize: 15, fontWeight: "600", color: colors.text },
  levelDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  buildBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 32,
  },
  buildBtnDisabled: { opacity: 0.4 },
  buildBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
