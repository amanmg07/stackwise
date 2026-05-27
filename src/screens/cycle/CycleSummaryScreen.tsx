// ────────────────────────────────────────────────────────────────────
// CycleSummaryScreen — end-of-cycle reflection (ticket 1.5).
//
// Pre-1.5, finishing a cycle was a dead-end: the user invested
// 8-16 weeks of logging and got a silent "ended" toast. This screen
// turns the end-of-cycle moment into a *payoff*:
//   - Visible recap of what they did (total days, dose count)
//   - Outcome scores side-by-side across week 4/8/12/16
//   - Journal-derived deltas (first week vs last week of the cycle)
//   - Top side effects logged during the cycle
//   - "Run this cycle again" → clones into NewCycle one tap from here
//
// Edge cases: cycles ended in their first week skip the deltas and
// outcomes sections (no signal). Cycles with no journal entries skip
// the deltas card. Cycles with no outcomes skip that card. The
// summary always renders the totals + the action buttons.
// ────────────────────────────────────────────────────────────────────

import React from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { useApp } from "../../context/AppContext";
import { colors, spacing, safeTop, safeBottom, highlights } from "../../theme";
import {
  JournalEntry, OUTCOME_WEEKS, OutcomeWeek, normalizeSideEffects, AdverseEvent,
} from "../../types";

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((s, n) => s + n, 0) / arr.length;
}

function fmtDelta(delta: number): { text: string; color: string } {
  const rounded = Math.round(delta * 10) / 10;
  if (Math.abs(rounded) < 0.5) return { text: `flat at ±${Math.abs(rounded)}`, color: colors.textSecondary };
  if (rounded > 0) return { text: `up ${rounded.toFixed(1)}`, color: colors.success };
  return { text: `down ${Math.abs(rounded).toFixed(1)}`, color: colors.warning };
}

