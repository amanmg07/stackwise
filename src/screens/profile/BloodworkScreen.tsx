import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { Swipeable } from "react-native-gesture-handler";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { generateId } from "../../utils/id";
import { colors, spacing, safeTop, safeBottom } from "../../theme";
import { Bloodwork } from "../../types";
import { trackBloodwork } from "../../services/analyticsService";

interface FieldDef {
  key: keyof Bloodwork;
  label: string;
  unit: string;
  placeholder?: string;
}

interface FieldGroup {
  title: string;
  fields: FieldDef[];
}

const GROUPS: FieldGroup[] = [
  {
    title: "Hormones",
    fields: [
      { key: "testosterone_total", label: "Total testosterone", unit: "ng/dL" },
      { key: "testosterone_free", label: "Free testosterone", unit: "pg/mL" },
      { key: "estradiol", label: "Estradiol", unit: "pg/mL" },
      { key: "shbg", label: "SHBG", unit: "nmol/L" },
      { key: "igf1", label: "IGF-1", unit: "ng/mL" },
      { key: "tsh", label: "TSH", unit: "mIU/L" },
    ],
  },
  {
    title: "Metabolic",
    fields: [
      { key: "hba1c", label: "HbA1c", unit: "%" },
      { key: "fasting_glucose", label: "Fasting glucose", unit: "mg/dL" },
      { key: "fasting_insulin", label: "Fasting insulin", unit: "µIU/mL" },
    ],
  },
  {
    title: "Lipids",
    fields: [
      { key: "total_cholesterol", label: "Total cholesterol", unit: "mg/dL" },
      { key: "ldl", label: "LDL", unit: "mg/dL" },
      { key: "hdl", label: "HDL", unit: "mg/dL" },
      { key: "triglycerides", label: "Triglycerides", unit: "mg/dL" },
    ],
  },
  {
    title: "Inflammation",
    fields: [{ key: "hs_crp", label: "hs-CRP", unit: "mg/L" }],
  },
  {
    title: "Liver / Kidney",
    fields: [
      { key: "alt", label: "ALT", unit: "U/L" },
      { key: "ast", label: "AST", unit: "U/L" },
      { key: "creatinine", label: "Creatinine", unit: "mg/dL" },
    ],
  },
];

