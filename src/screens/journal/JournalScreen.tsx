import React, { useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, Animated, Dimensions } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing, safeTop, emptyStateStyle } from "../../theme";
import { format, parseISO } from "date-fns";
import { JournalEntry } from "../../types";


interface Insight {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  title: string;
  detail: string;
  peptideIds: string[];
}

function analyzeJournal(entries: JournalEntry[]): Insight[] {
  if (entries.length === 0) return [];

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

  // Check trends (only if enough data for meaningful comparison)
  let sleepTrend = 0, energyTrend = 0, recoveryTrend = 0;
  if (recent.length >= 4) {
    const half = Math.floor(recent.length / 2);
    const newer = recent.slice(0, half);
    const older = recent.slice(half);
    const trendAvg = (arr: JournalEntry[], fn: (e: JournalEntry) => number) =>
      arr.reduce((sum, e) => sum + fn(e), 0) / arr.length;

    sleepTrend = trendAvg(newer, (e) => e.sleepQuality) - trendAvg(older, (e) => e.sleepQuality);
    energyTrend = trendAvg(newer, (e) => e.energyLevel) - trendAvg(older, (e) => e.energyLevel);
    recoveryTrend = trendAvg(newer, (e) => e.recoveryScore) - trendAvg(older, (e) => e.recoveryScore);
  }
  // Trend thresholds are on 1-10 scale so double the old 0.5 threshold
  const TREND_THRESHOLD = 1.0;

  const insights: Insight[] = [];

  // Sleep issues
  if (avgSleep < 6) {
    insights.push({
      icon: "moon-outline",
      color: "#818cf8",
      title: "Sleep needs attention",
      detail: `Avg sleep quality: ${avgSleep.toFixed(1)}/10. DSIP promotes delta-wave deep sleep. Ipamorelin triggers GH release during sleep, improving sleep architecture.`,
      peptideIds: ["dsip", "sleep_blend", "ipamorelin", "mk677"],
    });
  } else if (sleepTrend < -TREND_THRESHOLD) {
    insights.push({
      icon: "trending-down-outline",
      color: "#818cf8",
      title: "Sleep quality declining",
      detail: `Your sleep has been trending down recently. DSIP is a natural sleep-regulating peptide that restores healthy sleep cycles.`,
      peptideIds: ["dsip", "sleep_blend"],
    });
  }

  // Recovery issues
  if (avgRecovery < 6) {
    insights.push({
      icon: "bandage-outline",
      color: "#4ade80",
      title: "Recovery is lagging",
      detail: `Avg recovery: ${avgRecovery.toFixed(1)}/10. BPC-157 accelerates tissue repair via angiogenesis. TB-500 reduces inflammation and promotes cell migration to injury sites.`,
      peptideIds: ["bpc157", "tb500", "wolverine_blend", "ghkcu"],
    });
  } else if (recoveryTrend < -TREND_THRESHOLD) {
    insights.push({
      icon: "trending-down-outline",
      color: "#4ade80",
      title: "Recovery trending down",
      detail: `Recovery scores dropping — could indicate overtraining. BPC-157 and TB-500 support systemic healing and reduce inflammation.`,
      peptideIds: ["bpc157", "tb500", "klow_blend"],
    });
  }

  // High soreness (low score = more sore, since 1=very sore, 10=no pain)
  if (avgSoreness <= 5) {
    insights.push({
      icon: "fitness-outline",
      color: "#f87171",
      title: "High soreness levels",
      detail: `Avg soreness: ${avgSoreness.toFixed(1)}/10. BPC-157 reduces inflammatory markers. KPV is a potent anti-inflammatory fragment that targets NF-kB pathways.`,
      peptideIds: ["bpc157", "tb500", "kpv", "wolverine_blend"],
    });
  }

  // Low energy
  if (avgEnergy < 6) {
    insights.push({
      icon: "flash-outline",
      color: "#facc15",
      title: "Low energy levels",
      detail: `Avg energy: ${avgEnergy.toFixed(1)}/10. CJC-1295 + Ipamorelin boost GH output, which improves energy, metabolism, and body composition over 4-6 weeks.`,
      peptideIds: ["cjc1295_nodac", "ipamorelin", "cjc_ipa_blend", "tesamorelin"],
    });
  } else if (energyTrend < -TREND_THRESHOLD) {
    insights.push({
      icon: "trending-down-outline",
      color: "#facc15",
      title: "Energy declining",
      detail: `Your energy has been dropping. GH-boosting peptides raise IGF-1 levels, which supports cellular energy production and vitality.`,
      peptideIds: ["cjc_ipa_blend", "mk677"],
    });
  }

  // Low mood
  if (avgMood < 6) {
    insights.push({
      icon: "sad-outline",
      color: "#f472b6",
      title: "Mood could be better",
      detail: `Avg mood: ${avgMood.toFixed(1)}/10. Selank modulates GABA and serotonin for anxiolytic effects. Semax boosts BDNF, supporting mood and cognitive resilience.`,
      peptideIds: ["selank", "semax", "cognitive_blend"],
    });
  }

  // Positive affirmations for good metrics
  if (avgSleep >= 8) {
    insights.push({
      icon: "moon-outline",
      color: "#818cf8",
      title: "Sleep is on point",
      detail: `Avg ${avgSleep.toFixed(1)}/10 — quality rest fuels everything. Your recovery and gains benefit hugely from this.`,
      peptideIds: [],
    });
  }
  if (avgEnergy >= 8) {
    insights.push({
      icon: "flash-outline",
      color: "#facc15",
      title: "Energy levels are strong",
      detail: `Avg ${avgEnergy.toFixed(1)}/10 — you're firing on all cylinders. Great energy means your stack and habits are working.`,
      peptideIds: [],
    });
  }
  if (avgRecovery >= 8 && avgSoreness >= 7) {
    insights.push({
      icon: "fitness-outline",
      color: "#4ade80",
      title: "Recovery is dialed in",
      detail: `Avg recovery ${avgRecovery.toFixed(1)}/10 with low soreness. Your body is bouncing back fast — keep pushing.`,
      peptideIds: [],
    });
  }
  if (avgMood >= 8) {
    insights.push({
      icon: "happy-outline",
      color: "#f472b6",
      title: "Mood is thriving",
      detail: `Avg ${avgMood.toFixed(1)}/10 — feeling good mentally is just as important as physical metrics. You're in a great headspace.`,
      peptideIds: [],
    });
  }

  // Improving trends
  if (sleepTrend >= TREND_THRESHOLD) {
    insights.push({
      icon: "trending-up-outline",
      color: "#818cf8",
      title: "Sleep is improving",
      detail: "Your sleep quality has been trending up recently. Whatever you changed is working.",
      peptideIds: [],
    });
  }
  if (energyTrend >= TREND_THRESHOLD) {
    insights.push({
      icon: "trending-up-outline",
      color: "#facc15",
      title: "Energy is climbing",
      detail: "Your energy levels are on the rise. Your body is responding well.",
      peptideIds: [],
    });
  }
  if (recoveryTrend >= TREND_THRESHOLD) {
    insights.push({
      icon: "trending-up-outline",
      color: "#4ade80",
      title: "Recovery is getting better",
      detail: "Recovery scores are trending up. You're adapting and bouncing back faster.",
      peptideIds: [],
    });
  }

  // Notes-based keyword analysis
  const allNotes = recent
    .map((e) => (e.notes || "").toLowerCase())
    .join(" ");

  const notePatterns: { keywords: string[]; icon: keyof typeof Ionicons.glyphMap; color: string; title: string; detail: string; peptideIds: string[] }[] = [
    {
      keywords: ["pain", "injury", "hurt", "torn", "sprain", "strain", "tendon", "ligament", "joint", "knee", "shoulder", "back pain", "elbow", "wrist", "ankle"],
      icon: "bandage-outline",
      color: "#f87171",
      title: "You mentioned pain or injury",
      detail: "Based on your notes, healing peptides could accelerate recovery from tissue damage.",
      peptideIds: ["bpc157", "tb500", "wolverine_blend", "ghkcu", "kpv"],
    },
    {
      keywords: ["anxiety", "anxious", "stress", "stressed", "nervous", "panic", "overwhelm", "worry", "tense"],
      icon: "leaf-outline",
      color: "#c084fc",
      title: "Stress & anxiety mentioned",
      detail: "Your notes suggest elevated stress. Anxiolytic peptides may support mental calm.",
      peptideIds: ["selank", "dsip", "cognitive_blend"],
    },
    {
      keywords: ["brain fog", "focus", "concentration", "memory", "forgetful", "mental clarity", "foggy", "scatter", "distracted", "cognitive"],
      icon: "bulb-outline",
      color: "#facc15",
      title: "Cognitive concerns noted",
      detail: "You mentioned focus or cognitive issues. Nootropic peptides may sharpen mental performance.",
      peptideIds: ["semax", "selank", "dihexa", "cognitive_blend"],
    },
    {
      keywords: ["fat", "weight", "belly", "overweight", "lose weight", "stubborn fat", "body fat", "visceral", "cutting", "lean", "slim"],
      icon: "flame-outline",
      color: "#fb923c",
      title: "Weight & fat loss goals noted",
      detail: "Based on your notes, fat-targeting peptides could complement your efforts.",
      peptideIds: ["retatrutide", "semaglutide", "tirzepatide", "aod9604", "tesamorelin", "fat_burner_blend"],
    },
    {
      keywords: ["appetite", "hunger", "cravings", "eating too much", "binge", "snacking", "overeating"],
      icon: "restaurant-outline",
      color: "#fb923c",
      title: "Appetite concerns noted",
      detail: "GLP-1 agonists can help regulate appetite and reduce cravings.",
      peptideIds: ["retatrutide", "semaglutide", "tirzepatide"],
    },
    {
      keywords: ["insomnia", "can't sleep", "waking up", "restless", "trouble sleeping", "sleep issues", "tossing", "turning"],
      icon: "moon-outline",
      color: "#818cf8",
      title: "Sleep issues mentioned in notes",
      detail: "Your notes describe sleep difficulties. Sleep-promoting peptides may help.",
      peptideIds: ["dsip", "sleep_blend", "ipamorelin"],
    },
    {
      keywords: ["aging", "wrinkles", "skin", "hair loss", "hair thin", "grey", "gray", "old", "longevity", "anti-aging", "telomere"],
      icon: "sparkles-outline",
      color: "#c084fc",
      title: "Anti-aging goals noted",
      detail: "Your notes mention aging concerns. Longevity peptides may help at the cellular level.",
      peptideIds: ["epithalon", "ghkcu", "foxo4dri", "humanin", "motsc", "glow_blend"],
    },
    {
      keywords: ["muscle", "gains", "bulk", "strength", "hypertrophy", "lifting", "gym", "mass", "growth hormone"],
      icon: "barbell-outline",
      color: "#60a5fa",
      title: "Muscle & strength goals noted",
      detail: "GH-boosting peptides can support lean mass and recovery from training.",
      peptideIds: ["cjc1295_nodac", "ipamorelin", "cjc_ipa_blend", "mk677", "hexarelin", "triple_gh_blend"],
    },
    {
      keywords: ["sick", "cold", "flu", "immune", "infection", "virus", "covid", "illness", "fever", "gut", "bloat", "digest", "ibs"],
      icon: "shield-checkmark-outline",
      color: "#2dd4bf",
      title: "Immune or gut health mentioned",
      detail: "Your notes suggest immune or digestive concerns. These peptides support immune function and gut healing.",
      peptideIds: ["thymosin_a1", "kpv", "ll37", "bpc157", "klow_blend"],
    },
    {
      keywords: ["libido", "sex", "erectile", "arousal", "intimacy", "desire", "performance"],
      icon: "heart-outline",
      color: "#f472b6",
      title: "Sexual health mentioned",
      detail: "Peptides targeting sexual function may help with desire and performance.",
      peptideIds: ["pt141", "kisspeptin", "gonadorelin"],
    },
    {
      keywords: ["inflammation", "inflamed", "swollen", "swelling", "redness", "chronic pain", "autoimmune", "arthritis"],
      icon: "flame-outline",
      color: "#f87171",
      title: "Inflammation mentioned",
      detail: "Anti-inflammatory peptides can help reduce systemic and localized inflammation.",
      peptideIds: ["bpc157", "kpv", "ll37", "thymosin_a1", "ss31"],
    },
  ];

  const alreadySuggested = new Set(insights.flatMap((i) => i.peptideIds));

  // Track which categories each peptide was suggested for
  const peptideBenefits: Record<string, string[]> = {};
  const matchedPatterns: typeof notePatterns = [];

  for (const pattern of notePatterns) {
    if (pattern.keywords.some((kw) => allNotes.includes(kw))) {
      matchedPatterns.push(pattern);
      const newPeptides = pattern.peptideIds.filter((id) => !alreadySuggested.has(id));
      if (newPeptides.length > 0 || insights.every((i) => i.title !== pattern.title)) {
        insights.push({
          ...pattern,
          peptideIds: pattern.peptideIds,
        });
        pattern.peptideIds.forEach((id) => alreadySuggested.add(id));
      }
      // Track benefits per peptide
      for (const id of pattern.peptideIds) {
        if (!peptideBenefits[id]) peptideBenefits[id] = [];
        peptideBenefits[id].push(pattern.title.replace("You mentioned ", "").replace(" mentioned", "").replace(" noted", "").replace(" mentioned in notes", "").toLowerCase());
      }
    }
  }

  // Also count metric-based insights for peptides
  const metricLabels: Record<string, string> = {
    dsip: "sleep", sleep_blend: "sleep", ipamorelin: "sleep & GH",
    bpc157: "healing", tb500: "healing", wolverine_blend: "healing", ghkcu: "skin & healing",
    cjc1295_nodac: "energy & GH", cjc_ipa_blend: "energy & GH", mk677: "GH & appetite",
    tesamorelin: "fat loss & GH", selank: "mood & calm", semax: "focus",
  };
  for (const insight of insights) {
    for (const id of insight.peptideIds) {
      if (!peptideBenefits[id]) peptideBenefits[id] = [];
    }
  }

  // Highlight multi-benefit peptides
  const multiBenefit = Object.entries(peptideBenefits)
    .filter(([_, benefits]) => benefits.length >= 2)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 3);

  if (multiBenefit.length > 0) {
    const lines = multiBenefit.map(([id, benefits]) => {
      const pep = peptideDB.find((p) => p.id === id);
      const uniqueBenefits = [...new Set(benefits)];
      return `${pep?.name || id} — addresses ${uniqueBenefits.join(", ")}`;
    });
    insights.push({
      icon: "star-outline",
      color: colors.accent,
      title: "Multi-benefit peptides for you",
      detail: `These address multiple concerns from your journal:\n${lines.join("\n")}`,
      peptideIds: multiBenefit.map(([id]) => id),
    });
  }

  // Everything is great
  if (insights.length === 0 && recent.length >= 1) {
    const allGood = avgSleep >= 7 && avgEnergy >= 7 && avgRecovery >= 7 && avgMood >= 7 && avgSoreness >= 6;
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

  // Prioritize: problems first, then trends, then notes, then positives.
  // Cap at 3 to avoid overwhelming the user.
  const priority = (i: Insight): number => {
    const t = i.title.toLowerCase();
    if (t.includes("needs attention") || t.includes("lagging") || t.includes("high ") || t.includes("low ") || t.includes("could be better")) return 0;
    if (t.includes("declining") || t.includes("trending down")) return 1;
    if (t.includes("mentioned") || t.includes("noted") || t.includes("multi-benefit")) return 2;
    return 3; // positives / improving trends
  };
  insights.sort((a, b) => priority(a) - priority(b));
  return insights.slice(0, 3);
}

