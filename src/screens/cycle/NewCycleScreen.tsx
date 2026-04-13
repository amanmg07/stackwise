import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generateId } from "../../utils/id";
import { format, addWeeks, differenceInWeeks, parseISO } from "date-fns";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { protocolTemplates } from "../../data/protocolTemplates";
import { trackCycleCreated, trackCycleUpdated } from "../../services/analyticsService";
import { getInteractions } from "../../data/interactions";
import { colors, spacing } from "../../theme";
import { CyclePeptide, AdministrationRoute, PeptideCategory } from "../../types";

const CATEGORY_INFO: { key: PeptideCategory; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "recovery", label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  { key: "fat_loss", label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  { key: "muscle_gain", label: "Muscle Gain", icon: "barbell-outline", color: "#60a5fa" },
  { key: "anti_aging", label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  { key: "sleep", label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  { key: "cognitive", label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
  { key: "immune", label: "Immune Health", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  { key: "sexual_health", label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
];

export default function NewCycleScreen({ route, navigation }: any) {
  const { addCycle, updateCycle, cycles, settings } = useApp();
  const templateId = route.params?.templateId;
  const template = templateId ? protocolTemplates.find((t) => t.id === templateId) : null;
  const communityStack = route.params?.communityStack;
  const editCycleId = route.params?.editCycleId;
  const editCycle = editCycleId ? cycles.find((c) => c.id === editCycleId) : null;

  const buildInitialPeptides = (): CyclePeptide[] => {
    if (template) {
      return template.peptides.map((tp) => {
        const pep = peptideDB.find((p) => p.id === tp.peptideId);
        const doseMatch = tp.suggestedDose.match(/([\d.]+)/);
        return {
          peptideId: tp.peptideId,
          doseAmount: doseMatch ? parseFloat(doseMatch[1]) : 0.25,
          doseUnit: "mg" as const,
          frequency: tp.suggestedFrequency,
          route: (pep?.routes?.[0] || "subcutaneous") as AdministrationRoute,
          timeOfDay: ["morning"],
        };
      });
    }
    if (communityStack) {
      return communityStack.peptides.map((cp: any) => {
        const pep = peptideDB.find((p) => p.id === cp.peptideId);
        const doseMatch = cp.dose?.match(/([\d.]+)/);
        return {
          peptideId: cp.peptideId,
          doseAmount: doseMatch ? parseFloat(doseMatch[1]) : 0.25,
          doseUnit: "mg" as const,
          frequency: cp.frequency || "1x daily",
          route: (pep?.routes?.[0] || "subcutaneous") as AdministrationRoute,
          timeOfDay: ["morning"],
        };
      });
    }
    return [];
  };

  const [name, setName] = useState(
    editCycle?.name || template?.name || communityStack?.name || ""
  );
  const [durationWeeks, setDurationWeeks] = useState(
    editCycle
      ? String(differenceInWeeks(parseISO(editCycle.endDate), parseISO(editCycle.startDate)) || 8)
      : "8"
  );
  const [notes, setNotes] = useState(editCycle?.notes || "");
  const [cyclePeptides, setCyclePeptides] = useState<CyclePeptide[]>(
    editCycle ? editCycle.peptides : buildInitialPeptides()
  );
  const [showPicker, setShowPicker] = useState(false);
  const [expandedCats, setExpandedCats] = useState<(PeptideCategory | "saved")[]>([]);
  const [pickerSearch, setPickerSearch] = useState("");

  const interactions = useMemo(
    () => getInteractions(cyclePeptides.map((cp) => cp.peptideId)),
    [cyclePeptides]
  );

  const addPeptide = (peptideId: string) => {
    if (cyclePeptides.some((p) => p.peptideId === peptideId)) return;
    const pep = peptideDB.find((p) => p.id === peptideId);
    const proto = pep?.dosingProtocols?.[0];

    // Parse dose from first protocol's doseRange (e.g. "0.25-0.5 mg" → 0.25)
    const doseMatch = proto?.doseRange?.match(/([\d.]+)/);
    const doseAmount = doseMatch ? parseFloat(doseMatch[1]) : 0.25;

    // Parse frequency
    const freq = proto?.frequency || "1x daily";

    // Use peptide's first route or default to subcutaneous
    const route = pep?.routes?.[0] || "subcutaneous";

    setCyclePeptides([
      ...cyclePeptides,
      {
        peptideId,
        doseAmount,
        doseUnit: "mg",
        frequency: freq,
        route,
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
    const weeks = parseInt(durationWeeks) || 0;
    if (weeks < 1 || weeks > 52) {
      Alert.alert("Invalid duration", "Cycle duration must be between 1 and 52 weeks");
      return;
    }

    if (editCycle) {
      const endDate = format(
        addWeeks(parseISO(editCycle.startDate), parseInt(durationWeeks) || 8),
        "yyyy-MM-dd"
      );
      updateCycle({
        ...editCycle,
        name: name.trim(),
        peptides: cyclePeptides,
        endDate,
        notes: notes,
      });
      trackCycleUpdated(cyclePeptides.map((p) => p.peptideId));
    } else {
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
      trackCycleCreated(cyclePeptides.map((p) => p.peptideId));
    }

    navigation.goBack();
  };

  const parsedWeeks = parseInt(durationWeeks) || 0;
  const canSave = name.trim().length > 0 && cyclePeptides.length > 0 && parsedWeeks >= 1 && parsedWeeks <= 52;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
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
                  onChangeText={(v) => updatePeptide(cp.peptideId, { doseAmount: parseFloat(v) || 0 })}
                  keyboardType="decimal-pad"
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

      {/* Interaction warnings */}
      {interactions.length > 0 && (
        <View style={styles.interactionsSection}>
          {interactions.map((interaction, i) => {
            const isWarning = interaction.severity === "warning";
            const isCaution = interaction.severity === "caution";
            const iconColor = isWarning ? colors.error : isCaution ? colors.warning : colors.success;
            const bgColor = isWarning ? colors.error + "12" : isCaution ? colors.warning + "12" : colors.success + "12";
            const borderColor = isWarning ? colors.error + "30" : isCaution ? colors.warning + "30" : colors.success + "30";
            const pep1 = peptideDB.find((p) => p.id === interaction.peptideIds[0]);
            const pep2 = peptideDB.find((p) => p.id === interaction.peptideIds[1]);
            return (
              <View key={i} style={[styles.interactionBanner, { backgroundColor: bgColor, borderColor }]}>
                <Ionicons
                  name={isWarning ? "warning-outline" : isCaution ? "alert-circle-outline" : "checkmark-circle-outline"}
                  size={18}
                  color={iconColor}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.interactionTitle, { color: iconColor }]}>
                    {interaction.title}
                  </Text>
                  <Text style={styles.interactionPeptides}>
                    {pep1?.name} + {pep2?.name}
                  </Text>
                  <Text style={styles.interactionDetail}>{interaction.detail}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {showPicker ? (
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>Select Peptide</Text>

          {/* Search bar */}
          <View style={styles.pickerSearchBar}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <TextInput
              style={styles.pickerSearchInput}
              placeholder="Search peptides..."
              placeholderTextColor={colors.textSecondary}
              value={pickerSearch}
              onChangeText={setPickerSearch}
              autoCapitalize="none"
            />
            {pickerSearch.length > 0 && (
              <TouchableOpacity onPress={() => setPickerSearch("")}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Flat search results when searching */}
          {pickerSearch.length > 0 ? (
            peptideDB
              .filter((p) => !cyclePeptides.some((cp) => cp.peptideId === p.id))
              .filter((p) =>
                p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
                (p.abbreviation?.toLowerCase().includes(pickerSearch.toLowerCase()))
              )
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => (
                <TouchableOpacity key={p.id} style={styles.pickerRow} onPress={() => { addPeptide(p.id); setPickerSearch(""); }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    {settings.savedPeptides.includes(p.id) && (
                      <Ionicons name="bookmark" size={14} color={colors.accent} />
                    )}
                  </View>
                  <Ionicons name="add" size={20} color={colors.accent} />
                </TouchableOpacity>
              ))
          ) : (
          <>
          {/* Saved peptides section */}
          {settings.savedPeptides.length > 0 && (() => {
            const savedAvailable = peptideDB
              .filter((p) => settings.savedPeptides.includes(p.id) && !cyclePeptides.some((cp) => cp.peptideId === p.id))
              .sort((a, b) => a.name.localeCompare(b.name));
            if (savedAvailable.length === 0) return null;
            const expanded = expandedCats.includes("saved");
            return (
              <View style={styles.catSection}>
                <TouchableOpacity
                  style={styles.catHeader}
                  onPress={() => setExpandedCats((prev) =>
                    prev.includes("saved") ? prev.filter((c) => c !== "saved") : [...prev, "saved"]
                  )}
                >
                  <Ionicons name="bookmark" size={18} color={colors.accent} />
                  <Text style={[styles.catHeaderText, { color: colors.accent }]}>Saved ({savedAvailable.length})</Text>
                  <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                {expanded && savedAvailable.map((p) => (
                  <TouchableOpacity key={p.id} style={styles.pickerRow} onPress={() => addPeptide(p.id)}>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    <Ionicons name="add" size={20} color={colors.accent} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {/* Category sections */}
          {CATEGORY_INFO.map((cat) => {
            const catPeptides = peptideDB
              .filter((p) => p.categories.includes(cat.key) && !cyclePeptides.some((cp) => cp.peptideId === p.id))
              .sort((a, b) => a.name.localeCompare(b.name));
            if (catPeptides.length === 0) return null;
            const expanded = expandedCats.includes(cat.key);
            return (
              <View key={cat.key} style={styles.catSection}>
                <TouchableOpacity
                  style={styles.catHeader}
                  onPress={() => setExpandedCats((prev) =>
                    prev.includes(cat.key) ? prev.filter((c) => c !== cat.key) : [...prev, cat.key]
                  )}
                >
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                  <Text style={[styles.catHeaderText, { color: cat.color }]}>{cat.label} ({catPeptides.length})</Text>
                  <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                {expanded && catPeptides.map((p) => (
                  <TouchableOpacity key={p.id} style={styles.pickerRow} onPress={() => addPeptide(p.id)}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1 }}>
                      <Text style={styles.pickerName}>{p.name}</Text>
                      {settings.savedPeptides.includes(p.id) && (
                        <Ionicons name="bookmark" size={14} color={colors.accent} />
                      )}
                    </View>
                    <Ionicons name="add" size={20} color={colors.accent} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}
          </>
          )}

          <TouchableOpacity onPress={() => { setShowPicker(false); setPickerSearch(""); }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowPicker(true)}>
          <Ionicons name="add" size={20} color={colors.accent} />
          <Text style={styles.addBtnText}>Add Peptide</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { minHeight: 60, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes about this cycle"
        placeholderTextColor={colors.textSecondary}
        multiline
      />

      <TouchableOpacity
        style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
        onPress={saveCycle}
        disabled={!canSave}
      >
        <Text style={styles.saveBtnText}>{editCycle ? "Save Changes" : "Start Cycle"}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
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
  interactionsSection: { marginTop: 4, marginBottom: 4 },
  interactionBanner: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    borderRadius: 12, padding: 12,
    borderWidth: 1, marginBottom: 8,
  },
  interactionTitle: { fontSize: 14, fontWeight: "700" },
  interactionPeptides: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  interactionDetail: { fontSize: 12, color: colors.text, lineHeight: 17, marginTop: 4 },
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
  pickerTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 8 },
  pickerSearchBar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border, marginBottom: 6,
  },
  pickerSearchInput: { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
  catSection: { marginTop: 6 },
  catHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  catHeaderText: { fontSize: 14, fontWeight: "700", flex: 1 },
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
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
