// ────────────────────────────────────────────────────────────────────
// ProtocolPickerScreen — the "Build a new cycle" flow.
//
// Used to be the body of ProtocolBuilderScreen (the old home tab). The
// home tab is now the "Today" surface (ticket 1.1); this screen is
// reached from the Home "Build a new cycle" CTA. It carries the
// goals + routes + "View Recommended Cycles" pipeline that feeds into
// ProtocolResult.
//
// Goals + preferred routes are stored on UserSettings, so editing
// them here is the same as editing them on the Profile screen.
// ────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { colors, spacing, safeBottom } from "../../theme";
import { AdministrationRoute } from "../../types";
import GlassCard from "../../components/GlassCard";

const ROUTES: { key: AdministrationRoute; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "subcutaneous", label: "SubQ Injection", icon: "medkit-outline", color: "#4ade80" },
  { key: "intramuscular", label: "IM Injection", icon: "fitness-outline", color: "#60a5fa" },
  { key: "oral", label: "Oral", icon: "nutrition-outline", color: "#facc15" },
  { key: "nasal", label: "Nasal", icon: "water-outline", color: "#c084fc" },
  { key: "topical", label: "Topical", icon: "hand-left-outline", color: "#f472b6" },
];

const GOAL_DISPLAY: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  recovery: { label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  fat_loss: { label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  muscle_gain: { label: "Muscle Gain", icon: "barbell-outline", color: "#60a5fa" },
  anti_aging: { label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  sleep: { label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  cognitive: { label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
  immune: { label: "Immune Health", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  sexual_health: { label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
};

export default function ProtocolPickerScreen({ navigation }: any) {
  const { settings, updateSettings } = useApp();
  const userGoals = settings.goals || [];
  const selectedRoutes = settings.preferredRoutes ?? [];

  const toggleRoute = (route: AdministrationRoute) => {
    const updated = selectedRoutes.includes(route)
      ? selectedRoutes.filter((r) => r !== route)
      : [...selectedRoutes, route];
    updateSettings({ preferredRoutes: updated });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      <Text style={styles.intro}>
        Cycles get recommended from your goals + how you'd prefer to take them.
        Edit either below.
      </Text>

      <TouchableOpacity onPress={() => navigation.navigate("EditDemographics")} activeOpacity={0.7}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <View style={styles.editHint}>
            <Ionicons name="create-outline" size={14} color={colors.accent} />
            <Text style={styles.editHintText}>Edit</Text>
          </View>
        </View>
        {userGoals.length > 0 ? (
          <View style={styles.goalsGrid}>
            {userGoals.map((g) => {
              const info = GOAL_DISPLAY[g];
              if (!info) return null;
              return (
                <GlassCard key={g} style={[styles.goalCard, Platform.OS === "ios" ? { borderColor: info.color } : {}]}>
                  <Ionicons name={info.icon} size={28} color={info.color} />
                  <Text style={[styles.goalLabel, { color: info.color }]}>{info.label}</Text>
                </GlassCard>
              );
            })}
          </View>
        ) : (
          <View style={styles.setGoalsBtn}>
            <Ionicons name="add-circle-outline" size={16} color={colors.accent} />
            <Text style={styles.setGoalsBtnText}>Tap to set your goals</Text>
          </View>
        )}
      </TouchableOpacity>

      {userGoals.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Preferred administration</Text>
          <View style={styles.routeGrid}>
            {ROUTES.map((r, i) => {
              const selected = selectedRoutes.includes(r.key);
              const isInjection = i < 2;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={isInjection ? styles.routeWrapLarge : styles.routeWrapSmall}
                  onPress={() => toggleRoute(r.key)}
                  activeOpacity={0.7}
                >
                  <GlassCard
                    style={[
                      styles.routeChip,
                      selected ? { borderColor: r.color, borderWidth: 1.5 } : styles.routeChipInactive,
                    ]}
                  >
                    <Ionicons name={r.icon} size={isInjection ? 24 : 20} color={selected ? r.color : colors.textSecondary} />
                    <Text style={[styles.routeLabel, selected ? { color: r.color } : styles.routeLabelInactive]}>{r.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.buildBtn, (userGoals.length === 0 || selectedRoutes.length === 0) && styles.buildBtnDisabled]}
        disabled={userGoals.length === 0 || selectedRoutes.length === 0}
        onPress={() => navigation.navigate("ProtocolResult", { goals: userGoals, routes: selectedRoutes })}
      >
        <Ionicons name="flash" size={20} color={colors.background} />
        <Text style={styles.buildBtnText}>View Recommended Cycles</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  intro: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 4, marginBottom: spacing.lg },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  editHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  editHintText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  sectionTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  goalsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 24 },
  goalCard: { width: "48.5%", borderRadius: 14, padding: 18, alignItems: "center", gap: 8 },
  goalLabel: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  setGoalsBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "30", marginBottom: 24,
  },
  setGoalsBtnText: { fontSize: 14, fontWeight: "600", color: colors.accent },
  routeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 24 },
  routeWrapLarge: { width: "48.5%" },
  routeWrapSmall: { width: "32%" },
  routeChip: { alignItems: "center", gap: 6, paddingVertical: 16, borderRadius: 14, position: "relative" },
  routeLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  routeChipInactive: {},
  routeLabelInactive: { color: colors.textSecondary },
  buildBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
  },
  buildBtnDisabled: { opacity: 0.4 },
  buildBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
