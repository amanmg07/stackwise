import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generateId } from "../../utils/id";
import { format, addWeeks } from "date-fns";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { protocolTemplates } from "../../data/protocolTemplates";
import { colors, spacing } from "../../theme";
import { CyclePeptide, AdministrationRoute } from "../../types";

export default function NewCycleScreen({ route, navigation }: any) {
  const { addCycle } = useApp();
  const templateId = route.params?.templateId;
  const template = templateId ? protocolTemplates.find((t) => t.id === templateId) : null;

  const [name, setName] = useState(template?.name || "");
  const [durationWeeks, setDurationWeeks] = useState("8");
  const [cyclePeptides, setCyclePeptides] = useState<CyclePeptide[]>(
    template
      ? template.peptides.map((tp) => ({
          peptideId: tp.peptideId,
          doseAmount: parseFloat(tp.suggestedDose) || 0.25,
          doseUnit: "mg" as const,
          frequency: tp.suggestedFrequency,
          route: "subcutaneous" as AdministrationRoute,
          timeOfDay: ["morning"],
        }))
      : []
  );
  const [showPicker, setShowPicker] = useState(false);

  const addPeptide = (peptideId: string) => {
    if (cyclePeptides.some((p) => p.peptideId === peptideId)) return;
    setCyclePeptides([
      ...cyclePeptides,
      {
        peptideId,
        doseAmount: 0.25,
        doseUnit: "mg",
        frequency: "1x daily",
        route: "subcutaneous",
        timeOfDay: ["morning"],
      },
    ]);
    setShowPicker(false);
  };

  const removePeptide = (peptideId: string) => {
    setCyclePeptides(cyclePeptides.filter((p) => p.peptideId !== peptideId));
  };

  const updatePeptide = (peptideId: string, updates: Partial<CyclePeptide>) => {
    setCyclePeptides(
      cyclePeptides.map((p) => (p.peptideId === peptideId ? { ...p, ...updates } : p))
    );
  };

  const saveCycle = () => {
    if (!name.trim()) {
      Alert.alert("Name required", "Give your cycle a name");
      return;
    }
    if (cyclePeptides.length === 0) {
      Alert.alert("No peptides", "Add at least one peptide to your cycle");
      return;
    }

    const startDate = new Date().toISOString().split("T")[0];
    const endDate = format(addWeeks(new Date(), parseInt(durationWeeks) || 8), "yyyy-MM-dd");

    addCycle({
      id: generateId(),
      name: name.trim(),
      peptides: cyclePeptides,
      startDate,
      endDate,
      isActive: true,
      notes: template ? `Based on ${template.name} protocol` : "",
      createdAt: new Date().toISOString(),
    });

    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.label}>Cycle Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="e.g. Recovery Stack"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Duration (weeks)</Text>
      <TextInput
        style={styles.input}
        value={durationWeeks}
        onChangeText={setDurationWeeks}
        keyboardType="number-pad"
        placeholder="8"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Peptides</Text>
      {template && (
        <View style={styles.recBanner}>
          <Ionicons name="sparkles" size={14} color={colors.accent} />
          <Text style={styles.recBannerText}>
            Pre-filled from {template.name} protocol. You can adjust values below.
          </Text>
        </View>
      )}
      {cyclePeptides.map((cp) => {
        const pep = peptideDB.find((p) => p.id === cp.peptideId);
        const templatePep = template?.peptides.find((tp) => tp.peptideId === cp.peptideId);
        return (
          <View key={cp.peptideId} style={styles.peptideCard}>
            <View style={styles.peptideHeader}>
              <Text style={styles.peptideName}>{pep?.name || cp.peptideId}</Text>
              <TouchableOpacity onPress={() => removePeptide(cp.peptideId)}>
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
            {templatePep && (
              <View style={styles.recRow}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                <Text style={styles.recText}>
                  Recommended: {templatePep.suggestedDose} · {templatePep.suggestedFrequency} · {templatePep.suggestedDuration}
                </Text>
              </View>
            )}
            <View style={styles.fieldRow}>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Dose</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={String(cp.doseAmount)}
                  onChangeText={(v) => updatePeptide(cp.peptideId, { doseAmount: parseInt(v) || 0 })}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.fieldHalf}>
                <Text style={styles.fieldLabel}>Unit</Text>
                <View style={styles.unitRow}>
                  {(["mcg", "mg", "IU"] as const).map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitBtn, cp.doseUnit === u && styles.unitBtnActive]}
                      onPress={() => updatePeptide(cp.peptideId, { doseUnit: u })}
                    >
                      <Text style={[styles.unitText, cp.doseUnit === u && styles.unitTextActive]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
            <Text style={styles.fieldLabel}>Frequency</Text>
            <TextInput
              style={styles.fieldInput}
              value={cp.frequency}
              onChangeText={(v) => updatePeptide(cp.peptideId, { frequency: v })}
              placeholder="e.g. 2x daily"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        );
      })}

      {showPicker ? (
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>Select Peptide</Text>
          {peptideDB
            .filter((p) => !cyclePeptides.some((cp) => cp.peptideId === p.id))
            .map((p) => (
              <TouchableOpacity key={p.id} style={styles.pickerRow} onPress={() => addPeptide(p.id)}>
                <Text style={styles.pickerName}>{p.name}</Text>
                <Ionicons name="add" size={20} color={colors.accent} />
              </TouchableOpacity>
            ))}
          <TouchableOpacity onPress={() => setShowPicker(false)}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
          <Ionicons name="add" size={20} color={colors.accent} />
          <Text style={styles.addBtnText}>Add Peptide</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={saveCycle}>
        <Text style={styles.saveBtnText}>Start Cycle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  recBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.accent + "10", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.accent + "25", marginBottom: 12,
  },
  recBannerText: { fontSize: 13, color: colors.accent, flex: 1, lineHeight: 18 },
  peptideCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  peptideHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  peptideName: { fontSize: 16, fontWeight: "700", color: colors.accent },
  recRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 6,
    backgroundColor: colors.success + "10", borderRadius: 8, padding: 8,
    marginBottom: 10,
  },
  recText: { fontSize: 12, color: colors.success, flex: 1, lineHeight: 17 },
  fieldRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  fieldHalf: { flex: 1 },
  fieldLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  fieldInput: {
    backgroundColor: colors.background, borderRadius: 8, padding: 10,
    fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  unitRow: { flexDirection: "row", gap: 6 },
  unitBtn: {
    backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  unitBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  unitText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  unitTextActive: { color: colors.background },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
    borderRadius: 12, padding: 16, marginTop: 8,
  },
  addBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  pickerCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginTop: 8,
  },
  pickerTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 10 },
  pickerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerName: { fontSize: 14, color: colors.text },
  cancelText: { fontSize: 14, color: colors.error, textAlign: "center", marginTop: 12 },
  saveBtn: {
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
    alignItems: "center", marginTop: 24,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
