import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, safeTop, safeBottom } from "../../theme";
import { PlanId } from "../../types";
import { getCurrentPlan, setPlan, PLAN_CONFIG, PLAN_FEATURES } from "../../services/planService";

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

const PLAN_ORDER: PlanId[] = ["basic", "pro", "elite"];

export default function SubscriptionScreen({ navigation }: any) {
  const [currentPlan, setCurrentPlan] = useState<PlanId>("basic");
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("pro");

  useEffect(() => {
    getCurrentPlan().then((p) => {
      setCurrentPlan(p);
      // Pre-select next tier up, or current if elite
      if (p === "basic") setSelectedPlan("pro");
      else if (p === "pro") setSelectedPlan("elite");
      else setSelectedPlan("elite");
    });
  }, []);

  const handleSubscribe = async () => {
    // TODO: Integrate RevenueCat for actual purchases
    // For now, save the plan locally so you can test restrictions
    await setPlan(selectedPlan);
    setCurrentPlan(selectedPlan);
    alert(`Plan changed to ${PLAN_CONFIG[selectedPlan].name}. In production this will go through ${Platform.OS === "ios" ? "App Store" : "Google Play"}.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={colors.accent} />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>Unlock the full StackWise experience</Text>

      {/* Plan cards */}
      {PLAN_ORDER.map((planId) => {
        const plan = PLAN_CONFIG[planId];
        const features = PLAN_FEATURES[planId];
        const color = PLAN_COLORS[planId];
        const icon = PLAN_ICONS[planId];
        const isSelected = selectedPlan === planId;
        const isCurrent = currentPlan === planId;

        return (
          <TouchableOpacity
            key={planId}
            style={[
              styles.planCard,
              isSelected && { borderColor: color, borderWidth: 2 },
            ]}
            onPress={() => setSelectedPlan(planId)}
            activeOpacity={0.7}
          >
            {planId === "pro" && (
              <View style={[styles.popularBadge, { backgroundColor: color }]}>
                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
              </View>
            )}

            <View style={styles.planHeader}>
              <View style={[styles.planIconCircle, { backgroundColor: color + "20" }]}>
                <Ionicons name={icon} size={24} color={color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={[styles.planPrice, { color }]}>{plan.price}</Text>
              </View>
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>CURRENT</Text>
                </View>
              )}
              {isSelected && !isCurrent && (
                <Ionicons name="checkmark-circle" size={24} color={color} />
              )}
            </View>

            <View style={styles.featureList}>
              {features.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={planId === "basic" ? colors.textSecondary : colors.success}
                  />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Subscribe / change button */}
      {selectedPlan !== currentPlan && (
        <TouchableOpacity
          style={[styles.subscribeBtn, { backgroundColor: PLAN_COLORS[selectedPlan] || colors.textSecondary }]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeBtnText}>
            {selectedPlan === "basic"
              ? "Switch to Basic (Free)"
              : `Subscribe to ${PLAN_CONFIG[selectedPlan].name} — ${PLAN_CONFIG[selectedPlan].price}`}
          </Text>
        </TouchableOpacity>
      )}

      {selectedPlan === currentPlan && (
        <View style={styles.currentPlanNote}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.currentPlanNoteText}>You're on the {PLAN_CONFIG[currentPlan].name} plan</Text>
        </View>
      )}

      <Text style={styles.legalText}>
        Subscriptions are billed monthly through {Platform.OS === "ios" ? "Apple" : "Google Play"}.
        Cancel anytime in your {Platform.OS === "ios" ? "App Store" : "Play Store"} settings.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: safeTop },
  header: { marginBottom: spacing.md },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  backBtnText: { fontSize: 15, fontWeight: "600", color: colors.accent },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 15, color: colors.textSecondary, marginBottom: spacing.lg },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  popularBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularBadgeText: { fontSize: 10, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  planHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  planIconCircle: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  planName: { fontSize: 18, fontWeight: "700", color: colors.text },
  planPrice: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  currentBadge: {
    backgroundColor: colors.success + "20",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  currentBadgeText: { fontSize: 11, fontWeight: "700", color: colors.success },
  featureList: { gap: 8 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  featureText: { fontSize: 14, color: colors.text },
  subscribeBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: spacing.md,
    marginBottom: 12,
  },
  subscribeBtnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  currentPlanNote: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginTop: spacing.md, marginBottom: 12,
  },
  currentPlanNoteText: { fontSize: 15, fontWeight: "600", color: colors.success },
  legalText: {
    fontSize: 12, color: colors.textSecondary, textAlign: "center",
    lineHeight: 18, marginTop: 8, paddingHorizontal: spacing.md,
  },
});
