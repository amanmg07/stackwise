import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { peptides as peptideDB } from "../../data/peptides";
import { generateId } from "../../utils/id";
import { colors, spacing } from "../../theme";
import { Goal } from "../../types";

const GOALS: { key: Goal; label: string; color: string }[] = [
  { key: "recovery", label: "Recovery", color: "#4ade80" },
  { key: "fat_loss", label: "Fat Loss", color: "#f87171" },
  { key: "muscle_gain", label: "Muscle", color: "#60a5fa" },
  { key: "anti_aging", label: "Anti-Aging", color: "#c084fc" },
  { key: "sleep", label: "Sleep", color: "#818cf8" },
  { key: "cognitive", label: "Cognitive", color: "#facc15" },
  { key: "immune", label: "Immune", color: "#2dd4bf" },
  { key: "sexual_health", label: "Sexual Health", color: "#f472b6" },
];

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export default function NewPostScreen({ route, navigation }: any) {
  const { cycles, addCommunityPost } = useApp();
  const { showToast } = useToast();
  const activeCycle = cycles.find((c) => c.isActive);

  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>("beginner");
  const [postPeptides, setPostPeptides] = useState<{ peptideId: string; dose: string; frequency: string }[]>([]);
  const [showPicker, setShowPicker] = useState(false);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Import from cycle */}
      {activeCycle && (
        <TouchableOpacity style={styles.importBanner} onPress={importFromCycle}>
          <Ionicons name="download-outline" size={18} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.importTitle}>Import from active cycle</Text>
            <Text style={styles.importDesc}>{activeCycle.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Display Name</Text>
      <TextInput
        style={styles.input}
        value={author}
        onChangeText={setAuthor}
        placeholder="Your name or alias"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Stack Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. My Recovery Protocol"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>What's your experience?</Text>
      <TextInput
        style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Tell people what you noticed, how it worked, tips, results..."
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <Text style={styles.label}>Duration</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        placeholder="e.g. 8 weeks"
        placeholderTextColor={colors.textSecondary}
      />

      {/* Goals */}
      <Text style={styles.label}>Goals</Text>
      <View style={styles.goalRow}>
        {GOALS.map((g) => {
          const active = selectedGoals.includes(g.key);
          return (
            <TouchableOpacity
              key={g.key}
              style={[styles.goalChip, active && { backgroundColor: g.color + "20", borderColor: g.color + "50" }]}
              onPress={() => toggleGoal(g.key)}
            >
              <Text style={[styles.goalChipText, active && { color: g.color }]}>{g.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Difficulty */}
      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.diffRow}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.diffBtn, difficulty === d && styles.diffBtnActive]}
            onPress={() => setDifficulty(d)}
          >
            <Text style={[styles.diffBtnText, difficulty === d && styles.diffBtnTextActive]}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Peptides */}
      <Text style={styles.label}>Peptides</Text>
      {postPeptides.map((pp) => {
        const pep = peptideDB.find((p) => p.id === pp.peptideId);
        return (
          <View key={pp.peptideId} style={styles.pepCard}>
            <View style={styles.pepHeader}>
              <Text style={styles.pepName}>{pep?.name || pp.peptideId}</Text>
              <TouchableOpacity onPress={() => removePeptide(pp.peptideId)}>
                <Ionicons name="close-circle" size={20} color={colors.error} />
              </TouchableOpacity>
            </View>
            <View style={styles.pepFields}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Dose</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={pp.dose}
                  onChangeText={(v) =>
                    setPostPeptides(postPeptides.map((p) =>
                      p.peptideId === pp.peptideId ? { ...p, dose: v } : p
                    ))
                  }
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Frequency</Text>
                <TextInput
                  style={styles.fieldInput}
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
          <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
            {peptideDB
              .filter((p) => !postPeptides.some((pp) => pp.peptideId === p.id))
              .map((p) => (
                <TouchableOpacity key={p.id} style={styles.pickerRow} onPress={() => addPeptide(p.id)}>
                  <Text style={styles.pickerName}>{p.name}</Text>
                  <Ionicons name="add" size={18} color={colors.accent} />
                </TouchableOpacity>
              ))}
          </ScrollView>
          <TouchableOpacity onPress={() => setShowPicker(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={styles.addBtnText}>Add Peptide</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.publishBtn} onPress={publish}>
        <Ionicons name="paper-plane-outline" size={18} color={colors.background} />
        <Text style={styles.publishBtnText}>Post to Feed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  importBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.accent + "10", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.accent + "25", marginBottom: 16,
  },
  importTitle: { fontSize: 14, fontWeight: "600", color: colors.accent },
  importDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  goalRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goalChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  goalChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  diffRow: { flexDirection: "row", gap: 8 },
  diffBtn: {
    flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  diffBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  diffBtnText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  diffBtnTextActive: { color: colors.background },
  pepCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  pepHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  pepName: { fontSize: 15, fontWeight: "700", color: colors.accent },
  pepFields: { flexDirection: "row", gap: 10 },
  fieldLabel: { fontSize: 11, color: colors.textSecondary, marginBottom: 4 },
  fieldInput: {
    backgroundColor: colors.background, borderRadius: 8, padding: 10,
    fontSize: 13, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    borderRadius: 12, padding: 14, marginTop: 8,
  },
  addBtnText: { fontSize: 14, fontWeight: "600", color: colors.accent },
  pickerCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginTop: 8,
  },
  pickerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerName: { fontSize: 14, color: colors.text },
  cancelText: { fontSize: 14, color: colors.error, textAlign: "center", marginTop: 12 },
  publishBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 24,
  },
  publishBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
