import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, safeTop } from "../../theme";
import { syncResearchConsent } from "../../services/analyticsService";

interface Props {
  onDecided: (consented: boolean) => void;
}

export default function ResearchConsentScreen({ onDecided }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const decide = async (consented: boolean) => {
    if (submitting) return;
    setSubmitting(true);
    // Best-effort server sync. Even if it fails, we still record the
    // decision locally so onboarding doesn't block.
    await syncResearchConsent(consented);
    onDecided(consented);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.iconCircle}>
          <Ionicons name="flask-outline" size={44} color={colors.accent} />
        </View>

        <Text style={styles.title}>Help advance{"\n"}peptide research</Text>

        <Text style={styles.body}>
          We partner with healthcare research companies who study how peptides
          and supplements work in real-world use. Your consent lets us share
          your <Text style={styles.bold}>de-identified</Text> cycle and
          outcome data with them.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>What we share</Text>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.cardText}>Compounds, doses, frequencies, and routes</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.cardText}>Daily journal metrics (sleep, energy, recovery, mood, weight)</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.cardText}>Reported side effects (from a fixed list)</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.cardText}>Demographics: age, gender, experience level</Text>
          </View>
        </View>

        <View style={[styles.card, { borderColor: colors.error + "30" }]}>
          <Text style={[styles.cardHeading, { color: colors.error }]}>What we never share</Text>
          <View style={styles.cardRow}>
            <Ionicons name="close-circle" size={18} color={colors.error} />
            <Text style={styles.cardText}>Your name, email, phone, or any contact info</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="close-circle" size={18} color={colors.error} />
            <Text style={styles.cardText}>Photos from Self Scans (those stay on your device)</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="close-circle" size={18} color={colors.error} />
            <Text style={styles.cardText}>Free-text journal notes or chat messages</Text>
          </View>
        </View>

        <Text style={styles.finePrint}>
          You can change your mind anytime in <Text style={styles.bold}>Profile → Settings</Text>.
          Revoking consent removes you from all future data shares immediately.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.acceptBtn}
          onPress={() => decide(true)}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <>
              <Text style={styles.acceptBtnText}>I agree</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.background} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.declineBtn}
          onPress={() => decide(false)}
          disabled={submitting}
          activeOpacity={0.8}
        >
          <Text style={styles.declineBtnText}>No thanks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 20 },
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
    borderWidth: 1, borderColor: colors.border, marginBottom: 16, gap: 12,
  },
  cardHeading: { fontSize: 13, fontWeight: "700", color: colors.success, textTransform: "uppercase", letterSpacing: 0.5 },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardText: { fontSize: 14, color: colors.text, lineHeight: 20, flex: 1 },
  bold: { fontWeight: "700" },
  finePrint: {
    fontSize: 12, color: colors.textSecondary, textAlign: "center",
    lineHeight: 18, paddingHorizontal: 8, marginTop: 4,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingTop: 12,
    gap: 10,
  },
  acceptBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
  },
  acceptBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  declineBtn: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 14,
  },
  declineBtnText: { fontSize: 15, fontWeight: "600", color: colors.textSecondary },
});
