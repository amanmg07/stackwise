export const colors = {
  background: "#0a0a0a",
  surface: "#141414",
  surfaceLight: "#1e1e1e",
  border: "#2a2a2a",
  accent: "#f5f5dc",
  accentDim: "#c8c8a9",
  text: "#f0f0f0",
  textSecondary: "#8a8a8a",
  success: "#4ade80",
  warning: "#facc15",
  error: "#f87171",
  info: "#60a5fa",
};

import { Platform, StatusBar } from "react-native";

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const safeTop = Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 0) + 16;
export const safeBottom = Platform.OS === "ios" ? 100 : 80;

export const typography = {
  h1: { fontSize: 28, fontWeight: "700" as const, color: colors.text },
  h2: { fontSize: 22, fontWeight: "600" as const, color: colors.text },
  h3: { fontSize: 18, fontWeight: "600" as const, color: colors.text },
  body: { fontSize: 15, fontWeight: "400" as const, color: colors.text },
  caption: { fontSize: 13, fontWeight: "400" as const, color: colors.textSecondary },
};

export const cardStyle = {
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: spacing.md,
  borderWidth: 1,
  borderColor: colors.border,
};

export const emptyStateStyle = {
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: spacing.xl,
    paddingTop: safeTop,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  button: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: spacing.xl,
    width: "100%" as const,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.background,
  },
};
