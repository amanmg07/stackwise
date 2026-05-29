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

import React, { useEffect, useRef, useState } from "react";
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
import {
  getOrGenerateWeeklyDigest,
  loadDigestDismissed,
  markDigestDismissed,
  DigestResult,
} from "../../services/weeklyDigest";
import { useToast } from "../../context/ToastContext";
import { trackDoseLogged } from "../../services/analyticsService";
import { generateId } from "../../utils/id";
import { Cycle, CyclePeptide, DoseLog } from "../../types";

/** Map a mood score (1–10) to the closest quick-log emoji. */
function moodEmoji(mood: number): string {
  if (mood <= 3) return "😞";
  if (mood <= 6) return "😐";
  if (mood <= 9) return "🙂";
  return "🤩";
}

export default function ProtocolBuilderScreen({ navigation }: any) {
  const { cycles, doseLogs, journal, outcomes, scans, settings, addDoseLog } = useApp();
  const { showToast } = useToast();
  const activeCycle = cycles.find((c) => c.isActive);

  /**
   * One-tap dose-log from the Home DoseRow's + icon. Inherits the
   * cycle's prescribed amount/unit/route — no per-dose site/source/
   * notes review — so flagged quickLogged=true to keep the buyer
   * dataset's high-fidelity aggregates clean (same posture as the
   * notification-tap path from ticket 1.6).
   */
  const quickLogDose = (cycle: Cycle, cp: CyclePeptide) => {
    const log: DoseLog = {
      id: generateId(),
      cycleId: cycle.id,
      peptideId: cp.peptideId,
      amount: cp.doseAmount,
      unit: cp.doseUnit,
      route: cp.route,
      timestamp: new Date().toISOString(),
      quickLogged: true,
    };
    addDoseLog(log);
    trackDoseLogged({
      doseLogId: log.id,
      cycleId: log.cycleId,
      peptideId: log.peptideId,
      amount: log.amount,
      unit: log.unit,
      route: log.route,
      quickLogged: true,
    });
    const pepName = peptideDB.find((p) => p.id === cp.peptideId)?.name || cp.peptideId;
    showToast(`${pepName} logged`);
  };

  // Ticket 2.1 — weekly AI digest. On mount, check cache (fast path)
  // and only spend Groq tokens if a new week needs one and the user
  // has ≥3 journal entries to summarize. Dismiss state is per-week,
  // so the card returns after the next Sunday digest fires.
  const [digest, setDigest] = useState<DigestResult | null>(null);
  const [digestDismissed, setDigestDismissed] = useState<boolean>(true);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getOrGenerateWeeklyDigest({
        journal, doseLogs, cycles, scans, outcomes, settings,
      });
      if (cancelled) return;
      setDigest(result);
      if (result) {
        const wasDismissed = await loadDigestDismissed(result.weekKey);
        if (!cancelled) setDigestDismissed(wasDismissed);
      }
    })();
    return () => { cancelled = true; };
    // Deliberately empty deps — digest is generated once per session
    // mount. Cache + per-week key ensures we don't regenerate when
    // home re-renders due to other state changes (logging a dose, etc.).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissDigest = () => {
    if (!digest) return;
    markDigestDismissed(digest.weekKey);
    setDigestDismissed(true);
  };

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

      {/* Ticket 2.1 — weekly AI digest card. Above the streak strip
          because this is the "AI talks first" surface — the only
          card whose mere presence is the engagement event. Auto-
          hides when generation is skipped (<3 entries) or after the
          user dismisses for the week. */}
      {digest && !digestDismissed && (
        <View style={styles.digestCard}>
          <View style={styles.digestHeader}>
            <Ionicons name="sparkles-outline" size={18} color={colors.accent} />
            <Text style={styles.digestTitle}>Your week in StackWise</Text>
            <TouchableOpacity
              onPress={dismissDigest}
              hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
            >
              <Ionicons name="close" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.digestBody}>{digest.content}</Text>
        </View>
      )}

      {/* Notification quick-log undo card (ticket 1.6). Auto-hides
          when these doses stop being "today" — no manual dismiss.
          Moved above the streak/milestone block so the streak +
          milestone read as a single visually-contiguous section. */}
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

      {/* Streak + milestone — one logical section ("today's habit
          status"). Inner gap is small so they read as grouped;
          outer marginBottom is the full inter-section gap so the
          next section (Today's Cycle) gets the same breathing room
          as every other section. */}
      <View style={styles.streakSection}>
        <StreakStrip
          info={streak}
          onPressOpen={() => navigation.navigate("JournalTab")}
          onPressTodayDot={() => navigation.navigate("JournalTab", { screen: "NewEntry" })}
        />
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
      </View>

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
              onPressQuickLog={() => quickLogDose(activeCycle, cp)}
            />
          ))}
        </View>
      ) : (
        // Empty-cycle card: punched-up version so first-time users
        // see a clear primary action right at the top of Home
        // instead of having to scroll down to the Build button.
        // Tap → ProtocolPicker (the goals + routes flow).
        <TouchableOpacity
          style={styles.emptyCycleCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("ProtocolPicker")}
        >
          <View style={styles.emptyCycleIcon}>
            <Ionicons name="rocket-outline" size={28} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.emptyCycleTitle}>Start your first cycle</Text>
            <Text style={styles.emptyCycleDesc}>
              Pick a goal and we'll recommend peptides + supplements that fit. Today's doses, check-ins, and progress show up here once you do.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      )}

      {/* Today's journal */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { marginBottom: spacing.xs }]}>Today's Journal</Text>
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
          <Text style={[styles.sectionTitle, { marginBottom: spacing.xs }]}>Run a past cycle again</Text>
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

      {/* Self Scan — sits right under the Build button as a paired
          action; tight gap (spacing.xs = 4px) so the two read as one
          action group rather than two separate sections. */}
      <Animated.View style={{ transform: [{ scale }], marginTop: spacing.xs, borderRadius: 14, overflow: "hidden" }}>
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
  // Streak + milestone wrapper. Inner `gap` keeps them visually
  // grouped as one logical "today's habit status" section; outer
  // marginBottom matches every other section so the page reads
  // with consistent vertical rhythm.
  streakSection: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    // Tight title→content gap (4px) so the header reads as part of
    // the section rather than floating above it.
    marginBottom: spacing.xs,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  sectionSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Empty-cycle state when no active cycle exists.
  emptyCycleCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: 14, padding: spacing.md,
    borderWidth: 1, borderColor: colors.accent + "40",
    marginBottom: spacing.lg,
  },
  emptyCycleIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.accent + "15",
    alignItems: "center", justifyContent: "center",
  },
  emptyCycleTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  emptyCycleDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 17 },

  // Outcome check-in DUE banner (urgent). Lives inside streakSection
  // so its outer margin comes from the wrapper's gap — no marginBottom
  // here.
  dueBanner: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.accent + "12",
    borderColor: colors.accent + "40",
    borderWidth: 1, borderRadius: 14, padding: spacing.md,
  },
  dueBannerTitle: { fontSize: 14, fontWeight: "700", color: colors.accent },
  dueBannerDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  // Upcoming-milestone countdown (informational). Same wrapper as
  // dueBanner — no marginBottom; relies on streakSection's gap.
  countdownCard: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.surface, borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: colors.border,
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

  // Ticket 2.1 — weekly AI digest card.
  digestCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + "30",
    marginBottom: spacing.lg,
  },
  digestHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  digestTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  digestBody: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
  },

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
    marginBottom: spacing.lg,
  },
  undoCardTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  undoCardDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 4, lineHeight: 16 },
});
