import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { protocolTemplates } from "../../data/protocolTemplates";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { Goal } from "../../types";

const DIFFICULTY_COLORS = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.error,
};

export default function ProtocolResultScreen({ route, navigation }: any) {
  const { goals } = route.params as { goals: Goal[] };

  const scored = protocolTemplates
    .map((t) => {
      const goalMatch = t.goals.filter((g) => goals.includes(g)).length;
      return { template: t, score: goalMatch };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Recommended Protocols</Text>
      <Text style={styles.subtitle}>
        Based on your selected goals
      </Text>

      {scored.length === 0 && (
        <View style={styles.empty}>
          <Ionicons name="search-outline" size={40} color={colors.border} />
          <Text style={styles.emptyText}>No matching protocols found. Try selecting different goals.</Text>
        </View>
      )}

      {scored.map(({ template: t, score }) => (
        <View key={t.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardName}>{t.name}</Text>
            <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[t.difficulty] + "20" }]}>
              <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[t.difficulty] }]}>
                {t.difficulty}
              </Text>
            </View>
          </View>

          <Text style={styles.cardDesc}>{t.description}</Text>

          <View style={styles.goalsRow}>
            {t.goals.map((g) => (
              <View
                key={g}
                style={[styles.goalChip, goals.includes(g) && styles.goalChipMatch]}
              >
                <Text style={[styles.goalChipText, goals.includes(g) && styles.goalChipTextMatch]}>
                  {g.replace("_", " ")}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Peptides</Text>
          {t.peptides.map((tp) => {
            const pep = peptideDB.find((p) => p.id === tp.peptideId);
            return (
              <View key={tp.peptideId} style={styles.pepRow}>
                <View style={styles.pepInfo}>
                  <Text style={styles.pepName}>{pep?.name || tp.peptideId}</Text>
                  <Text style={styles.pepRole}>{tp.role}</Text>
                </View>
                <View>
                  <Text style={styles.pepDose}>{tp.suggestedDose}</Text>
                  <Text style={styles.pepFreq}>{tp.suggestedFrequency}</Text>
                </View>
              </View>
            );
          })}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.metaText}>{t.cycleDuration}</Text>
            </View>
          </View>

          {t.notes ? <Text style={styles.notes}>{t.notes}</Text> : null}

          <TouchableOpacity
            style={styles.startBtn}
            onPress={() => navigation.navigate("NewCycle", { templateId: t.id })}
          >
            <Ionicons name="play" size={16} color={colors.background} />
            <Text style={styles.startBtnText}>Start This Protocol</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 24 },
  empty: { alignItems: "center", paddingTop: 60, gap: 16 },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16, overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardName: { fontSize: 18, fontWeight: "700", color: colors.accent, flex: 1 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  goalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
  goalChip: {
    backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  goalChipMatch: { borderColor: colors.accent, backgroundColor: colors.accent + "15" },
  goalChipText: { fontSize: 11, color: colors.textSecondary, textTransform: "capitalize" },
  goalChipTextMatch: { color: colors.accent },
  sectionLabel: {
    fontSize: 11, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
  },
  pepRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10,
  },
  pepInfo: { flex: 1, flexShrink: 1 },
  pepName: { fontSize: 14, fontWeight: "600", color: colors.text },
  pepRole: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  pepDose: { fontSize: 13, fontWeight: "600", color: colors.accent, textAlign: "right", flexShrink: 1 },
  pepFreq: { fontSize: 11, color: colors.textSecondary, textAlign: "right", marginTop: 2, flexShrink: 1 },
  metaRow: { flexDirection: "row", gap: 16, marginTop: 12, marginBottom: 8 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 12, color: colors.textSecondary },
  notes: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, fontStyle: "italic", marginTop: 4, marginBottom: 12 },
  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 10, padding: 14, marginTop: 8,
  },
  startBtnText: { fontSize: 14, fontWeight: "700", color: colors.background },
});
