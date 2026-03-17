import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { peptides as peptideDB } from "../../data/peptides";
import { generateId } from "../../utils/id";
import { colors, spacing } from "../../theme";
import { Goal } from "../../types";

const GOALS: { key: Goal; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "recovery", label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  { key: "fat_loss", label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  { key: "muscle_gain", label: "Muscle", icon: "barbell-outline", color: "#60a5fa" },
  { key: "anti_aging", label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  { key: "sleep", label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  { key: "cognitive", label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
  { key: "immune", label: "Immune", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  { key: "sexual_health", label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
];

const DIFFICULTIES = [
  { key: "beginner" as const, label: "Beginner", icon: "leaf-outline" as const, color: colors.success },
  { key: "intermediate" as const, label: "Intermediate", icon: "trending-up-outline" as const, color: colors.warning },
  { key: "advanced" as const, label: "Advanced", icon: "rocket-outline" as const, color: colors.error },
];

export default function NewPostScreen({ route, navigation }: any) {
  const { cycles, settings, addCommunityPost } = useApp();
  const { showToast } = useToast();
  const activeCycle = cycles.find((c) => c.isActive);

  const [author, setAuthor] = useState(settings.displayName || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [postPeptides, setPostPeptides] = useState<{ peptideId: string; dose: string; frequency: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleGoal = (key: string) => {
    setSelectedGoals((prev) =>
      prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]
    );
  };

  const addPeptide = (peptideId: string) => {
    if (postPeptides.some((p) => p.peptideId === peptideId)) return;
    const pep = peptideDB.find((p) => p.id === peptideId);
    const proto = pep?.dosingProtocols?.[0];
    setPostPeptides([
      ...postPeptides,
      {
        peptideId,
        dose: proto?.doseRange?.match(/([\d.]+\s*mg)/)?.[1] || "0.25 mg",
        frequency: proto?.frequency || "1x daily",
      },
    ]);
    setShowPicker(false);
    setSearchQuery("");
  };

  const removePeptide = (peptideId: string) => {
    setPostPeptides(postPeptides.filter((p) => p.peptideId !== peptideId));
  };

  const importFromCycle = () => {
    if (!activeCycle) return;
    setTitle(activeCycle.name);
    setPostPeptides(
      activeCycle.peptides.map((cp) => ({
        peptideId: cp.peptideId,
        dose: `${cp.doseAmount} ${cp.doseUnit}`,
        frequency: cp.frequency,
      }))
    );
    showToast("Imported from your active cycle!");
  };

  const publish = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Give your stack a name");
      return;
    }
    if (postPeptides.length === 0) {
      Alert.alert("No peptides", "Add at least one peptide to your post");
      return;
    }

    addCommunityPost({
      id: generateId(),
      author: author.trim() || "Anonymous",
      title: title.trim(),
      description: description.trim(),
      goals: selectedGoals,
      peptides: postPeptides,
      difficulty,
      likes: 0,
      duration: duration.trim() || "8 weeks",
      createdAt: new Date().toISOString(),
      isUserPost: true,
    });

    showToast("Stack posted to the feed!");
    navigation.goBack();
  };

  const filteredPeptides = peptideDB.filter(
    (p) =>
      !postPeptides.some((pp) => pp.peptideId === p.id) &&
      (!searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.abbreviation?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={100}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
      {/* Hero header */}
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Ionicons name="megaphone-outline" size={28} color={colors.accent} />
        </View>
        <Text style={styles.heroTitle}>Share Your Stack</Text>
        <Text style={styles.heroDesc}>Let others know what's working for you</Text>
      </View>

      {/* Import from cycle */}
      {activeCycle && (
        <TouchableOpacity style={styles.importBanner} onPress={importFromCycle}>
          <View style={styles.importIconWrap}>
            <Ionicons name="flash-outline" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.importTitle}>Quick import from your cycle</Text>
            <Text style={styles.importDesc}>{activeCycle.name}</Text>
          </View>
          <View style={styles.importArrow}>
            <Ionicons name="arrow-forward" size={16} color={colors.accent} />
          </View>
        </TouchableOpacity>
      )}

      {/* Section 1: About you */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="person-outline" size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>About You</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.fieldLabel}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={author}
            onChangeText={setAuthor}
            placeholder="Your name or alias"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      </View>

      {/* Section 2: Your Stack */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="layers-outline" size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>Your Stack</Text>
        </View>
        <View style={styles.sectionCard}>
          <Text style={styles.fieldLabel}>Stack Name</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. My Recovery Protocol"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Duration</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g. 8 weeks"
            placeholderTextColor={colors.textSecondary}
          />

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Difficulty</Text>
          <View style={styles.diffRow}>
            {DIFFICULTIES.map((d) => {
              const active = difficulty === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.diffBtn, active && { backgroundColor: d.color + "18", borderColor: d.color + "50" }]}
                  onPress={() => setDifficulty(d.key)}
                >
                  <Ionicons name={d.icon} size={16} color={active ? d.color : colors.textSecondary} />
                  <Text style={[styles.diffBtnText, active && { color: d.color }]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Section 3: Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flag-outline" size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>Goals</Text>
        </View>
        <View style={styles.goalsGrid}>
          {GOALS.map((g) => {
            const active = selectedGoals.includes(g.key);
            return (
              <TouchableOpacity
                key={g.key}
                style={[styles.goalCard, active && { backgroundColor: g.color + "15", borderColor: g.color + "40" }]}
                onPress={() => toggleGoal(g.key)}
              >
                <Ionicons name={g.icon} size={20} color={active ? g.color : colors.textSecondary} />
                <Text style={[styles.goalCardText, active && { color: g.color }]}>{g.label}</Text>
                {active && (
                  <View style={[styles.goalCheck, { backgroundColor: g.color }]}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Section 4: Peptides */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="flask-outline" size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>Peptides</Text>
          <Text style={styles.pepCount}>{postPeptides.length} added</Text>
        </View>

        {postPeptides.map((pp, idx) => {
          const pep = peptideDB.find((p) => p.id === pp.peptideId);
          return (
            <View key={pp.peptideId} style={styles.pepCard}>
              <View style={styles.pepCardLeft}>
                <View style={styles.pepNum}>
                  <Text style={styles.pepNumText}>{idx + 1}</Text>
                </View>
                <Text style={styles.pepName}>{pep?.name || pp.peptideId}</Text>
              </View>
              <TouchableOpacity onPress={() => removePeptide(pp.peptideId)} style={styles.pepRemove}>
                <Ionicons name="close" size={16} color={colors.error} />
              </TouchableOpacity>
              <View style={styles.pepFieldsRow}>
                <View style={styles.pepField}>
                  <Text style={styles.pepFieldLabel}>Dose</Text>
                  <TextInput
                    style={styles.pepFieldInput}
                    value={pp.dose}
                    onChangeText={(v) =>
                      setPostPeptides(postPeptides.map((p) =>
                        p.peptideId === pp.peptideId ? { ...p, dose: v } : p
                      ))
                    }
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.pepField}>
                  <Text style={styles.pepFieldLabel}>Frequency</Text>
                  <TextInput
                    style={styles.pepFieldInput}
                    value={pp.frequency}
                    onChangeText={(v) =>
                      setPostPeptides(postPeptides.map((p) =>
                        p.peptideId === pp.peptideId ? { ...p, frequency: v } : p
                      ))
                    }
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>
            </View>
          );
        })}

        {showPicker ? (
          <View style={styles.pickerCard}>
            <View style={styles.pickerSearch}>
              <Ionicons name="search" size={16} color={colors.textSecondary} />
              <TextInput
                style={styles.pickerSearchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search peptides..."
                placeholderTextColor={colors.textSecondary}
                autoFocus
              />
            </View>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {filteredPeptides.map((p) => (
                <TouchableOpacity key={p.id} style={styles.pickerRow} onPress={() => addPeptide(p.id)}>
                  <View>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    <Text style={styles.pickerCats}>
                      {p.categories.map((c) => c.replace("_", " ")).join(", ")}
                    </Text>
                  </View>
                  <View style={styles.pickerAddIcon}>
                    <Ionicons name="add" size={16} color={colors.accent} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.pickerDone} onPress={() => { setShowPicker(false); setSearchQuery(""); }}>
              <Text style={styles.pickerDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
            <View style={styles.addBtnIcon}>
              <Ionicons name="add" size={20} color={colors.accent} />
            </View>
            <Text style={styles.addBtnText}>Add Peptide</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Section 5: Your Experience */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.accent} />
          <Text style={styles.sectionTitle}>Your Experience</Text>
        </View>
        <View style={styles.sectionCard}>
          <TextInput
            style={[styles.input, styles.experienceInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell people what you noticed, how it worked, tips, results..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
        </View>
      </View>

      {/* Publish button */}
      <TouchableOpacity style={styles.publishBtn} onPress={publish}>
        <Ionicons name="paper-plane-outline" size={20} color={colors.background} />
        <Text style={styles.publishBtnText}>Post to Feed</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },

  // Hero
  hero: { alignItems: "center", paddingVertical: 20, marginBottom: 8 },
  heroIconWrap: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
    marginBottom: 12,
  },
  heroTitle: { fontSize: 22, fontWeight: "800", color: colors.text },
  heroDesc: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  // Import
  importBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "30", marginBottom: 20,
  },
  importIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
  },
  importTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  importDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  importArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
  },

  // Sections
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15, fontWeight: "700", color: colors.text, flex: 1,
  },
  sectionCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },

  // Fields
  fieldLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: colors.background, borderRadius: 10, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  experienceInput: {
    minHeight: 100, textAlignVertical: "top", lineHeight: 22,
  },

  // Goals
  goalsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalCard: {
    width: "47%", flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: colors.border,
  },
  goalCardText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, flex: 1 },
  goalCheck: {
    width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center",
  },

  // Difficulty
  diffRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  diffBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface,
  },
  diffBtnText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },

  // Peptides
  pepCount: { fontSize: 12, color: colors.textSecondary },
  pepCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  pepCardLeft: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  pepNum: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
  },
  pepNumText: { fontSize: 12, fontWeight: "700", color: colors.background },
  pepName: { fontSize: 16, fontWeight: "700", color: colors.accent },
  pepRemove: {
    position: "absolute", top: 12, right: 12,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.error + "15", alignItems: "center", justifyContent: "center",
  },
  pepFieldsRow: { flexDirection: "row", gap: 10 },
  pepField: { flex: 1 },
  pepFieldLabel: { fontSize: 11, fontWeight: "600", color: colors.textSecondary, marginBottom: 4 },
  pepFieldInput: {
    backgroundColor: colors.background, borderRadius: 8, padding: 10,
    fontSize: 13, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },

  // Add peptide
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: colors.accent + "30", borderStyle: "dashed",
  },
  addBtnIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
  },
  addBtnText: { fontSize: 14, fontWeight: "700", color: colors.accent },

  // Picker
  pickerCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
  },
  pickerSearch: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerSearchInput: { flex: 1, fontSize: 14, color: colors.text },
  pickerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerName: { fontSize: 14, fontWeight: "600", color: colors.text },
  pickerCats: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textTransform: "capitalize" },
  pickerAddIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
  },
  pickerDone: {
    alignItems: "center", padding: 14,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  pickerDoneText: { fontSize: 14, fontWeight: "700", color: colors.accent },

  // Publish
  publishBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.accent, borderRadius: 16, padding: 18, marginTop: 8,
    shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  publishBtnText: { fontSize: 17, fontWeight: "800", color: colors.background },
});
