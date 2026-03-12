import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { colors, spacing } from "../../theme";
import { format, parseISO } from "date-fns";

const RATING_LABELS = ["", "Poor", "Low", "Average", "Good", "Excellent"];

export default function JournalScreen({ navigation }: any) {
  const { journal, settings } = useApp();
  const sorted = [...journal].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
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
            </View>
            {item.notes ? (
              <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text>
            ) : null}
          </TouchableOpacity>
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

function MetricBadge({ label, value }: { label: string; value: number }) {
  const color = value >= 4 ? colors.success : value >= 3 ? colors.warning : colors.error;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeLabel}>{label}</Text>
      <Text style={[styles.badgeValue, { color }]}>{value}/5</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 60 : 0 },
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
  metrics: { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge: {
    flex: 1, backgroundColor: colors.background, borderRadius: 8,
    padding: 8, alignItems: "center",
  },
  badgeLabel: { fontSize: 10, color: colors.textSecondary, marginBottom: 2 },
  badgeValue: { fontSize: 14, fontWeight: "700" },
  notes: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  fab: {
    position: "absolute", bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
});