export default function JournalScreen({ navigation }: any) {
  const { journal, settings, deleteJournalEntry } = useApp();
  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));
  const insights = analyzeJournal(journal);

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
          {sorted.length === 0 && (
            <Text style={styles.journalSubtitle}>Log how you feel daily — StackWise will spot trends and recommend peptides based on your metrics.</Text>
          )}
          {header()}
          {sorted.length >= 3 && <TrendChart entries={sorted} />}
          {sorted.length > 0 && (
            <Text style={styles.swipeHint}>
              <Ionicons name="arrow-back" size={11} color={colors.textSecondary} /> Swipe left to delete
            </Text>
          )}
        </>}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 80, paddingHorizontal: spacing.xl }}>
            <View style={emptyStateStyle.icon}>
              <Ionicons name="book-outline" size={44} color={colors.accent} />
            </View>
            <Text style={emptyStateStyle.title}>No Entries Yet</Text>
            <Text style={emptyStateStyle.subtitle}>
              Start logging your daily metrics — after a few entries, StackWise will analyze your trends and recommend peptides tailored to you.
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
              <MetricSummary entry={item} />
              {item.notes ? (
                <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
              ) : null}
            </TouchableOpacity>
          </Swipeable>
        )}
      />

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

function dotColor(v: number) {
  return v >= 8 ? colors.success : v >= 5 ? colors.warning : colors.error;
}

