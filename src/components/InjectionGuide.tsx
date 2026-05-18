import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Collapsible "How to Inject Peptides" guide. Lives on the cycle page
// and is only rendered when a cycle actually contains an
// injection-route compound — it is intentionally NOT shown on the
// Explore/browse screen anymore (it was noise there).
const INJECTION_STEPS = [
  { step: "1", title: "Gather supplies", detail: "Insulin syringe (29-31g), alcohol wipes, bacteriostatic water (if reconstituting), peptide vial, and a sharps container." },
  { step: "2", title: "Wash your hands", detail: "Scrub with soap and water for at least 20 seconds. Dry with a clean towel." },
  { step: "3", title: "Reconstitute (if powder)", detail: "Wipe the vial top with an alcohol swab. Slowly inject bacteriostatic water down the side of the vial — never spray directly onto the powder. Gently swirl, don't shake." },
  { step: "4", title: "Draw your dose", detail: "Wipe the vial top again with a fresh alcohol swab. Pull back the plunger to your dose, insert the needle into the vial, push air in, then invert and draw out your dose. Flick out any air bubbles." },
  { step: "5", title: "Clean the injection site", detail: "Wipe the area with an alcohol swab in a circular motion. Let it air dry completely — don't blow on it. Common sites: belly fat (2 inches from navel), outer thigh, or back of arm." },
  { step: "6", title: "Inject", detail: "Pinch the skin, insert the needle at a 45-90° angle (subcutaneous). Push the plunger slowly and steadily. Hold for 5-10 seconds before withdrawing." },
  { step: "7", title: "After injection", detail: "Apply light pressure with an alcohol swab if needed — don't rub. Dispose of the syringe in a sharps container. Never recap or reuse needles. Rotate injection sites to avoid scar tissue." },
];

export default function InjectionGuide() {
  const [showGuide, setShowGuide] = useState(false);
  return (
    <TouchableOpacity
      style={styles.guideCard}
      onPress={() => setShowGuide(!showGuide)}
      activeOpacity={0.7}
    >
      <View style={styles.guideHeader}>
        <View style={styles.guideLeft}>
          <View style={styles.guideIcon}>
            <Ionicons name="medical-outline" size={18} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guideTitle}>How to Inject Peptides</Text>
            <Text style={styles.guideSubtitle}>Step-by-step guide with safety tips</Text>
          </View>
        </View>
        <Ionicons
          name={showGuide ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </View>
      {showGuide && (
        <View style={styles.guideBody}>
          {INJECTION_STEPS.map((s) => (
            <View key={s.step} style={styles.guideStep}>
              <View style={styles.guideStepNum}>
                <Text style={styles.guideStepNumText}>{s.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.guideStepTitle}>{s.title}</Text>
                <Text style={styles.guideStepDetail}>{s.detail}</Text>
              </View>
            </View>
          ))}
          <View style={styles.guideTip}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
            <Text style={styles.guideTipText}>
              Always use a new syringe for each injection. Store reconstituted peptides in the fridge and use within 30 days.
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  guideCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1, borderColor: colors.accent + "30",
    overflow: "hidden",
  },
  guideHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    padding: 14,
  },
  guideLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  guideIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
  },
  guideTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  guideSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  guideBody: { paddingHorizontal: 14, paddingBottom: 14 },
  guideStep: {
    flexDirection: "row", gap: 12, marginBottom: 14,
  },
  guideStepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  guideStepNumText: { fontSize: 13, fontWeight: "700", color: colors.background },
  guideStepTitle: { fontSize: 14, fontWeight: "600", color: colors.text },
  guideStepDetail: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginTop: 2 },
  guideTip: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: colors.warning + "10", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.warning + "25", marginTop: 4,
  },
  guideTipText: { fontSize: 12, color: colors.warning, flex: 1, lineHeight: 17 },
});
