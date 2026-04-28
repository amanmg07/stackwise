import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing, safeBottom } from "../../theme";
import { getCurrentPlan, PLAN_CONFIG } from "../../services/planService";
import { PlanId } from "../../types";

const GOAL_DISPLAY: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  recovery: { label: "Recovery", icon: "bandage", color: "#4ade80" },
  fat_loss: { label: "Fat Loss", icon: "flame", color: "#f87171" },
  muscle_gain: { label: "Muscle", icon: "barbell", color: "#60a5fa" },
  anti_aging: { label: "Anti-Aging", icon: "sparkles", color: "#c084fc" },
  sleep: { label: "Sleep", icon: "moon", color: "#818cf8" },
  cognitive: { label: "Cognitive", icon: "bulb", color: "#facc15" },
  immune: { label: "Immune", icon: "shield-checkmark", color: "#2dd4bf" },
  sexual_health: { label: "Sexual Health", icon: "heart", color: "#f472b6" },
  hormone: { label: "Hormone", icon: "pulse", color: "#fb923c" },
};

const GENDER_DISPLAY: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  male: { label: "Male", icon: "male", color: "#60a5fa" },
  female: { label: "Female", icon: "female", color: "#f472b6" },
  other: { label: "Other", icon: "person", color: "#c084fc" },
};

const EXP_DISPLAY: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  new: { label: "Beginner", icon: "leaf", color: "#4ade80" },
  some: { label: "Intermediate", icon: "trending-up", color: "#facc15" },
  experienced: { label: "Advanced", icon: "trophy", color: "#f87171" },
};

const PLAN_COLORS: Record<PlanId, string> = {
  basic: colors.textSecondary,
  pro: "#60a5fa",
  elite: "#c084fc",
};

