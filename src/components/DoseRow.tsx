// ────────────────────────────────────────────────────────────────────
// DoseRow — one peptide's "today" state, tap to navigate to LogDose.
// Extracted from CycleTrackerScreen so Home (ticket 1.1) can render
// the same row without duplicating the dosed/not-dosed UI.
// ────────────────────────────────────────────────────────────────────

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";
import { CyclePeptide, Peptide } from "../types";

interface Props {
  cyclePeptide: CyclePeptide;
  peptide?: Peptide;
  dosed: boolean;
  onPress: () => void;
}

export function DoseRow({ cyclePeptide, peptide, dosed, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${peptide?.name || cyclePeptide.peptideId}, ${dosed ? "dosed today" : "not dosed yet today"}. Tap to log a dose.`}
    >
      <View style={[styles.statusDot, dosed && styles.statusDotDone]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{peptide?.name || cyclePeptide.peptideId}</Text>
        <Text style={styles.dose}>
          {cyclePeptide.doseAmount} {cyclePeptide.doseUnit} · {cyclePeptide.frequency}
        </Text>
      </View>
      <Ionicons
        name={dosed ? "checkmark-circle" : "add-circle-outline"}
        size={28}
        color={dosed ? colors.success : colors.accent}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  statusDotDone: { backgroundColor: colors.success },
  name: { fontSize: 15, fontWeight: "600", color: colors.text },
  dose: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
