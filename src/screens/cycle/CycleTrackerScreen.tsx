import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Share, Alert, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides } from "../../data/peptides";
import { colors, spacing, safeTop } from "../../theme";
import { format, differenceInDays, parseISO } from "date-fns";

export default function CycleTrackerScreen({ navigation }: any) {
  const { cycles, doseLogs, deleteCycle, deleteDoseLog, updateCycle } = useApp();
  const activeCycle = cycles.find((c) => c.isActive);

  if (!activeCycle) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="calendar-outline" size={40} color={colors.border} />
        </View>
        <Text style={styles.emptyTitle}>No Active Cycle</Text>
        <Text style={styles.emptySubtext}>
          Start a new cycle to track your peptide protocol
        </Text>
        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => navigation.navigate("NewCycle")}
        >
          <Ionicons name="add" size={20} color={colors.background} />
          <Text style={styles.startBtnText}>Start New Cycle</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const start = parseISO(activeCycle.startDate);
  const end = parseISO(activeCycle.endDate);
  const totalDays = differenceInDays(end, start);
  const elapsed = differenceInDays(new Date(), start) + 1;
  const progress = Math.min(Math.max(elapsed / totalDays, 0), 1);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const todayLogs = doseLogs.filter(
    (l) => l.cycleId === activeCycle.id && l.timestamp.startsWith(todayStr)
  );

  const recentLogs = doseLogs
    .filter((l) => l.cycleId === activeCycle.id)
    .slice(0, 10);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
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
                Alert.alert(
                  "Delete Cycle",
                  `Delete "${activeCycle.name}"? This will remove the cycle and all its data. This cannot be undone.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteCycle(activeCycle.id) },
                  ]
                );
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
                const msg = `My Stack: ${activeCycle.name}\n\nPeptides:\n${pepList}\n\nDay ${elapsed} of ${totalDays}\n\nShared from StackWise`;
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
                `End "${activeCycle.name}" early? It will be marked as completed with today's date.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "End Cycle",
                    onPress: () => {
                      updateCycle({
                        ...activeCycle,
                        isActive: false,
                        endDate: new Date().toISOString().split("T")[0],
                      });
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="checkmark-done-outline" size={16} color={colors.accent} />
            <Text style={styles.endBtnText}>End Cycle</Text>
          </TouchableOpacity>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>
              Day {elapsed} of {totalDays}
            </Text>
          </View>

          {/* Today's peptides */}
          <Text style={styles.sectionTitle}>Today's Protocol</Text>
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
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Doses</Text>
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
  empty: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: "center", alignItems: "center", padding: spacing.xl, paddingTop: safeTop,
  },
  emptyIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 32 },
  startBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, paddingHorizontal: 32,
  },
  startBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  cycleHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 16 },
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
  progressContainer: { marginBottom: 24 },
  progressBar: {
    height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: "hidden",
    borderWidth: 1, borderColor: colors.border,
  },
  progressFill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  progressText: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
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
  endBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.accent + "15", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16,
    borderWidth: 1, borderColor: colors.accent + "30", marginBottom: 16,
  },
  endBtnText: { fontSize: 13, fontWeight: "700", color: colors.accent },
  swipeDelete: {
    backgroundColor: colors.error, justifyContent: "center", alignItems: "center",
    width: 80, borderRadius: 10, marginBottom: 8,
  },
  swipeDeleteText: { color: "#fff", fontSize: 11, fontWeight: "600", marginTop: 4 },
});
