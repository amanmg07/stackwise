import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { format, parseISO, subDays } from "date-fns";
import { JournalEntry } from "../../types";
import { generateId } from "../../utils/id";

const RATING_LABELS = ["", "Poor", "Low", "Average", "Good", "Excellent"];

interface Insight {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  detail: string;
  peptideIds: string[];
}

function analyzeJournal(entries: JournalEntry[]): Insight[] {
  if (entries.length < 3) return [];

  const recent = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 14);

  const avg = (fn: (e: JournalEntry) => number) =>
    recent.reduce((sum, e) => sum + fn(e), 0) / recent.length;

  const avgSleep = avg((e) => e.sleepQuality);
  const avgEnergy = avg((e) => e.energyLevel);
  const avgRecovery = avg((e) => e.recoveryScore);
  const avgMood = avg((e) => e.mood);
  const avgSoreness = avg((e) => e.soreness);

  // Check trends (compare first half vs second half)
  const half = Math.floor(recent.length / 2);
  const newer = recent.slice(0, half);
  const older = recent.slice(half);
  const trendAvg = (arr: JournalEntry[], fn: (e: JournalEntry) => number) =>
    arr.reduce((sum, e) => sum + fn(e), 0) / arr.length;

  const sleepTrend = trendAvg(newer, (e) => e.sleepQuality) - trendAvg(older, (e) => e.sleepQuality);
  const energyTrend = trendAvg(newer, (e) => e.energyLevel) - trendAvg(older, (e) => e.energyLevel);
  const recoveryTrend = trendAvg(newer, (e) => e.recoveryScore) - trendAvg(older, (e) => e.recoveryScore);

  const insights: Insight[] = [];

  // Sleep issues
  if (avgSleep < 3) {
    insights.push({
      icon: "moon-outline",
      color: "#818cf8",
      title: "Sleep needs attention",
      detail: `Avg sleep quality: ${avgSleep.toFixed(1)}/5. Consider peptides that improve deep sleep.`,
      peptideIds: ["dsip", "sleep_blend", "ipamorelin", "mk677"],
    });
  } else if (sleepTrend < -0.5) {
    insights.push({
      icon: "trending-down-outline",
      color: "#818cf8",
      title: "Sleep quality declining",
      detail: `Your sleep has been trending down recently.`,
      peptideIds: ["dsip", "sleep_blend"],
    });
  }

  // Recovery issues
  if (avgRecovery < 3) {
    insights.push({
      icon: "bandage-outline",
      color: "#4ade80",
      title: "Recovery is lagging",
      detail: `Avg recovery: ${avgRecovery.toFixed(1)}/5. Healing peptides could help.`,
      peptideIds: ["bpc157", "tb500", "wolverine_blend", "ghkcu"],
    });
  } else if (recoveryTrend < -0.5) {
    insights.push({
      icon: "trending-down-outline",
      color: "#4ade80",
      title: "Recovery trending down",
      detail: `Recovery scores dropping — might be overtraining.`,
      peptideIds: ["bpc157", "tb500", "klow_blend"],
    });
  }

  // High soreness
  if (avgSoreness >= 3.5) {
    insights.push({
      icon: "fitness-outline",
      color: "#f87171",
      title: "High soreness levels",
      detail: `Avg soreness: ${avgSoreness.toFixed(1)}/5. Anti-inflammatory peptides may help.`,
      peptideIds: ["bpc157", "tb500", "kpv", "wolverine_blend"],
    });
  }

  // Low energy
  if (avgEnergy < 3) {
    insights.push({
      icon: "flash-outline",
      color: "#facc15",
      title: "Low energy levels",
      detail: `Avg energy: ${avgEnergy.toFixed(1)}/5. GH peptides can boost energy and vitality.`,
      peptideIds: ["cjc1295_nodac", "ipamorelin", "cjc_ipa_blend", "tesamorelin"],
    });
  } else if (energyTrend < -0.5) {
    insights.push({
      icon: "trending-down-outline",
      color: "#facc15",
      title: "Energy declining",
      detail: `Your energy has been dropping. Consider a GH-boosting stack.`,
      peptideIds: ["cjc_ipa_blend", "mk677"],
    });
  }

  // Low mood
  if (avgMood < 3) {
    insights.push({
      icon: "sad-outline",
      color: "#f472b6",
      title: "Mood could be better",
      detail: `Avg mood: ${avgMood.toFixed(1)}/5. Cognitive peptides may help with wellbeing.`,
      peptideIds: ["selank", "semax", "cognitive_blend"],
    });
  }

  // Everything is great
  if (insights.length === 0 && recent.length >= 5) {
    const allGood = avgSleep >= 3.5 && avgEnergy >= 3.5 && avgRecovery >= 3.5 && avgMood >= 3.5 && avgSoreness < 3;
    if (allGood) {
      insights.push({
        icon: "checkmark-circle-outline",
        color: colors.success,
        title: "Looking great!",
        detail: `All metrics trending well. Keep doing what you're doing.`,
        peptideIds: [],
      });
    }
  }

  return insights;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function JournalScreen({ navigation }: any) {
  const { journal, settings, addJournalEntry } = useApp();
  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  const insights = analyzeJournal(journal);

  const simulateOneDay = () => {
    // Find the earliest existing date and go one day before, or start at yesterday
    const nextDate = journal.length === 0
      ? subDays(new Date(), 1)
      : subDays(parseISO([...journal].sort((a, b) => a.date.localeCompare(b.date))[0].date), 1);

    addJournalEntry({
      id: generateId(),
      date: format(nextDate, "yyyy-MM-dd"),
      sleepQuality: randomInt(1, 5),
      energyLevel: randomInt(1, 5),
      recoveryScore: randomInt(1, 5),
      mood: randomInt(1, 5),
      soreness: randomInt(1, 5),
      notes: "",
      createdAt: new Date().toISOString(),
    });
  };

  const header = () => {
    if (insights.length === 0) return null;
    return (
      <View style={styles.insightsSection}>
        <Text style={styles.insightsTitle}>Trends & Recommendations</Text>
        {insights.map((insight, i) => (
          <View key={i} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={[styles.insightIcon, { backgroundColor: insight.color + "20" }]}>
                <Ionicons name={insight.icon} size={18} color={insight.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.insightTitle, { color: insight.color }]}>{insight.title}</Text>
                <Text style={styles.insightDetail}>{insight.detail}</Text>
              </View>
            </View>
            {insight.peptideIds.length > 0 && (
              <View style={styles.recRow}>
                <Text style={styles.recLabel}>Try:</Text>
                {insight.peptideIds.slice(0, 3).map((id) => {
                  const pep = peptideDB.find((p) => p.id === id);
                  if (!pep) return null;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={styles.recChip}
                      onPress={() => navigation.navigate("ExploreTab", {
                        screen: "PeptideDetail",
                        params: { peptideId: id },
                      })}
                    >
                      <Text style={styles.recChipText}>{pep.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={40} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>No Entries Yet</Text>
            <Text style={styles.emptySubtext}>
              Track your progress by logging daily metrics
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("NewEntry", { entryId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardDate}>
                {format(parseISO(item.date), "EEE, MMM d")}
              </Text>
              {item.weight && (
                <Text style={styles.cardWeight}>
                  {item.weight} {settings.weightUnit}
                </Text>
              )}
            </View>
            <View style={styles.metrics}>
              <MetricBadge label="Energy" value={item.energyLevel} />
              <MetricBadge label="Sleep" value={item.sleepQuality} />
              <MetricBadge label="Recovery" value={item.recoveryScore} />
              <MetricBadge label="Mood" value={item.mood} />
              <MetricBadge label="Soreness" value={item.soreness} inverted />
            </View>
            {item.notes ? (
              <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
            ) : null}
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.simBtn}
        onPress={simulateOneDay}
      >
        <Ionicons name="time-outline" size={18} color={colors.accent} />
        <Text style={styles.simBtnText}>+ 1 Day</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("NewEntry")}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>
    </View>
  );
}

function MetricBadge({ label, value, inverted }: { label: string; value: number; inverted?: boolean }) {
  const color = inverted
    ? (value <= 2 ? colors.success : value <= 3 ? colors.warning : colors.error)
    : (value >= 4 ? colors.success : value >= 3 ? colors.warning : colors.error);
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={[styles.badgeValue, { color }]}>{value}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 60 : 0 },
  // Insights
  insightsSection: { paddingHorizontal: spacing.md, paddingTop: 4, marginBottom: 8 },
  insightsTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
  },
  insightCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 10,
  },
  insightHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  insightIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center",
  },
  insightTitle: { fontSize: 15, fontWeight: "700" },
  insightDetail: { fontSize: 13, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  recRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 10 },
  recLabel: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  recChip: {
    backgroundColor: colors.accent + "15", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  recChipText: { fontSize: 12, fontWeight: "600", color: colors.accent },
  // Existing styles
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    marginHorizontal: spacing.md, marginTop: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardDate: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardWeight: { fontSize: 14, fontWeight: "600", color: colors.accent },
  metrics: { flexDirection: "row", gap: 4, marginBottom: 8 },
  badge: {
    flex: 1, backgroundColor: colors.background, borderRadius: 8,
    paddingVertical: 8, paddingHorizontal: 4, alignItems: "center",
  },
  badgeLabel: { fontSize: 9, color: colors.textSecondary, marginBottom: 2 },
  badgeValue: { fontSize: 14, fontWeight: "700" },
  notes: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  simBtn: {
    position: "absolute", bottom: 28, left: 24,
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.accent + "40",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4,
    elevation: 4,
  },
  simBtnText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  fab: {
    position: "absolute", bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
});
