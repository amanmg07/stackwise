import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { v4 as uuid } from "uuid";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { AdministrationRoute } from "../../types";

const SITES = ["Left Delt", "Right Delt", "Left Abdomen", "Right Abdomen", "Left Glute", "Right Glute", "Left Thigh", "Right Thigh"];

export default function LogDoseScreen({ route, navigation }: any) {
  const { cycleId, peptideId: initPeptideId } = route.params;
  const { cycles, addDoseLog } = useApp();
  const cycle = cycles.find((c) => c.id === cycleId);
  const cyclePeptide = cycle?.peptides.find((p) => p.peptideId === initPeptideId);
  const peptide = peptideDB.find((p) => p.id === initPeptideId);

  const [amount, setAmount] = useState(String(cyclePeptide?.doseAmount || 250));
  const [unit, setUnit] = useState<"mcg" | "mg" | "IU">(cyclePeptide?.doseUnit || "mcg");
  const [route_, setRoute] = useState<AdministrationRoute>(cyclePeptide?.route || "subcutaneous");
  const [site, setSite] = useState("");
  const [notes, setNotes] = useState("");

  const save = () => {
    addDoseLog({
      id: uuid(),
      cycleId,
      peptideId: initPeptideId,
      amount: parseFloat(amount) || 0,
      unit,
      route: route_,
      timestamp: new Date().toISOString(),
      site: site || undefined,
      notes: notes || undefined,
    });
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>{peptide?.name || initPeptideId}</Text>

      <Text style={styles.label}>Amount</Text>
      <View style={styles.amountRow}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        <View style={styles.unitRow}>
          {(["mcg", "mg", "IU"] as const).map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => setUnit(u)}
            >
              <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.label}>Route</Text>
      <View style={styles.routeRow}>
        {(["subcutaneous", "intramuscular", "oral", "nasal"] as AdministrationRoute[]).map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.routeBtn, route_ === r && styles.routeBtnActive]}
            onPress={() => setRoute(r)}
          >
            <Text style={[styles.routeText, route_ === r && styles.routeTextActive]}>
              {r === "subcutaneous" ? "SubQ" : r === "intramuscular" ? "IM" : r.charAt(0).toUpperCase() + r.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {(route_ === "subcutaneous" || route_ === "intramuscular") && (
        <>
          <Text style={styles.label}>Injection Site</Text>
          <View style={styles.siteGrid}>
            {SITES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.siteBtn, site === s && styles.siteBtnActive]}
                onPress={() => setSite(site === s ? "" : s)}
              >
                <Text style={[styles.siteText, site === s && styles.siteTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Notes (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="Any observations..."
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Ionicons name="checkmark" size={20} color={colors.background} />
        <Text style={styles.saveBtnText}>Log Dose</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  title: { fontSize: 24, fontWeight: "800", color: colors.accent, marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  amountRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  unitRow: { flexDirection: "row", gap: 6 },
  unitBtn: {
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  unitBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  unitText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  unitTextActive: { color: colors.background },
  routeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  routeBtn: {
    backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  routeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  routeText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  routeTextActive: { color: colors.background },
  siteGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  siteBtn: {
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.border,
  },
  siteBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  siteText: { fontSize: 12, color: colors.textSecondary },
  siteTextActive: { color: colors.background, fontWeight: "600" },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 32,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
