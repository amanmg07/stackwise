import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../context/AppContext";
import { colors, highlights, spacing, safeTop, safeBottom } from "../../theme";
import { AdministrationRoute } from "../../types";
import GlassCard from "../../components/GlassCard";

const ROUTES: { key: AdministrationRoute; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { key: "subcutaneous", label: "SubQ Injection", icon: "medkit-outline", color: "#4ade80" },
  { key: "intramuscular", label: "IM Injection", icon: "fitness-outline", color: "#60a5fa" },
  { key: "oral", label: "Oral", icon: "nutrition-outline", color: "#facc15" },
  { key: "nasal", label: "Nasal", icon: "water-outline", color: "#c084fc" },
  { key: "topical", label: "Topical", icon: "hand-left-outline", color: "#f472b6" },
];

const GOAL_DISPLAY: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  recovery: { label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  fat_loss: { label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  muscle_gain: { label: "Muscle Gain", icon: "barbell-outline", color: "#60a5fa" },
  anti_aging: { label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  sleep: { label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  cognitive: { label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
  immune: { label: "Immune Health", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  sexual_health: { label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
};

export default function ProtocolBuilderScreen({ navigation }: any) {
  const { cycles, settings, updateSettings } = useApp();
  const activeCycle = cycles.find((c) => c.isActive);
  const userGoals = settings.goals || [];
  const selectedRoutes = settings.preferredRoutes ?? ROUTES.map((r) => r.key);

  // Gentle infinite pulse on the Self Scan button — flags it as the
  // marquee feature without being distracting. Scale 1 → 1.04 → 1
  // over ~1.6s using native driver.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  const toggleRoute = (route: AdministrationRoute) => {
    const updated = selectedRoutes.includes(route)
      ? selectedRoutes.filter((r) => r !== route)
      : [...selectedRoutes, route];
    updateSettings({ preferredRoutes: updated });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: safeBottom }}>
      {/* Welcome header */}
      <View style={styles.headerRow}>
        <View style={{ width: 32 }} />
        <View style={styles.headerCenter}>
          <Image source={require("../../../assets/logo.png")} style={styles.headerLogo} />
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => navigation.navigate("Profile")}
        >
          <Ionicons name="person-circle-outline" size={32} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Active cycle quick card */}
      {activeCycle && (
        <TouchableOpacity onPress={() => navigation.navigate("CycleTab")} activeOpacity={0.7}>
          <GlassCard style={styles.activeCycleCard}>
            <View style={styles.activeCycleDot} />
            <View style={{ flex: 1 }}>
              <Text style={styles.activeCycleLabel}>Active Cycle</Text>
              <Text style={styles.activeCycleName}>{activeCycle.name}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </GlassCard>
        </TouchableOpacity>
      )}

      {/* Your Goals (from profile) */}
      <TouchableOpacity onPress={() => navigation.navigate("EditDemographics")} activeOpacity={0.7}>
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Your Goals</Text>
          <View style={styles.editHint}>
            <Ionicons name="create-outline" size={14} color={colors.accent} />
            <Text style={styles.editHintText}>Edit</Text>
          </View>
        </View>
        {userGoals.length > 0 ? (
          <View style={styles.goalsGrid}>
            {userGoals.map((g) => {
              const info = GOAL_DISPLAY[g];
              if (!info) return null;
              return (
                <GlassCard key={g} style={[styles.goalCard, Platform.OS === "ios" ? { borderColor: info.color } : {}]}>
                  <Ionicons name={info.icon} size={28} color={info.color} />
                  <Text style={[styles.goalLabel, { color: info.color }]}>{info.label}</Text>
                </GlassCard>
              );
            })}
          </View>
        ) : (
          <View style={styles.setGoalsBtn}>
            <Ionicons name="add-circle-outline" size={16} color={colors.accent} />
            <Text style={styles.setGoalsBtnText}>Tap to set your goals</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Route preferences */}
      {userGoals.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Preferred administration</Text>
          <View style={styles.routeGrid}>
            {ROUTES.map((r, i) => {
              const selected = selectedRoutes.includes(r.key);
              const isInjection = i < 2;
              return (
                <TouchableOpacity
                  key={r.key}
                  style={isInjection ? styles.routeWrapLarge : styles.routeWrapSmall}
                  onPress={() => toggleRoute(r.key)}
                  activeOpacity={0.7}
                >
                  <GlassCard
                    style={[
                      styles.routeChip,
                      selected ? { borderColor: r.color, borderWidth: 1.5 } : styles.routeChipInactive,
                    ]}
                  >
                    <Ionicons name={r.icon} size={isInjection ? 24 : 20} color={selected ? r.color : colors.textSecondary} />
                    <Text style={[styles.routeLabel, selected ? { color: r.color } : styles.routeLabelInactive]}>{r.label}</Text>
                  </GlassCard>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.buildBtn, (userGoals.length === 0 || selectedRoutes.length === 0) && styles.buildBtnDisabled]}
        disabled={userGoals.length === 0 || selectedRoutes.length === 0}
        onPress={() => navigation.navigate("ProtocolResult", { goals: userGoals, routes: selectedRoutes })}
      >
        <Ionicons name="flash" size={20} color={colors.background} />
        <Text style={styles.buildBtnText}>View Recommended Protocols</Text>
      </TouchableOpacity>

      <Animated.View style={{ transform: [{ scale }], marginTop: 12, borderRadius: 14, overflow: "hidden" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ScannerTab")}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={["rgba(252,211,77,0.04)", "rgba(245,158,11,0.16)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.selfScanBtn}
          >
            <Ionicons name="scan-outline" size={20} color={highlights.yellow} />
            <Text style={styles.selfScanBtnText}>Self Scan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: safeTop },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 8, marginBottom: 8 },
  headerCenter: { alignItems: "center", flex: 1 },
  headerLogo: { width: 140, height: 140, resizeMode: "contain" },
  profileBtn: { padding: 4 },
  welcome: { fontSize: 24, fontWeight: "900", color: colors.accent, letterSpacing: -0.5 },
  activeCycleCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 16, marginBottom: 24,
  },
  activeCycleDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  activeCycleLabel: { fontSize: 11, color: colors.success, fontWeight: "600", textTransform: "uppercase" },
  activeCycleName: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 2 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  editHint: { flexDirection: "row", alignItems: "center", gap: 4 },
  editHintText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  sectionTitle: {
    fontSize: 20, fontWeight: "700", color: colors.text,
  },
  sectionDesc: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  goalsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 24 },
  goalCard: {
    width: "48.5%", borderRadius: 14,
    padding: 18, alignItems: "center", gap: 8,
  },
  goalLabel: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  setGoalsBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "30", marginBottom: 24,
  },
  setGoalsBtnText: { fontSize: 14, fontWeight: "600", color: colors.accent },
  routeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10, marginBottom: 24 },
  routeWrapLarge: { width: "48.5%" },
  routeWrapSmall: { width: "32%" },
  routeChip: {
    alignItems: "center", gap: 6, paddingVertical: 16, borderRadius: 14,
    position: "relative",
  },
  routeLabel: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  routeChipInactive: {},
  routeLabelInactive: { color: colors.textSecondary },
  buildBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
  },
  buildBtnDisabled: { opacity: 0.4 },
  buildBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  selfScanBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    padding: 18,
  },
  // Bright yellow text + icon on the translucent tint — looks like
  // yellow glass over the dark surface.
  selfScanBtnText: { fontSize: 16, fontWeight: "700", color: "#fcd34d" },
  linkRow: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 14, padding: 16, marginBottom: 8,
  },
  linkTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  linkDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
