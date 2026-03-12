import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides } from "../../data/peptides";
import { colors, spacing } from "../../theme";

export default function PeptideDetailScreen({ route, navigation }: any) {
  const { peptideId } = route.params;
  const peptide = peptides.find((p) => p.id === peptideId);
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(0);

  if (!peptide) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Peptide not found</Text>
      </View>
    );
  }

  const stackPeptides = peptides.filter((p) => peptide.stacksWith.includes(p.id));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{peptide.name}</Text>
        {peptide.abbreviation && peptide.abbreviation !== peptide.name && (
          <Text style={styles.abbr}>{peptide.abbreviation}</Text>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText}>t½ {peptide.halfLife}</Text>
        </View>
        {peptide.routes.map((r) => (
          <View key={r} style={styles.metaPill}>
            <Text style={styles.metaText}>{r}</Text>
          </View>
        ))}
      </View>

      {/* Description */}
      <Text style={styles.desc}>{peptide.description}</Text>

      {/* How it works */}
      <Text style={styles.sectionTitle}>How It Works</Text>
      <View style={styles.card}>
        <Text style={styles.cardBody}>{peptide.mechanism}</Text>
      </View>

      {/* Dosing Protocols */}
      <Text style={styles.sectionTitle}>Dosing Protocols</Text>
      {peptide.dosingProtocols.map((proto, i) => (
        <TouchableOpacity
          key={i}
          style={styles.card}
          onPress={() => setExpandedProtocol(expandedProtocol === i ? null : i)}
          activeOpacity={0.7}
        >
          <View style={styles.protoHeader}>
            <Text style={styles.protoPurpose}>{proto.purpose}</Text>
            <Ionicons
              name={expandedProtocol === i ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textSecondary}
            />
          </View>
          {expandedProtocol === i && (
            <View style={styles.protoDetails}>
              <View style={styles.protoRow}>
                <Text style={styles.protoLabel}>Dose</Text>
                <Text style={styles.protoValue}>{proto.doseRange}</Text>
              </View>
              <View style={styles.protoRow}>
                <Text style={styles.protoLabel}>Frequency</Text>
                <Text style={styles.protoValue}>{proto.frequency}</Text>
              </View>
              <View style={styles.protoRow}>
                <Text style={styles.protoLabel}>Duration</Text>
                <Text style={styles.protoValue}>{proto.cycleDuration}</Text>
              </View>
              <View style={[styles.protoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.protoLabel}>Timing</Text>
                <Text style={[styles.protoValue, { flex: 1, textAlign: "right" }]}>{proto.timing}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}

      {/* Side Effects */}
      <Text style={styles.sectionTitle}>Side Effects</Text>
      <View style={styles.card}>
        {peptide.sideEffects.map((se, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={styles.bullet} />
            <Text style={styles.bulletText}>{se}</Text>
          </View>
        ))}
      </View>

      {/* Stacks With */}
      {stackPeptides.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Stacks Well With</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {stackPeptides.map((sp) => (
              <TouchableOpacity
                key={sp.id}
                style={styles.stackCard}
                onPress={() => navigation.push("PeptideDetail", { peptideId: sp.id })}
              >
                <Text style={styles.stackName}>{sp.name}</Text>
                <Text style={styles.stackDesc} numberOfLines={2}>{sp.description}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      {/* Storage */}
      <Text style={styles.sectionTitle}>Storage</Text>
      <View style={styles.card}>
        <Text style={styles.cardBody}>{peptide.storage}</Text>
      </View>

      {/* Notes */}
      {peptide.notes && (
        <>
          <Text style={styles.sectionTitle}>Notes</Text>
          <View style={styles.card}>
            <Text style={styles.cardBody}>{peptide.notes}</Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  errorText: { color: colors.error, fontSize: 16, textAlign: "center", marginTop: 40 },
  header: { flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 8 },
  name: { fontSize: 28, fontWeight: "800", color: colors.text },
  abbr: { fontSize: 16, color: colors.textSecondary },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  metaPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.surface, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
  },
  metaText: { fontSize: 12, color: colors.textSecondary, textTransform: "capitalize" },
  desc: { fontSize: 15, color: colors.text, lineHeight: 23, marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12,
  },
  cardBody: { fontSize: 14, color: colors.text, lineHeight: 22 },
  protoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  protoPurpose: { fontSize: 15, fontWeight: "600", color: colors.accent },
  protoDetails: { marginTop: 12 },
  protoRow: {
    flexDirection: "row", justifyContent: "space-between", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  protoLabel: { fontSize: 13, color: colors.textSecondary },
  protoValue: { fontSize: 13, fontWeight: "600", color: colors.text },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning, marginTop: 6 },
  bulletText: { fontSize: 14, color: colors.text, flex: 1 },
  stackCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, width: 180,
    marginRight: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 12,
  },
  stackName: { fontSize: 15, fontWeight: "700", color: colors.accent, marginBottom: 4 },
  stackDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
});
