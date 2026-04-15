import React, { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { syncUserProfile } from "../../services/analyticsService";
import { colors, spacing, safeTop } from "../../theme";
import { Gender, ExperienceLevel, Goal } from "../../types";

const GENDER_OPTIONS: { value: Gender; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { value: "male", label: "Male", icon: "male", color: "#60a5fa" },
  { value: "female", label: "Female", icon: "female", color: "#f472b6" },
  { value: "other", label: "Other", icon: "person", color: "#c084fc" },
];

const GOAL_OPTIONS: { value: Goal; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { value: "recovery", label: "Recovery", icon: "bandage", color: "#4ade80" },
  { value: "fat_loss", label: "Fat Loss", icon: "flame", color: "#f87171" },
  { value: "muscle_gain", label: "Muscle", icon: "barbell", color: "#60a5fa" },
  { value: "anti_aging", label: "Anti-Aging", icon: "sparkles", color: "#c084fc" },
  { value: "sleep", label: "Sleep", icon: "moon", color: "#818cf8" },
  { value: "cognitive", label: "Cognitive", icon: "bulb", color: "#facc15" },
  { value: "immune", label: "Immune", icon: "shield-checkmark", color: "#2dd4bf" },
  { value: "sexual_health", label: "Sexual Health", icon: "heart", color: "#f472b6" },
  { value: "hormone", label: "Hormonal", icon: "pulse", color: "#fb923c" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { value: "new", label: "Beginner", desc: "Haven't used peptides", icon: "leaf", color: "#4ade80" },
  { value: "some", label: "Intermediate", desc: "Tried a few peptides", icon: "trending-up", color: "#facc15" },
  { value: "experienced", label: "Advanced", desc: "Regular peptide user", icon: "trophy", color: "#f87171" },
];

export default function EditDemographicsScreen({ navigation }: any) {
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();

  const [age, setAge] = useState(settings.age?.toString() || "");
  const [gender, setGender] = useState<Gender | undefined>(settings.gender);
  const [goals, setGoals] = useState<Set<Goal>>(new Set(settings.goals || []));
  const [experience, setExperience] = useState<ExperienceLevel | undefined>(settings.experienceLevel);
  const [analyticsConsent, setAnalyticsConsent] = useState(settings.analyticsConsent ?? true);
  const savedRef = useRef(false);

  const toggleGoal = (g: Goal) => {
    setGoals((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const saveOnExit = useCallback(async () => {
    if (savedRef.current) return;
    savedRef.current = true;

    const parsedAge = parseInt(age, 10);
    const validAge = !isNaN(parsedAge) && parsedAge >= 16 && parsedAge <= 100;
    if (!validAge || !gender || goals.size === 0) return;

    updateSettings({
      age: parsedAge,
      gender,
      goals: [...goals],
      experienceLevel: experience,
      analyticsConsent,
    });
    showToast("Profile saved");

    if (analyticsConsent) {
      const synced = await syncUserProfile({
        age: parsedAge,
        gender,
        goals: [...goals],
        experienceLevel: experience,
      });
      if (!synced) {
        showToast("Profile saved locally. Sync will retry next time.");
      }
    }
  }, [age, gender, goals, experience, analyticsConsent]);

  useFocusEffect(
    useCallback(() => {
      savedRef.current = false;
      return () => { saveOnExit(); };
    }, [saveOnExit])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Basics */}
      <Text style={styles.sectionLabel}>Basics</Text>
      <View style={styles.basicsRow}>
        <View style={styles.ageWrap}>
          <Ionicons name="calendar-outline" size={18} color={colors.accent} style={styles.inputIcon} />
          <TextInput
            style={styles.ageInput}
            value={age}
            onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
            keyboardType="number-pad"
            maxLength={3}
            placeholder="Age"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((o) => {
            const selected = gender === o.value;
            return (
              <TouchableOpacity
                key={o.value}
                style={[styles.genderChip, selected && { backgroundColor: o.color + "20", borderColor: o.color }]}
                onPress={() => setGender(o.value)}
              >
                <Ionicons name={o.icon} size={20} color={selected ? o.color : colors.textSecondary} />
                <Text style={[styles.genderText, selected && { color: o.color }]}>{o.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Goals */}
      <Text style={styles.sectionLabel}>What are your goals?</Text>
      <View style={styles.goalGrid}>
        {GOAL_OPTIONS.map((o) => {
          const selected = goals.has(o.value);
          return (
            <TouchableOpacity
              key={o.value}
              style={[styles.goalCard, selected && { backgroundColor: o.color + "18", borderColor: o.color }]}
              onPress={() => toggleGoal(o.value)}
            >
              <View style={[styles.goalIconCircle, { backgroundColor: (selected ? o.color : colors.textSecondary) + "15" }]}>
                <Ionicons name={o.icon} size={20} color={selected ? o.color : colors.textSecondary} />
              </View>
              <Text style={[styles.goalLabel, selected && { color: o.color }]}>{o.label}</Text>
              {selected && (
                <View style={[styles.goalCheck, { backgroundColor: o.color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Experience */}
      <Text style={styles.sectionLabel}>Experience Level</Text>
      <View style={styles.expRow}>
        {EXPERIENCE_OPTIONS.map((o) => {
          const selected = experience === o.value;
          return (
            <TouchableOpacity
              key={o.value}
              style={[styles.expCard, selected && { backgroundColor: o.color + "15", borderColor: o.color }]}
              onPress={() => setExperience(o.value)}
            >
              <Ionicons name={o.icon} size={22} color={selected ? o.color : colors.textSecondary} />
              <Text style={[styles.expLabel, selected && { color: o.color }]}>{o.label}</Text>
              <Text style={styles.expDesc}>{o.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Analytics consent */}
      <View style={styles.consentRow}>
        <View style={[styles.consentIcon, { backgroundColor: colors.success + "15" }]}>
          <Ionicons name="analytics" size={20} color={colors.success} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.consentTitle}>Help Peptide Research</Text>
          <Text style={styles.consentDesc}>
            Share anonymous usage data to advance peptide science. No personal info is ever shared.
          </Text>
        </View>
        <Switch
          value={analyticsConsent}
          onValueChange={setAnalyticsConsent}
          trackColor={{ false: colors.border, true: colors.success + "60" }}
          thumbColor={analyticsConsent ? colors.success : colors.textSecondary}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === "ios" ? 50 : 30 },
  sectionLabel: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  basicsRow: { gap: 12 },
  ageWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  ageInput: { flex: 1, fontSize: 16, color: colors.text, paddingVertical: 14 },
  genderRow: { flexDirection: "row", gap: 8 },
  genderChip: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
  },
  genderText: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
  goalGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  goalCard: {
    width: "48%", alignItems: "center", paddingVertical: 16, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, position: "relative",
  },
  goalIconCircle: {
    width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8,
  },
  goalLabel: { fontSize: 11, fontWeight: "700", color: colors.textSecondary, textAlign: "center" },
  goalCheck: {
    position: "absolute", top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center",
  },
  expRow: { flexDirection: "row", gap: 8 },
  expCard: {
    flex: 1, alignItems: "center", paddingVertical: 18, paddingHorizontal: 8, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
  },
  expLabel: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginTop: 8 },
  expDesc: { fontSize: 10, color: colors.textSecondary, textAlign: "center", marginTop: 4, lineHeight: 14 },
  consentRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginTop: spacing.xl,
  },
  consentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  consentTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 2 },
  consentDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16 },
});
