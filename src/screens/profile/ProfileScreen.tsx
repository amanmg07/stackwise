import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { colors, spacing } from "../../theme";

export default function ProfileScreen({ navigation }: any) {
  const { cycles, doseLogs, journal, settings, updateSettings, clearAllData } = useApp();

  const completedCycles = cycles.filter((c) => !c.isActive).length;
  const activeCycles = cycles.filter((c) => c.isActive).length;
  const totalDoses = doseLogs.length;
  const totalEntries = journal.length;

  const confirmClear = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all cycles, dose logs, and journal entries. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Everything", style: "destructive", onPress: clearAllData },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{activeCycles}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{completedCycles}</Text>
          <Text style={styles.statLabel} numberOfLines={1}>Done</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalDoses}</Text>
          <Text style={styles.statLabel}>Doses</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{totalEntries}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Settings</Text>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() =>
          updateSettings({ weightUnit: settings.weightUnit === "lbs" ? "kg" : "lbs" })
        }
      >
        <View style={styles.settingLeft}>
          <Ionicons name="scale-outline" size={20} color={colors.text} />
          <Text style={styles.settingLabel}>Weight Unit</Text>
        </View>
        <Text style={styles.settingValue}>{settings.weightUnit}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.settingRow}
        onPress={() =>
          updateSettings({ notificationsEnabled: !settings.notificationsEnabled })
        }
      >
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <Text style={styles.settingLabel}>Reminders</Text>
        </View>
        <Ionicons
          name={settings.notificationsEnabled ? "toggle" : "toggle-outline"}
          size={28}
          color={settings.notificationsEnabled ? colors.accent : colors.textSecondary}
        />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>AI Chat</Text>
      <ApiKeyInput settings={settings} updateSettings={updateSettings} />

      <Text style={styles.sectionTitle}>Cycle History</Text>

      {cycles.length === 0 ? (
        <Text style={styles.emptyText}>No cycles yet</Text>
      ) : (
        cycles.map((c) => (
          <View key={c.id} style={styles.cycleRow}>
            <View style={styles.cycleInfo}>
              <Text style={styles.cycleName}>{c.name}</Text>
              <Text style={styles.cycleDates}>
                {c.startDate} → {c.endDate}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: c.isActive ? colors.success + "20" : colors.border }]}>
              <Text style={[styles.statusText, { color: c.isActive ? colors.success : colors.textSecondary }]}>
                {c.isActive ? "Active" : "Done"}
              </Text>
            </View>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Data</Text>

      <TouchableOpacity style={styles.dangerRow} onPress={confirmClear}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
        <Text style={styles.dangerText}>Clear All Data</Text>
      </TouchableOpacity>

      <Text style={styles.version}>StackWise v1.0.0</Text>
    </ScrollView>
  );
}

function ApiKeyInput({ settings, updateSettings }: any) {
  const [editing, setEditing] = useState(false);
  const [key, setKey] = useState(settings.groqApiKey || "");
  const hasKey = !!settings.groqApiKey;

  const saveKey = () => {
    updateSettings({ groqApiKey: key.trim() || undefined });
    setEditing(false);
  };

  const removeKey = () => {
    Alert.alert("Remove API Key", "This will disable the AI chat feature.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          updateSettings({ groqApiKey: undefined });
          setKey("");
        },
      },
    ]);
  };

  if (!editing && hasKey) {
    return (
      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Ionicons name="key-outline" size={20} color={colors.success} />
          <View>
            <Text style={styles.settingLabel}>Groq API Key</Text>
            <Text style={styles.apiKeyMask}>gsk_•••••{settings.groqApiKey.slice(-4)}</Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={removeKey}>
            <Ionicons name="close-circle-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!editing && !hasKey) {
    return (
      <TouchableOpacity style={styles.settingRow} onPress={() => setEditing(true)}>
        <View style={styles.settingLeft}>
          <Ionicons name="key-outline" size={20} color={colors.text} />
          <View>
            <Text style={styles.settingLabel}>Groq API Key</Text>
            <Text style={styles.apiKeyHint}>Required for AI chat</Text>
          </View>
        </View>
        <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.apiKeyEdit}>
      <Text style={styles.apiKeyEditLabel}>Enter your Groq API key</Text>
      <TextInput
        style={styles.apiKeyInput}
        value={key}
        onChangeText={setKey}
        placeholder="gsk_..."
        placeholderTextColor={colors.textSecondary}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
      />
      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
        <TouchableOpacity
          style={styles.apiKeyCancel}
          onPress={() => { setEditing(false); setKey(settings.groqApiKey || ""); }}
        >
          <Text style={styles.apiKeyCancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.apiKeySave, !key.trim() && { opacity: 0.4 }]}
          disabled={!key.trim()}
          onPress={saveKey}
        >
          <Text style={styles.apiKeySaveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, paddingTop: Platform.OS === "ios" ? 60 : spacing.md },
  title: { fontSize: 28, fontWeight: "800", color: colors.text, marginBottom: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    alignItems: "center", borderWidth: 1, borderColor: colors.border,
  },
  statNum: { fontSize: 22, fontWeight: "800", color: colors.accent },
  statLabel: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  sectionTitle: {
    fontSize: 13, fontWeight: "700", color: colors.textSecondary,
    textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 8,
  },
  settingRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingLabel: { fontSize: 15, color: colors.text },
  settingValue: { fontSize: 15, fontWeight: "600", color: colors.accent },
  cycleRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  cycleInfo: { flex: 1 },
  cycleName: { fontSize: 15, fontWeight: "600", color: colors.text },
  cycleDates: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: "700" },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  dangerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.error + "30",
  },
  dangerText: { fontSize: 15, color: colors.error },
  version: { fontSize: 12, color: colors.textSecondary, textAlign: "center", marginTop: 32 },
  apiKeyMask: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  apiKeyHint: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  apiKeyEdit: {
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  apiKeyEditLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  apiKeyInput: {
    backgroundColor: colors.background, borderRadius: 8, padding: 12,
    fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border,
  },
  apiKeyCancel: {
    flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: 12, alignItems: "center",
  },
  apiKeyCancelText: { fontSize: 14, fontWeight: "600", color: colors.textSecondary },
  apiKeySave: {
    flex: 1, backgroundColor: colors.accent, borderRadius: 8,
    padding: 12, alignItems: "center",
  },
  apiKeySaveText: { fontSize: 14, fontWeight: "600", color: colors.background },
});
