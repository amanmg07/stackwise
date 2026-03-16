import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { useToast } from "../../context/ToastContext";

interface CommunityStack {
  id: string;
  author: string;
  title: string;
  description: string;
  goals: string[];
  peptides: { peptideId: string; dose: string; frequency: string }[];
  difficulty: "beginner" | "intermediate" | "advanced";
  likes: number;
  duration: string;
}

const GOAL_COLORS: Record<string, string> = {
  recovery: "#4ade80", fat_loss: "#f87171", muscle_gain: "#60a5fa",
  anti_aging: "#c084fc", cognitive: "#facc15", sleep: "#818cf8",
  immune: "#2dd4bf", sexual_health: "#f472b6", hormone: "#fb923c",
};

const DIFFICULTY_COLORS = {
  beginner: colors.success,
  intermediate: colors.warning,
  advanced: colors.error,
};

const POPULAR_STACKS: CommunityStack[] = [
  {
    id: "cs1",
    author: "PeptidePro",
    title: "The Wolverine Recovery Stack",
    description: "The gold standard healing combo. BPC + TB-500 for full-body recovery with GHK-Cu for tissue remodeling. Run this after injuries or hard training blocks.",
    goals: ["recovery"],
    peptides: [
      { peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" },
      { peptideId: "tb500", dose: "2.5 mg", frequency: "2x weekly" },
      { peptideId: "ghkcu", dose: "0.2 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 342,
    duration: "6 weeks",
  },
  {
    id: "cs2",
    author: "GHMaxx",
    title: "Clean GH Blast",
    description: "CJC + Ipamorelin is the classic GH stack. Natural pulsatile release, minimal side effects. Great for body recomp, better sleep, and anti-aging.",
    goals: ["muscle_gain", "anti_aging", "fat_loss"],
    peptides: [
      { peptideId: "cjc1295_nodac", dose: "0.1 mg", frequency: "3x daily" },
      { peptideId: "ipamorelin", dose: "0.2 mg", frequency: "3x daily" },
    ],
    difficulty: "intermediate",
    likes: 289,
    duration: "8-12 weeks",
  },
  {
    id: "cs3",
    author: "LeanKing",
    title: "Ultimate Recomp Stack",
    description: "Tesamorelin targets visceral fat while CJC/Ipa handles overall GH optimization. Add BPC for recovery from intense training.",
    goals: ["fat_loss", "muscle_gain"],
    peptides: [
      { peptideId: "tesamorelin", dose: "1 mg", frequency: "1x daily" },
      { peptideId: "cjc_ipa_blend", dose: "0.3 mg", frequency: "2x daily" },
      { peptideId: "bpc157", dose: "0.25 mg", frequency: "1x daily" },
    ],
    difficulty: "intermediate",
    likes: 256,
    duration: "10 weeks",
  },
  {
    id: "cs4",
    author: "BrainStack",
    title: "Cognitive Enhancement Protocol",
    description: "Selank for anxiety reduction + Semax for focus and mental clarity. A clean nootropic stack with no crash or dependency.",
    goals: ["cognitive"],
    peptides: [
      { peptideId: "selank", dose: "0.25 mg", frequency: "1x daily" },
      { peptideId: "semax", dose: "0.5 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 198,
    duration: "4-6 weeks",
  },
  {
    id: "cs5",
    author: "SleepDoc",
    title: "Deep Sleep Protocol",
    description: "DSIP for deep sleep architecture + Ipamorelin for nighttime GH pulse. Wake up feeling genuinely recovered.",
    goals: ["sleep", "recovery"],
    peptides: [
      { peptideId: "dsip", dose: "0.1 mg", frequency: "1x before bed" },
      { peptideId: "ipamorelin", dose: "0.2 mg", frequency: "1x before bed" },
    ],
    difficulty: "beginner",
    likes: 215,
    duration: "4 weeks",
  },
  {
    id: "cs6",
    author: "LongevityLab",
    title: "Anti-Aging Longevity Stack",
    description: "Epithalon for telomere support, GHK-Cu for skin and tissue renewal, MOTS-c for mitochondrial function. The longevity trifecta.",
    goals: ["anti_aging"],
    peptides: [
      { peptideId: "epithalon", dose: "5 mg", frequency: "1x daily for 10 days" },
      { peptideId: "ghkcu", dose: "0.2 mg", frequency: "1x daily" },
      { peptideId: "motsc", dose: "5 mg", frequency: "3x weekly" },
    ],
    difficulty: "advanced",
    likes: 178,
    duration: "8 weeks",
  },
  {
    id: "cs7",
    author: "ShredMode",
    title: "Fat Burner Express",
    description: "AOD-9604 targets fat cells directly without the side effects of full GH. Pair with Tesamorelin to hit visceral fat from two angles.",
    goals: ["fat_loss"],
    peptides: [
      { peptideId: "aod9604", dose: "0.3 mg", frequency: "1x daily" },
      { peptideId: "tesamorelin", dose: "1 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 231,
    duration: "8 weeks",
  },
  {
    id: "cs8",
    author: "ImmuneBoost",
    title: "Immune Defense Protocol",
    description: "Thymosin Alpha-1 for deep immune modulation + KPV for gut inflammation. Great during cold/flu season or after illness.",
    goals: ["immune"],
    peptides: [
      { peptideId: "thymosin_a1", dose: "1.5 mg", frequency: "2x weekly" },
      { peptideId: "kpv", dose: "0.2 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 145,
    duration: "6 weeks",
  },
];

export default function CommunityScreen({ navigation }: any) {
  const { showToast } = useToast();
  const [likedStacks, setLikedStacks] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    setLikedStacks((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const shareStack = async (stack: CommunityStack) => {
    const peptideList = stack.peptides
      .map((p) => {
        const pep = peptideDB.find((pp) => pp.id === p.peptideId);
        return `  ${pep?.name || p.peptideId} — ${p.dose}, ${p.frequency}`;
      })
      .join("\n");

    const message = `${stack.title}\nby ${stack.author}\n\n${stack.description}\n\nPeptides:\n${peptideList}\n\nDuration: ${stack.duration} | Difficulty: ${stack.difficulty}\n\nShared from StackWise`;

    try {
      await Share.share({ message });
    } catch {}
  };

  const copyStack = (stack: CommunityStack) => {
    navigation.navigate("CycleTab", {
      screen: "NewCycle",
      params: {
        communityStack: {
          name: stack.title,
          peptides: stack.peptides,
        },
      },
    });
    showToast("Stack copied — customize and start your cycle!");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={POPULAR_STACKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Community</Text>
            <Text style={styles.subtitle}>Popular stacks from the peptide community</Text>
          </>
        }
        renderItem={({ item }) => {
          const liked = likedStacks.includes(item.id);
          const displayLikes = liked ? item.likes + 1 : item.likes;
          return (
            <View style={styles.card}>
              {/* Author + difficulty */}
              <View style={styles.cardTop}>
                <View style={styles.authorRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.author[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.authorName}>{item.author}</Text>
                    <Text style={styles.durationText}>{item.duration}</Text>
                  </View>
                </View>
                <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + "20" }]}>
                  <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[item.difficulty] }]}>
                    {item.difficulty}
                  </Text>
                </View>
              </View>

              {/* Title + description */}
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc}>{item.description}</Text>

              {/* Goals */}
              <View style={styles.goalRow}>
                {item.goals.map((g) => (
                  <View key={g} style={[styles.goalTag, { backgroundColor: (GOAL_COLORS[g] || "#888") + "20" }]}>
                    <Text style={[styles.goalTagText, { color: GOAL_COLORS[g] || "#888" }]}>
                      {g.replace("_", " ")}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Peptides */}
              <View style={styles.pepSection}>
                {item.peptides.map((p) => {
                  const pep = peptideDB.find((pp) => pp.id === p.peptideId);
                  return (
                    <View key={p.peptideId} style={styles.pepRow}>
                      <Text style={styles.pepName}>{pep?.name || p.peptideId}</Text>
                      <Text style={styles.pepDose}>{p.dose} · {p.frequency}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                  <Ionicons
                    name={liked ? "heart" : "heart-outline"}
                    size={20}
                    color={liked ? colors.error : colors.textSecondary}
                  />
                  <Text style={[styles.actionText, liked && { color: colors.error }]}>{displayLikes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => shareStack(item)}>
                  <Ionicons name="share-outline" size={20} color={colors.textSecondary} />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.copyBtn} onPress={() => copyStack(item)}>
                  <Ionicons name="copy-outline" size={16} color={colors.accent} />
                  <Text style={styles.copyBtnText}>Use This Stack</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === "ios" ? 60 : 0 },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.md, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.textSecondary, paddingHorizontal: spacing.md, marginBottom: 16 },
  card: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 16,
    marginHorizontal: spacing.md, marginBottom: 14,
    borderWidth: 1, borderColor: colors.border,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent + "20", alignItems: "center", justifyContent: "center",
  },
  avatarText: { fontSize: 15, fontWeight: "700", color: colors.accent },
  authorName: { fontSize: 13, fontWeight: "600", color: colors.text },
  durationText: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  diffBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  diffText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 6 },
  cardDesc: { fontSize: 13, color: colors.textSecondary, lineHeight: 19, marginBottom: 12 },
  goalRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  goalTag: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  goalTagText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  pepSection: {
    backgroundColor: colors.background, borderRadius: 10, padding: 10,
    marginBottom: 12,
  },
  pepRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pepName: { fontSize: 13, fontWeight: "600", color: colors.text },
  pepDose: { fontSize: 12, color: colors.textSecondary },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 13, color: colors.textSecondary },
  copyBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    marginLeft: "auto",
    backgroundColor: colors.accent + "15", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  copyBtnText: { fontSize: 13, fontWeight: "600", color: colors.accent },
});
