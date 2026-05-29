import React, { useEffect, useRef } from "react";
import { Animated, Text, StyleSheet, Platform, TouchableOpacity, View } from "react-native";
import { colors } from "../theme";

export type ToastVariant = "success" | "error" | "info";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
  variant?: ToastVariant;
  action?: { label: string; onPress: () => void };
}

// Bottom snackbar (above the tab bar) so it never covers the top-left
// back button on any screen. 1200ms is a snappy, readable default for
// a short confirmation ("Profile saved"). Toasts with an action
// (undo, etc.) bump the duration in the caller — see ToastContext.
export default function Toast({
  message, visible, onHide,
  duration = 1200,
  variant = "success",
  action,
}: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
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
  }, [visible, duration]);

  if (!visible) return null;

  const bg =
    variant === "error" ? colors.error :
    variant === "info" ? colors.info :
    colors.success;

  const handleAction = () => {
    if (action) action.onPress();
    onHide();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: bg, opacity, transform: [{ translateY }] },
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      {action && (
        <TouchableOpacity onPress={handleAction} style={styles.actionBtn}>
          <Text style={styles.actionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
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
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 999,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  text: { flex: 1, fontSize: 14, fontWeight: "600", color: "#fff" },
  actionBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  actionText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#fff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