export default function BloodworkScreen({ navigation }: any) {
  const { bloodwork, addBloodwork, deleteBloodwork, cycles } = useApp();
  const { showToast } = useToast();

  // Ticket 2.4: per-marker trend computation. Sort entries chrono-
  // logically, then for each marker collect every (date, value) pair
  // where the value is a finite number. Keep markers with ≥2 entries.
  const markerTrends = useMemo(() => {
    const sorted = [...bloodwork].sort((a, b) => a.date.localeCompare(b.date));
    type Trend = {
      key: keyof Bloodwork;
      label: string;
      unit: string;
      values: { date: string; value: number }[];
    };
    const out: Trend[] = [];
    for (const f of GROUPS.flatMap((g) => g.fields)) {
      const vals = sorted
        .map((b) => ({ date: b.date, value: (b as any)[f.key] as number | undefined }))
        .filter((v): v is { date: string; value: number } => typeof v.value === "number" && Number.isFinite(v.value));
      if (vals.length >= 2) {
        out.push({ key: f.key, label: f.label, unit: f.unit, values: vals });
      }
    }
    return out;
  }, [bloodwork]);

  const [showForm, setShowForm] = useState(false);
  const [drawnOn, setDrawnOn] = useState(format(new Date(), "yyyy-MM-dd"));
  const [labName, setLabName] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});

  const activeCycle = cycles.find((c) => c.isActive);

  const setField = (key: string, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }));
  };

  const reset = () => {
    setDrawnOn(format(new Date(), "yyyy-MM-dd"));
    setLabName("");
    setValues({});
    setShowForm(false);
  };

  const save = () => {
    const numericFields: Partial<Bloodwork> = {};
    let anyFilled = false;
    for (const group of GROUPS) {
      for (const f of group.fields) {
        const raw = values[f.key as string];
        if (!raw || raw.trim() === "") continue;
        const num = parseFloat(raw);
        if (Number.isFinite(num) && num > 0) {
          (numericFields as any)[f.key] = num;
          anyFilled = true;
        }
      }
    }
    if (!anyFilled) {
      Alert.alert("Nothing to save", "Enter at least one biomarker value.");
      return;
    }

    const entry: Bloodwork = {
      id: generateId(),
      date: drawnOn,
      cycleId: activeCycle?.id,
      labName: labName.trim() || undefined,
      ...numericFields,
      createdAt: new Date().toISOString(),
    };
    addBloodwork(entry);
    trackBloodwork(entry);
    showToast("Bloodwork saved!");
    reset();
  };

  const confirmDelete = (id: string) => {
    Alert.alert("Delete bloodwork?", "This entry will be permanently removed.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteBloodwork(id) },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.accent} />
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Bloodwork</Text>
        <Text style={styles.subtitle}>
          Log lab results to track how peptides and supplements affect your biomarkers over time.
        </Text>

        {!showForm ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={20} color={colors.background} />
            <Text style={styles.primaryBtnText}>Log new bloodwork</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.formCard}>
            <Text style={styles.label}>Date drawn</Text>
            <TextInput
              style={styles.input}
              value={drawnOn}
              onChangeText={setDrawnOn}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />

            <Text style={styles.label}>Lab (optional)</Text>
            <TextInput
              style={styles.input}
              value={labName}
              onChangeText={setLabName}
              placeholder="e.g. Quest, LabCorp"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />

            <Text style={styles.helpText}>
              Fill in only the markers your lab reported. Empty fields are skipped.
            </Text>

            {GROUPS.map((g) => (
              <View key={g.title} style={styles.group}>
                <Text style={styles.groupTitle}>{g.title}</Text>
                {g.fields.map((f) => (
                  <View key={f.key as string} style={styles.fieldRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fieldLabel}>{f.label}</Text>
                      <Text style={styles.fieldUnit}>{f.unit}</Text>
                    </View>
                    <TextInput
                      style={styles.fieldInput}
                      value={values[f.key as string] || ""}
                      onChangeText={(v) => setField(f.key as string, v)}
                      keyboardType="decimal-pad"
                      placeholder="—"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                ))}
              </View>
            ))}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={styles.cancelBtn} onPress={reset}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1 }]} onPress={save}>
                <Ionicons name="checkmark" size={18} color={colors.background} />
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Trends (ticket 2.4): per-marker before→after view for any
            marker the user has logged twice. Surfaces the payoff of
            past logging — turning the screen from a write-only form
            into something with read value, which is what pulls users
            back to log their next lab. Neutral arrow color (no
            good/bad implication) because direction-of-good varies
            per marker (HDL up = good; LDL down = good; testosterone
            depends on goal). User interprets. */}
        {markerTrends.length > 0 && (
          <View style={styles.trendsSection}>
            <Text style={styles.trendsHeader}>Trends</Text>
            <Text style={styles.trendsSubheader}>
              Markers you've logged at least twice.
            </Text>
            {markerTrends.map((t) => {
              const first = t.values[0];
              const last = t.values[t.values.length - 1];
              const delta = last.value - first.value;
              const pct = first.value !== 0 ? (delta / first.value) * 100 : 0;
              const arrow = delta > 0 ? "↑" : delta < 0 ? "↓" : "→";
              return (
                <View key={t.key as string} style={styles.trendRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trendLabel}>{t.label}</Text>
                    <Text style={styles.trendDates}>
                      {format(parseISO(first.date), "MMM d")} → {format(parseISO(last.date), "MMM d")}
                      {t.values.length > 2 ? ` · ${t.values.length} entries` : ""}
                    </Text>
                  </View>
                  <View style={styles.trendValuesCol}>
                    <Text style={styles.trendValues}>
                      {first.value} → {last.value} <Text style={styles.trendUnit}>{t.unit}</Text>
                    </Text>
                    <Text style={styles.trendDelta}>
                      {arrow} {Math.abs(pct).toFixed(0)}%
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {bloodwork.length > 0 && (
          <>
            <Text style={styles.historyHeader}>History ({bloodwork.length})</Text>
            {bloodwork.map((b) => (
              <Swipeable
                key={b.id}
                renderRightActions={() => (
                  <TouchableOpacity style={styles.swipeDelete} onPress={() => confirmDelete(b.id)}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              >
                <View style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>{format(parseISO(b.date), "MMM d, yyyy")}</Text>
                    {b.labName && <Text style={styles.entryLab}>{b.labName}</Text>}
                  </View>
                  <Text style={styles.entryMarkers}>
                    {summarize(b)}
                  </Text>
                </View>
              </Swipeable>
            ))}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function summarize(b: Bloodwork): string {
  const parts: string[] = [];
  const all: { key: keyof Bloodwork; label: string; unit: string }[] = GROUPS.flatMap((g) =>
    g.fields.map((f) => ({ key: f.key, label: f.label, unit: f.unit }))
  );
  for (const f of all) {
    const v = (b as any)[f.key];
    if (typeof v === "number") parts.push(`${f.label}: ${v} ${f.unit}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "No values logged";
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: safeTop },
  header: { marginBottom: spacing.md },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  primaryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 16,
  },
  primaryBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  cancelBtn: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  cancelBtnText: { fontSize: 15, fontWeight: "600", color: colors.textSecondary },
  formCard: {
    backgroundColor: colors.surface, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.border,
  },
  label: {
    fontSize: 12, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: 12, marginBottom: 6,
  },
  helpText: { fontSize: 12, color: colors.textSecondary, marginTop: 12, marginBottom: 4, lineHeight: 17 },
  input: {
    backgroundColor: colors.background, borderRadius: 10, padding: 12,
    fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  group: { marginTop: 14 },
  groupTitle: {
    fontSize: 13, fontWeight: "700", color: colors.accent,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8,
  },
  fieldRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 6,
  },
  fieldLabel: { fontSize: 14, color: colors.text },
  fieldUnit: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  fieldInput: {
    width: 110, backgroundColor: colors.background, borderRadius: 8, padding: 10,
    fontSize: 14, color: colors.text, textAlign: "right",
    borderWidth: 1, borderColor: colors.border,
  },
  historyHeader: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm,
  },

  // Ticket 2.4 — per-marker trend section.
  trendsSection: { marginTop: spacing.xl },
  trendsHeader: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
  },
  trendsSubheader: { fontSize: 12, color: colors.textSecondary, marginBottom: spacing.sm },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 6,
    gap: 12,
  },
  trendLabel: { fontSize: 14, fontWeight: "600", color: colors.text },
  trendDates: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  trendValuesCol: { alignItems: "flex-end" },
  trendValues: { fontSize: 13, fontWeight: "700", color: colors.text },
  trendUnit: { fontSize: 11, fontWeight: "500", color: colors.textSecondary },
  trendDelta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  entryCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  entryDate: { fontSize: 15, fontWeight: "700", color: colors.text },
  entryLab: { fontSize: 12, color: colors.accent, fontWeight: "600" },
  entryMarkers: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  swipeDelete: {
    backgroundColor: colors.error, justifyContent: "center", alignItems: "center",
    width: 70, borderRadius: 12, marginBottom: 8,
  },
});
