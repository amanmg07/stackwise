import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing, safeTop } from "../../theme";
import { PeptideCategory } from "../../types";

interface Observation {
  category: PeptideCategory;
  observation: string;
  confidence: "high" | "medium" | "low";
}

interface ScanResult {
  observations: Observation[];
  recommendedCategories: PeptideCategory[];
  summary: string;
  error?: string;
}

const CATEGORY_INFO: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  recovery: { label: "Recovery", icon: "bandage-outline", color: "#4ade80" },
  fat_loss: { label: "Fat Loss", icon: "flame-outline", color: "#f87171" },
  muscle_gain: { label: "Muscle Gain", icon: "barbell-outline", color: "#60a5fa" },
  anti_aging: { label: "Anti-Aging", icon: "sparkles-outline", color: "#c084fc" },
  sleep: { label: "Sleep", icon: "moon-outline", color: "#818cf8" },
  cognitive: { label: "Cognitive", icon: "bulb-outline", color: "#facc15" },
  immune: { label: "Immune", icon: "shield-checkmark-outline", color: "#2dd4bf" },
  sexual_health: { label: "Sexual Health", icon: "heart-outline", color: "#f472b6" },
};

const CONFIDENCE_COLORS = { high: colors.success, medium: colors.warning, low: colors.textSecondary };

