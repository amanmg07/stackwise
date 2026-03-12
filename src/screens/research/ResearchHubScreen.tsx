import React, { useState, useMemo } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ScrollView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { PeptideCategory } from "../../types";

const CATEGORIES: { key: PeptideCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "recovery", label: "Recovery" },
  { key: "fat_loss", label: "Fat Loss" },
  { key: "muscle_gain", label: "Muscle" },
  { key: "anti_aging", label: "Anti-Aging" },
  { key: "sleep", label: "Sleep" },
  { key: "cognitive", label: "Cognitive" },
  { key: "immune", label: "Immune" },
];

const CATEGORY_COLORS: Record<string, string> = {
  recovery: "#4ade80",
  fat_loss: "#f87171",
  muscle_gain: "#60a5fa",
  anti_aging: "#c084fc",
  cognitive: "#facc15",
  sleep: "#818cf8",
  immune: "#2dd4bf",
};

export default function ResearchHubScreen({ navigation, embedded }: any) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PeptideCategory | "all">("all");

  const filtered = useMemo(() => {
    return peptides.filter((p) => {
      const matchSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.abbreviation?.toLowerCase().includes(search.toLowerCase()));
      const matchCat = category === "all" || p.categories.includes(category);
      return matchSearch && matchCat;
    });
  }, [search, category]);

  return (
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={styles.chipsContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.chip, category === cat.key && styles.chipActive]}
            onPress={() => setCategory(cat.key)}
          >
            <Text style={[styles.chipText, category === cat.key && styles.chipTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Peptide list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("PeptideDetail", { peptideId: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{item.name}</Text>
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
              <Text style={styles.metaText}>
                {item.routes.map((r) => r.charAt(0).toUpperCase() + r.slice(0, 2)).join(" · ")}
              </Text>
              <Text style={styles.metaText}>t½ {item.halfLife}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 60 : 0 },
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
  chips: { flexGrow: 0, marginBottom: spacing.sm },
  chipsContent: { paddingHorizontal: spacing.md, alignItems: "center" },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, includeFontPadding: false },
  chipTextActive: { color: colors.background },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  cardName: { fontSize: 17, fontWeight: "700", color: colors.text },
  cardAbbr: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  tagText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 8 },
  cardMeta: { flexDirection: "row", justifyContent: "space-between" },
  metaText: { fontSize: 12, color: colors.textSecondary },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: colors.textSecondary },
});
