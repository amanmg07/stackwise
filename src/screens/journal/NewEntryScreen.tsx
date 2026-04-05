import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, PanResponder, LayoutChangeEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { generateId } from "../../utils/id";
import { format, parseISO } from "date-fns";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { colors, spacing } from "../../theme";

const THUMB_SIZE = 24;

function RatingInput({ label, value, onChange, lowLabel, highLabel }: { label: string; value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string }) {
  const [trackWidth, setTrackWidth] = useState(0);
  const trackPageX = useRef(0);
  const trackRef = useRef<View>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
    // measure absolute page position so PanResponder can use gestureState.moveX
    setTimeout(() => {
      trackRef.current?.measureInWindow((x) => {
        trackPageX.current = x;
      });
    }, 0);
  };

  const valueFromPageX = (pageX: number) => {
    if (trackWidth <= 0) return valueRef.current;
    const onTrack = Math.max(0, Math.min(trackWidth, pageX - trackPageX.current));
    const raw = (onTrack / trackWidth) * 9 + 1;
    return Math.round(raw);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_, g) => {
        const next = valueFromPageX(g.x0);
        if (next !== valueRef.current) onChange(next);
      },
      onPanResponderMove: (_, g) => {
        const next = valueFromPageX(g.moveX);
        if (next !== valueRef.current) onChange(next);
      },
    })
  ).current;

  const fillPct = ((value - 1) / 9) * 100;
  const thumbLeft = trackWidth > 0 ? ((value - 1) / 9) * trackWidth : 0;

  return (
    <View style={styles.ratingContainer}>
      <View style={styles.ratingHeader}>
        <Text style={styles.ratingLabel}>{label}</Text>
        <Text style={styles.ratingValue}>{value}<Text style={styles.ratingValueMax}>/10</Text></Text>
      </View>
      <View style={styles.sliderWrap} {...panResponder.panHandlers}>
        <View ref={trackRef} style={styles.sliderTrack} onLayout={onTrackLayout}>
          <View style={[styles.sliderFill, { width: `${fillPct}%` }]} />
        </View>
        <View style={[styles.sliderThumb, { left: thumbLeft }]} pointerEvents="none" />
      </View>
      <View style={styles.ratingHints}>
        <Text style={styles.ratingHint}>{lowLabel}</Text>
        <Text style={styles.ratingHint}>{highLabel}</Text>
      </View>
    </View>
  );
}

export default function NewEntryScreen({ route, navigation }: any) {
  const { journal, addJournalEntry, updateJournalEntry, settings, cycles } = useApp();
  const { showToast } = useToast();
  const entryId = route.params?.entryId;
  const existing = entryId ? journal.find((e) => e.id === entryId) : null;
  const activeCycle = cycles.find((c) => c.isActive);

  const [weight, setWeight] = useState(existing?.weight?.toString() || "");
  const [sleepHours, setSleepHours] = useState(existing?.sleepHours?.toString() || "");
  const [sleepQuality, setSleepQuality] = useState(existing?.sleepQuality || 5);
  const [energyLevel, setEnergyLevel] = useState(existing?.energyLevel || 5);
  const [recoveryScore, setRecoveryScore] = useState(existing?.recoveryScore || 5);
  const [mood, setMood] = useState(existing?.mood || 5);
  const [soreness, setSoreness] = useState(existing?.soreness || 5);
  const [notes, setNotes] = useState(existing?.notes || "");

  const save = () => {
    const entry = {
      id: existing?.id || generateId(),
      cycleId: activeCycle?.id,
      date: existing?.date || format(new Date(), "yyyy-MM-dd"),
      weight: weight ? parseFloat(weight) : undefined,
      sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
      sleepQuality,
      energyLevel,
      recoveryScore,
      mood,
      soreness,
      notes,
      createdAt: existing?.createdAt || new Date().toISOString(),
      scaleV2: true,
    };

    if (existing) {
      updateJournalEntry(entry);
      showToast("Entry updated!");
    } else {
      addJournalEntry(entry);
      showToast("Entry saved!");
    }
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.dateText}>
        {existing ? format(parseISO(existing.date), "EEEE, MMMM d") : format(new Date(), "EEEE, MMMM d")}
      </Text>

      <Text style={styles.label}>Weight ({settings.weightUnit})</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>Sleep (hours)</Text>
      <TextInput
        style={styles.input}
        value={sleepHours}
        onChangeText={setSleepHours}
        keyboardType="decimal-pad"
        placeholder="—"
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.sectionTitle}>Ratings</Text>
      <RatingInput label="Sleep Quality" value={sleepQuality} onChange={setSleepQuality} lowLabel="Terrible" highLabel="Best sleep" />
      <RatingInput label="Energy Level" value={energyLevel} onChange={setEnergyLevel} lowLabel="Exhausted" highLabel="Fully charged" />
      <RatingInput label="Recovery" value={recoveryScore} onChange={setRecoveryScore} lowLabel="Very sore" highLabel="Fully recovered" />
      <RatingInput label="Mood" value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
      <RatingInput label="Soreness" value={soreness} onChange={setSoreness} lowLabel="Very sore" highLabel="No pain" />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, { height: 100, textAlignVertical: "top" }]}
        value={notes}
        onChangeText={setNotes}
        multiline
        placeholder="How are you feeling today?"
        placeholderTextColor={colors.textSecondary}
      />

      <TouchableOpacity style={styles.saveBtn} onPress={save}>
        <Ionicons name="checkmark" size={20} color={colors.background} />
        <Text style={styles.saveBtnText}>{existing ? "Update Entry" : "Save Entry"}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  dateText: { fontSize: 20, fontWeight: "700", color: colors.accent, marginBottom: 20 },
  label: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 24,
  },
  input: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: "row", gap: 12 },
  half: { flex: 1 },
  ratingContainer: { marginBottom: 18 },
  ratingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 },
  ratingLabel: { fontSize: 14, color: colors.text },
  ratingValue: { fontSize: 20, fontWeight: "800", color: colors.accent },
  ratingValueMax: { fontSize: 12, fontWeight: "600", color: colors.textSecondary },
  ratingHints: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  ratingHint: { fontSize: 10, color: colors.textSecondary },
  sliderWrap: {
    height: THUMB_SIZE, justifyContent: "center",
    paddingHorizontal: THUMB_SIZE / 2,
  },
  sliderTrack: {
    height: 6, backgroundColor: colors.surface, borderRadius: 3,
    borderWidth: 1, borderColor: colors.border, overflow: "hidden",
  },
  sliderFill: { height: "100%", backgroundColor: colors.accent },
  sliderThumb: {
    position: "absolute", width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2, backgroundColor: colors.accent,
    borderWidth: 2, borderColor: colors.background,
    left: THUMB_SIZE / 2,
  },
  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 14, padding: 18, marginTop: 32,
  },
  saveBtnText: { fontSize: 16, fontWeight: "700", color: colors.background },
});
