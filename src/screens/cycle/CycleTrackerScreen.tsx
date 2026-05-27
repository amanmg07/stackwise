import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Share, Alert, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides } from "../../data/peptides";
import { colors, highlights, spacing, safeTop, safeBottom, emptyStateStyle } from "../../theme";
import InjectionGuide from "../../components/InjectionGuide";
import { format, differenceInDays, parseISO, differenceInCalendarDays } from "date-fns";
import { trackCycleEnded } from "../../services/analyticsService";
import { OUTCOME_WEEKS, OutcomeWeek, CycleEndReason } from "../../types";

export default function CycleTrackerScreen({ navigation }: any) {
  const { cycles, doseLogs, outcomes, deleteCycle, deleteDoseLog, updateCycle } = useApp();
  const activeCycle = cycles.find((c) => c.isActive);

  if (!activeCycle) {
    return (
      <View style={emptyStateStyle.container}>
        <View style={emptyStateStyle.icon}>
          <Ionicons name="repeat-outline" size={44} color={colors.accent} />
        </View>
        <Text style={emptyStateStyle.title}>Ready when you are</Text>
        <Text style={emptyStateStyle.subtitle}>
          Start a new cycle to track your cycle, log doses, and see how it's working.
        </Text>
        <Text style={emptyStateStyle.hint}>
          Tip: try a pre-built cycle from the Home tab for a quick start.
        </Text>
        <TouchableOpacity
          style={emptyStateStyle.button}
          onPress={() => navigation.navigate("NewCycle")}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={emptyStateStyle.buttonText}>Start New Cycle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const todayDate = new Date().toISOString().split("T")[0];
  const start = parseISO(activeCycle.startDate + "T00:00:00");
  const end = parseISO(activeCycle.endDate + "T00:00:00");
  const totalDays = differenceInDays(end, start);

  const todayLogs = doseLogs.filter(
    (l) => l.cycleId === activeCycle.id && l.timestamp.startsWith(todayDate)
  );

  // Count days where every peptide that was active on that day got logged.
  // A peptide added mid-cycle doesn't count toward the requirement for
  // earlier days — appending a peptide should never retroactively
  // un-complete previously-finished days.
  const cycleLogs = doseLogs.filter((l) => l.cycleId === activeCycle.id);
  const logDays = new Set(cycleLogs.map((l) => l.timestamp.split("T")[0]));

  // Precompute when each peptide became active in this cycle.
  // Priority: explicit addedAt → earliest dose log → today (just added, no logs yet).
  const peptideActiveSince: Record<string, string> = {};
  for (const cp of activeCycle.peptides) {
    if (cp.addedAt) {
      peptideActiveSince[cp.peptideId] = cp.addedAt;
      continue;
    }
    const earliest = cycleLogs
      .filter((l) => l.peptideId === cp.peptideId)
      .map((l) => l.timestamp.split("T")[0])
      .sort()[0];
    peptideActiveSince[cp.peptideId] = earliest || todayDate;
  }

  // Find the earliest milestone week (4/8/12/16) that's due but not yet
  // completed. Returns null if none — either nothing is due, or every
  // overdue milestone has already been answered.
  const daysSinceStart = differenceInCalendarDays(
    new Date(),
    parseISO(activeCycle.startDate + "T00:00:00"),
  );
  const completedWeeks = new Set(
    outcomes.filter((o) => o.cycleId === activeCycle.id).map((o) => o.weekNumber),
  );
  const dueWeek: OutcomeWeek | null =
    OUTCOME_WEEKS.find((w) => daysSinceStart >= w * 7 && !completedWeeks.has(w)) ?? null;

  let completedDays = 0;
  logDays.forEach((day) => {
    const expectedPeps = activeCycle.peptides.filter(
      (cp) => peptideActiveSince[cp.peptideId] <= day
    );
    if (expectedPeps.length === 0) return;
    const uniquePeps = new Set(
      cycleLogs.filter((l) => l.timestamp.startsWith(day)).map((l) => l.peptideId)
    );
    const allLogged = expectedPeps.every((cp) => uniquePeps.has(cp.peptideId));
    if (allLogged) completedDays++;
  });
  const progress = Math.min(Math.max(completedDays / totalDays, 0), 1);

  const recentLogs = doseLogs
    .filter((l) => l.cycleId === activeCycle.id)
    .slice(0, 10);

  // End-cycle flow extracted so the delete-redirect "End Cycle"
  // button can reuse it without showing the initial "End Cycle?"
  // confirm a second time. promptReasonAndFinalize() goes straight
  // to the reason picker (or silently finalizes 'completed' if the
  // cycle has already passed its planned end).
  const promptReasonAndFinalize = () => {
    const now = new Date();
    const plannedEnd = parseISO(activeCycle.endDate + "T00:00:00");
    const endingEarly = now < plannedEnd;
    const finalize = (reason: CycleEndReason) => {
      const endDate = now.toISOString().split("T")[0];
      const durationDays = differenceInCalendarDays(now, parseISO(activeCycle.startDate));
      const plannedDays = Math.max(
        differenceInDays(parseISO(activeCycle.endDate + "T00:00:00"), parseISO(activeCycle.startDate + "T00:00:00")),
        1,
      );
      updateCycle({ ...activeCycle, isActive: false, endDate });
      trackCycleEnded({
        cycleId: activeCycle.id,
        peptideIds: activeCycle.peptides.map((p) => p.peptideId),
        durationDays,
        reason,
        expectedDays: plannedDays,
        completedDays,
        totalDosesLogged: cycleLogs.length,
      });
      // Ticket 1.5: route the user into the cycle-summary payoff
      // screen instead of dropping them on an empty cycle tracker.
      // replace() rather than navigate() so the back button doesn't
      // return them to a tracker that no longer has an active cycle.
      navigation.replace("CycleSummary", { cycleId: activeCycle.id });
    };
    if (!endingEarly) {
      finalize("completed");
      return;
    }
    Alert.alert("Why are you ending early?", "Picking a reason helps you and other users learn what works.", [
      { text: "Side effects", onPress: () => finalize("side_effects") },
      { text: "Goal achieved", onPress: () => finalize("goal_achieved") },
      { text: "Cost", onPress: () => finalize("cost") },
      { text: "Other", onPress: () => finalize("other") },
    ]);
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: safeBottom }}
      data={recentLogs}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          {/* Cycle header */}
          <View style={styles.cycleHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cycleName}>{activeCycle.name}</Text>
              <Text style={styles.dateRange}>
                {format(start, "MMM d")} — {format(end, "MMM d, yyyy")}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => {
                const hasActivity = cycleLogs.length > 0;
                const doDelete = () =>
                  Alert.alert(
                    "Delete Cycle",
                    `Delete "${activeCycle.name}"? This will remove the cycle and all its data. This cannot be undone.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteCycle(activeCycle.id) },
                    ]
                  );

                // If the cycle has dose logs, the user probably meant
                // End Cycle (preserves history + records a reason).
                // Surface that option before letting them destroy data.
                if (hasActivity) {
                  Alert.alert(
                    "Stop tracking this cycle?",
                    `"${activeCycle.name}" has ${cycleLogs.length} dose ${cycleLogs.length === 1 ? "log" : "logs"}. Did you mean to end it instead? "End Cycle" preserves your history; "Delete" permanently erases everything.`,
                    [
                      { text: "Cancel", style: "cancel" },
                      { text: "End Cycle", onPress: promptReasonAndFinalize },
                      { text: "Delete", style: "destructive", onPress: doDelete },
                    ]
                  );
                } else {
                  doDelete();
                }
              }}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("NewCycle", { editCycleId: activeCycle.id })}
            >
              <Ionicons name="create-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={async () => {
                const pepList = activeCycle.peptides
                  .map((cp) => {
                    const pep = peptides.find((p) => p.id === cp.peptideId);
                    return `  ${pep?.name || cp.peptideId} — ${cp.doseAmount} ${cp.doseUnit}, ${cp.frequency}`;
                  })
                  .join("\n");
                const msg = `My Stack: ${activeCycle.name}\n\nPeptides:\n${pepList}\n\nDay ${completedDays} of ${totalDays} completed\n\nShared from StackWise`;
                try { await Share.share({ message: msg }); } catch {}
              }}
            >
              <Ionicons name="share-outline" size={20} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* End cycle */}
          <TouchableOpacity
            style={styles.endBtn}
            onPress={() => {
              Alert.alert(
                "End Cycle",
                `End "${activeCycle.name}"? It will be marked as completed with today's date.`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "End Cycle", onPress: promptReasonAndFinalize },
                ]
              );
            }}
          >
            <Ionicons name="checkmark-done-outline" size={16} color={colors.accent} />
            <Text style={styles.endBtnText}>End Cycle</Text>
          </TouchableOpacity>

          {/* Outcome check-in due banner */}
          {dueWeek !== null && (
            <TouchableOpacity
              style={styles.checkInBanner}
              onPress={() =>
                navigation.navigate("OutcomeCheckIn", {
                  cycleId: activeCycle.id,
                  weekNumber: dueWeek,
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <Text style={styles.checkInBannerTitle}>Week {dueWeek} check-in is due</Text>
                <Text style={styles.checkInBannerDesc}>
                  ~60-second standardized check-in. Helps track this cycle's outcome.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.accent} />
            </TouchableOpacity>
          )}

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Day {completedDays} of {totalDays} completed
            </Text>
          </View>

          {/* Injection guide — only when a compound in this cycle is injected */}
          {activeCycle.peptides.some((cp) => cp.route === "subcutaneous" || cp.route === "intramuscular") && (
            <InjectionGuide />
          )}

          {/* Today's peptides */}
          <Text style={styles.sectionTitle}>Today's Cycle</Text>
          {activeCycle.peptides.map((cp) => {
            const pep = peptides.find((p) => p.id === cp.peptideId);
            const dosed = todayLogs.some((l) => l.peptideId === cp.peptideId);
            return (
              <TouchableOpacity
                key={cp.peptideId}
                style={styles.peptideRow}
                onPress={() =>
                  navigation.navigate("LogDose", {
                    cycleId: activeCycle.id,
                    peptideId: cp.peptideId,
                  })
                }
              >
                <View style={[styles.statusDot, dosed && styles.statusDotDone]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.peptideName}>{pep?.name || cp.peptideId}</Text>
                  <Text style={styles.peptideDose}>
                    {cp.doseAmount} {cp.doseUnit} · {cp.frequency}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.logBtn}
                  onPress={() =>
                    navigation.navigate("LogDose", {
                      cycleId: activeCycle.id,
                      peptideId: cp.peptideId,
                    })
                  }
                >
                  <Ionicons
                    name={dosed ? "checkmark-circle" : "add-circle-outline"}
                    size={28}
                    color={dosed ? colors.success : colors.accent}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {recentLogs.length > 0 && (
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Recent Doses</Text>
          )}
        </>
      }
      renderItem={({ item }) => {
        const pep = peptides.find((p) => p.id === item.peptideId);
        return (
          <Swipeable
            renderRightActions={(progress, dragX) => {
              const scale = dragX.interpolate({
                inputRange: [-80, 0],
                outputRange: [1, 0.5],
                extrapolate: "clamp",
              });
              return (
                <TouchableOpacity
                  style={styles.swipeDelete}
                  onPress={() => {
                    Alert.alert("Delete Dose", `Delete this ${pep?.name || item.peptideId} dose log?`, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => deleteDoseLog(item.id) },
                    ]);
                  }}
                >
                  <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.swipeDeleteText}>Delete</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            }}
          >
            <View style={styles.logRow}>
              <View>
                <Text style={styles.logName}>{pep?.name || item.peptideId}</Text>
                <Text style={styles.logMeta}>
                  {item.amount} {item.unit} · {item.route}
                  {item.site ? ` · ${item.site}` : ""}
                </Text>
              </View>
              <Text style={styles.logTime}>
                {format(parseISO(item.timestamp), "MMM d, h:mm a")}
              </Text>
            </View>
          </Swipeable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: safeTop },
  cycleHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: spacing.md },
  deleteBtn: {
    padding: 10, backgroundColor: colors.error + "15", borderRadius: 10,
    borderWidth: 1, borderColor: colors.error + "30",
  },
  editBtn: {
    padding: 10, backgroundColor: colors.accent + "15", borderRadius: 10,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  shareBtn: {
    padding: 10, backgroundColor: colors.accent + "15", borderRadius: 10,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  cycleName: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 4 },
  dateRange: { fontSize: 14, color: colors.textSecondary },
  progressContainer: { marginBottom: spacing.lg },
  progressBar: {
    height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: "hidden",
    borderWidth: 1, borderColor: colors.border,
  },
  // PALETTE_V2: yellow progress fill for warmth + achievement feel.
  progressFill: { height: 8, backgroundColor: highlights.yellow, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm,
  },
  peptideRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  statusDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: colors.border },
  statusDotDone: { backgroundColor: colors.success, borderColor: colors.success },
  peptideName: { fontSize: 15, fontWeight: "600", color: colors.text },
  peptideDose: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  logBtn: { paddingVertical: 12, paddingHorizontal: 16 },
  logRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  logName: { fontSize: 14, fontWeight: "600", color: colors.text },
  logMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  logTime: { fontSize: 12, color: colors.textSecondary },
  // PALETTE_V2: red tint for the end-cycle CTA — striking but not garish.
  endBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: highlights.red + "15", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: highlights.red + "40", marginBottom: spacing.md,
  },
  checkInBanner: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.accent + "12", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.accent + "40", marginBottom: spacing.md,
  },
  checkInBannerTitle: { fontSize: 14, fontWeight: "700", color: colors.accent },
  checkInBannerDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  // PALETTE_V2
  endBtnText: { fontSize: 13, fontWeight: "700", color: highlights.red },
  swipeDelete: {
    backgroundColor: colors.error, justifyContent: "center", alignItems: "center",
    width: 80, borderRadius: 10, marginBottom: 8,
  },
  swipeDeleteText: { color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 4 },
});
