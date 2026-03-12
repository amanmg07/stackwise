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

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

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
