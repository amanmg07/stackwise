import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Alert, Animated, Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { LineChart } from "react-native-chart-kit";
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

  // Positive affirmations for good metrics
  if (avgSleep >= 4) {
    insights.push({
      icon: "moon",
      color: "#818cf8",
      title: "Sleep is on point",
      detail: `Avg ${avgSleep.toFixed(1)}/5 — quality rest fuels everything. Your recovery and gains benefit hugely from this.`,
      peptideIds: [],
    });
  }
  if (avgEnergy >= 4) {
    insights.push({
      icon: "flash",
      color: "#facc15",
      title: "Energy levels are strong",
      detail: `Avg ${avgEnergy.toFixed(1)}/5 — you're firing on all cylinders. Great energy means your stack and habits are working.`,
      peptideIds: [],
    });
  }
  if (avgRecovery >= 4 && avgSoreness < 2.5) {
    insights.push({
      icon: "fitness",
      color: "#4ade80",
      title: "Recovery is dialed in",
      detail: `Avg recovery ${avgRecovery.toFixed(1)}/5 with low soreness. Your body is bouncing back fast — keep pushing.`,
      peptideIds: [],
    });
  }
  if (avgMood >= 4) {
    insights.push({
      icon: "happy",
      color: "#f472b6",
      title: "Mood is thriving",
      detail: `Avg ${avgMood.toFixed(1)}/5 — feeling good mentally is just as important as physical metrics. You're in a great headspace.`,
      peptideIds: [],
    });
  }

  // Improving trends
  if (sleepTrend >= 0.5) {
    insights.push({
      icon: "trending-up",
      color: "#818cf8",
      title: "Sleep is improving",
      detail: "Your sleep quality has been trending up recently. Whatever you changed is working.",
      peptideIds: [],
    });
  }
  if (energyTrend >= 0.5) {
    insights.push({
      icon: "trending-up",
      color: "#facc15",
      title: "Energy is climbing",
      detail: "Your energy levels are on the rise. Your body is responding well.",
      peptideIds: [],
    });
  }
  if (recoveryTrend >= 0.5) {
    insights.push({
      icon: "trending-up",
      color: "#4ade80",
      title: "Recovery is getting better",
      detail: "Recovery scores are trending up. You're adapting and bouncing back faster.",
      peptideIds: [],
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
  const { journal, settings, addJournalEntry, deleteJournalEntry } = useApp();
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
        ListHeaderComponent={<>
          <Text style={styles.journalTitle}>Journal</Text>
          <Text style={styles.journalSubtitle}>Log how you feel daily — StackWise will spot trends and recommend peptides based on your metrics.</Text>
          {header()}
          {sorted.length >= 3 && <TrendChart entries={sorted} />}
          {sorted.length > 0 && (
            <Text style={styles.swipeHint}>
              <Ionicons name="arrow-back" size={11} color={colors.textSecondary} /> Swipe left to delete
            </Text>
          )}
        </>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons name="book-outline" size={40} color={colors.border} />
            </View>
            <Text style={styles.emptyTitle}>No Entries Yet</Text>
            <Text style={styles.emptySubtext}>
              Start logging your daily metrics — after a few entries, StackWise will analyze your trends and recommend peptides tailored to what your body needs.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={(progress, dragX) => {
              const scale = dragX.interpolate({
                inputRange: [-80, 0],
                outputRange: [1, 0.5],
                extrapolate: "clamp",
              });
              return (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    Alert.alert("Delete Entry", `Delete entry from ${format(parseISO(item.date), "MMM d")}?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteJournalEntry(item.id) },
                    ]);
                  }}
                >
                  <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            }}
          >
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate("NewEntry", { entryId: item.id })}
              activeOpacity={0.7}
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
          </Swipeable>
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


const METRICS = [
  { key: "sleepQuality" as const, label: "Sleep", color: "#818cf8" },
  { key: "energyLevel" as const, label: "Energy", color: "#facc15" },
  { key: "recoveryScore" as const, label: "Recovery", color: "#4ade80" },
  { key: "mood" as const, label: "Mood", color: "#f472b6" },
  { key: "soreness" as const, label: "Soreness", color: "#f87171" },
];

const screenWidth = Dimensions.get("window").width;

function TrendChart({ entries }: { entries: JournalEntry[] }) {
  const [activeMetrics, setActiveMetrics] = useState<string[]>(["sleepQuality", "energyLevel", "recoveryScore", "mood", "soreness"]);

  const chartEntries = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14);

  const labels = chartEntries.map((e) => format(parseISO(e.date), "M/d"));
  const step = Math.max(1, Math.ceil(labels.length / 6));
  const displayLabels = labels.map((l, i) => i % step === 0 ? l : "");

  const datasets = METRICS
    .filter((m) => activeMetrics.includes(m.key))
    .map((m) => ({
      data: chartEntries.map((e) => e[m.key]),
      color: () => m.color,
      strokeWidth: 2,
    }));

  if (datasets.length === 0) {
    datasets.push({ data: [0], color: () => "transparent", strokeWidth: 0 });
  }

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <View style={styles.chartSection}>
      <Text style={styles.chartTitle}>Trends</Text>
      <View style={styles.chartLegend}>
        {METRICS.map((m) => {
          const active = activeMetrics.includes(m.key);
          return (
            <TouchableOpacity
              key={m.key}
              style={[styles.legendChip, active && { backgroundColor: m.color + "20", borderColor: m.color + "50" }]}
              onPress={() => toggleMetric(m.key)}
            >
              <View style={[styles.legendDot, { backgroundColor: active ? m.color : colors.border }]} />
              <Text style={[styles.legendText, active && { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {activeMetrics.length > 0 && (
        <LineChart
          data={{
            labels: displayLabels,
            datasets,
          }}
          width={screenWidth - spacing.md * 2}
          height={180}
          yAxisSuffix=""
          yAxisInterval={1}
          fromZero
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.3})`,
            labelColor: () => colors.textSecondary,
            propsForDots: { r: "3", strokeWidth: "0" },
            propsForBackgroundLines: { stroke: colors.border, strokeDasharray: "" },
          }}
          bezier
          style={styles.chart}
          withInnerLines={false}
          segments={4}
        />
      )}
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
  journalTitle: { fontSize: 28, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.md, marginBottom: 4 },
  journalSubtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: 16, lineHeight: 18 },
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
  deleteBtn: {
    backgroundColor: colors.error, justifyContent: "center", alignItems: "center",
    width: 80, borderRadius: 14, marginTop: 12, marginRight: spacing.md,
  },
  deleteBtnText: { color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 4 },
  swipeHint: {
    fontSize: 11, color: colors.textSecondary, textAlign: "right",
    paddingHorizontal: spacing.md, marginBottom: 4,
  },
  chartSection: {
    paddingHorizontal: spacing.md, marginBottom: 12,
  },
  chartTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
  },
  chartLegend: { flexDirection: "row", gap: 4, marginBottom: 12 },
  legendChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, fontWeight: "600", color: colors.textSecondary },
  chart: { borderRadius: 12, overflow: "hidden" },
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
