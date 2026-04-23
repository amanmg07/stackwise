import React, { useState, useMemo } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides as peptideDB } from "../../data/peptides";
import { getInteractions, PeptideInteraction } from "../../data/interactions";
import { colors, spacing, safeBottom } from "../../theme";

const SEVERITY_CONFIG = {
  warning: { icon: "warning-outline" as const, color: colors.error, bg: colors.error + "15", label: "Warning" },
  caution: { icon: "alert-circle-outline" as const, color: colors.warning, bg: colors.warning + "15", label: "Caution" },
  info: { icon: "checkmark-circle-outline" as const, color: colors.success, bg: colors.success + "15", label: "Synergy" },
};

export default function InteractionCheckerScreen({ navigation }: any) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [search, setSearch] = useState("");

  const interactions = useMemo(() => getInteractions(selected), [selected]);

  const togglePeptide = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredPeptides = peptideDB.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.abbreviation?.toLowerCase().includes(search.toLowerCase())
  );

  const warnings = interactions.filter((i) => i.severity === "warning");
  const cautions = interactions.filter((i) => i.severity === "caution");
  const synergies = interactions.filter((i) => i.severity === "info");

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      <View style={styles.headerCard}>
        <Ionicons name="git-compare-outline" size={24} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Interaction Checker</Text>
          <Text style={styles.headerDesc}>Select peptides to check for interactions, conflicts, and synergies</Text>
        </View>
      </View>

      {/* Selected peptides */}
      <Text style={styles.label}>Your Stack ({selected.length})</Text>
      <View style={styles.selectedRow}>
        {selected.map((id) => {
          const pep = peptideDB.find((p) => p.id === id);
          return (
            <TouchableOpacity
              key={id}
              style={styles.selectedChip}
              onPress={() => togglePeptide(id)}
            >
              <Text style={styles.selectedChipText}>{pep?.name || id}</Text>
              <Ionicons name="close-circle" size={16} color={colors.accent} />
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          style={styles.addChip}
          onPress={() => setShowPicker(!showPicker)}
        >
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={styles.addChipText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Peptide picker */}
      {showPicker && (
        <View style={styles.pickerCard}>
          <View style={styles.pickerSearch}>
            <Ionicons name="search" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pickerSearchPlaceholder}>
                {search || "Search peptides..."}
              </Text>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 250 }} nestedScrollEnabled>
            {filteredPeptides.map((p) => {
              const isSelected = selected.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}
                  onPress={() => togglePeptide(p.id)}
                >
                  <Text style={[styles.pickerItemText, isSelected && { color: colors.accent }]}>
                    {p.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={colors.accent} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <TouchableOpacity
            style={styles.pickerDone}
            onPress={() => setShowPicker(false)}
          >
            <Text style={styles.pickerDoneText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results */}
      {selected.length >= 2 && (
        <View style={styles.results}>
          {/* Summary */}
          <View style={styles.summaryRow}>
            {warnings.length > 0 && (
              <View style={[styles.summaryBadge, { backgroundColor: colors.error + "20" }]}>
                <Ionicons name="warning-outline" size={14} color={colors.error} />
                <Text style={[styles.summaryText, { color: colors.error }]}>{warnings.length} warning{warnings.length > 1 ? "s" : ""}</Text>
              </View>
            )}
            {cautions.length > 0 && (
              <View style={[styles.summaryBadge, { backgroundColor: colors.warning + "20" }]}>
                <Ionicons name="alert-circle-outline" size={14} color={colors.warning} />
                <Text style={[styles.summaryText, { color: colors.warning }]}>{cautions.length} caution{cautions.length > 1 ? "s" : ""}</Text>
              </View>
            )}
            {synergies.length > 0 && (
              <View style={[styles.summaryBadge, { backgroundColor: colors.success + "20" }]}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                <Text style={[styles.summaryText, { color: colors.success }]}>{synergies.length} synerg{synergies.length > 1 ? "ies" : "y"}</Text>
              </View>
            )}
            {interactions.length === 0 && (
              <View style={[styles.summaryBadge, { backgroundColor: colors.success + "20" }]}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                <Text style={[styles.summaryText, { color: colors.success }]}>No known interactions</Text>
              </View>
            )}
          </View>

          {/* Interaction cards */}
          {interactions.map((interaction, i) => {
            const config = SEVERITY_CONFIG[interaction.severity];
            const pep1 = peptideDB.find((p) => p.id === interaction.peptideIds[0]);
            const pep2 = peptideDB.find((p) => p.id === interaction.peptideIds[1]);
            return (
              <View key={i} style={[styles.interactionCard, { borderLeftColor: config.color }]}>
                <View style={styles.interactionHeader}>
                  <View style={[styles.severityBadge, { backgroundColor: config.bg }]}>
                    <Ionicons name={config.icon} size={14} color={config.color} />
                    <Text style={[styles.severityText, { color: config.color }]}>{config.label}</Text>
                  </View>
                </View>
                <Text style={styles.interactionTitle}>{interaction.title}</Text>
                <Text style={styles.interactionPeptides}>
                  {pep1?.name || interaction.peptideIds[0]} + {pep2?.name || interaction.peptideIds[1]}
                </Text>
                <Text style={styles.interactionDetail}>{interaction.detail}</Text>
              </View>
            );
          })}
        </View>
      )}

      {selected.length < 2 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="flask-outline" size={36} color={colors.border} />
          </View>
          <Text style={styles.emptyTitle}>Select at least 2 peptides</Text>
          <Text style={styles.emptySubtext}>
            Add peptides to your stack above to check for interactions, conflicts, and synergies between them.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  headerCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  headerDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
  },
  selectedRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  selectedChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.accent + "15", borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  selectedChipText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  addChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.surface, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border, borderStyle: "dashed",
  },
  addChipText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  pickerCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    overflow: "hidden",
  },
  pickerSearch: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerSearchPlaceholder: { fontSize: 14, color: colors.textSecondary },
  pickerItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerItemSelected: { backgroundColor: colors.accent + "08" },
  pickerItemText: { fontSize: 14, color: colors.text },
  pickerDone: {
    alignItems: "center", padding: 12,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  pickerDoneText: { fontSize: 14, fontWeight: "600", color: colors.accent },
  results: { marginTop: 8 },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  summaryBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  summaryText: { fontSize: 13, fontWeight: "600" },
  interactionCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12,
    borderLeftWidth: 4,
  },
  interactionHeader: { flexDirection: "row", marginBottom: 8 },
  severityBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
  },
  severityText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  interactionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 4 },
  interactionPeptides: { fontSize: 12, color: colors.textSecondary, marginBottom: 8 },
  interactionDetail: { fontSize: 13, color: colors.text, lineHeight: 20 },
  emptyState: { alignItems: "center", paddingTop: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: colors.textSecondary, textAlign: "center", lineHeight: 19, paddingHorizontal: 20 },
});
