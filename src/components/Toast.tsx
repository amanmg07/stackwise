import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Platform } from "react-native";
import { colors } from "../theme";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

// Bottom snackbar (above the tab bar) so it never covers the top-left
// back button on any screen. 1200ms is a snappy, readable default for
// a short confirmation ("Profile saved").
export default function Toast({ message, visible, onHide, duration = 1200 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  // Slides up from below.
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 20, duration: 200, useNativeDriver: true }),
        ]).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    // Sits above the bottom tab bar (~85 iOS / ~65 Android) so the
    // top-left back button is never obscured on any screen.
    bottom: Platform.OS === "ios" ? 100 : 80,
    left: 20, right: 20,
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
