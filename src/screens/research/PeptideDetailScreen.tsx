import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides } from "../../data/peptides";
import { getSourcesForPeptide } from "../../data/peptideSources";
import { useApp } from "../../context/AppContext";
import { colors, spacing } from "../../theme";

const CATEGORY_COLORS: Record<string, string> = {
  recovery: "#4ade80",
  fat_loss: "#f87171",
  muscle_gain: "#60a5fa",
  anti_aging: "#c084fc",
  cognitive: "#facc15",
  sleep: "#818cf8",
  immune: "#2dd4bf",
  sexual_health: "#f472b6",
  hormone: "#fb923c",
};

export default function PeptideDetailScreen({ route, navigation }: any) {
  const { peptideId } = route.params;
  const peptide = peptides.find((p) => p.id === peptideId);
  const { settings, updateSettings } = useApp();
  const [expandedProtocol, setExpandedProtocol] = useState<number | null>(0);
  const [showStorage, setShowStorage] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const isSaved = settings.savedPeptides?.includes(peptideId);
  const toggleSave = () => {
    const saved = settings.savedPeptides || [];
    updateSettings({
      savedPeptides: isSaved ? saved.filter((id) => id !== peptideId) : [...saved, peptideId],
    });
  };

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
        <View style={styles.nameRow}>
          <Text style={styles.name}>{peptide.name}</Text>
          {peptide.abbreviation && peptide.abbreviation !== peptide.name && (
            <Text style={styles.abbr}>{peptide.abbreviation}</Text>
          )}
          <TouchableOpacity onPress={toggleSave} style={styles.saveBtn}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isSaved ? colors.accent : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        {peptide.isBlend && (
          <View style={styles.blendBadge}>
            <Ionicons name="layers-outline" size={12} color={colors.accent} />
            <Text style={styles.blendBadgeText}>Pre-Mixed Blend</Text>
          </View>
        )}
      </View>

      {/* Category tags */}
      {peptide.categories.length > 0 && (
        <View style={styles.categoryRow}>
          {peptide.categories.map((cat) => (
            <View key={cat} style={[styles.categoryTag, { backgroundColor: (CATEGORY_COLORS[cat] || "#888") + "20" }]}>
              <Text style={[styles.categoryTagText, { color: CATEGORY_COLORS[cat] || "#888" }]}>
                {cat.replace("_", " ")}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.metaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.metaText} numberOfLines={2}>t½ {peptide.halfLife}</Text>
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
                <Text style={styles.protoValue}>{proto.timing}</Text>
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

      {/* Storage — collapsible */}
      <TouchableOpacity
        style={styles.collapsibleHeader}
        onPress={() => setShowStorage(!showStorage)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsibleLeft}>
          <Ionicons name="snow-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.collapsibleTitle}>Storage</Text>
        </View>
        <Ionicons
          name={showStorage ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      {showStorage && (
        <View style={styles.collapsibleBody}>
          <Text style={styles.cardBody}>{peptide.storage}</Text>
        </View>
      )}

      {/* Notes — collapsible */}
      {peptide.notes && (
        <>
          <TouchableOpacity
            style={styles.collapsibleHeader}
            onPress={() => setShowNotes(!showNotes)}
            activeOpacity={0.7}
          >
            <View style={styles.collapsibleLeft}>
              <Ionicons name="document-text-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.collapsibleTitle}>Notes</Text>
            </View>
            <Ionicons
              name={showNotes ? "chevron-up" : "chevron-down"}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showNotes && (
            <View style={styles.collapsibleBody}>
              <Text style={styles.cardBody}>{peptide.notes}</Text>
            </View>
          )}
        </>
      )}

      {/* Where to Find */}
      {(() => {
        const sources = getSourcesForPeptide(peptide.id);
        return (
          <>
            <Text style={styles.sectionTitle}>Where to Find</Text>
            <View style={styles.card}>
              {sources.map((src, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.sourceRow, i === sources.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => src.url ? Linking.openURL(src.url) : null}
                  disabled={!src.url}
                  activeOpacity={src.url ? 0.6 : 1}
                >
                  <View style={styles.sourceLeft}>
                    <Ionicons
                      name={src.url ? "storefront-outline" : "medical-outline"}
                      size={16}
                      color={src.url ? colors.accent : colors.textSecondary}
                    />
                    <Text style={[styles.sourceName, !src.url && { color: colors.textSecondary }]}>
                      {src.name}
                    </Text>
                  </View>
                  {src.url ? (
                    <Ionicons name="open-outline" size={16} color={colors.accent} />
                  ) : (
                    <Text style={styles.sourceRx}>Rx</Text>
                  )}
                </TouchableOpacity>
              ))}
              <Text style={styles.sourceDisclaimer}>
                Sold as research chemicals. Not medical advice — consult a healthcare provider.
              </Text>
            </View>
          </>
        );
      })()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  errorText: { color: colors.error, fontSize: 16, textAlign: "center", marginTop: 40 },
  header: { marginBottom: 10 },
  nameRow: { flexDirection: "row", alignItems: "baseline", gap: 10, flexWrap: "wrap", flex: 1 },
  saveBtn: { marginLeft: "auto", padding: 4 },
  name: { fontSize: 28, fontWeight: "800", color: colors.text, flexShrink: 1 },
  abbr: { fontSize: 16, color: colors.textSecondary },
  blendBadge: {
    flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start",
    backgroundColor: colors.accent + "15", borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: 6,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  blendBadgeText: { fontSize: 11, fontWeight: "700", color: colors.accent, textTransform: "uppercase" },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  categoryTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  categoryTagText: { fontSize: 12, fontWeight: "700", textTransform: "capitalize" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
  metaPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.surface, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.border,
    flexShrink: 1, maxWidth: "100%",
  },
  metaText: { fontSize: 12, color: colors.textSecondary, textTransform: "capitalize", flexShrink: 1 },
  desc: { fontSize: 15, color: colors.text, lineHeight: 23, marginBottom: 24 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 8,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12, overflow: "hidden",
  },
  cardBody: { fontSize: 14, color: colors.text, lineHeight: 22 },
  protoHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  protoPurpose: { fontSize: 15, fontWeight: "600", color: colors.accent, flexShrink: 1 },
  protoDetails: { marginTop: 12 },
  protoRow: {
    flexDirection: "row", justifyContent: "space-between", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border, gap: 12,
  },
  protoLabel: { fontSize: 13, color: colors.textSecondary, flexShrink: 0 },
  protoValue: { fontSize: 13, fontWeight: "600", color: colors.text, flexShrink: 1, textAlign: "right" },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.warning, marginTop: 6 },
  bulletText: { fontSize: 14, color: colors.text, flex: 1 },
  stackCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14, width: 180,
    marginRight: 10, borderWidth: 1, borderColor: colors.border, marginBottom: 12,
    overflow: "hidden",
  },
  stackName: { fontSize: 15, fontWeight: "700", color: colors.accent, marginBottom: 4 },
  stackDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17 },
  collapsibleHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, marginBottom: 2, marginTop: 8,
  },
  collapsibleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  collapsibleTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1,
  },
  collapsibleBody: {
    backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md,
    borderWidth: 1, borderColor: colors.border, borderTopWidth: 0,
    borderTopLeftRadius: 0, borderTopRightRadius: 0, marginBottom: 12,
  },
  sourceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  sourceLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  sourceName: { fontSize: 14, fontWeight: "600", color: colors.text },
  sourceRx: {
    fontSize: 11, fontWeight: "700", color: colors.textSecondary,
    backgroundColor: colors.border, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
  },
  sourceDisclaimer: {
    fontSize: 11, color: colors.textSecondary, marginTop: 12, lineHeight: 16,
    fontStyle: "italic",
  },
});
