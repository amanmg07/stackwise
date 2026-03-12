import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { format, differenceInDays, parseISO } from "date-fns";

export default function CycleTrackerScreen({ navigation }: any) {
  const { cycles, doseLogs } = useApp();
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
  const elapsed = differenceInDays(new Date(), start);
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
          <Text style={styles.cycleName}>{activeCycle.name}</Text>
          <Text style={styles.dateRange}>
            {format(start, "MMM d")} — {format(end, "MMM d, yyyy")}
          </Text>

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
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  empty: {
    flex: 1, backgroundColor: colors.background,
    justifyContent: "center", alignItems: "center", padding: spacing.xl,
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
  cycleName: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 4 },
  dateRange: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
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
  logBtn: { padding: 4 },
  logRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  logName: { fontSize: 14, fontWeight: "600", color: colors.text },
  logMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  logTime: { fontSize: 12, color: colors.textSecondary },
});