function MetricSummary({ entry }: { entry: JournalEntry }) {
  const dots = [
    { label: "Sleep", value: entry.sleepQuality },
    { label: "Energy", value: entry.energyLevel },
    { label: "Recovery", value: entry.recoveryScore },
    { label: "Mood", value: entry.mood },
    { label: "Soreness", value: entry.soreness },
  ];
  const avg = dots.reduce((s, d) => s + d.value, 0) / dots.length;
  const avgColor = dotColor(avg);
  const worst = dots.reduce((lo, d) => (d.value < lo.value ? d : lo), dots[0]);
  return (
    <View style={styles.summary}>
      <View style={styles.summaryAvg}>
        <Text style={[styles.summaryAvgValue, { color: avgColor }]}>{avg.toFixed(1)}</Text>
        <Text style={styles.summaryAvgLabel}>avg</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.dotRow}>
          {dots.map((d) => (
            <View key={d.label} style={styles.dotItem}>
              <View style={[styles.dot, { backgroundColor: dotColor(d.value) }]} />
              <Text style={styles.dotLabel}>{d.label}</Text>
            </View>
          ))}
        </View>
        {worst.value <= 4 && (
          <Text style={styles.worstText}>Low {worst.label.toLowerCase()}: {worst.value}/10</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  journalTitle: { fontSize: 28, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.md, marginBottom: 4 },
  journalSubtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: spacing.md, lineHeight: 18 },
  // Insights
  insightsSection: { paddingHorizontal: spacing.md, paddingTop: 4, marginBottom: 8 },
  insightsTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm,
  },
  insightCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm,
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
  card: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    marginHorizontal: spacing.md, marginTop: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  cardDate: { fontSize: 16, fontWeight: "700", color: colors.text },
  cardWeight: { fontSize: 14, fontWeight: "600", color: colors.accent },
  metrics: { flexDirection: "row", gap: 4, marginBottom: 8 },
  summary: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 },
  summaryAvg: { alignItems: "center", minWidth: 44 },
  summaryAvgValue: { fontSize: 22, fontWeight: "800" },
  summaryAvgLabel: { fontSize: 9, color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 0.5, marginTop: -2 },
  dotRow: { flexDirection: "row", justifyContent: "space-between" },
  dotItem: { alignItems: "center", gap: 3, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotLabel: { fontSize: 9, color: colors.textSecondary, fontWeight: "600" },
  worstText: { fontSize: 11, color: colors.textSecondary, marginTop: 6 },
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
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  chartTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm,
  },
  chartLegend: { flexDirection: "row", gap: 4, marginBottom: spacing.md },
  legendChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  legendDot: { width: 6, height: 6, borderRadius: 3 },
  legendText: { fontSize: 10, fontWeight: "600", color: colors.textSecondary },
  chart: { borderRadius: 12, overflow: "hidden" },
  fab: {
    position: "absolute", bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
});
