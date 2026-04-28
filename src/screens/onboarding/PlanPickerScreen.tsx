import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, safeTop } from "../../theme";
import { PlanId } from "../../types";
import { PLAN_CONFIG, PLAN_FEATURES, setPlan } from "../../services/planService";

const PLAN_ORDER: PlanId[] = ["basic", "pro", "elite"];

const PLAN_ICONS: Record<PlanId, keyof typeof Ionicons.glyphMap> = {
  basic: "flash-outline",
  pro: "rocket-outline",
  elite: "diamond-outline",
};

const PLAN_COLORS: Record<PlanId, string> = {
  basic: colors.textSecondary,
  pro: "#60a5fa",
  elite: "#c084fc",
};

interface Props {
  onComplete: () => void;
}

export default function PlanPickerScreen({ onComplete }: Props) {
  const [selected, setSelected] = useState<PlanId>("pro");

  const handleContinue = async () => {
    await setPlan(selected);
    // TODO: Trigger RevenueCat purchase flow for pro/elite
    onComplete();
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerIcon}>
          <Ionicons name="sparkles" size={36} color={colors.accent} />
        </View>
        <Text style={styles.title}>Choose Your Plan</Text>
        <Text style={styles.subtitle}>
          Start free or unlock the full experience. You can change your plan anytime.
        </Text>

        {PLAN_ORDER.map((planId) => {
          const plan = PLAN_CONFIG[planId];
          const features = PLAN_FEATURES[planId];
          const color = PLAN_COLORS[planId];
          const icon = PLAN_ICONS[planId];
          const isSelected = selected === planId;

          return (
            <TouchableOpacity
              key={planId}
              style={[
                styles.planCard,
                isSelected && { borderColor: color, borderWidth: 2 },
              ]}
              onPress={() => setSelected(planId)}
              activeOpacity={0.7}
            >
              {planId === "pro" && (
                <View style={[styles.badge, { backgroundColor: color }]}>
                  <Text style={styles.badgeText}>MOST POPULAR</Text>
                </View>
              )}

              <View style={styles.planHeader}>
                <View style={[styles.iconCircle, { backgroundColor: color + "20" }]}>
                  <Ionicons name={icon} size={22} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={[styles.planPrice, { color }]}>{plan.price}</Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={color} />
                )}
              </View>

              <View style={styles.featureList}>
                {features.map((f, i) => (
                  <View key={i} style={styles.featureRow}>
                    <Ionicons
                      name="checkmark"
                      size={15}
                      color={planId === "basic" ? colors.textSecondary : colors.success}
                    />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: PLAN_COLORS[selected] || colors.accent }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>
            {selected === "basic" ? "Continue with Basic" : `Start ${PLAN_CONFIG[selected].name} — ${PLAN_CONFIG[selected].price}`}
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>

        {selected !== "basic" && (
          <Text style={styles.legalText}>
            Billed monthly through {Platform.OS === "ios" ? "Apple" : "Google Play"}. Cancel anytime.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  scroll: { paddingHorizontal: spacing.xl, paddingBottom: 20 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: colors.accent + "15",
    alignItems: "center", justifyContent: "center",
    alignSelf: "center", marginBottom: 16,
  },
  title: {
    fontSize: 26, fontWeight: "800", color: colors.text,
    textAlign: "center", marginBottom: 8,
  },
  subtitle: {
    fontSize: 15, color: colors.textSecondary,
    textAlign: "center", lineHeight: 22, marginBottom: 24,
  },
  planCard: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 12,
    overflow: "hidden",
  },
  badge: {
    position: "absolute", top: 0, right: 0,
    borderBottomLeftRadius: 10, paddingHorizontal: 12, paddingVertical: 4,
  },
  badgeText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  planName: { fontSize: 17, fontWeight: "700", color: colors.text },
  planPrice: { fontSize: 14, fontWeight: "600", marginTop: 1 },
  featureList: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 13, color: colors.text },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingTop: 12,
  },
  continueBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    borderRadius: 14, paddingVertical: 18,
  },
  continueBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  legalText: {
    fontSize: 12, color: colors.textSecondary,
    textAlign: "center", marginTop: 12, lineHeight: 18,
  },
});
