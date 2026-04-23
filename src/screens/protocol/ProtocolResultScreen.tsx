import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, addWeeks } from "date-fns";
import { protocolTemplates } from "../../data/protocolTemplates";
import { peptides as peptideDB } from "../../data/peptides";
import { useApp } from "../../context/AppContext";
import { generateId } from "../../utils/id";
import { colors, spacing, emptyStateStyle } from "../../theme";
import { Goal, AdministrationRoute } from "../../types";

const DIFFICULTY_COLORS = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.error,
};

export default function ProtocolResultScreen({ route, navigation }: any) {
  const { goals, routes: preferredRoutes } = route.params as { goals: Goal[]; routes?: AdministrationRoute[] };
  const { addCycle } = useApp();

  const scored = protocolTemplates
    .map((t) => {
      const goalMatch = t.goals.filter((g) => goals.includes(g)).length;
      return { template: t, score: goalMatch };
    })
    .filter((s) => s.score > 0)
    .filter((s) => {
      // If route preferences provided, only show protocols where every peptide
      // has at least one route matching the user's preferences.
      // Supplements (oral) are always allowed regardless of route preference.
      if (!preferredRoutes || preferredRoutes.length === 0) return true;
      return s.template.peptides.every((tp) => {
        const pep = peptideDB.find((p) => p.id === tp.peptideId);
        if (!pep) return true;
        if (pep.compoundType === "supplement") return true;
        return pep.routes.some((r) => preferredRoutes.includes(r));
      });
    })
    .sort((a, b) => b.score - a.score);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Recommended Protocols</Text>
      <Text style={styles.subtitle}>
        Based on your selected goals
      </Text>

      {scored.length === 0 && (
        <View style={{ alignItems: "center", paddingTop: 80 }}>
          <View style={emptyStateStyle.icon}>
            <Ionicons name="search-outline" size={44} color={colors.accent} />
          </View>
          <Text style={emptyStateStyle.title}>No Matching Protocols</Text>
          <Text style={emptyStateStyle.subtitle}>Try selecting different goals to find protocols that match.</Text>
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

          <Text style={styles.sectionLabel}>
            {t.peptides.every((tp) => peptideDB.find((p) => p.id === tp.peptideId)?.compoundType === "supplement")
              ? "Supplements"
              : t.peptides.some((tp) => peptideDB.find((p) => p.id === tp.peptideId)?.compoundType === "supplement")
              ? "Peptides & Supplements"
              : "Peptides"}
          </Text>
          {t.peptides.map((tp) => {
            const pep = peptideDB.find((p) => p.id === tp.peptideId);
            const isSupplement = pep?.compoundType === "supplement";
            return (
              <View key={tp.peptideId} style={styles.pepRow}>
                <View style={styles.pepInfo}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.pepName}>{pep?.name || tp.peptideId}</Text>
                    {isSupplement && <Ionicons name="leaf-outline" size={13} color="#4ade80" />}
                  </View>
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
            onPress={() => {
              const parseDoseUnit = (s?: string): "mcg" | "mg" | "g" | "IU" => {
                if (!s) return "mg";
                if (/\biu\b/i.test(s)) return "IU";
                if (/\bmcg\b/i.test(s) || /\bμg\b/.test(s)) return "mcg";
                if (/\bg\b/i.test(s) && !/\bmg\b/i.test(s)) return "g";
                return "mg";
              };
              const peptidesList = t.peptides.map((tp) => {
                const pep = peptideDB.find((p) => p.id === tp.peptideId);
                const doseMatch = tp.suggestedDose.match(/([\d.,]+)/);
                return {
                  peptideId: tp.peptideId,
                  doseAmount: doseMatch ? parseFloat(doseMatch[1].replace(/,/g, "")) : 0.25,
                  doseUnit: parseDoseUnit(tp.suggestedDose),
                  frequency: tp.suggestedFrequency,
                  route: (pep?.routes?.[0] || "subcutaneous") as AdministrationRoute,
                  timeOfDay: ["morning"] as string[],
                };
              });
              const startDate = new Date().toISOString().split("T")[0];
              const endDate = format(addWeeks(new Date(), 8), "yyyy-MM-dd");
              addCycle({
                id: generateId(),
                name: t.name,
                peptides: peptidesList,
                startDate,
                endDate,
                isActive: true,
                notes: `Based on ${t.name} protocol`,
                createdAt: new Date().toISOString(),
              });
              Alert.alert("Cycle Started", `${t.name} is now active!`, [
                { text: "View Cycle", onPress: () => navigation.navigate("CycleTab", { screen: "CycleTracker" }) },
              ]);
            }}
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md, overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm, gap: 10 },
  cardName: { fontSize: 18, fontWeight: "700", color: colors.accent, flex: 1 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, flexShrink: 0 },
  diffText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: spacing.md },
  goalsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: spacing.md },
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
    backgroundColor: colors.accent, borderRadius: 10, padding: 18, marginTop: 8,
  },
  startBtnText: { fontSize: 14, fontWeight: "700", color: colors.background },
});
