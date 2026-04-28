import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme";
import { PlanId } from "../types";
import { PLAN_CONFIG, PLAN_FEATURES } from "../services/planService";

interface Props {
  visible: boolean;
  message: string;
  suggestedPlan: PlanId;
  onUpgrade: () => void;
  onDismiss: () => void;
}

export default function UpgradePrompt({ visible, message, suggestedPlan, onUpgrade, onDismiss }: Props) {
  const plan = PLAN_CONFIG[suggestedPlan];
  const features = PLAN_FEATURES[suggestedPlan];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-open-outline" size={32} color={colors.accent} />
          </View>

          <Text style={styles.title}>Upgrade to {plan.name}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.featureList}>
            {features.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.upgradeBtn} onPress={onUpgrade}>
            <Text style={styles.upgradeBtnText}>Upgrade to {plan.name} — {plan.price}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dismissBtn} onPress={onDismiss}>
            <Text style={styles.dismissBtnText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  featureList: {
    width: "100%",
    gap: 10,
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  upgradeBtn: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  upgradeBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.background,
  },
  dismissBtn: {
    paddingVertical: 8,
  },
  dismissBtnText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
