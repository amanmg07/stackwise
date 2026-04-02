import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides } from "../../data/peptides";
import { colors, spacing, safeTop } from "../../theme";
import { PeptideCategory, AdministrationRoute } from "../../types";

const CATEGORIES: { key: PeptideCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recovery", label: "Recovery" },
  { key: "fat_loss", label: "Fat Loss" },
  { key: "muscle_gain", label: "Muscle" },
  { key: "anti_aging", label: "Anti-Aging" },
  { key: "sleep", label: "Sleep" },
  { key: "cognitive", label: "Cognitive" },
  { key: "immune", label: "Immune" },
  { key: "sexual_health", label: "Sexual Health" },
  { key: "hormone", label: "Hormone" },
];

const CATEGORY_COLORS: Record<string, string> = {
  recovery: "#4ade80",
  fat_loss: "#f87171",
  muscle_gain: "#60a5fa",
  anti_aging: "#c084fc",
  cognitive: "#facc15",
  sleep: "#818cf8",
  immune: "#2dd4bf",
  sexual_health: "#f472b6",
  hormone: "#fb923c",
};

const ROUTE_ICONS: Record<string, { icon: keyof typeof Ionicons.glyphMap; label: string }> = {
  subcutaneous: { icon: "medical-outline", label: "Injection" },
  intramuscular: { icon: "medical-outline", label: "IM Injection" },
  oral: { icon: "nutrition-outline", label: "Oral" },
  topical: { icon: "hand-left-outline", label: "Topical" },
  nasal: { icon: "water-outline", label: "Nasal" },
};

const INJECTION_STEPS = [
  { step: "1", title: "Gather supplies", detail: "Insulin syringe (29-31g), alcohol wipes, bacteriostatic water (if reconstituting), peptide vial, and a sharps container." },
  { step: "2", title: "Wash your hands", detail: "Scrub with soap and water for at least 20 seconds. Dry with a clean towel." },
  { step: "3", title: "Reconstitute (if powder)", detail: "Wipe the vial top with an alcohol swab. Slowly inject bacteriostatic water down the side of the vial — never spray directly onto the powder. Gently swirl, don't shake." },
  { step: "4", title: "Draw your dose", detail: "Wipe the vial top again with a fresh alcohol swab. Pull back the plunger to your dose, insert the needle into the vial, push air in, then invert and draw out your dose. Flick out any air bubbles." },
  { step: "5", title: "Clean the injection site", detail: "Wipe the area with an alcohol swab in a circular motion. Let it air dry completely — don't blow on it. Common sites: belly fat (2 inches from navel), outer thigh, or back of arm." },
  { step: "6", title: "Inject", detail: "Pinch the skin, insert the needle at a 45-90° angle (subcutaneous). Push the plunger slowly and steadily. Hold for 5-10 seconds before withdrawing." },
  { step: "7", title: "After injection", detail: "Apply light pressure with an alcohol swab if needed — don't rub. Dispose of the syringe in a sharps container. Never recap or reuse needles. Rotate injection sites to avoid scar tissue." },
];

const ROUTE_FILTERS: { key: AdministrationRoute | "all"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "All Routes", icon: "apps-outline" },
  { key: "subcutaneous", label: "SubQ", icon: "medkit-outline" },
  { key: "intramuscular", label: "IM", icon: "fitness-outline" },
  { key: "oral", label: "Oral", icon: "nutrition-outline" },
  { key: "nasal", label: "Nasal", icon: "water-outline" },
  { key: "topical", label: "Topical", icon: "hand-left-outline" },
];