export default function CycleSummaryScreen({ route, navigation }: any) {
  const { cycles, doseLogs, journal, outcomes } = useApp();
  const cycleId: string | undefined = route.params?.cycleId;
  const cycle = cycles.find((c) => c.id === cycleId);

  if (!cycle) {
    return (
      <View style={styles.container}>
        <Text style={styles.fallbackTitle}>Cycle not found</Text>
        <Text style={styles.fallbackDesc}>It may have been deleted.</Text>
      </View>
    );
  }

  const start = parseISO(cycle.startDate + "T00:00:00");
  const end = parseISO(cycle.endDate + "T00:00:00");
  const totalDays = Math.max(differenceInCalendarDays(end, start), 1);
  const completedDays = Math.min(totalDays, Math.max(0, differenceInCalendarDays(end, start)));
  const wasShortCycle = completedDays < 7;

  // Doses logged across the entire cycle (timestamp-based filter is fine
  // here — we're aggregating, not displaying a per-day grid).
  const cycleDoseLogs = doseLogs.filter((l) => l.cycleId === cycle.id);

  // Cycle outcomes ordered week 4 → 16, only those that were answered.
  const cycleOutcomes = outcomes
    .filter((o) => o.cycleId === cycle.id)
    .sort((a, b) => a.weekNumber - b.weekNumber);

  // Journal entries that fall within the cycle window. Date is local
  // YYYY-MM-DD (see streak.ts notes); same key shape as cycle.startDate.
  const cycleJournal = journal
    .filter((e) => e.date >= cycle.startDate && e.date <= cycle.endDate)
    .sort((a, b) => a.date.localeCompare(b.date));

  // First-7-days vs last-7-days delta (the cleanest before/after
  // comparison). Requires at least one entry in each window — otherwise
  // we'd be comparing against an empty set and the number would lie.
  const firstWeekEnd = format(
    new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd",
  );
  const lastWeekStart = format(
    new Date(end.getTime() - 6 * 24 * 60 * 60 * 1000),
    "yyyy-MM-dd",
  );
  const firstWeek = cycleJournal.filter((e) => e.date <= firstWeekEnd);
  const lastWeek = cycleJournal.filter((e) => e.date >= lastWeekStart);
  const showDeltas =
    !wasShortCycle && firstWeek.length >= 1 && lastWeek.length >= 1 && cycleJournal.length >= 4;

  const deltas = showDeltas
    ? [
        {
          label: "Sleep quality",
          delta: avg(lastWeek.map((e) => e.sleepQuality)) - avg(firstWeek.map((e) => e.sleepQuality)),
        },
        {
          label: "Energy",
          delta: avg(lastWeek.map((e) => e.energyLevel)) - avg(firstWeek.map((e) => e.energyLevel)),
        },
        {
          label: "Recovery",
          delta: avg(lastWeek.map((e) => e.recoveryScore)) - avg(firstWeek.map((e) => e.recoveryScore)),
        },
        {
          label: "Mood",
          delta: avg(lastWeek.map((e) => e.mood)) - avg(firstWeek.map((e) => e.mood)),
        },
      ]
    : [];

  // Side effects — count occurrences across both journal entries and
  // outcome check-ins for this cycle. Normalize via the canonical
  // helper so "Headache" and "headache" coalesce.
  const seCounts = new Map<string, number>();
  const collect = (raw?: AdverseEvent[] | string[]) => {
    for (const ev of normalizeSideEffects(raw)) {
      const key = ev.effect.toLowerCase();
      seCounts.set(key, (seCounts.get(key) || 0) + 1);
    }
  };
  for (const e of cycleJournal) collect(e.sideEffects);
  for (const o of cycleOutcomes) collect(o.sideEffectsReported);
  const topSE = [...seCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const onShare = async () => {
    try {
      const summary = [
        `${cycle.name} — ${completedDays} days`,
        cycleOutcomes.length > 0
          ? `Outcomes: ${cycleOutcomes.map((o) => `W${o.weekNumber} ${o.overallScore}/10`).join(", ")}`
          : null,
        showDeltas
          ? `Sleep ${fmtDelta(deltas[0].delta).text}, Energy ${fmtDelta(deltas[1].delta).text}`
          : null,
        "Shared from StackWise",
      ]
        .filter(Boolean)
        .join("\n");
      await Share.share({ message: summary });
    } catch {}
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      {/* Hero */}
      <View style={styles.heroRow}>
        <Ionicons name="checkmark-circle" size={28} color={colors.success} />
        <Text style={styles.heroTitle}>
          {wasShortCycle ? "Cycle ended early" : "Cycle complete"}
        </Text>
      </View>
      <Text style={styles.cycleName}>{cycle.name}</Text>
      <Text style={styles.dateRange}>
        {format(start, "MMM d")} — {format(end, "MMM d, yyyy")}
      </Text>

      {/* Totals */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{completedDays}</Text>
          <Text style={styles.statLabel}>day{completedDays === 1 ? "" : "s"}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{cycleDoseLogs.length}</Text>
          <Text style={styles.statLabel}>dose{cycleDoseLogs.length === 1 ? "" : "s"} logged</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{cycleJournal.length}</Text>
          <Text style={styles.statLabel}>journal entr{cycleJournal.length === 1 ? "y" : "ies"}</Text>
        </View>
      </View>

      {/* Outcome check-ins */}
      {cycleOutcomes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outcome check-ins</Text>
          {OUTCOME_WEEKS.map((w: OutcomeWeek) => {
            const o = cycleOutcomes.find((x) => x.weekNumber === w);
            if (!o) return null;
            return (
              <View key={w} style={styles.outcomeRow}>
                <Text style={styles.outcomeWeek}>Week {w}</Text>
                <View style={styles.outcomeScores}>
                  <Text style={styles.outcomeScore}>Overall {o.overallScore}/10</Text>
                  <Text style={styles.outcomeScoreSecondary}>
                    · energy {o.energyScore} · recovery {o.recoveryScore}
                  </Text>
                </View>
                {o.wouldRepeat && (
                  <View style={styles.repeatBadge}>
                    <Text style={styles.repeatBadgeText}>repeat ✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Journal deltas */}
      {showDeltas && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What changed</Text>
          <Text style={styles.sectionSubtitle}>
            First week vs last week — averaged across your journal entries.
          </Text>
          {deltas.map((d) => {
            const f = fmtDelta(d.delta);
            return (
              <View key={d.label} style={styles.deltaRow}>
                <Text style={styles.deltaLabel}>{d.label}</Text>
                <Text style={[styles.deltaValue, { color: f.color }]}>{f.text}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Top side effects */}
      {topSE.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Side effects logged</Text>
          {topSE.map(([effect, n]) => (
            <View key={effect} style={styles.seRow}>
              <Text style={styles.seName}>{effect}</Text>
              <Text style={styles.seCount}>
                {n} day{n === 1 ? "" : "s"}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.replace("NewCycle", { cloneFromCycleId: cycle.id })}
        activeOpacity={0.85}
      >
        <Ionicons name="refresh" size={18} color={colors.background} />
        <Text style={styles.primaryBtnText}>Run this cycle again</Text>
      </TouchableOpacity>

      <View style={styles.secondaryRow}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onShare} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={16} color={colors.accent} />
          <Text style={styles.secondaryBtnText}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>Done</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: safeTop },
  fallbackTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 60 },
  fallbackDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 6 },

  heroRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  heroTitle: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", letterSpacing: 1 },
  cycleName: { fontSize: 26, fontWeight: "800", color: colors.text, marginTop: 6, letterSpacing: -0.5 },
  dateRange: { fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },

  statsRow: { flexDirection: "row", gap: 10, marginBottom: spacing.lg },
  statCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, alignItems: "center",
  },
  statValue: { fontSize: 26, fontWeight: "800", color: highlights.white, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4, textAlign: "center" },

  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: 8 },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginBottom: 10, lineHeight: 17 },

  outcomeRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  outcomeWeek: { fontSize: 13, fontWeight: "700", color: colors.accent, width: 60 },
  outcomeScores: { flex: 1 },
  outcomeScore: { fontSize: 14, fontWeight: "600", color: colors.text },
  outcomeScoreSecondary: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  repeatBadge: { backgroundColor: colors.success + "20", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  repeatBadgeText: { fontSize: 10, color: colors.success, fontWeight: "700" },

  deltaRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  deltaLabel: { fontSize: 13, color: colors.text, fontWeight: "600" },
  deltaValue: { fontSize: 13, fontWeight: "700" },

  seRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  seName: { fontSize: 13, color: colors.text, textTransform: "capitalize" },
  seCount: { fontSize: 12, color: colors.textSecondary },

  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 8,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },

  secondaryRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  secondaryBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: "600", color: colors.accent },
});
