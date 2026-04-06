import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../theme";

export const CATEGORY_INFO: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  recovery: { label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  fat_loss: { label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  muscle_gain: { label: "Muscle Gain", icon: "barbell-outline", color: "#60a5fa" },
  anti_aging: { label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  sleep: { label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  cognitive: { label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
  immune: { label: "Immune", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  sexual_health: { label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
};

export const CONFIDENCE_LABELS: Record<string, string> = {
  high: "Clearly visible",
  medium: "Somewhat visible",
  low: "Subtle",
};

export const CONFIDENCE_COLORS: Record<string, string> = {
  high: colors.success,
  medium: colors.warning,
  low: colors.textSecondary,
};
