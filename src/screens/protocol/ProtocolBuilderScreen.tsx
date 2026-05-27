// ────────────────────────────────────────────────────────────────────
// Home / "Today" surface (ticket 1.1).
//
// Was a stack configurator that asked "what do you want to build?"
// Now answers "what do you do right now?" within ~1 second of open.
// Layout: header, streak strip, today's doses (or empty state),
// today's journal status, milestone banner, build-a-cycle CTA,
// Self Scan CTA.
//
// The route is still named `ProtocolBuilder` so deep links from
// outside this stack continue to land here — the cycle-build flow
// moved to ProtocolPickerScreen.
// ────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image,
  Animated, Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format, parseISO } from "date-fns";
import { useApp } from "../../context/AppContext";
import { colors, highlights, spacing, safeTop, safeBottom } from "../../theme";
import { peptides as peptideDB } from "../../data/peptides";
import { StreakStrip } from "../../components/StreakStrip";
import { DoseRow } from "../../components/DoseRow";
import { computeStreak } from "../../utils/streak";
import {
  computeDueWeek,
  computeNextMilestone,
  selectPeptidesDosedToday,
  cycleDayNumber,
  cycleTotalDays,
} from "../../utils/cycleSelectors";

/** Map a mood score (1–10) to the closest quick-log emoji. */
function moodEmoji(mood: number): string {
  if (mood <= 3) return "😞";
  if (mood <= 6) return "😐";
  if (mood <= 9) return "🙂";
  return "🤩";
}