export default function ScannerScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const pickImage = async (useCamera: boolean) => {
    const permissionMethod = useCamera
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

    const { status } = await permissionMethod();
    if (status !== "granted") {
      Alert.alert("Permission needed", `Please allow ${useCamera ? "camera" : "photo library"} access to use this feature.`);
      return;
    }

    const pickerMethod = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;

    const result = await pickerMethod({
      mediaTypes: ["images"],
      quality: 0.3,
      allowsEditing: true,
      aspect: [3, 4],
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
      setResult(null);
      if (asset.base64) {
        analyzeImage(asset.base64, asset.uri);
      } else {
        Alert.alert("Error", "Could not read image data. Please try again.");
      }
    }
  };

  const analyzeImage = async (base64: string, uri: string) => {
    setLoading(true);
    try {
      const ext = uri.split(".").pop()?.toLowerCase();
      const mediaType = ext === "png" ? "image/png" : "image/jpeg";

      // Call edge function directly via fetch to avoid supabase SDK issues
      const response = await fetch(
        "https://criicsyjvafvgovqlyfq.supabase.co/functions/v1/scan-analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, mediaType }),
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("Scanner error:", response.status, errText);
        throw new Error("Analysis failed. Please try again.");
      }

      const parsed = await response.json();

      if (parsed.error) {
        Alert.alert("Analysis Issue", parsed.error);
        setResult(null);
      } else {
        setResult(parsed);
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getPeptidesForCategory = (cat: PeptideCategory) => {
    return peptideDB
      .filter((p) => p.categories.includes(cat))
      .slice(0, 3);
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
  };

  // Landing state — no image yet
  if (!imageUri) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Scanner</Text>
        <View style={styles.landingContent}>
          <View style={styles.scanIconWrap}>
            <Ionicons name="scan-outline" size={60} color={colors.accent} />
          </View>
          <Text style={styles.landingTitle}>Peptide Scanner</Text>
          <Text style={styles.landingDesc}>
            Take a photo and our AI will analyze visible characteristics to recommend peptides tailored to your goals.
          </Text>

          <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera" size={22} color={colors.background} />
            <Text style={styles.cameraBtnText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
            <Ionicons name="images-outline" size={20} color={colors.accent} />
            <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
          </TouchableOpacity>

          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              This is not medical advice. Recommendations are for educational purposes only. Always consult a healthcare provider.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Analyzing / Results state
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Scanner</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Ionicons name="refresh-outline" size={18} color={colors.accent} />
          <Text style={styles.resetBtnText}>New Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Photo preview */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        {loading && (
          <View style={styles.imageOverlay}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.analyzingText}>Analyzing...</Text>
          </View>
        )}
      </View>

      {/* Results */}
      {result && !result.error && (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={styles.summaryText}>{result.summary}</Text>
          </View>

          {/* Observations */}
          {result.observations.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>What We Noticed</Text>
              {result.observations.map((obs, i) => {
                const catInfo = CATEGORY_INFO[obs.category];
                return (
                  <View key={i} style={styles.obsCard}>
                    <View style={styles.obsHeader}>
                      <Ionicons name={catInfo?.icon || "ellipse-outline"} size={18} color={catInfo?.color || colors.accent} />
                      <Text style={[styles.obsCategory, { color: catInfo?.color }]}>{catInfo?.label || obs.category}</Text>
                      <View style={[styles.confidenceBadge, { backgroundColor: CONFIDENCE_COLORS[obs.confidence] + "20" }]}>
                        <Text style={[styles.confidenceText, { color: CONFIDENCE_COLORS[obs.confidence] }]}>
                          {obs.confidence}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.obsText}>{obs.observation}</Text>
                  </View>
                );
              })}
            </>
          )}

          {/* Recommended peptides by category */}
          <Text style={styles.sectionTitle}>Recommended Peptides</Text>
          {result.recommendedCategories.map((cat) => {
            const catInfo = CATEGORY_INFO[cat];
            const catPeptides = getPeptidesForCategory(cat);
            if (catPeptides.length === 0) return null;
            return (
              <View key={cat} style={styles.catSection}>
                <View style={styles.catHeader}>
                  <Ionicons name={catInfo?.icon || "ellipse-outline"} size={18} color={catInfo?.color || colors.accent} />
                  <Text style={[styles.catHeaderText, { color: catInfo?.color }]}>{catInfo?.label}</Text>
                </View>
                {catPeptides.map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.peptideRow}
                    onPress={() => navigation.navigate("PeptideDetail", { peptideId: p.id })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.peptideName}>{p.name}</Text>
                      <Text style={styles.peptideDesc} numberOfLines={2}>{p.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              This is not medical advice. Recommendations are for educational purposes only. Always consult a healthcare provider before starting any peptide protocol.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: safeTop },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resetBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.accent + "15", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  resetBtnText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  // Landing
  landingContent: { flex: 1, justifyContent: "center", alignItems: "center", paddingBottom: 80 },
  scanIconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.accent + "12", alignItems: "center", justifyContent: "center",
    marginBottom: 24, borderWidth: 2, borderColor: colors.accent + "30",
  },
  landingTitle: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: 8 },
  landingDesc: { fontSize: 15, color: colors.textSecondary, textAlign: "center", lineHeight: 22, marginBottom: 32, paddingHorizontal: 20 },
  cameraBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40,
    width: "100%", marginBottom: 12,
  },
  cameraBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  galleryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40,
    width: "100%", borderWidth: 1, borderColor: colors.border,
  },
  galleryBtnText: { fontSize: 16, fontWeight: "600", color: colors.accent },
  // Image
  imageContainer: { borderRadius: 16, overflow: "hidden", marginBottom: 16, position: "relative" },
  image: { width: "100%", aspectRatio: 3 / 4, borderRadius: 16 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center", justifyContent: "center", borderRadius: 16, gap: 12,
  },
  analyzingText: { fontSize: 16, fontWeight: "600", color: colors.text },
  // Summary
  summaryCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: colors.accent + "12", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "25", marginBottom: 20,
  },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 22, flex: 1 },
  // Observations
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, marginTop: 4,
  },
  obsCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  obsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  obsCategory: { fontSize: 14, fontWeight: "700", flex: 1 },
  confidenceBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  confidenceText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  obsText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  // Peptide recommendations
  catSection: { marginBottom: 16 },
  catHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  catHeaderText: { fontSize: 16, fontWeight: "700" },
  peptideRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  peptideName: { fontSize: 15, fontWeight: "600", color: colors.text },
  peptideDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, marginTop: 2 },
  // Disclaimer
  disclaimer: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginTop: 16,
  },
  disclaimerText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, flex: 1 },
});
