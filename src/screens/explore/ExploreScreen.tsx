import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, safeTop } from "../../theme";
import ChatView from "./ChatView";
import ResearchHubScreen from "../research/ResearchHubScreen";

type Mode = "ask" | "browse";

export default function ExploreScreen({ navigation }: any) {
  const [mode, setMode] = useState<Mode>("ask");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>

      {/* Mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "ask" && styles.toggleBtnActive]}
          onPress={() => setMode("ask")}
        >
          <Ionicons
            name="chatbubbles-outline"
            size={16}
            color={mode === "ask" ? colors.background : colors.textSecondary}
          />
          <Text style={[styles.toggleText, mode === "ask" && styles.toggleTextActive]}>Ask AI</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, mode === "browse" && styles.toggleBtnActive]}
          onPress={() => setMode("browse")}
        >
          <Ionicons
            name="flask-outline"
            size={16}
            color={mode === "browse" ? colors.background : colors.textSecondary}
          />
          <Text style={[styles.toggleText, mode === "browse" && styles.toggleTextActive]}>Browse</Text>
        </TouchableOpacity>
      </View>

      {/* Content — both stay mounted to preserve state */}
      <View style={[styles.content, mode !== "ask" && { display: "none" }]}>
        <ChatView navigation={navigation} />
      </View>
      <View style={[styles.content, mode !== "browse" && { display: "none" }]}>
        <ResearchHubScreen navigation={navigation} embedded />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: safeTop },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, paddingHorizontal: spacing.md, marginBottom: 12 },
  toggleRow: {
    flexDirection: "row", marginHorizontal: spacing.md, marginBottom: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 4,
    borderWidth: 1, borderColor: colors.border,
  },
  toggleBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    borderRadius: 10, paddingVertical: 12,
  },
  toggleBtnActive: { backgroundColor: colors.accent },
  toggleText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary, lineHeight: 18 },
  toggleTextActive: { color: colors.background },
  content: { flex: 1 },
});
