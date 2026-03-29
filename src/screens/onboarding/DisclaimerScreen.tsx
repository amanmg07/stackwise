import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, safeTop } from "../../theme";

interface Props {
  onAccept: () => void;
}

export default function DisclaimerScreen({ onAccept }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark-outline" size={44} color={colors.accent} />
        </View>

        <Text style={styles.title}>Built for People{"\n"}Who Do Their Research</Text>

        <Text style={styles.body}>
          StackWise gives you the same peptide knowledge that clinics, researchers, and experienced users rely on — dosing protocols, mechanisms, stacking strategies, side effects, and more.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.cardText}>
              <Text style={styles.bold}>Evidence-based data</Text> from published research and real-world protocols
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.cardText}>
              <Text style={styles.bold}>Detailed dosing ranges</Text> with routes, timing, and cycle durations
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.cardText}>
              <Text style={styles.bold}>Side effects and interactions</Text> clearly listed so you can make informed decisions
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
            <Text style={styles.cardText}>
              <Text style={styles.bold}>AI advisor</Text> trained on the full peptide database for instant, specific answers
            </Text>
          </View>
        </View>

        <Text style={styles.body}>
          StackWise is an educational and tracking tool. The information here is thoroughly researched, but individual responses to peptides vary. You are responsible for your own health decisions.
        </Text>

        <Text style={styles.finePrint}>
          This app provides peptide information for educational purposes. It is not a substitute for professional medical advice, diagnosis, or treatment. By continuing, you acknowledge that you understand this and take full responsibility for how you use this information.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.btn} onPress={onAccept} activeOpacity={0.8}>
          <Text style={styles.btnText}>I Understand — Let's Go</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    paddingTop: safeTop,
  },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 20,
  },
  iconCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
    alignSelf: "center", marginBottom: 24,
    borderWidth: 2, borderColor: colors.accent + "30",
  },
  title: {
    fontSize: 26, fontWeight: "800", color: colors.text,
    textAlign: "center", marginBottom: 16, lineHeight: 34,
  },
  body: {
    fontSize: 15, color: colors.textSecondary, textAlign: "center",
    lineHeight: 23, marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: colors.border, marginBottom: 20, gap: 14,
  },
  cardRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
  },
  cardText: {
    fontSize: 14, color: colors.text, lineHeight: 20, flex: 1,
  },
  bold: { fontWeight: "700" },
  finePrint: {
    fontSize: 12, color: colors.textSecondary, textAlign: "center",
    lineHeight: 18, paddingHorizontal: 8,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingTop: 12,
  },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
  },
  btnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
