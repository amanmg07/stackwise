import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Switch, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";

export default function ProfileScreen({ navigation }: any) {
  const { cycles, doseLogs, journal, settings, updateSettings, clearAllData } = useApp();
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(settings.displayName || "");

  const completedCycles = cycles.filter((c) => !c.isActive).length;
  const activeCycles = cycles.filter((c) => c.isActive).length;
  const totalDoses = doseLogs.length;
  const totalEntries = journal.length;

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow photo access to set a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      updateSettings({ profileImage: result.assets[0].uri });
    }
  };

  const saveName = () => {
    updateSettings({ displayName: nameDraft.trim() });
    setEditingName(false);
  };

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
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrap}>
          {settings.profileImage ? (
            <Image source={{ uri: settings.profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person-outline" size={36} color={colors.textSecondary} />
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Ionicons name="camera-outline" size={12} color="#fff" />
          </View>
        </TouchableOpacity>

        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              style={styles.nameInput}
              value={nameDraft}
              onChangeText={setNameDraft}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
              onSubmitEditing={saveName}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={saveName} style={styles.nameSaveBtn}>
              <Ionicons name="checkmark-outline" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => { setNameDraft(settings.displayName || ""); setEditingName(true); }}>
            <Text style={styles.displayName}>
              {settings.displayName || "Tap to set name"}
            </Text>
            {!settings.displayName && (
              <Text style={styles.nameHint}>This shows on your feed posts</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

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

      <View style={styles.settingRow}>
        <View style={styles.settingLeft}>
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <Text style={styles.settingLabel}>Reminders</Text>
        </View>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={(val) => updateSettings({ notificationsEnabled: val })}
          trackColor={{ false: colors.border, true: colors.accent + "60" }}
          thumbColor={settings.notificationsEnabled ? colors.accent : colors.textSecondary}
        />
      </View>

      {/* Saved Peptides */}
      <Text style={styles.sectionTitle}>Saved for Later</Text>
      {(!settings.savedPeptides || settings.savedPeptides.length === 0) ? (
        <Text style={styles.emptyText}>No saved peptides — tap the bookmark on any peptide to save it</Text>
      ) : (
        settings.savedPeptides.map((id) => {
          const pep = peptideDB.find((p) => p.id === id);
          if (!pep) return null;
          return (
            <TouchableOpacity
              key={id}
              style={styles.savedRow}
              onPress={() => navigation.navigate("ExploreTab", {
                screen: "PeptideDetail",
                params: { peptideId: id },
              })}
            >
              <View style={styles.savedInfo}>
                <Text style={styles.savedName}>{pep.name}</Text>
                <Text style={styles.savedCats} numberOfLines={1}>
                  {pep.categories.map((c) => c.replace("_", " ")).join(", ")}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          );
        })
      )}

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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md },
  // Profile header
  profileHeader: { alignItems: "center", paddingVertical: 20, marginBottom: 8 },
  avatarWrap: { marginBottom: 14 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    alignItems: "center", justifyContent: "center",
  },
  cameraBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.background,
  },
  displayName: { fontSize: 22, fontWeight: "800", color: colors.text, textAlign: "center" },
  nameHint: { fontSize: 12, color: colors.textSecondary, textAlign: "center", marginTop: 2 },
  nameEditRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  nameInput: {
    fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center",
    backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10,
    borderWidth: 1, borderColor: colors.accent + "50", minWidth: 180,
  },
  nameSaveBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
  },
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
  savedRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: colors.border, marginBottom: 8,
  },
  savedInfo: { flex: 1 },
  savedName: { fontSize: 15, fontWeight: "600", color: colors.text },
  savedCats: { fontSize: 12, color: colors.textSecondary, marginTop: 2, textTransform: "capitalize" },
  emptyText: { fontSize: 14, color: colors.textSecondary, marginBottom: 16 },
  dangerRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: colors.surface, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: colors.error + "30",
  },
  dangerText: { fontSize: 15, color: colors.error },
  version: { fontSize: 12, color: colors.textSecondary, textAlign: "center", marginTop: 32 },
});
