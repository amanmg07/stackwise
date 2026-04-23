import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { useApp } from "../../context/AppContext";
import { colors, spacing, safeTop, safeBottom } from "../../theme";
import { ScanComparison } from "../../types";
import { peptides as peptideDB } from "../../data/peptides";
import { compareScans } from "../../services/scanCompareService";
import { CATEGORY_INFO } from "./scanConstants";
import { trackScanCompared } from "../../services/analyticsService";

const DIRECTION_STYLES: Record<string, { color: string; icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  improved: { color: colors.success, icon: "trending-up", label: "Improved" },
  worsened: { color: colors.error, icon: "trending-down", label: "Worsened" },
  unchanged: { color: colors.textSecondary, icon: "remove", label: "No change" },
};

export default function ScanCompareScreen({ route, navigation }: any) {
  const { earlierScanId, laterScanId } = route.params;
  const { scans, cycles, settings } = useApp();
  const earlier = scans.find((s) => s.id === earlierScanId);
  const later = scans.find((s) => s.id === laterScanId);
  const activeCycle = cycles.find((c) => c.isActive) || null;

  const [loading, setLoading] = useState(true);
  const [comparison, setComparison] = useState<ScanComparison | null>(null);

  useEffect(() => {
    if (!earlier || !later) return;
    (async () => {
      try {
        const result = await compareScans(earlier, later, activeCycle, settings.gender);
        setComparison(result);
        trackScanCompared({
          daysBetween,
          changesImproved: result.changes.filter((c) => c.direction === "improved").length,
          changesWorsened: result.changes.filter((c) => c.direction === "worsened").length,
          changesUnchanged: result.changes.filter((c) => c.direction === "unchanged").length,
          workingPeptideIds: result.workingPeptides.map((wp) => wp.peptideId),
          recommendedCategories: result.newRecommendations.map((r) => r.category),
        });
      } catch (e: any) {
        Alert.alert("Error", e.message || "Failed to compare scans.");
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!earlier || !later) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Scans not found</Text>
      </View>
    );
  }

  const daysBetween = differenceInCalendarDays(parseISO(later.date), parseISO(earlier.date));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Progress</Text>
      <Text style={styles.subtitle}>
        {daysBetween} {daysBetween === 1 ? "day" : "days"} apart
      </Text>

      {/* Photos side by side */}
      <View style={styles.photosRow}>
        <View style={styles.photoCol}>
          <Image source={{ uri: earlier.imagePath }} style={styles.photo} resizeMode="cover" />
          <Text style={styles.photoLabel}>Before</Text>
          <Text style={styles.photoDate}>{format(parseISO(earlier.date), "MMM d, yyyy")}</Text>
        </View>
        <View style={styles.photoCol}>
          <Image source={{ uri: later.imagePath }} style={styles.photo} resizeMode="cover" />
          <Text style={styles.photoLabel}>After</Text>
          <Text style={styles.photoDate}>{format(parseISO(later.date), "MMM d, yyyy")}</Text>
        </View>
      </View>

      {loading && (
        <View style={styles.loadingCard}>
          <Ionicons name="sparkles" size={18} color={colors.accent} />
          <Text style={styles.loadingText}>Analyzing changes…</Text>
        </View>
      )}

      {comparison && (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={styles.summaryText}>{comparison.summary}</Text>
          </View>

          {/* Changes */}
          {comparison.changes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>What Changed</Text>
              {comparison.changes.map((c, i) => {
                const dir = DIRECTION_STYLES[c.direction] || DIRECTION_STYLES.unchanged;
                const catInfo = CATEGORY_INFO[c.category];
                return (
                  <View key={`c-${i}`} style={[styles.changeCard, { borderColor: dir.color + "30" }]}>
                    <View style={styles.changeHeader}>
                      <Ionicons name={dir.icon} size={16} color={dir.color} />
                      <Text style={[styles.directionLabel, { color: dir.color }]}>{dir.label}</Text>
                      {catInfo && <Text style={[styles.categoryTag, { color: catInfo.color }]}>{catInfo.label}</Text>}
                    </View>
                    <Text style={styles.changeText}>{c.change}</Text>
                  </View>
                );
              })}
            </>
          )}

          {/* Working peptides */}
          {comparison.workingPeptides.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.sectionTitle, { color: colors.success, marginBottom: 0, marginTop: 0 }]}>
                  What's Working
                </Text>
              </View>
              <Text style={styles.sectionDesc}>Peptides in your current cycle that appear to be helping</Text>
              {comparison.workingPeptides.map((wp, i) => {
                const p = peptideDB.find((pp) => pp.id === wp.peptideId);
                if (!p) return null;
                return (
                  <TouchableOpacity
                    key={`wp-${i}`}
                    style={[styles.workingCard, { borderColor: colors.success + "30" }]}
                    onPress={() => navigation.navigate("PeptideDetail", { peptideId: p.id })}
                  >
                    <View style={styles.workingHeader}>
                      <Text style={styles.workingName}>{p.name}</Text>
                      <Ionicons name="chevron-forward" size={16} color={colors.accent} />
                    </View>
                    <Text style={styles.workingReason}>{wp.reason}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}

          {/* New recommendations */}
          {comparison.newRecommendations.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
                <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.accent, marginBottom: 0, marginTop: 0 }]}>
                  Consider Adding
                </Text>
              </View>
              <Text style={styles.sectionDesc}>New peptides to address areas that haven't improved</Text>
              {comparison.newRecommendations.map((rec, i) => {
                const catInfo = CATEGORY_INFO[rec.category];
                const recPeptides = rec.suggestedPeptideIds
                  .map((id) => peptideDB.find((p) => p.id === id))
                  .filter(Boolean);
                return (
                  <View key={`rec-${i}`} style={[styles.recCard, { borderColor: colors.accent + "30" }]}>
                    <View style={styles.recHeader}>
                      {catInfo && (
                        <>
                          <Ionicons name={catInfo.icon} size={16} color={catInfo.color} />
                          <Text style={[styles.categoryTag, { color: catInfo.color }]}>{catInfo.label}</Text>
                        </>
                      )}
                    </View>
                    <Text style={styles.recObservation}>{rec.observation}</Text>
                    {recPeptides.length > 0 && (
                      <View style={styles.recPeptides}>
                        {recPeptides.map((p) => (
                          <TouchableOpacity
                            key={p!.id}
                            style={styles.peptideChip}
                            onPress={() => navigation.navigate("PeptideDetail", { peptideId: p!.id })}
                          >
                            <Text style={styles.peptideChipText}>{p!.name}</Text>
                            <Ionicons name="chevron-forward" size={12} color={colors.accent} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: safeTop },
  empty: { color: colors.textSecondary, textAlign: "center", marginTop: 40 },
  headerRow: { flexDirection: "row", marginBottom: spacing.sm },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  title: { fontSize: 28, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.md },
  photosRow: { flexDirection: "row", gap: 10, marginBottom: spacing.md },
  photoCol: { flex: 1 },
  photo: Platform.OS === "android"
    ? { width: "100%", height: 250, borderRadius: 12, backgroundColor: colors.surface }
    : { width: "100%", aspectRatio: 3 / 4, borderRadius: 12, backgroundColor: colors.surface },
  photoLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1, marginTop: 8 },
  photoDate: { fontSize: 13, fontWeight: "600", color: colors.text, marginTop: 2 },
  loadingCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.accent + "12", borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "25", marginTop: spacing.md,
  },
  loadingText: { fontSize: 14, color: colors.text, flex: 1 },
  summaryCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: colors.accent + "12", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "25", marginTop: spacing.md, marginBottom: spacing.lg,
  },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 22, flex: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: spacing.lg, marginBottom: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.md, marginBottom: spacing.sm,
  },
  sectionDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  changeCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, marginBottom: 8,
  },
  changeHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  directionLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  categoryTag: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginLeft: "auto" },
  changeText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  workingCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, marginBottom: 8,
  },
  workingHeader: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  workingName: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
  workingReason: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  recCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, marginBottom: 8,
  },
  recHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  recObservation: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 10 },
  recPeptides: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  peptideChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.accent + "12", borderRadius: 10,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.accent + "25",
  },
  peptideChipText: { fontSize: 13, fontWeight: "600", color: colors.text },
});
