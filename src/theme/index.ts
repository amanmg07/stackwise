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

// ────────────────────────────────────────────────────────────────────
// PALETTE_V2 — purpose-built emphasis tokens layered on top of the
// base palette. The original `colors.warning` and `colors.error` are
// reserved for *state* meaning (something is warning / broken).
// These highlights are for *visual emphasis* in non-state contexts
// (hero numbers, progress fills, attention CTAs).
//
// To revert: delete this `highlights` block + grep the codebase for
// `PALETTE_V2` and restore the pre-change colors at each call site.
// ────────────────────────────────────────────────────────────────────
export const highlights = {
  yellow: "#fcd34d",  // warm amber for progress + achievement
  red:    "#ef4444",  // punchy red for prominent CTAs
  white:  "#ffffff",  // pure white for hero typography
};

import { Platform, StatusBar } from "react-native";

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const safeTop = Platform.OS === "ios" ? 60 : (StatusBar.currentHeight || 0) + 16;
export const safeBottom = Platform.OS === "ios" ? 60 : 80;

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
    fontSize: 24,
    fontWeight: "800" as const,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: "center" as const,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 22,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  // A small italic tip line shown below the subtitle to nudge
  // users toward the next step without making the screen feel
  // wordy.
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center" as const,
    fontStyle: "italic" as const,
    marginBottom: spacing.xl,
    opacity: 0.7,
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

/**
 * Compact inline empty state used inside content sections
 * (e.g. "no saved peptides" within Profile). Less screen-dominant
 * than emptyStateStyle but still gives an icon + warm copy.
 */
export const inlineEmptyStyle = {
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: "dashed" as const,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.accent + "15",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
};
