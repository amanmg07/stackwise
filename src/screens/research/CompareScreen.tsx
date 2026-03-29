import React, { useState, useMemo } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { Peptide } from "../../types";

const CATEGORY_COLORS: Record<string, string> = {
  recovery: "#4ade80", fat_loss: "#f87171", muscle_gain: "#60a5fa",
  anti_aging: "#c084fc", cognitive: "#facc15", sleep: "#818cf8",
  immune: "#2dd4bf", sexual_health: "#f472b6", hormone: "#fb923c",
};

export default function CompareScreen({ route, navigation }: any) {
  const initIds: string[] = route.params?.peptideIds || [];
  const [selected, setSelected] = useState<string[]>(initIds.slice(0, 3));
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSlot, setPickerSlot] = useState(0);

  const peptideList = selected.map((id) => peptideDB.find((p) => p.id === id)).filter(Boolean) as Peptide[];

  const openPicker = (slot: number) => {
    setPickerSlot(slot);
    setShowPicker(true);
  };

  const selectPeptide = (id: string) => {
    setSelected((prev) => {
      const next = [...prev];
      next[pickerSlot] = id;
      return next;
    });
    setShowPicker(false);
  };

  const addSlot = () => {
    if (selected.length < 3) {
      setPickerSlot(selected.length);
      setSelected((prev) => [...prev, ""]);
      setShowPicker(true);
    }
  };

  const removeSlot = (idx: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerCard}>
        <Ionicons name="swap-horizontal-outline" size={24} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Compare Peptides</Text>
          <Text style={styles.headerDesc}>Side-by-side comparison of up to 3 peptides</Text>
        </View>
      </View>

      {/* Peptide selectors */}
      <View style={styles.selectorRow}>
        {selected.map((id, idx) => {
          const pep = peptideDB.find((p) => p.id === id);
          return (
            <View key={idx} style={styles.selectorSlot}>
              <TouchableOpacity style={styles.selectorBtn} onPress={() => openPicker(idx)}>
                <Text style={[styles.selectorText, pep && { color: colors.text }]} numberOfLines={1}>
                  {pep ? pep.name : "Select..."}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
              </TouchableOpacity>
              {selected.length > 2 && (
                <TouchableOpacity onPress={() => removeSlot(idx)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={18} color={colors.error} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        {selected.length < 3 && (
          <TouchableOpacity style={styles.addSlotBtn} onPress={addSlot}>
            <Ionicons name="add" size={18} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* Picker modal */}
      {showPicker && (
        <View style={styles.pickerCard}>
          <ScrollView style={{ maxHeight: 300 }} nestedScrollEnabled>
            {peptideDB.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pickerItem}
                onPress={() => selectPeptide(p.id)}
              >
                <Text style={styles.pickerItemText}>{p.name}</Text>
                {selected.includes(p.id) && (
                  <Ionicons name="checkmark" size={16} color={colors.accent} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Comparison table */}
      {peptideList.length >= 2 && (
        <View style={styles.table}>
          {/* Categories */}
          <CompareRow label="Categories">
            {peptideList.map((p) => (
              <View key={p.id} style={styles.cellContent}>
                {p.categories.map((cat) => (
                  <View key={cat} style={[styles.catTag, { backgroundColor: (CATEGORY_COLORS[cat] || "#888") + "20" }]}>
                    <Text style={[styles.catTagText, { color: CATEGORY_COLORS[cat] || "#888" }]}>
                      {cat.replace("_", " ")}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </CompareRow>

          {/* Routes */}
          <CompareRow label="Routes">
            {peptideList.map((p) => (
              <Text key={p.id} style={styles.cellText}>
                {p.routes.map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ")}
              </Text>
            ))}
          </CompareRow>

          {/* Half-life */}
          <CompareRow label="Half-life">
            {peptideList.map((p) => (
              <Text key={p.id} style={styles.cellText}>{p.halfLife}</Text>
            ))}
          </CompareRow>

          {/* Primary dose */}
          <CompareRow label="Dose Range">
            {peptideList.map((p) => (
              <Text key={p.id} style={styles.cellText}>
                {p.dosingProtocols[0]?.doseRange || "—"}
              </Text>
            ))}
          </CompareRow>

          {/* Frequency */}
          <CompareRow label="Frequency">
            {peptideList.map((p) => (
              <Text key={p.id} style={styles.cellText}>
                {p.dosingProtocols[0]?.frequency || "—"}
              </Text>
            ))}
          </CompareRow>

          {/* Cycle Duration */}
          <CompareRow label="Cycle">
            {peptideList.map((p) => (
              <Text key={p.id} style={styles.cellText}>
                {p.dosingProtocols[0]?.cycleDuration || "—"}
              </Text>
            ))}
          </CompareRow>

          {/* Side Effects */}
          <CompareRow label="Side Effects">
            {peptideList.map((p) => (
              <View key={p.id} style={styles.cellContent}>
                {p.sideEffects.slice(0, 3).map((se, i) => (
                  <Text key={i} style={styles.cellSmall}>• {se}</Text>
                ))}
                {p.sideEffects.length > 3 && (
                  <Text style={styles.cellMore}>+{p.sideEffects.length - 3} more</Text>
                )}
              </View>
            ))}
          </CompareRow>

          {/* Stacks With */}
          <CompareRow label="Stacks With">
            {peptideList.map((p) => (
              <View key={p.id} style={styles.cellContent}>
                {p.stacksWith.slice(0, 3).map((sid) => {
                  const sp = peptideDB.find((pp) => pp.id === sid);
                  return <Text key={sid} style={styles.cellSmall}>• {sp?.name || sid}</Text>;
                })}
              </View>
            ))}
          </CompareRow>
        </View>
      )}

      {peptideList.length < 2 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="swap-horizontal-outline" size={36} color={colors.border} />
          </View>
          <Text style={styles.emptyTitle}>Select 2-3 peptides to compare</Text>
          <Text style={styles.emptySubtext}>
            See dosing, side effects, routes, and more in a side-by-side view.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode[] }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowCells}>
        {React.Children.map(children, (child, i) => (
          <View key={i} style={styles.cell}>{child}</View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  headerCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  headerDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  selectorRow: { flexDirection: "row", gap: 8, marginBottom: 16, alignItems: "center" },
  selectorSlot: { flex: 1, flexDirection: "row", alignItems: "center", gap: 4 },
  selectorBtn: {
    flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  selectorText: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  removeBtn: { padding: 8 },
  addSlotBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderStyle: "dashed", alignItems: "center", justifyContent: "center",
  },
  pickerCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
    overflow: "hidden",
  },
  pickerItem: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pickerItemText: { fontSize: 14, color: colors.text },
  table: { marginTop: 8 },
  row: { marginBottom: 2 },
  rowLabel: {
    fontSize: 11, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6,
    paddingHorizontal: 4,
  },
  rowCells: {
    flexDirection: "row", gap: 8, marginBottom: 12,
  },
  cell: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  cellContent: { gap: 4 },
  cellText: { fontSize: 12, color: colors.text, lineHeight: 17 },
  cellSmall: { fontSize: 11, color: colors.textSecondary, lineHeight: 16 },
  cellMore: { fontSize: 11, color: colors.accent, fontWeight: "600" },
  catTag: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: "flex-start", marginBottom: 2 },
  catTagText: { fontSize: 10, fontWeight: "700", textTransform: "capitalize" },
  emptyState: { alignItems: "center", paddingTop: 40 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text, marginBottom: 6 },
  emptySubtext: { fontSize: 13, color: colors.textSecondary, textAlign: "center", lineHeight: 19, paddingHorizontal: 20 },
});
