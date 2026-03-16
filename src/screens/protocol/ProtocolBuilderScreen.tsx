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
  { key: "immune", label: "Immune Health", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  { key: "sexual_health", label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
];

export default function ProtocolBuilderScreen({ navigation }: any) {
  const { cycles } = useApp();
  const activeCycle = cycles.find((c) => c.isActive);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Welcome header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.welcome}>StackWise</Text>
          <Text style={styles.motto}>Stop Guessing, Start StackWising.</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={32} color={colors.accent} />
        </TouchableOpacity>
      </View>
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

      {/* Goals */}
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
        style={[styles.buildBtn, selectedGoals.length === 0 && styles.buildBtnDisabled]}
        disabled={selectedGoals.length === 0}
        onPress={() => navigation.navigate("ProtocolResult", { goals: selectedGoals })}
      >
        <Ionicons name="flash" size={20} color={colors.background} />
        <Text style={styles.buildBtnText}>View Recommended Protocols</Text>
      </TouchableOpacity>

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
      <TouchableOpacity
        style={styles.linkRow}
        onPress={() => navigation.navigate("ReconCalculator")}
      >
        <Ionicons name="calculator-outline" size={20} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.linkTitle}>Dosing Calculator</Text>
          <Text style={styles.linkDesc}>Calculate exactly how much to draw on your syringe</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: Platform.OS === "ios" ? 60 : spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8 },
  profileBtn: { padding: 4 },
  welcome: { fontSize: 36, fontWeight: "900", color: colors.accent, letterSpacing: -0.5 },
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
  buildBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
  },
  buildBtnDisabled: { opacity: 0.4 },
  buildBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  linkRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  linkTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  linkDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
