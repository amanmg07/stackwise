import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../../context/AppContext";
import { uploadAvatar } from "../../utils/supabase";
import { peptides as peptideDB } from "../../data/peptides";
import { colors, spacing } from "../../theme";

export default function ProfileScreen({ navigation }: any) {
  const { cycles, doseLogs, journal, settings, updateSettings, clearAllData, userId } = useApp();

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
      const localUri = result.assets[0].uri;
      // Show local preview immediately
      updateSettings({ profileImage: localUri });
      // Upload to Supabase so others can see it
      if (userId) {
        try {
          const publicUrl = await uploadAvatar(userId, localUri);
          updateSettings({ profileImage: publicUrl });
        } catch (e) {
          Alert.alert("Upload failed", "Photo saved locally but others won't see it yet. Try again later.");
        }
      }
    }
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
            <>
              <Image source={{ uri: settings.profileImage }} style={styles.avatar} />
              <View style={styles.editPhotoBadge}>
                <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
              </View>
            </>
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="add-circle-outline" size={32} color={colors.accent} />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.nameBtn}>
          <Ionicons name="create-outline" size={16} color={colors.accent} />
          <TextInput
            style={styles.nameInput}
            value={settings.displayName || ""}
            onChangeText={(text) => updateSettings({ displayName: text })}
            placeholder="Set your name"
            placeholderTextColor={colors.textSecondary}
            returnKeyType="done"
            maxLength={40}
          />
        </View>
        <Text style={styles.nameHint}>This shows on your feed posts</Text>
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
        <Text style={styles.comingSoon}>Coming Soon</Text>
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
          <TouchableOpacity
            key={c.id}
            style={styles.cycleRow}
            onPress={() => navigation.navigate("CycleTab", {
              screen: c.isActive ? "CycleTracker" : "CycleDetail",
              params: c.isActive ? undefined : { cycleId: c.id },
            })}
            activeOpacity={0.7}
          >
            <View style={styles.cycleInfo}>
              <Text style={styles.cycleName}>{c.name}</Text>
              <Text style={styles.cycleDates}>
                {c.startDate} → {c.endDate}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={[styles.statusBadge, { backgroundColor: c.isActive ? colors.success + "20" : colors.border }]}>
                <Text style={[styles.statusText, { color: c.isActive ? colors.success : colors.textSecondary }]}>
                  {c.isActive ? "Active" : "Done"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
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
    backgroundColor: colors.accent + "10", borderWidth: 2, borderColor: colors.accent + "40",
    borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  addPhotoText: { fontSize: 11, fontWeight: "600", color: colors.textSecondary, marginTop: 4 },
  editPhotoBadge: {
    position: "absolute", bottom: 0, right: -4,
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.background,
  },
  nameBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
    marginTop: 8,
  },
  nameHint: { fontSize: 12, color: colors.textSecondary, textAlign: "center", marginTop: 6 },
  nameInput: {
    fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center",
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
  comingSoon: { fontSize: 12, fontWeight: "600", color: colors.textSecondary, backgroundColor: colors.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, overflow: "hidden" },
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
