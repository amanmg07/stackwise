import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { value: "new", label: "Beginner", desc: "Haven't used peptides", icon: "leaf", color: "#4ade80" },
  { value: "some", label: "Intermediate", desc: "Tried a few peptides", icon: "trending-up", color: "#facc15" },
  { value: "experienced", label: "Advanced", desc: "Regular peptide user", icon: "trophy", color: "#f87171" },
];

interface Props {
  onComplete: (data: {
    age: number;
    gender: Gender;
    goals: Goal[];
    experienceLevel?: ExperienceLevel;
    analyticsConsent: boolean;
  }) => void;
}

export default function DemographicsScreen({ onComplete }: Props) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | undefined>();
  const [goals, setGoals] = useState<Set<Goal>>(new Set());
  const [experience, setExperience] = useState<ExperienceLevel | undefined>();
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  const toggleGoal = (g: Goal) => {
    setGoals((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  };

  const parsedAge = parseInt(age, 10);
  const validAge = !isNaN(parsedAge) && parsedAge >= 16 && parsedAge <= 100;
  const canContinue = validAge && gender && goals.size > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerIcon}>
        <Ionicons name="person-circle" size={48} color={colors.accent} />
      </View>
      <Text style={styles.title}>About You</Text>
      <Text style={styles.subtitle}>
        Help us personalize your experience and contribute to peptide research.
      </Text>

      {/* Age + Gender row */}
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

      {/* Continue */}
      <TouchableOpacity
        style={[styles.btn, !canContinue && styles.btnDisabled]}
        onPress={() => {
          if (!canContinue) return;
          onComplete({
            age: parsedAge,
            gender: gender!,
            goals: [...goals],
            experienceLevel: experience,
            analyticsConsent,
          });
        }}
      >
        <Text style={styles.btnText}>Continue</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.background} />
      </TouchableOpacity>

      {!canContinue && (
        <Text style={styles.hint}>
          {!validAge ? "Enter your age" : !gender ? "Select your gender" : "Pick at least one goal"}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  content: { paddingHorizontal: spacing.lg, paddingBottom: Platform.OS === "ios" ? 50 : 30 },
  headerIcon: { alignSelf: "center", marginBottom: 12, marginTop: 8 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, textAlign: "center", marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, textAlign: "center", marginBottom: spacing.lg, paddingHorizontal: 10 },
  sectionLabel: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  // Basics: age + gender
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
  // Goals grid
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
  // Experience
  expRow: { flexDirection: "row", gap: 8 },
  expCard: {
    flex: 1, alignItems: "center", paddingVertical: 18, paddingHorizontal: 8, borderRadius: 14,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
  },
  expLabel: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, marginTop: 8 },
  expDesc: { fontSize: 10, color: colors.textSecondary, textAlign: "center", marginTop: 4, lineHeight: 14 },
  // Consent
  consentRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginTop: spacing.xl,
  },
  consentIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  consentTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 2 },
  consentDesc: { fontSize: 11, color: colors.textSecondary, lineHeight: 16 },
  // Button
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
    marginTop: spacing.xl, width: "100%",
  },
  btnDisabled: { opacity: 0.35 },
  btnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  hint: { fontSize: 13, color: colors.textSecondary, textAlign: "center", marginTop: 12 },
});
