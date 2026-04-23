import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides } from "../../data/peptides";
import { colors, spacing, safeTop, safeBottom } from "../../theme";
import { format, parseISO, differenceInDays } from "date-fns";

export default function CycleDetailScreen({ route }: any) {
  const { cycleId } = route.params;
  const { cycles, doseLogs } = useApp();
  const cycle = cycles.find((c) => c.id === cycleId);

  if (!cycle) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Cycle not found</Text>
      </View>
    );
  }

  const start = parseISO(cycle.startDate);
  const end = parseISO(cycle.endDate);
  const totalDays = differenceInDays(end, start);
  const cycleLogs = doseLogs
    .filter((l) => l.cycleId === cycleId)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingBottom: safeBottom }}
      data={cycleLogs}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.cycleName}>{cycle.name}</Text>
          <Text style={styles.dateRange}>
            {format(start, "MMM d, yyyy")} — {format(end, "MMM d, yyyy")}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{totalDays}</Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{cycle.peptides.length}</Text>
              <Text style={styles.statLabel}>Compounds</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{cycleLogs.length}</Text>
              <Text style={styles.statLabel}>Doses</Text>
            </View>
          </View>

          {/* Peptide list */}
          <Text style={styles.sectionTitle}>Protocol</Text>
          {cycle.peptides.map((cp) => {
            const pep = peptides.find((p) => p.id === cp.peptideId);
            const doseCount = cycleLogs.filter((l) => l.peptideId === cp.peptideId).length;
            return (
              <View key={cp.peptideId} style={styles.peptideRow}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.peptideName}>{pep?.name || cp.peptideId}</Text>
                    {pep?.compoundType === "supplement" && (
                      <Ionicons name="leaf-outline" size={13} color="#4ade80" />
                    )}
                  </View>
                  <Text style={styles.peptideDose}>
                    {cp.doseAmount} {cp.doseUnit} · {cp.frequency} · {cp.route}
                  </Text>
                </View>
                <Text style={styles.doseCount}>{doseCount} doses</Text>
              </View>
            );
          })}

          {cycle.notes ? (
            <>
              <Text style={styles.sectionTitle}>Notes</Text>
              <View style={styles.notesCard}>
                <Text style={styles.notesText}>{cycle.notes}</Text>
              </View>
            </>
          ) : null}

          {cycleLogs.length > 0 && (
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Dose History</Text>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.emptyLogs}>
          <Ionicons name="document-text-outline" size={32} color={colors.border} />
          <Text style={styles.emptyLogsText}>No doses were logged for this cycle</Text>
        </View>
      }
      renderItem={({ item }) => {
        const pep = peptides.find((p) => p.id === item.peptideId);
        return (
          <View style={styles.logRow}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                <Text style={styles.logName}>{pep?.name || item.peptideId}</Text>
                {pep?.compoundType === "supplement" && (
                  <Ionicons name="leaf-outline" size={12} color="#4ade80" />
                )}
              </View>
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
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: safeTop },
  empty: { flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" },
  emptyText: { fontSize: 16, color: colors.textSecondary },
  cycleName: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 4 },
  dateRange: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.accent },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10,
  },
  peptideRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  peptideName: { fontSize: 15, fontWeight: "600", color: colors.text },
  peptideDose: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  doseCount: { fontSize: 13, fontWeight: "600", color: colors.accent },
  notesCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  notesText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  emptyLogs: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyLogsText: { fontSize: 14, color: colors.textSecondary },
  logRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  logName: { fontSize: 14, fontWeight: "600", color: colors.text },
  logMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  logTime: { fontSize: 12, color: colors.textSecondary },
});
