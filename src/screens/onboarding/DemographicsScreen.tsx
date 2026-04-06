import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, safeTop } from "../../theme";
import { Gender, ExperienceLevel, Goal } from "../../types";

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const GOAL_OPTIONS: { value: Goal; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "recovery", label: "Recovery", icon: "bandage-outline" },
  { value: "fat_loss", label: "Fat Loss", icon: "flame-outline" },
  { value: "muscle_gain", label: "Muscle Gain", icon: "barbell-outline" },
  { value: "anti_aging", label: "Anti-Aging", icon: "sparkles-outline" },
  { value: "sleep", label: "Sleep", icon: "moon-outline" },
  { value: "cognitive", label: "Cognitive", icon: "bulb-outline" },
  { value: "immune", label: "Immune", icon: "shield-checkmark-outline" },
  { value: "sexual_health", label: "Sexual Health", icon: "heart-outline" },
  { value: "hormone", label: "Hormone", icon: "pulse-outline" },
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; desc: string }[] = [
  { value: "new", label: "New", desc: "Haven't used peptides before" },
  { value: "some", label: "Some Experience", desc: "Tried a few peptides" },
  { value: "experienced", label: "Experienced", desc: "Regular peptide user" },
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
      <Text style={styles.title}>About You</Text>
      <Text style={styles.subtitle}>
        This helps us personalize your experience and improve peptide research for everyone.
      </Text>

      {/* Age */}
      <Text style={styles.sectionLabel}>Age</Text>
      <TextInput
        style={styles.ageInput}
        value={age}
        onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ""))}
        keyboardType="number-pad"
        maxLength={3}
        placeholder="Enter your age"
        placeholderTextColor={colors.textSecondary}
      />

      {/* Gender */}
      <Text style={styles.sectionLabel}>Gender</Text>
      <View style={styles.chipRow}>
        {GENDER_OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.value}
            style={[styles.chip, gender === o.value && styles.chipSelected]}
            onPress={() => setGender(o.value)}
          >
            <Text style={[styles.chipText, gender === o.value && styles.chipTextSelected]}>{o.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Goals */}
      <Text style={styles.sectionLabel}>Primary Goals</Text>
      <Text style={styles.sectionHint}>Select all that apply</Text>
      <View style={styles.chipRow}>
        {GOAL_OPTIONS.map((o) => {
          const selected = goals.has(o.value);
          return (
            <TouchableOpacity
              key={o.value}
              style={[styles.goalChip, selected && styles.chipSelected]}
              onPress={() => toggleGoal(o.value)}
            >
              <Ionicons name={o.icon} size={16} color={selected ? colors.background : colors.textSecondary} />
              <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Experience */}
      <Text style={styles.sectionLabel}>Peptide Experience</Text>
      {EXPERIENCE_OPTIONS.map((o) => (
        <TouchableOpacity
          key={o.value}
          style={[styles.expOption, experience === o.value && styles.expOptionSelected]}
          onPress={() => setExperience(o.value)}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.expLabel, experience === o.value && styles.chipTextSelected]}>{o.label}</Text>
            <Text style={styles.expDesc}>{o.desc}</Text>
          </View>
          {experience === o.value && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
        </TouchableOpacity>
      ))}

      {/* Analytics consent */}
      <View style={styles.consentRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.consentTitle}>Help Improve Peptide Research</Text>
          <Text style={styles.consentDesc}>
            Share anonymized usage data (age group, peptides used, outcomes) to help advance peptide research. No personal information is ever shared.
          </Text>
        </View>
        <Switch
          value={analyticsConsent}
          onValueChange={setAnalyticsConsent}
          trackColor={{ false: colors.border, true: colors.accent + "60" }}
          thumbColor={analyticsConsent ? colors.accent : colors.textSecondary}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  content: { paddingHorizontal: spacing.xl, paddingBottom: Platform.OS === "ios" ? 50 : 30 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.xl },
  sectionLabel: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  ageInput: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  sectionHint: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  goalChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 14, fontWeight: "600", color: colors.text },
  chipTextSelected: { color: colors.background },
  expOption: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  expOptionSelected: { borderColor: colors.accent, backgroundColor: colors.accent + "12" },
  expLabel: { fontSize: 15, fontWeight: "700", color: colors.text },
  expDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  consentRow: {
    flexDirection: "row", alignItems: "center", gap: 16,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginTop: spacing.xl,
  },
  consentTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
  consentDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
    marginTop: spacing.xl, width: "100%",
  },
  btnDisabled: { opacity: 0.4 },
  btnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