export default function ResearchHubScreen({ navigation, embedded }: any) {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<PeptideCategory[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<AdministrationRoute[]>([]);
  const [showGuide, setShowGuide] = useState(false);

  const toggleCat = (key: PeptideCategory | "all") => {
    if (key === "all") {
      setSelectedCats([]);
    } else {
      setSelectedCats((prev) =>
        prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
      );
    }
  };

  const toggleRoute = (key: AdministrationRoute | "all") => {
    if (key === "all") {
      setSelectedRoutes([]);
    } else {
      setSelectedRoutes((prev) =>
        prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
      );
    }
  };

  const filtered = useMemo(() => {
    return peptides.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.abbreviation?.toLowerCase().includes(search.toLowerCase()));
      const matchCat = selectedCats.length === 0 || selectedCats.some((c) => p.categories.includes(c));
      const matchRoute = selectedRoutes.length === 0 || selectedRoutes.some((r) => p.routes.includes(r));
      return matchSearch && matchCat && matchRoute;
    });
  }, [search, selectedCats, selectedRoutes]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search peptides..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {CATEGORIES.map((cat) => {
            const active = cat.key === "all" ? selectedCats.length === 0 : selectedCats.includes(cat.key as PeptideCategory);
            return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleCat(cat.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );})}
        </ScrollView>
      </View>

      {/* Route filter chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {ROUTE_FILTERS.map((rf) => {
            const active = rf.key === "all" ? selectedRoutes.length === 0 : selectedRoutes.includes(rf.key as AdministrationRoute);
            return (
            <TouchableOpacity
              key={rf.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => toggleRoute(rf.key)}
            >
              <Ionicons name={rf.icon} size={13} color={active ? colors.background : colors.textSecondary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {rf.label}
              </Text>
            </TouchableOpacity>
          );})}
        </ScrollView>
      </View>

      {/* Tools row */}
      <View style={styles.toolsRow}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => navigation.navigate("InteractionChecker")}
        >
          <Ionicons name="git-compare-outline" size={16} color={colors.accent} />
          <Text style={styles.toolBtnText}>Interactions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => navigation.navigate("Compare")}
        >
          <Ionicons name="swap-horizontal-outline" size={16} color={colors.accent} />
          <Text style={styles.toolBtnText}>Compare</Text>
        </TouchableOpacity>
      </View>

      {/* Result count */}
      <Text style={styles.resultCount}>
        {filtered.length} {filtered.length === 1 ? "result" : "results"}
      </Text>

      {/* Peptide list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
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
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("PeptideDetail", { peptideId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              {item.isBlend && (
                <View style={styles.blendBadge}>
                  <Ionicons name="layers-outline" size={10} color={colors.accent} />
                  <Text style={styles.blendBadgeText}>Blend</Text>
                </View>
              )}
              {item.abbreviation && item.abbreviation !== item.name && (
                <Text style={styles.cardAbbr}>{item.abbreviation}</Text>
              )}
            </View>
            <View style={styles.tags}>
              {item.categories.map((cat) => (
                <View key={cat} style={[styles.tag, { backgroundColor: (CATEGORY_COLORS[cat] || "#888") + "20" }]}>
                  <Text style={[styles.tagText, { color: CATEGORY_COLORS[cat] || "#888" }]}>
                    {cat.replace("_", " ")}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardMeta}>
              {item.routes.map((r) => {
                const info = ROUTE_ICONS[r] || { icon: "ellipse-outline" as const, label: r };
                return (
                  <View key={r} style={styles.routePill}>
                    <Ionicons name={info.icon} size={12} color={colors.textSecondary} />
                    <Text style={styles.routeText}>{info.label}</Text>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="flask-outline" size={40} color={colors.border} />
            <Text style={styles.emptyText}>No peptides found</Text>
          </View>
        }
      />
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  containerEmbedded: { paddingTop: 0 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    margin: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  chipsWrapper: { height: 44, marginBottom: 4 },
  chipsContent: { paddingHorizontal: spacing.md, alignItems: "center", height: 44 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    height: 36,
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.background },
  toolsRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: spacing.md, marginBottom: 10,
  },
  toolBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.accent + "12", borderRadius: 10, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.accent + "25",
  },
  toolBtnText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  resultCount: {
    fontSize: 12, color: colors.textSecondary, paddingHorizontal: spacing.md,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" },
  cardName: { fontSize: 17, fontWeight: "700", color: colors.text, flexShrink: 1 },
  cardAbbr: { fontSize: 13, color: colors.textSecondary, fontWeight: "500", flexShrink: 1 },
  blendBadge: {
    flexDirection: "row", alignItems: "center", gap: 3,
    backgroundColor: colors.accent + "15", borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  blendBadgeText: { fontSize: 10, fontWeight: "700", color: colors.accent, textTransform: "uppercase" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  routePill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.background, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  routeText: { fontSize: 11, color: colors.textSecondary },
  // Injection guide
  guideCard: {
    backgroundColor: colors.surface, borderRadius: 14,
    marginHorizontal: spacing.md, marginBottom: 12,
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
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
