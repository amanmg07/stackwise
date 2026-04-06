import React from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useApp } from "../../context/AppContext";
import { colors, spacing, safeTop } from "../../theme";
import { CATEGORY_INFO, CONFIDENCE_LABELS, CONFIDENCE_COLORS } from "./scanConstants";

export default function ScanDetailScreen({ route, navigation }: any) {
  const { scanId } = route.params;
  const { scans, deleteScan } = useApp();
  const scan = scans.find((s) => s.id === scanId);
  const scanIdx = scans.findIndex((s) => s.id === scanId);
  // scans are stored newest-first, so the "previous" scan is at idx+1
  const previousScan = scanIdx >= 0 && scanIdx < scans.length - 1 ? scans[scanIdx + 1] : null;

  if (!scan) {
    return (
      <View style={styles.container}>
        <Text style={styles.empty}>Scan not found</Text>
      </View>
    );
  }

  const confirmDelete = () => {
    Alert.alert("Delete Scan?", "This will permanently remove this scan and its photo from your device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteScan(scan.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const renderObs = (obs: any, i: number, color: string, keyPrefix: string) => {
    const catInfo = CATEGORY_INFO[obs.category];
    return (
      <View key={`${keyPrefix}-${i}`} style={[styles.obsCard, { borderColor: color + "30" }]}>
        <View style={styles.obsHeader}>
          <Ionicons name={catInfo?.icon || "ellipse-outline"} size={18} color={catInfo?.color || colors.accent} />
          <Text style={[styles.obsCategory, { color: catInfo?.color }]}>{catInfo?.label || obs.category}</Text>
          <View style={[styles.confidenceBadge, { backgroundColor: CONFIDENCE_COLORS[obs.confidence] + "20" }]}>
            <Text style={[styles.confidenceText, { color: CONFIDENCE_COLORS[obs.confidence] }]}>
              {CONFIDENCE_LABELS[obs.confidence] || obs.confidence}
            </Text>
          </View>
        </View>
        <Text style={styles.obsText}>{obs.observation}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={18} color={colors.error} />
        </TouchableOpacity>
      </View>

      <Text style={styles.dateText}>{format(parseISO(scan.date), "EEEE, MMMM d, yyyy")}</Text>
      <Text style={styles.timeText}>{format(parseISO(scan.date), "h:mm a")}</Text>

      <View style={styles.imageContainer}>
        <Image source={{ uri: scan.imagePath }} style={styles.image} />
      </View>

      {previousScan && (
        <TouchableOpacity
          style={styles.compareBtn}
          onPress={() =>
            navigation.navigate("ScanCompare", {
              earlierScanId: previousScan.id,
              laterScanId: scan.id,
            })
          }
        >
          <Ionicons name="analytics-outline" size={20} color={colors.accent} />
          <Text style={styles.compareBtnText}>Compare with previous scan</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.accent} />
        </TouchableOpacity>
      )}

      <View style={styles.summaryCard}>
        <Ionicons name="sparkles" size={20} color={colors.accent} />
        <Text style={styles.summaryText}>{scan.result.summary}</Text>
      </View>

      {scan.result.strengths && scan.result.strengths.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.sectionTitle, { color: colors.success }]}>Keep It Up</Text>
          </View>
          {scan.result.strengths.map((o, i) => renderObs(o, i, colors.success, "s"))}
        </>
      )}

      {scan.result.improvements && scan.result.improvements.length > 0 && (
        <>
          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <Ionicons name="trending-up" size={18} color={colors.accent} />
            <Text style={[styles.sectionTitle, { color: colors.accent }]}>Start Considering</Text>
          </View>
          {scan.result.improvements.map((o, i) => renderObs(o, i, colors.accent, "i"))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: safeTop },
  empty: { color: colors.textSecondary, textAlign: "center", marginTop: 40 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.error + "15", alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: colors.error + "30",
  },
  dateText: { fontSize: 22, fontWeight: "800", color: colors.text },
  timeText: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.md },
  imageContainer: { borderRadius: 16, overflow: "hidden", marginBottom: spacing.md },
  image: { width: "100%", aspectRatio: 3 / 4, borderRadius: 16 },
  compareBtn: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.accent + "12", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "30", marginBottom: spacing.lg,
  },
  compareBtnText: { fontSize: 15, fontWeight: "700", color: colors.text, flex: 1 },
  summaryCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: colors.accent + "12", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "25", marginBottom: spacing.lg,
  },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 22, flex: 1 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 },
  obsCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  obsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  obsCategory: { fontSize: 14, fontWeight: "700", flex: 1 },
  confidenceBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  confidenceText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  obsText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
});
