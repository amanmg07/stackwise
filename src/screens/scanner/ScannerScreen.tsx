import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Animated, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { format, addWeeks, parseISO } from "date-fns";
import { peptides as peptideDB } from "../../data/peptides";
import { useApp } from "../../context/AppContext";
import { generateId } from "../../utils/id";
import { saveScanImage } from "../../utils/scanImages";
import { colors, spacing, safeTop } from "../../theme";
import { PeptideCategory, AdministrationRoute, ScanObservation, ScanResultData } from "../../types";
import { CATEGORY_INFO, CONFIDENCE_LABELS, CONFIDENCE_COLORS } from "./scanConstants";
import { trackScanCompleted } from "../../services/analyticsService";

const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey || "";

type ScanResult = ScanResultData & { error?: string };

function ShimmerBlock({ width, height, style }: { width: number | string; height: number; style?: any }) {
  const shimmer = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);
  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });
  return (
    <Animated.View
      style={[{ width: width as any, height, borderRadius: 6, backgroundColor: colors.surfaceLight, opacity }, style]}
    />
  );
}

function SkeletonResults() {
  return (
    <View style={{ marginTop: 16 }}>
      {/* Summary skeleton */}
      <View style={[styles.summaryCard, { gap: 10 }]}>
        <ShimmerBlock width={20} height={20} />
        <View style={{ flex: 1, gap: 6 }}>
          <ShimmerBlock width="100%" height={14} />
          <ShimmerBlock width="70%" height={14} />
        </View>
      </View>

      {/* Strengths skeleton */}
      <View style={styles.sectionHeader}>
        <ShimmerBlock width={18} height={18} style={{ borderRadius: 9 }} />
        <ShimmerBlock width={100} height={14} />
      </View>
      <ShimmerBlock width="40%" height={12} style={{ marginBottom: 10 }} />
      {[1, 2].map((i) => (
        <View key={`ss-${i}`} style={[styles.obsCard, { gap: 8 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ShimmerBlock width={18} height={18} style={{ borderRadius: 9 }} />
            <ShimmerBlock width={90} height={14} />
          </View>
          <ShimmerBlock width="90%" height={12} />
        </View>
      ))}

      {/* Improvements skeleton */}
      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <ShimmerBlock width={18} height={18} style={{ borderRadius: 9 }} />
        <ShimmerBlock width={130} height={14} />
      </View>
      <ShimmerBlock width="50%" height={12} style={{ marginBottom: 10 }} />
      {[1, 2].map((i) => (
        <View key={`is-${i}`} style={[styles.obsCard, { gap: 8 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ShimmerBlock width={18} height={18} style={{ borderRadius: 9 }} />
            <ShimmerBlock width={90} height={14} />
          </View>
          <ShimmerBlock width="85%" height={12} />
        </View>
      ))}

      {/* Peptide chips skeleton */}
      <ShimmerBlock width={160} height={14} style={{ marginTop: 16, marginBottom: 12 }} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {[1, 2, 3].map((i) => (
          <ShimmerBlock key={`pc-${i}`} width={100} height={38} style={{ borderRadius: 10 }} />
        ))}
      </View>
    </View>
  );
}

export default function ScannerScreen({ navigation }: any) {
  const { addCycle, scans, addScan, deleteScan } = useApp();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [selectedPeptides, setSelectedPeptides] = useState<Set<string>>(new Set());

  const togglePeptide = (id: string) => {
    setSelectedPeptides((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

      const systemPrompt = `You are an expert peptide advisor analyzing a photo to recommend peptide categories. Be thorough — most people will benefit from multiple categories.

CATEGORY MAPPING — assign observations to ALL relevant categories:

recovery: injuries, scars, bruises, swelling, joint redness, post-surgical marks, muscle strain signs, poor posture suggesting chronic pain
fat_loss: higher body fat percentage, round face, double chin, excess weight visible in arms/midsection
muscle_gain: lean frame that could add mass, average build that could benefit from more definition, room for muscle development
anti_aging: wrinkles, fine lines, crow's feet, forehead lines, nasolabial folds, sun damage, age spots, skin laxity, dull/uneven skin tone, acne, acne scars, skin texture issues, thinning skin, hair thinning, receding hairline
sleep: dark circles under eyes, puffy eyes, bags under eyes, tired/fatigued appearance, pallid complexion
cognitive: (recommend alongside sleep if person looks fatigued or stressed)
immune: acne, rosacea, eczema, psoriasis, skin inflammation, redness, irritation, breakouts, hives, fungal signs, slow-healing wounds

IMPORTANT:
- Skin issues like acne should map to BOTH anti_aging AND immune (peptides like GHK-Cu help skin repair, BPC-157 reduces inflammation)
- Most people benefit from at least 2-3 categories — don't be too conservative
- Body composition observations should include both fat_loss AND muscle_gain when relevant
- Dark circles/fatigue → both sleep AND cognitive
- Always recommend anti_aging for any skin quality issues (acne, scars, texture, tone)

HONESTY RULE: Be accurate and constructive. Don't exaggerate strengths that aren't there, but don't be harsh either. Frame improvements as opportunities, not criticisms. For example, say "room to add more muscle mass" instead of "underdeveloped muscles" or "lack of definition".

Respond ONLY with valid JSON:
{"strengths":[{"category":"anti_aging","observation":"Clear, youthful skin with no visible wrinkles","confidence":"high"}],"improvements":[{"category":"muscle_gain","observation":"Average build — could benefit from muscle development","confidence":"medium"}],"recommendedCategories":["muscle_gain","anti_aging"],"summary":"Brief encouraging 1-2 sentence summary."}

IMPORTANT DISTINCTION:
- "strengths": things the person is GENUINELY doing well that you can clearly see — not generic compliments. Only list a strength if it's actually visible and notable. "Good skin" is only a strength if their skin actually looks good. Do NOT list "good muscle definition" unless you can genuinely see defined muscles.
- "improvements": areas where there is a VISIBLE PROBLEM that peptides could fix — actual skin damage, actual excess body fat, actual dark circles, actual inflammation, etc.
- STRICT RULE: "improvements" is ONLY for things that are visibly WRONG right now. Preventive advice, maintenance suggestions, and "it's important to..." statements are NOT improvements. If the person looks fine in a category, it MUST go in "strengths" even if you think they could benefit from prevention. For example: "no visible signs of aging but maintaining skin health is important" = STRENGTHS, not improvements. "Clear skin with good complexion" = STRENGTHS. Only "visible wrinkles on forehead" or "acne scarring on cheeks" = IMPROVEMENTS.
- ALWAYS include at least 1 strength — find something positive to highlight
- Each observation needs: category, observation text, confidence ("high"/"medium"/"low")
- recommendedCategories: ordered by relevance, include ALL that apply (from both strengths and improvements)
- CRITICAL: If the photo does NOT clearly show a person's face or body (e.g. it's a wall, ceiling, blurry image, object, pet, or the person is fully clothed with no skin/face visible), you MUST return: {"error":"Could not analyze photo. Please take a clear, well-lit photo showing your face or body."}
- Do NOT guess or fabricate observations. Every observation MUST be based on something you can actually see in the photo. If you cannot see enough to make a judgment about a category, do not include it.

FINAL CHECK — before returning your JSON, review EVERY item in "improvements". For each one, ask: "Does my observation describe something that is ACTUALLY WRONG that I can see?" If your observation contains phrases like "no visible signs", "maintaining", "important to", "could benefit from prevention", or "proactive" — MOVE IT TO STRENGTHS. Examples of WRONG placement:
  WRONG in improvements: "No visible signs of aging, but maintaining skin health is important" → MOVE TO STRENGTHS
  WRONG in improvements: "Skin looks healthy, proactive care recommended" → MOVE TO STRENGTHS
  WRONG in improvements: "No major concerns but preventive peptides could help" → MOVE TO STRENGTHS
  CORRECT in improvements: "Visible acne scarring on cheeks" (actual problem)
  CORRECT in improvements: "Dark circles under eyes indicating poor sleep" (actual problem)`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:${mediaType};base64,${base64}` },
                },
                {
                  type: "text",
                  text: "Analyze this person's photo and recommend peptide categories based on what you observe. Be respectful and positive. Respond with JSON only.",
                },
              ],
            },
          ],
          max_tokens: 1024,
          temperature: 0.5,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("Groq vision error:", response.status, errText);
        if (response.status === 429) {
          throw new Error("Rate limit reached. Wait a moment and try again.");
        }
        throw new Error("Analysis failed. Please try again.");
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Could not parse analysis. Please try again.");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (parsed.error) {
        Alert.alert("Analysis Issue", parsed.error);
        setResult(null);
      } else if (!parsed.strengths?.length && !parsed.improvements?.length) {
        Alert.alert("Analysis Issue", "Could not detect enough detail. Please take a clearer photo showing your face or body.");
        setResult(null);
      } else {
        setResult(parsed);
        // Persist scan to local storage (copy image + save metadata)
        try {
          const id = generateId();
          const savedPath = saveScanImage(uri, id);
          addScan({
            id,
            date: new Date().toISOString(),
            imagePath: savedPath,
            result: {
              strengths: parsed.strengths || [],
              improvements: parsed.improvements || [],
              recommendedCategories: parsed.recommendedCategories || [],
              summary: parsed.summary || "",
            },
          });
          setImageUri(savedPath);
          trackScanCompleted(parsed.recommendedCategories || []);
        } catch (e) {
          console.warn("Failed to save scan:", e);
        }
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to analyze image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const PRIORITY_PEPTIDES: Partial<Record<PeptideCategory, string[]>> = {
    fat_loss: ["retatrutide", "semaglutide", "tirzepatide"],
    muscle_gain: ["tesamorelin", "igf1_lr3"],
    anti_aging: ["ghkcu", "klow_blend", "glow_blend"],
  };

  const getPeptidesForCategory = (cat: PeptideCategory) => {
    const priority = PRIORITY_PEPTIDES[cat] || [];
    const all = peptideDB.filter((p) => p.categories.includes(cat));
    const sorted = all.sort((a, b) => {
      const aIdx = priority.indexOf(a.id);
      const bIdx = priority.indexOf(b.id);
      if (aIdx >= 0 && bIdx >= 0) return aIdx - bIdx;
      if (aIdx >= 0) return -1;
      if (bIdx >= 0) return 1;
      return 0;
    });
    return sorted.slice(0, 3);
  };

  const confirmDeleteScan = (scanId: string) => {
    Alert.alert("Delete Scan?", "This will permanently remove this scan and its photo from your device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteScan(scanId) },
    ]);
  };

  const reset = () => {
    setImageUri(null);
    setResult(null);
    setSelectedPeptides(new Set());
  };

  // Landing state — no image yet
  if (!imageUri) {
    const hasHistory = scans.length > 0;
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={hasHistory ? { paddingBottom: 40 } : { paddingBottom: 40, flexGrow: 1, justifyContent: "center" }}
      >
        {hasHistory && <Text style={styles.title}>Self Scan</Text>}

        {!hasHistory && (
          <View style={styles.scanIconWrap}>
            <Ionicons name="scan-outline" size={60} color={colors.accent} />
          </View>
        )}
        <Text style={[styles.landingDesc, !hasHistory && { textAlign: "center" }]}>
          {hasHistory
            ? "Track visible changes over time. Take a scan regularly to see how your body and skin respond."
            : "Take your first scan to start tracking visible changes over time."}
        </Text>

        <TouchableOpacity style={styles.cameraBtn} onPress={() => pickImage(true)}>
          <Ionicons name="camera" size={22} color={colors.background} />
          <Text style={styles.cameraBtnText}>{hasHistory ? "New Scan" : "Take Photo"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.galleryBtn} onPress={() => pickImage(false)}>
          <Ionicons name="images-outline" size={20} color={colors.accent} />
          <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
        </TouchableOpacity>

        {scans.length >= 2 && (
          <TouchableOpacity
            style={styles.progressBtn}
            onPress={() =>
              navigation.navigate("ScanCompare", {
                earlierScanId: scans[scans.length - 1].id,
                laterScanId: scans[0].id,
              })
            }
          >
            <Ionicons name="analytics-outline" size={20} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.progressBtnTitle}>See Progress</Text>
              <Text style={styles.progressBtnDesc}>Compare your first and latest scans with AI</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.accent} />
          </TouchableOpacity>
        )}

        {hasHistory && (
          <>
            <Text style={styles.historyHeader}>Your Scans ({scans.length})</Text>
            <View style={styles.grid}>
              {scans.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.historyCard}
                  onPress={() => navigation.navigate("ScanDetail", { scanId: s.id })}
                  onLongPress={() => confirmDeleteScan(s.id)}
                >
                  <Image source={{ uri: s.imagePath }} style={styles.historyThumb} />
                  <TouchableOpacity
                    style={styles.historyDeleteBtn}
                    onPress={() => confirmDeleteScan(s.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="close" size={16} color={colors.text} />
                  </TouchableOpacity>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>{format(parseISO(s.date), "MMM d, yyyy")}</Text>
                    <Text style={styles.historyTime}>{format(parseISO(s.date), "h:mm a")}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.disclaimerText}>
            Photos are stored only on this device. They never leave your phone except when sent to the AI for analysis, and are not kept on any server.
          </Text>
        </View>
      </ScrollView>
    );
  }

  // Analyzing / Results state
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Self Scan</Text>
        <TouchableOpacity style={styles.resetBtn} onPress={reset}>
          <Ionicons name="refresh-outline" size={18} color={colors.accent} />
          <Text style={styles.resetBtnText}>New Scan</Text>
        </TouchableOpacity>
      </View>

      {/* Photo preview */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>

      {/* Skeleton while loading */}
      {loading && <SkeletonResults />}

      {/* Results */}
      {result && !result.error && (
        <>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Ionicons name="sparkles" size={20} color={colors.accent} />
            <Text style={styles.summaryText}>{result.summary}</Text>
          </View>

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.sectionTitle, { color: colors.success, marginBottom: 0 }]}>Keep It Up</Text>
              </View>
              <Text style={styles.sectionDesc}>Peptides to maintain what you're doing well</Text>
              {(() => {
                const shown = new Set<string>();
                return result.strengths.map((obs, i) => {
                  const catInfo = CATEGORY_INFO[obs.category];
                  const catPeptides = getPeptidesForCategory(obs.category).filter((p) => !shown.has(p.id));
                  catPeptides.forEach((p) => shown.add(p.id));
                  return (
                    <View key={`s-${i}`} style={[styles.obsCard, { borderColor: colors.success + "30" }]}>
                      <View style={styles.obsHeader}>
                        <Ionicons name={catInfo?.icon || "ellipse-outline"} size={18} color={catInfo?.color || colors.accent} />
                        <Text style={[styles.obsCategory, { color: catInfo?.color }]}>{catInfo?.label || obs.category}</Text>
                        <View style={[styles.confidenceBadge, { backgroundColor: CONFIDENCE_COLORS[obs.confidence] + "20" }]}>
                          <Text style={[styles.confidenceText, { color: CONFIDENCE_COLORS[obs.confidence] }]}>
                            {CONFIDENCE_LABELS[obs.confidence] || obs.confidence}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.obsText}>{obs.observation}</Text>
                      {catPeptides.length > 0 && (
                        <View style={styles.inlinePeptides}>
                          {catPeptides.map((p) => {
                            const selected = selectedPeptides.has(p.id);
                            return (
                              <View key={p.id} style={[styles.peptideChip, selected && styles.peptideChipSelected]}>
                                <TouchableOpacity
                                  style={styles.peptideChipSelect}
                                  onPress={() => togglePeptide(p.id)}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}
                                >
                                  <Ionicons
                                    name={selected ? "checkmark-circle" : "add-circle-outline"}
                                    size={18}
                                    color={selected ? colors.success : colors.textSecondary}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.peptideChipLabel}
                                  onPress={() => navigation.navigate("PeptideDetail", { peptideId: p.id })}
                                >
                                  <Text style={styles.peptideChipText}>{p.name}</Text>
                                  <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                });
              })()}
            </>
          )}

          {/* Improvements */}
          {result.improvements && result.improvements.length > 0 && (
            <>
              <View style={[styles.sectionHeader, { marginTop: 8 }]}>
                <Ionicons name="trending-up" size={18} color={colors.accent} />
                <Text style={[styles.sectionTitle, { color: colors.accent, marginBottom: 0 }]}>Start Considering</Text>
              </View>
              <Text style={styles.sectionDesc}>Areas where peptides could help</Text>
              {(() => {
                const shown = new Set<string>();
                // Collect already-shown peptide IDs from strengths
                if (result.strengths) {
                  result.strengths.forEach((obs) => {
                    getPeptidesForCategory(obs.category).forEach((p) => shown.add(p.id));
                  });
                }
                return result.improvements.map((obs, i) => {
                  const catInfo = CATEGORY_INFO[obs.category];
                  const catPeptides = getPeptidesForCategory(obs.category).filter((p) => !shown.has(p.id));
                  catPeptides.forEach((p) => shown.add(p.id));
                  return (
                    <View key={`i-${i}`} style={[styles.obsCard, { borderColor: colors.accent + "30" }]}>
                      <View style={styles.obsHeader}>
                        <Ionicons name={catInfo?.icon || "ellipse-outline"} size={18} color={catInfo?.color || colors.accent} />
                        <Text style={[styles.obsCategory, { color: catInfo?.color }]}>{catInfo?.label || obs.category}</Text>
                        <View style={[styles.confidenceBadge, { backgroundColor: CONFIDENCE_COLORS[obs.confidence] + "20" }]}>
                          <Text style={[styles.confidenceText, { color: CONFIDENCE_COLORS[obs.confidence] }]}>
                            {CONFIDENCE_LABELS[obs.confidence] || obs.confidence}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.obsText}>{obs.observation}</Text>
                      {catPeptides.length > 0 && (
                        <View style={styles.inlinePeptides}>
                          {catPeptides.map((p) => {
                            const selected = selectedPeptides.has(p.id);
                            return (
                              <View key={p.id} style={[styles.peptideChip, selected && styles.peptideChipSelected]}>
                                <TouchableOpacity
                                  style={styles.peptideChipSelect}
                                  onPress={() => togglePeptide(p.id)}
                                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 0 }}
                                >
                                  <Ionicons
                                    name={selected ? "checkmark-circle" : "add-circle-outline"}
                                    size={18}
                                    color={selected ? colors.success : colors.textSecondary}
                                  />
                                </TouchableOpacity>
                                <TouchableOpacity
                                  style={styles.peptideChipLabel}
                                  onPress={() => navigation.navigate("PeptideDetail", { peptideId: p.id })}
                                >
                                  <Text style={styles.peptideChipText}>{p.name}</Text>
                                  <Ionicons name="chevron-forward" size={14} color={colors.accent} />
                                </TouchableOpacity>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  );
                });
              })()}
            </>
          )}

          {/* Add to Cycle */}
          {selectedPeptides.size > 0 && (
            <TouchableOpacity
              style={styles.addToCycleBtn}
              onPress={() => {
                const cyclePeptides = [...selectedPeptides].map((id) => {
                  const p = peptideDB.find((pep) => pep.id === id)!;
                  const doseMatch = p.dosingProtocols?.[0]?.doseRange?.match(/([\d.]+)/);
                  return {
                    peptideId: p.id,
                    doseAmount: doseMatch ? parseFloat(doseMatch[1]) : 0.25,
                    doseUnit: "mg" as const,
                    frequency: p.dosingProtocols?.[0]?.frequency || "daily",
                    route: (p.routes?.[0] || "subcutaneous") as AdministrationRoute,
                    timeOfDay: ["morning"],
                  };
                });
                const startDate = new Date().toISOString().split("T")[0];
                const endDate = format(addWeeks(new Date(), 8), "yyyy-MM-dd");
                addCycle({
                  id: generateId(),
                  name: "Self Scan Protocol",
                  peptides: cyclePeptides,
                  startDate,
                  endDate,
                  isActive: true,
                  notes: "Created from Self Scan results",
                  createdAt: new Date().toISOString(),
                });
                Alert.alert("Cycle Started!", "Your Self Scan protocol is now active.", [
                  { text: "View Cycle", onPress: () => navigation.navigate("CycleTab") },
                ]);
              }}
            >
              <Ionicons name="add-circle" size={20} color={colors.background} />
              <Text style={styles.addToCycleBtnText}>Add {selectedPeptides.size} to Cycle</Text>
            </TouchableOpacity>
          )}

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.disclaimerText}>
              This scan is saved to your device so you can compare progress over time. Delete it anytime from the scan details.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.md, paddingTop: safeTop },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resetBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.accent + "15", borderRadius: 10, paddingVertical: 8, paddingHorizontal: 14,
    borderWidth: 1, borderColor: colors.accent + "30",
  },
  resetBtnText: { fontSize: 13, fontWeight: "600", color: colors.accent },
  // Landing
  scanIconWrap: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: colors.accent + "12", alignItems: "center", justifyContent: "center",
    marginBottom: spacing.lg, borderWidth: 2, borderColor: colors.accent + "30",
    alignSelf: "center",
  },
  landingDesc: { fontSize: 14, color: colors.textSecondary, lineHeight: 20, marginBottom: spacing.lg },
  progressBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.accent + "12", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "30", marginTop: spacing.md,
  },
  progressBtnTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  progressBtnDesc: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  historyHeader: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginTop: spacing.xl, marginBottom: spacing.sm,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  historyCard: {
    width: "48%", backgroundColor: colors.surface, borderRadius: 12,
    overflow: "hidden", borderWidth: 1, borderColor: colors.border, position: "relative",
  },
  historyDeleteBtn: {
    position: "absolute", top: 6, right: 6,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center",
  },
  historyThumb: { width: "100%", aspectRatio: 3 / 4 },
  historyInfo: { padding: 10 },
  historyDate: { fontSize: 13, fontWeight: "700", color: colors.text },
  historyTime: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  cameraBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40,
    width: "100%", marginBottom: spacing.md,
  },
  cameraBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  galleryBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.surface, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 40,
    width: "100%", borderWidth: 1, borderColor: colors.border,
  },
  galleryBtnText: { fontSize: 16, fontWeight: "600", color: colors.accent },
  // Image
  imageContainer: { borderRadius: 16, overflow: "hidden", marginBottom: spacing.md, position: "relative" },
  image: { width: "100%", aspectRatio: 3 / 4, borderRadius: 16 },
  // Summary
  summaryCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: colors.accent + "12", borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: colors.accent + "25", marginBottom: spacing.lg,
  },
  summaryText: { fontSize: 15, color: colors.text, lineHeight: 22, flex: 1 },
  // Observations
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: spacing.sm, marginTop: spacing.xs,
  },
  sectionDesc: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  obsCard: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  obsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  obsCategory: { fontSize: 14, fontWeight: "700", flex: 1 },
  confidenceBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  confidenceText: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },
  obsText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  inlinePeptides: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.border },
  peptideChip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 10,
    borderWidth: 1, borderColor: colors.border,
  },
  peptideChipSelected: { borderColor: colors.success + "50", backgroundColor: colors.success + "10" },
  peptideChipSelect: { paddingVertical: 10, paddingLeft: 12, paddingRight: 4 },
  peptideChipLabel: { flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 10, paddingRight: 12, paddingLeft: 6 },
  peptideChipText: { fontSize: 14, fontWeight: "600", color: colors.text },
  // Add to Cycle
  addToCycleBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: colors.accent, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32,
    marginTop: spacing.lg,
  },
  addToCycleBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
  // Disclaimer
  disclaimer: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginTop: spacing.md,
  },
  disclaimerText: { fontSize: 12, color: colors.textSecondary, lineHeight: 17, flex: 1 },
});
