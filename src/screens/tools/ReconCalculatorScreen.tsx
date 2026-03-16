import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";

const SYRINGE_SIZES = [
  { label: "1 mL (100 units)", totalUnits: 100, totalMl: 1 },
  { label: "0.5 mL (50 units)", totalUnits: 50, totalMl: 0.5 },
  { label: "0.3 mL (30 units)", totalUnits: 30, totalMl: 0.3 },
];

export default function ReconCalculatorScreen({ route, navigation }: any) {
  const initPeptideId = route.params?.peptideId || null;
  const [selectedPeptide, setSelectedPeptide] = useState<string | null>(initPeptideId);
  const [showPicker, setShowPicker] = useState(false);
  const [vialMg, setVialMg] = useState("5");
  const [waterMl, setWaterMl] = useState("2");
  const initPep = initPeptideId ? peptideDB.find((p) => p.id === initPeptideId) : null;
  const initDoseMatch = initPep?.dosingProtocols?.[0]?.doseRange?.match(/([\d.]+)/);
  const [targetDoseMg, setTargetDoseMg] = useState(initDoseMatch ? initDoseMatch[1] : "0.25");
  const [syringeIndex, setSyringeIndex] = useState(0);

  const peptide = selectedPeptide ? peptideDB.find((p) => p.id === selectedPeptide) : null;

  // Auto-fill from peptide data
  const selectPeptide = (id: string) => {
    setSelectedPeptide(id);
    setShowPicker(false);
    const pep = peptideDB.find((p) => p.id === id);
    if (pep?.dosingProtocols?.[0]) {
      const doseMatch = pep.dosingProtocols[0].doseRange.match(/([\d.]+)/);
      if (doseMatch) setTargetDoseMg(doseMatch[1]);
    }
  };

  const results = useMemo(() => {
    const vial = parseFloat(vialMg) || 0;
    const water = parseFloat(waterMl) || 0;
    const dose = parseFloat(targetDoseMg) || 0;
    const syringe = SYRINGE_SIZES[syringeIndex];

    if (vial <= 0 || water <= 0 || dose <= 0) return null;

    const concentrationMgPerMl = vial / water;
    const doseVolumeMl = dose / concentrationMgPerMl;
    const doseUnits = (doseVolumeMl / syringe.totalMl) * syringe.totalUnits;
    const dosesPerVial = Math.floor(vial / dose);

    return {
      concentrationMgPerMl,
      doseVolumeMl,
      doseUnits: Math.round(doseUnits * 10) / 10,
      dosesPerVial,
    };
  }, [vialMg, waterMl, targetDoseMg, syringeIndex]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerCard}>
        <Ionicons name="calculator-outline" size={24} color={colors.accent} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Reconstitution Calculator</Text>
          <Text style={styles.headerDesc}>Calculate exactly how much to draw on your syringe</Text>
        </View>
      </View>

      {/* Peptide selector */}
      <Text style={styles.label}>Peptide (optional)</Text>
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowPicker(!showPicker)}>
        <Text style={[styles.pickerBtnText, peptide && { color: colors.text }]}>
          {peptide ? peptide.name : "Select a peptide to auto-fill..."}
        </Text>
        <Ionicons name={showPicker ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {showPicker && (
        <View style={styles.pickerList}>
          <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
            {peptideDB.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.pickerItem}
                onPress={() => selectPeptide(p.id)}
              >
                <Text style={[styles.pickerItemText, selectedPeptide === p.id && { color: colors.accent }]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Inputs */}
      <Text style={styles.label}>Vial Size (mg)</Text>
      <TextInput
        style={styles.input}
        value={vialMg}
        onChangeText={setVialMg}
        keyboardType="decimal-pad"
        placeholder="e.g. 5"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Bacteriostatic Water Added (mL)</Text>
      <TextInput
        style={styles.input}
        value={waterMl}
        onChangeText={setWaterMl}
        keyboardType="decimal-pad"
        placeholder="e.g. 2"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Target Dose (mg)</Text>
      <TextInput
        style={styles.input}
        value={targetDoseMg}
        onChangeText={setTargetDoseMg}
        keyboardType="decimal-pad"
        placeholder="e.g. 0.25"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Syringe Size</Text>
      <View style={styles.syringeRow}>
        {SYRINGE_SIZES.map((s, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.syringeBtn, syringeIndex === i && styles.syringeBtnActive]}
            onPress={() => setSyringeIndex(i)}
          >
            <Text style={[styles.syringeText, syringeIndex === i && styles.syringeTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {results && (
        <View style={styles.resultsCard}>
          <Text style={styles.resultsTitle}>Your Dose</Text>

          <View style={styles.resultMain}>
            <Text style={styles.resultBigNumber}>{results.doseUnits}</Text>
            <Text style={styles.resultBigLabel}>units on your syringe</Text>
          </View>

          <View style={styles.resultDivider} />

          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{results.concentrationMgPerMl.toFixed(2)} mg/mL</Text>
              <Text style={styles.resultLabel}>Concentration</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{results.doseVolumeMl.toFixed(3)} mL</Text>
              <Text style={styles.resultLabel}>Volume per dose</Text>
            </View>
          </View>

          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{results.dosesPerVial} doses</Text>
              <Text style={styles.resultLabel}>Per vial</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={styles.resultValue}>{parseFloat(targetDoseMg)} mg</Text>
              <Text style={styles.resultLabel}>Per injection</Text>
            </View>
          </View>
        </View>
      )}

      {!results && (
        <View style={styles.emptyResults}>
          <Ionicons name="flask-outline" size={32} color={colors.border} />
          <Text style={styles.emptyText}>Fill in the fields above to calculate your dose</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  headerCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: colors.accent + "10", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "25", marginBottom: 20,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  headerDesc: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  pickerBtn: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  pickerBtnText: { fontSize: 15, color: colors.textSecondary },
  pickerList: {
    backgroundColor: colors.surface, borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
  },
  pickerItem: { padding: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  pickerItemText: { fontSize: 14, color: colors.text },
  syringeRow: { gap: 8 },
  syringeBtn: {
    backgroundColor: colors.surface, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border, marginBottom: 6,
  },
  syringeBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  syringeText: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  syringeTextActive: { color: colors.background, fontWeight: "600" },
  resultsCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 20,
    borderWidth: 2, borderColor: colors.accent, marginTop: 24,
  },
  resultsTitle: {
    fontSize: 13, fontWeight: "700", color: colors.accent,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12,
  },
  resultMain: { alignItems: "center", marginBottom: 16 },
  resultBigNumber: { fontSize: 48, fontWeight: "800", color: colors.accent },
  resultBigLabel: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
  resultDivider: { height: 1, backgroundColor: colors.border, marginBottom: 16 },
  resultRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  resultItem: {
    flex: 1, backgroundColor: colors.background, borderRadius: 10, padding: 12, alignItems: "center",
  },
  resultValue: { fontSize: 15, fontWeight: "700", color: colors.text },
  resultLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  emptyResults: { alignItems: "center", paddingTop: 40, gap: 12 },
  emptyText: { fontSize: 14, color: colors.textSecondary },
});
