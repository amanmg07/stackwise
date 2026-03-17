import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Platform, Share, Alert, Image, RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";
import { useToast } from "../../context/ToastContext";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../utils/supabase";
import { CommunityPost } from "../../types";

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
  createdAt?: string;
  isUserPost?: boolean;
  userId?: string;
  avatarUrl?: string | null;
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

function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const POPULAR_STACKS: CommunityStack[] = [
  {
    id: "cs1",
    author: "PeptidePro",
    title: "The Wolverine Recovery Stack",
    description: "Been running this for 4 weeks after a torn rotator cuff. Pain is almost gone and my physio is shocked at how fast I'm healing. BPC near the injury + TB systemically is the way.",
    goals: ["recovery"],
    peptides: [
      { peptideId: "bpc157", dose: "0.25 mg", frequency: "2x daily" },
      { peptideId: "tb500", dose: "2.5 mg", frequency: "2x weekly" },
      { peptideId: "ghkcu", dose: "0.2 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 342,
    duration: "6 weeks",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs2",
    author: "GHMaxx",
    title: "Clean GH Blast",
    description: "3 months in — sleep is deeper, body comp noticeably better, and my skin looks 5 years younger. This combo just works. Inject on empty stomach before bed for best results.",
    goals: ["muscle_gain", "anti_aging", "fat_loss"],
    peptides: [
      { peptideId: "cjc1295_nodac", dose: "0.1 mg", frequency: "3x daily" },
      { peptideId: "ipamorelin", dose: "0.2 mg", frequency: "3x daily" },
    ],
    difficulty: "intermediate",
    likes: 289,
    duration: "8-12 weeks",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs3",
    author: "LeanKing",
    title: "Ultimate Recomp Stack",
    description: "Down 14 lbs in 10 weeks while gaining strength. Tesamorelin melted the belly fat and the CJC/Ipa keeps energy and recovery high. Best recomp I've ever done.",
    goals: ["fat_loss", "muscle_gain"],
    peptides: [
      { peptideId: "tesamorelin", dose: "1 mg", frequency: "1x daily" },
      { peptideId: "cjc_ipa_blend", dose: "0.3 mg", frequency: "2x daily" },
      { peptideId: "bpc157", dose: "0.25 mg", frequency: "1x daily" },
    ],
    difficulty: "intermediate",
    likes: 256,
    duration: "10 weeks",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs4",
    author: "BrainStack",
    title: "Cognitive Enhancement Protocol",
    description: "This replaced my morning coffee. Selank kills my anxiety and Semax gives me laser focus for 4-5 hours. No crash, no jitters. Nasal spray is the move.",
    goals: ["cognitive"],
    peptides: [
      { peptideId: "selank", dose: "0.25 mg", frequency: "1x daily" },
      { peptideId: "semax", dose: "0.5 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 198,
    duration: "4-6 weeks",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs5",
    author: "SleepDoc",
    title: "Deep Sleep Protocol",
    description: "I was averaging 5 hours of broken sleep. Two weeks on this and I'm getting 7-8 hours of deep sleep. DSIP before bed knocked me out in the best way. Game changer.",
    goals: ["sleep", "recovery"],
    peptides: [
      { peptideId: "dsip", dose: "0.1 mg", frequency: "1x before bed" },
      { peptideId: "ipamorelin", dose: "0.2 mg", frequency: "1x before bed" },
    ],
    difficulty: "beginner",
    likes: 215,
    duration: "4 weeks",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs6",
    author: "LongevityLab",
    title: "Anti-Aging Longevity Stack",
    description: "Running this twice a year. Bloodwork shows IGF-1 optimized, inflammation markers way down. My doctor asked what I changed. Skin is visibly tighter too. Worth the investment.",
    goals: ["anti_aging"],
    peptides: [
      { peptideId: "epithalon", dose: "5 mg", frequency: "1x daily for 10 days" },
      { peptideId: "ghkcu", dose: "0.2 mg", frequency: "1x daily" },
      { peptideId: "motsc", dose: "5 mg", frequency: "3x weekly" },
    ],
    difficulty: "advanced",
    likes: 178,
    duration: "8 weeks",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs7",
    author: "ShredMode",
    title: "Fat Burner Express",
    description: "Lost 2 inches off my waist in 6 weeks without changing diet. AOD handles stubborn fat areas and Tesamorelin hits the visceral stuff. No hunger sides at all.",
    goals: ["fat_loss"],
    peptides: [
      { peptideId: "aod9604", dose: "0.3 mg", frequency: "1x daily" },
      { peptideId: "tesamorelin", dose: "1 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 231,
    duration: "8 weeks",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "cs8",
    author: "ImmuneBoost",
    title: "Immune Defense Protocol",
    description: "Started this after getting sick 3 times in 2 months. Haven't been sick once since. Also fixed my gut issues I'd been dealing with for years. TA1 is underrated.",
    goals: ["immune"],
    peptides: [
      { peptideId: "thymosin_a1", dose: "1.5 mg", frequency: "2x weekly" },
      { peptideId: "kpv", dose: "0.2 mg", frequency: "1x daily" },
    ],
    difficulty: "beginner",
    likes: 145,
    duration: "6 weeks",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function CommunityScreen({ navigation }: any) {
  const { showToast } = useToast();
  const { settings, userId } = useApp();
  const [likedStacks, setLikedStacks] = useState<string[]>([]);
  const [remotePosts, setRemotePosts] = useState<CommunityStack[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setRemotePosts(
        data.map((row: any) => ({
          id: row.id,
          author: row.author,
          title: row.title,
          description: row.description || "",
          goals: row.goals || [],
          peptides: row.peptides || [],
          difficulty: row.difficulty || "beginner",
          likes: row.likes || 0,
          duration: row.duration || "8 weeks",
          createdAt: row.created_at,
          isUserPost: true,
          userId: row.user_id || null,
          avatarUrl: row.avatar_url || null,
        }))
      );
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchPosts();

    // Real-time subscription for instant updates
    const channel = supabase
      .channel("community_posts_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchPosts]);

  // Refresh when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchPosts);
    return unsubscribe;
  }, [navigation, fetchPosts]);

  const allStacks = useMemo(() => {
    return [...remotePosts, ...POPULAR_STACKS];
  }, [remotePosts]);

  const toggleLike = async (id: string) => {
    const alreadyLiked = likedStacks.includes(id);
    setLikedStacks((prev) =>
      alreadyLiked ? prev.filter((s) => s !== id) : [...prev, id]
    );

    // Update likes in Supabase for remote posts
    const post = remotePosts.find((p) => p.id === id);
    if (post) {
      const newLikes = alreadyLiked ? Math.max(0, post.likes - 1) : post.likes + 1;
      setRemotePosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: newLikes } : p))
      );
      await supabase.from("community_posts").update({ likes: newLikes }).eq("id", id);
    }
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

  const confirmDelete = (id: string) => {
    Alert.alert("Delete Post", "Remove this post from the feed?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        await supabase.from("community_posts").delete().eq("id", id);
        setRemotePosts((prev) => prev.filter((p) => p.id !== id));
        showToast("Post deleted");
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={allStacks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchPosts(); }}
            tintColor={colors.accent}
          />
        }
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Feed</Text>
            <Text style={styles.subtitle}>Popular stacks from the peptide community</Text>
          </>
        }
        renderItem={({ item }) => {
          const liked = likedStacks.includes(item.id);
          const isOwnPost = item.userId != null && item.userId === userId;
          const displayLikes = item.isUserPost ? item.likes : (liked ? item.likes + 1 : item.likes);
          return (
            <View style={styles.card}>
              {/* Author + difficulty */}
              <View style={styles.cardTop}>
                <View style={styles.authorRow}>
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatarImg} />
                  ) : (
                    <View style={[styles.avatar, isOwnPost && { backgroundColor: colors.success + "20" }]}>
                      <Text style={[styles.avatarText, isOwnPost && { color: colors.success }]}>{item.author[0]}</Text>
                    </View>
                  )}
                  <View>
                    <View style={styles.authorNameRow}>
                      <Text style={styles.authorName}>{item.author}</Text>
                      {isOwnPost && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>You</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.durationText}>{timeAgo(item.createdAt)}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <View style={[styles.diffBadge, { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + "20" }]}>
                    <Text style={[styles.diffText, { color: DIFFICULTY_COLORS[item.difficulty] }]}>
                      {item.difficulty}
                    </Text>
                  </View>
                  {isOwnPost && (
                    <TouchableOpacity onPress={() => confirmDelete(item.id)}>
                      <Ionicons name="trash-outline" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Title + description */}
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? <Text style={styles.cardDesc}>{item.description}</Text> : null}

              {/* Goals */}
              {item.goals.length > 0 && (
                <View style={styles.goalRow}>
                  {item.goals.map((g) => (
                    <View key={g} style={[styles.goalTag, { backgroundColor: (GOAL_COLORS[g] || "#888") + "20" }]}>
                      <Text style={[styles.goalTagText, { color: GOAL_COLORS[g] || "#888" }]}>
                        {g.replace("_", " ")}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Peptides */}
              <View style={styles.pepSection}>
                <View style={styles.pepDurationRow}>
                  <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.pepDurationText}>{item.duration}</Text>
                </View>
                {item.peptides.map((p) => {
                  const pep = peptideDB.find((pp) => pp.id === p.peptideId);
                  return (
                    <TouchableOpacity
                      key={p.peptideId}
                      style={styles.pepRow}
                      onPress={() => navigation.navigate("PeptideDetail", { peptideId: p.peptideId })}
                    >
                      <Text style={styles.pepName}>{pep?.name || p.peptideId}</Text>
                      <View style={styles.pepRight}>
                        <Text style={styles.pepDose}>{p.dose} · {p.frequency}</Text>
                        <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
                      </View>
                    </TouchableOpacity>
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

      {/* FAB to create new post */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("NewPost")}
      >
        <Ionicons name="add" size={28} color={colors.background} />
      </TouchableOpacity>
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
  avatarImg: { width: 36, height: 36, borderRadius: 18 },
  authorNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  authorName: { fontSize: 13, fontWeight: "600", color: colors.text },
  youBadge: {
    backgroundColor: colors.success + "20", borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 1,
  },
  youBadgeText: { fontSize: 10, fontWeight: "700", color: colors.success },
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
  pepDurationRow: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingBottom: 6, marginBottom: 2,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pepDurationText: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  pepRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  pepName: { fontSize: 13, fontWeight: "600", color: colors.text },
  pepRight: { flexDirection: "row", alignItems: "center", gap: 4 },
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
  fab: {
    position: "absolute", bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 8,
  },
});
