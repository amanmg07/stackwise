import React, { useRef, useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../../theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    icon: "flask-outline" as const,
    title: "Welcome to StackWise",
    subtitle: "Your all-in-one peptide guide. Browse peptides, build protocols, and get personalized recommendations.",
  },
  {
    icon: "chatbubbles-outline" as const,
    title: "AI-Powered Advice",
    subtitle: "Ask StackWise AI anything about peptides — dosing, stacking, side effects. Get real answers, not disclaimers.",
  },
  {
    icon: "bar-chart-outline" as const,
    title: "Track & Optimize",
    subtitle: "Log daily metrics in your journal. StackWise spots trends and recommends peptides based on how you feel.",
  },
];

interface Props {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (activeIndex < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={styles.iconCircle}>
              <Ionicons name={item.icon} size={48} color={colors.accent} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={next}>
          <Text style={styles.btnText}>
            {activeIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          </Text>
          <Ionicons
            name={activeIndex === SLIDES.length - 1 ? "checkmark" : "arrow-forward"}
            size={18}
            color={colors.background}
          />
        </TouchableOpacity>

        {activeIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={onComplete} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: colors.background,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
  },
  slide: {
    width, alignItems: "center", justifyContent: "center",
    paddingHorizontal: spacing.xl, flex: 1,
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.accent + "15", alignItems: "center", justifyContent: "center",
    marginBottom: 32,
    borderWidth: 2, borderColor: colors.accent + "30",
  },
  title: {
    fontSize: 28, fontWeight: "800", color: colors.text,
    textAlign: "center", marginBottom: 12,
  },
  subtitle: {
    fontSize: 16, color: colors.textSecondary, textAlign: "center",
    lineHeight: 24, paddingHorizontal: 10,
  },
  footer: {
    alignItems: "center", paddingBottom: Platform.OS === "ios" ? 50 : 30,
    paddingHorizontal: spacing.xl,
  },
  dots: { flexDirection: "row", gap: 8, marginBottom: 24 },
  dot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.border,
  },
  dotActive: { backgroundColor: colors.accent, width: 24 },
  btn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18,
    width: "100%",
  },
  btnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  skipBtn: { marginTop: 16 },
  skipText: { fontSize: 14, color: colors.textSecondary },
});
