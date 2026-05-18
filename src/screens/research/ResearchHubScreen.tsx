import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides } from "../../data/peptides";
import { matchesQuery } from "../../utils/peptideMatch";
import { colors, spacing, safeTop, safeBottom } from "../../theme";
import { PeptideCategory, AdministrationRoute, CompoundType } from "../../types";

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

const ROUTE_FILTERS: { key: AdministrationRoute | "all"; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "All Routes", icon: "apps-outline" },
  { key: "subcutaneous", label: "SubQ", icon: "medkit-outline" },
  { key: "intramuscular", label: "IM", icon: "fitness-outline" },
  { key: "oral", label: "Oral", icon: "nutrition-outline" },
  { key: "nasal", label: "Nasal", icon: "water-outline" },
  { key: "topical", label: "Topical", icon: "hand-left-outline" },
];

const TYPE_FILTERS: { key: "all" | CompoundType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: "peptide", label: "Peptides", icon: "flask-outline" },
  { key: "supplement", label: "Supplements", icon: "leaf-outline" },
];

export default function ResearchHubScreen({ navigation, embedded }: any) {
  const [search, setSearch] = useState("");
  const [selectedCats, setSelectedCats] = useState<PeptideCategory[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<AdministrationRoute[]>([]);
  const [selectedType, setSelectedType] = useState<"all" | CompoundType>("all");

  const isSupplements = selectedType === "supplement";

  const handleTypeChange = (key: "all" | CompoundType) => {
    setSelectedType(key);
    if (key === "supplement") {
      setSelectedRoutes([]);
    }
  };

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
      const matchSearch = matchesQuery(p, search);
      const matchCat = selectedCats.length === 0 || selectedCats.some((c) => p.categories.includes(c));
      const matchRoute = selectedRoutes.length === 0 || selectedRoutes.some((r) => p.routes.includes(r));
      const matchType = selectedType === "all" || (p.compoundType || "peptide") === selectedType;
      return matchSearch && matchCat && matchRoute && matchType;
    });
  }, [search, selectedCats, selectedRoutes, selectedType]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <View style={[styles.container, embedded && styles.containerEmbedded]}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search peptides & supplements..."
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

      {/* Type filter */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {TYPE_FILTERS.map((tf) => {
            const active = tf.key === selectedType;
            return (
            <TouchableOpacity key={tf.key} style={[styles.chip, active && styles.chipActive]} onPress={() => handleTypeChange(tf.key)}>
              <Ionicons name={tf.icon} size={12} color={active ? colors.background : colors.textSecondary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{tf.label}</Text>
            </TouchableOpacity>
          );})}
        </ScrollView>
      </View>

      {/* Category chips */}
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {CATEGORIES.map((cat) => {
            const active = cat.key === "all" ? selectedCats.length === 0 : selectedCats.includes(cat.key as PeptideCategory);
            return (
            <TouchableOpacity key={cat.key} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleCat(cat.key)}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );})}
        </ScrollView>
      </View>

      {/* Route filter chips — hidden when Supplements is selected */}
      {!isSupplements && (
      <View style={styles.chipsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {ROUTE_FILTERS.map((rf) => {
            const active = rf.key === "all" ? selectedRoutes.length === 0 : selectedRoutes.includes(rf.key as AdministrationRoute);
            return (
            <TouchableOpacity key={rf.key} style={[styles.chip, active && styles.chipActive]} onPress={() => toggleRoute(rf.key)}>
              <Ionicons name={rf.icon} size={12} color={active ? colors.background : colors.textSecondary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{rf.label}</Text>
            </TouchableOpacity>
          );})}
        </ScrollView>
      </View>
      )}

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
      <Text style={[styles.resultCount, { paddingHorizontal: spacing.md, marginBottom: 6 }]}>
        {filtered.length} {filtered.length === 1 ? "result" : "results"}
      </Text>

      {/* Peptide list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: safeBottom }}
        keyboardDismissMode="on-drag"
        maxToRenderPerBatch={15}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("PeptideDetail", { peptideId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              {item.compoundType === "supplement" && (
                <View style={[styles.blendBadge, { backgroundColor: "#4ade80" + "15", borderColor: "#4ade80" + "30" }]}>
                  <Ionicons name="leaf-outline" size={10} color="#4ade80" />
                  <Text style={[styles.blendBadgeText, { color: "#4ade80" }]}>Supplement</Text>
                </View>
              )}
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
            <Text style={styles.emptyText}>No results found</Text>
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
    borderRadius: 10,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: colors.text },
  chipsWrapper: { height: 36, marginBottom: 4 },
  chipsContent: { paddingHorizontal: spacing.md, alignItems: "center", height: 36 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 30,
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  chipTextActive: { color: colors.background },
  subHeaderRow: {
    paddingHorizontal: spacing.md, marginBottom: 6, marginTop: 2,
  },
  toolsRow: {
    flexDirection: "row", gap: 8, paddingHorizontal: spacing.md, marginBottom: 6, marginTop: 2,
  },
  toolBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    backgroundColor: colors.accent + "12", borderRadius: 10, paddingVertical: 9,
    borderWidth: 1, borderColor: colors.accent + "25",
  },
  toolBtnText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  resultCount: {
    fontSize: 12, color: colors.textSecondary,
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
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