export default function ProfileScreen({ navigation }: any) {
  const { cycles, doseLogs, journal, settings, updateSettings, clearAllData, userId } = useApp();
  const [plan, setPlan] = useState<PlanId>("basic");

  useEffect(() => {
    getCurrentPlan().then(setPlan);
  }, []);

  const completedCycles = cycles.filter((c) => !c.isActive).length;
  const activeCycles = cycles.filter((c) => c.isActive).length;
  const totalDoses = doseLogs.length;
  const totalEntries = journal.length;

  const genderInfo = settings.gender ? GENDER_DISPLAY[settings.gender] : null;
  const expInfo = settings.experienceLevel ? EXP_DISPLAY[settings.experienceLevel] : null;

  const confirmClear = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all cycles, dose logs, and journal entries. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Everything", style: "destructive", onPress: clearAllData },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      {/* Profile Header — demographics */}
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => navigation.navigate("EditDemographics")}
        >
          <Ionicons name="create-outline" size={16} color={colors.accent} />
          <Text style={styles.editProfileText}>Edit</Text>
        </TouchableOpacity>
        <View style={styles.avatarCircle}>
          <Ionicons name="person" size={36} color={colors.accent} />
        </View>
        <View style={styles.demoBadges}>
          {settings.age && (
            <View style={styles.demoBadge}>
              <Ionicons name="calendar" size={14} color={colors.accent} />
              <Text style={styles.demoBadgeText}>{settings.age} years old</Text>
            </View>
          )}
          {genderInfo && (
            <View style={[styles.demoBadge, { borderColor: genderInfo.color + "40" }]}>
              <Ionicons name={genderInfo.icon} size={14} color={genderInfo.color} />
              <Text style={[styles.demoBadgeText, { color: genderInfo.color }]}>{genderInfo.label}</Text>
            </View>
          )}
          {expInfo && (
            <View style={[styles.demoBadge, { borderColor: expInfo.color + "40" }]}>
              <Ionicons name={expInfo.icon} size={14} color={expInfo.color} />
              <Text style={[styles.demoBadgeText, { color: expInfo.color }]}>{expInfo.label}</Text>
            </View>
          )}
        </View>
        {settings.goals && settings.goals.length > 0 && (
          <View style={styles.goalChips}>
            {settings.goals.map((g) => {
              const info = GOAL_DISPLAY[g];
              if (!info) return null;
              return (
                <View key={g} style={[styles.goalChip, { backgroundColor: info.color + "15", borderColor: info.color + "30" }]}>
                  <Ionicons name={info.icon} size={14} color={info.color} />
                  <Text style={[styles.goalChipText, { color: info.color }]}>{info.label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Plan card */}
      <TouchableOpacity
        style={[styles.planCard, { borderColor: PLAN_COLORS[plan] + "40" }]}
        onPress={() => navigation.navigate("Subscription")}
        activeOpacity={0.7}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.planLabel}>Your Plan</Text>
          <Text style={[styles.planName, { color: PLAN_COLORS[plan] }]}>
            {PLAN_CONFIG[plan].name} {plan !== "basic" && `— ${PLAN_CONFIG[plan].price}`}
          </Text>
        </View>
        <View style={[styles.planBadge, { backgroundColor: PLAN_COLORS[plan] + "20" }]}>
          <Text style={[styles.planBadgeText, { color: PLAN_COLORS[plan] }]}>
            {plan === "basic" ? "Upgrade" : "Manage"}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={PLAN_COLORS[plan]} />
        </View>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{activeCycles}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{completedCycles}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>Done</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalDoses}</Text>
          <Text style={styles.statLabel}>Doses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() =>
          updateSettings({ weightUnit: settings.weightUnit === "lbs" ? "kg" : "lbs" })
        }
      >
        <View style={styles.settingLeft}>
          <Ionicons name="scale-outline" size={20} color={colors.text} />
          <Text style={styles.settingLabel}>Weight Unit</Text>
        </View>
        <Text style={styles.settingValue}>{settings.weightUnit}</Text>
      </TouchableOpacity>

      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <Text style={styles.settingLabel}>Reminders</Text>
        </View>
        <Text style={styles.comingSoon}>Coming Soon</Text>
      </View>

      {/* Saved Peptides */}
      <Text style={styles.sectionTitle}>Saved for Later</Text>
      {(!settings.savedPeptides || settings.savedPeptides.length === 0) ? (
        <Text style={styles.emptyText}>No saved peptides — tap the bookmark on any peptide to save it</Text>
      ) : (
        settings.savedPeptides.map((id) => {
          const pep = peptideDB.find((p) => p.id === id);
          if (!pep) return null;
          return (
            <TouchableOpacity
              key={id}
              style={styles.savedRow}
              onPress={() => navigation.navigate("ExploreTab", {
                screen: "PeptideDetail",
                params: { peptideId: id },
              })}
            >
              <View style={styles.savedInfo}>
                <Text style={styles.savedName}>{pep.name}</Text>
                <Text style={styles.savedCats} numberOfLines={1}>
                  {pep.categories.map((c) => c.replace("_", " ")).join(", ")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Cycle History</Text>

      {cycles.length === 0 ? (
        <Text style={styles.emptyText}>No cycles yet</Text>
      ) : (
        cycles.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.cycleRow}
            onPress={() => navigation.navigate("CycleTab", {
              screen: c.isActive ? "CycleTracker" : "CycleDetail",
              params: c.isActive ? undefined : { cycleId: c.id },
            })}
            activeOpacity={0.7}
          >
            <View style={styles.cycleInfo}>
              <Text style={styles.cycleName}>{c.name}</Text>
              <Text style={styles.cycleDates}>
                {c.startDate} → {c.endDate}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.statusBadge, { backgroundColor: c.isActive ? colors.success + "20" : colors.border }]}>
                <Text style={[styles.statusText, { color: c.isActive ? colors.success : colors.textSecondary }]}>
                  {c.isActive ? "Active" : "Done"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.sectionTitle}>Data</Text>

      <TouchableOpacity style={styles.dangerRow} onPress={confirmClear}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
        <Text style={styles.dangerText}>Clear All Data</Text>
      </TouchableOpacity>

      <Text style={styles.version}>StackWise v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  // Plan card
  planCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, marginBottom: 16,
  },
  planLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5 },
  planName: { fontSize: 18, fontWeight: "700", marginTop: 2 },
  planBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  planBadgeText: { fontSize: 13, fontWeight: "700" },
  // Profile header
  profileHeader: { alignItems: "center", paddingVertical: 20, marginBottom: 8, position: "relative" },
  editProfileBtn: {
    position: "absolute", top: 20, right: 0, flexDirection: "row", alignItems: "center", gap: 4,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8,
    backgroundColor: colors.accent + "15", borderWidth: 1, borderColor: colors.accent + "30",
    zIndex: 1,
  },
  editProfileText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.accent + "12", borderWidth: 2, borderColor: colors.accent + "30",
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  demoBadges: { flexDirection: "row", gap: 8, marginBottom: 12, width: "100%" },
  demoBadge: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  demoBadgeText: { fontSize: 12, fontWeight: "600", color: colors.text },
  goalChips: { flexDirection: "row", flexWrap: "wrap", gap: 8, width: "100%" },
  goalChip: {
    width: "48%", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5,
    paddingVertical: 8, borderRadius: 10,
    borderWidth: 1,
  },
  goalChipText: { fontSize: 12, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.accent },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  settingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontSize: 15, color: colors.text },
  settingValue: { fontSize: 15, fontWeight: "600", color: colors.accent },
  comingSoon: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
  cycleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  cycleInfo: { flex: 1 },
  cycleName: { fontSize: 15, fontWeight: "600", color: colors.text },
  cycleDates: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  savedRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  savedInfo: { flex: 1 },
  savedName: { fontSize: 15, fontWeight: "600", color: colors.text },
  savedCats: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textTransform: "capitalize" },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  dangerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.error + "30",
  },
  dangerText: { fontSize: 15, color: colors.error },
  version: { fontSize: 12, color: colors.textSecondary, textAlign: "center", marginTop: 32 },
});
