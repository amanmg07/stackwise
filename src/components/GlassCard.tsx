import React from "react";
import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { colors } from "../theme";

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
}

export default function GlassCard({ children, style, intensity = 40 }: Props) {
  if (Platform.OS === "android") {
    return (
      <View style={[styles.androidWrapper, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, style]}>
      <BlurView intensity={intensity} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.innerBorder} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  androidWrapper: {
    overflow: "hidden",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderTopColor: "rgba(255,255,255,0.15)",
  },
});