export default function ProtocolBuilderScreen({ navigation }: any) {
  const { cycles, doseLogs, journal, outcomes } = useApp();
  const activeCycle = cycles.find((c) => c.isActive);

  // Ticket 2.3: past cycles surface as one-tap "Run again" chips
  // beneath the active-cycle card. We don't store templates separately
  // — past cycles ARE the templates. Newest first, capped at 5.
  const pastCycles = cycles
    .filter((c) => !c.isActive)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const streak = computeStreak(journal, doseLogs);
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const todayEntry = journal.find((e) => e.date === todayKey);

  // Ticket 1.6: surface notification-tap doses so the user can review
  // / undo if a misclick happened. Filter on quickLogged + today's
  // local date; the card auto-hides at midnight when these doses
  // stop being "today".
  const todayQuickLoggedDoses = doseLogs.filter((l) => {
    if (!l.quickLogged) return false;
    try {
      return format(parseISO(l.timestamp), "yyyy-MM-dd") === todayKey;
    } catch {
      return false;
    }
  });

  const dosedToday = activeCycle
    ? selectPeptidesDosedToday(activeCycle, doseLogs)
    : new Set<string>();
  const dueWeek = activeCycle ? computeDueWeek(activeCycle, outcomes) : null;
  const nextMilestone = activeCycle ? computeNextMilestone(activeCycle, outcomes) : null;

  // Gentle infinite pulse on Self Scan — flags the marquee feature
  // without being distracting. Preserved from the prior layout.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={{ width: 32 }} />
        <View style={styles.headerCenter}>
          <Image source={require("../../../assets/logo.png")} style={styles.headerLogo} />
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={32} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Streak strip — top of the home column so the loss-aversion
          signal is the first thing the user reads. */}
      <View style={{ marginBottom: spacing.md }}>
        <StreakStrip
          info={streak}
          onPressOpen={() => navigation.navigate("JournalTab")}
          onPressTodayDot={() => navigation.navigate("JournalTab", { screen: "NewEntry" })}
        />
      </View>

      {/* Notification quick-log undo card (ticket 1.6). Auto-hides
          when these doses stop being "today" — no manual dismiss. */}
      {todayQuickLoggedDoses.length > 0 && (
        <TouchableOpacity
          style={styles.undoCard}
          onPress={() => navigation.navigate("CycleTab")}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.undoCardTitle}>
              Logged {todayQuickLoggedDoses.length} dose{todayQuickLoggedDoses.length === 1 ? "" : "s"} from your reminder
            </Text>
            <Text style={styles.undoCardDesc}>
              Tap to review — swipe-left on the cycle tracker to undo any that weren't quite right.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      )}

      {/* Milestone surface — due banner > upcoming countdown > nothing */}
      {activeCycle && dueWeek !== null && (
        <TouchableOpacity
          style={styles.dueBanner}
          onPress={() =>
            navigation.navigate("CycleTab", {
              screen: "OutcomeCheckIn",
              params: { cycleId: activeCycle.id, weekNumber: dueWeek },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.dueBannerTitle}>Week {dueWeek} check-in is due</Text>
            <Text style={styles.dueBannerDesc}>~60 seconds. Helps track this cycle's outcome.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      )}
      {activeCycle && dueWeek === null && nextMilestone && (
        <View style={styles.countdownCard}>
          <Ionicons name="hourglass-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.countdownText}>
            Week {nextMilestone.week} check-in in {nextMilestone.daysAway} day{nextMilestone.daysAway === 1 ? "" : "s"}
          </Text>
        </View>
      )}

      {/* Today's doses */}
      {activeCycle ? (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeaderRow}
            onPress={() => navigation.navigate("CycleTab")}
            activeOpacity={0.7}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Today's Cycle</Text>
              <Text style={styles.sectionSubtitle}>
                {activeCycle.name} · Day {cycleDayNumber(activeCycle)} of {cycleTotalDays(activeCycle)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          {activeCycle.peptides.map((cp) => (
            <DoseRow
              key={cp.peptideId}
              cyclePeptide={cp}
              peptide={peptideDB.find((p) => p.id === cp.peptideId)}
              dosed={dosedToday.has(cp.peptideId)}
              onPress={() =>
                navigation.navigate("CycleTab", {
                  screen: "LogDose",
                  params: { cycleId: activeCycle.id, peptideId: cp.peptideId },
                })
              }
            />
          ))}
        </View>
      ) : (
        <View style={styles.emptyCycleCard}>
          <Text style={styles.emptyCycleTitle}>No active cycle</Text>
          <Text style={styles.emptyCycleDesc}>
            Start one to see today's doses, check-ins, and progress here.
          </Text>
        </View>
      )}

      {/* Today's journal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Journal</Text>
        {todayEntry ? (
          <TouchableOpacity
            style={styles.journalLoggedRow}
            onPress={() => navigation.navigate("JournalTab", { screen: "NewEntry", params: { entryId: todayEntry.id } })}
            activeOpacity={0.7}
          >
            <Text style={styles.journalEmoji}>{moodEmoji(todayEntry.mood)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.journalLoggedTitle}>Logged today</Text>
              <Text style={styles.journalLoggedDesc}>
                Mood {todayEntry.mood}/10 · sleep {todayEntry.sleepQuality}/10 · energy {todayEntry.energyLevel}/10
              </Text>
            </View>
            <Ionicons name="create-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.journalCta}
            onPress={() => navigation.navigate("JournalTab", { screen: "NewEntry" })}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.journalCtaText}>Log today's mood</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Past cycles → one-tap "Run again" chips (ticket 2.3).
          Bypasses the goals/routes flow because the user has already
          declared what they want — past cycles are the templates. */}
      {pastCycles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Run a past cycle again</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {pastCycles.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={styles.cycleChip}
                onPress={() =>
                  navigation.navigate("CycleTab", {
                    screen: "NewCycle",
                    params: { cloneFromCycleId: c.id },
                  })
                }
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={14} color={colors.accent} />
                <Text style={styles.cycleChipText} numberOfLines={1}>
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Build a new cycle */}
      <TouchableOpacity
        style={styles.buildBtn}
        onPress={() => navigation.navigate("ProtocolPicker")}
        activeOpacity={0.85}
      >
        <Ionicons name="flash" size={20} color={colors.background} />
        <Text style={styles.buildBtnText}>
          {activeCycle ? "Build a new cycle" : "Start your first cycle"}
        </Text>
      </TouchableOpacity>

      {/* Self Scan */}
      <Animated.View style={{ transform: [{ scale }], marginTop: 12, borderRadius: 14, overflow: "hidden" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ScannerTab")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["rgba(252,211,77,0.04)", "rgba(245,158,11,0.16)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.selfScanBtn}
          >
            <Ionicons name="scan-outline" size={20} color={highlights.yellow} />
            <Text style={styles.selfScanBtnText}>Self Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: safeTop },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, marginBottom: 8 },
  headerCenter: { alignItems: "center", flex: 1 },
  headerLogo: { width: 140, height: 140, resizeMode: "contain" },
  profileBtn: { padding: 4 },

  section: { marginBottom: spacing.lg },
  sectionHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Empty-cycle state when no active cycle exists.
  emptyCycleCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  emptyCycleTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  emptyCycleDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17 },

  // Outcome check-in DUE banner (urgent).
  dueBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.accent + "12",
    borderColor: colors.accent + "40",
    borderWidth: 1, borderRadius: 14, padding: spacing.md,
    marginBottom: spacing.md,
  },
  dueBannerTitle: { fontSize: 14, fontWeight: "700", color: colors.accent },
  dueBannerDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Upcoming-milestone countdown (informational).
  countdownCard: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
  },
  countdownText: { fontSize: 13, color: colors.textSecondary },

  // Today's journal — logged-state row.
  journalLoggedRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.success + "40",
  },
  journalEmoji: { fontSize: 28 },
  journalLoggedTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  journalLoggedDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Today's journal — not-yet-logged CTA.
  journalCta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent + "10",
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  journalCtaText: { fontSize: 14, fontWeight: "600", color: colors.accent },

  // Primary CTA (build a new cycle).
  buildBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
  },
  buildBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },

  // Self Scan (secondary, pulsed).
  selfScanBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 18,
  },
  selfScanBtnText: { fontSize: 16, fontWeight: "700", color: "#fcd34d" },

  // Ticket 2.3 — past cycles as run-again chips.
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  cycleChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    maxWidth: 200,
  },
  cycleChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.accent,
  },

  // Ticket 1.6 — notification-tap dose-log review surface.
  undoCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.accent + "10",
    borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.accent + "30",
    marginBottom: spacing.md,
  },
  undoCardTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  undoCardDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 16 },
});
