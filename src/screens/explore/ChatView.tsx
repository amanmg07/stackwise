import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../../context/AppContext";
import { peptides as peptideDB } from "../../data/peptides";
import { sendChatMessage } from "../../services/chatService";
import { generateId } from "../../utils/id";
import { colors, spacing } from "../../theme";
import { ChatMessage } from "../../types";

const STARTERS = [
  "What peptides help with recovery?",
  "Explain BPC-157 + TB-500 stack",
  "Best peptides for sleep quality?",
  "Side effects of semaglutide?",
  "What should I know about my cycle?",
  "Compare CJC-1295 vs MK-677",
];

interface Props {
  navigation: any;
}

export default function ChatView({ navigation }: Props) {
  const { cycles, journal, settings, updateSettings } = useApp();
  const activeCycle = cycles.find((c) => c.isActive) || null;
  const recentJournal = [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const hasKey = !!settings.geminiApiKey;

  const send = async (text: string) => {
    if (!text.trim() || loading || !settings.geminiApiKey) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const { content, peptideRefs } = await sendChatMessage(
        updated,
        { activeCycle, recentJournal },
        settings.geminiApiKey
      );

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content,
        timestamp: new Date().toISOString(),
        peptideRefs,
      };
      setMessages([...updated, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: err.message || "Something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages([...updated, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const renderPeptideChips = (refs: string[]) => {
    if (!refs || refs.length === 0) return null;
    return (
      <View style={styles.refRow}>
        {refs.map((id) => {
          const pep = peptideDB.find((p) => p.id === id);
          if (!pep) return null;
          return (
            <TouchableOpacity
              key={id}
              style={styles.refChip}
              onPress={() => navigation.navigate("PeptideDetail", { peptideId: id })}
            >
              <Ionicons name="flask-outline" size={12} color={colors.accent} />
              <Text style={styles.refChipText}>{pep.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
        {!isUser && item.peptideRefs && item.peptideRefs.length > 0 && renderPeptideChips(item.peptideRefs)}
      </View>
    );
  };

  const [apiKeyInput, setApiKeyInput] = useState("");

  const saveApiKey = () => {
    if (!apiKeyInput.trim()) return;
    updateSettings({ geminiApiKey: apiKeyInput.trim() });
    setApiKeyInput("");
  };

  if (!hasKey) {
    return (
      <View style={styles.noKey}>
        <View style={styles.noKeyIcon}>
          <Ionicons name="chatbubbles-outline" size={36} color={colors.accent} />
        </View>
        <Text style={styles.noKeyTitle}>Set Up AI Chat</Text>
        <Text style={styles.noKeyDesc}>
          Enter your free Gemini API key to chat with StackWise AI.{"\n"}
          Get one at aistudio.google.com → Get API Key
        </Text>
        <TextInput
          style={styles.noKeyInput}
          value={apiKeyInput}
          onChangeText={setApiKeyInput}
          placeholder="Paste your Gemini API key here"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[styles.noKeyBtn, !apiKeyInput.trim() && { opacity: 0.4 }]}
          disabled={!apiKeyInput.trim()}
          onPress={saveApiKey}
        >
          <Ionicons name="checkmark" size={18} color={colors.background} />
          <Text style={styles.noKeyBtnText}>Save & Start Chatting</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 140 : 0}
    >
      {messages.length === 0 ? (
        <View style={styles.starterContainer}>
          <View style={styles.starterIcon}>
            <Ionicons name="chatbubbles-outline" size={40} color={colors.accent} />
          </View>
          <Text style={styles.starterTitle}>Ask StackWise AI</Text>
          <Text style={styles.starterDesc}>
            Get personalized advice about peptides, dosing, stacking, and your cycle.
          </Text>
          <View style={styles.starterChips}>
            {STARTERS.map((q) => (
              <TouchableOpacity key={q} style={styles.starterChip} onPress={() => send(q)}>
                <Text style={styles.starterChipText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.typingText}>StackWise is thinking...</Text>
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about peptides..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
          editable={!loading}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
          disabled={!input.trim() || loading}
          onPress={() => send(input)}
        >
          <Ionicons name="send" size={18} color={colors.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  noKey: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.xl },
  noKeyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  noKeyTitle: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: 8 },
  noKeyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  noKeyInput: {
    width: "100%", backgroundColor: colors.surface, borderRadius: 12,
    padding: 14, fontSize: 14, color: colors.text, marginBottom: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  noKeyBtn: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: colors.accent, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 14,
  },
  noKeyBtnText: { fontSize: 15, fontWeight: "700", color: colors.background },
  starterContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg },
  starterIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  starterTitle: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 6 },
  starterDesc: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 24, lineHeight: 20 },
  starterChips: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, paddingHorizontal: 4 },
  starterChip: {
    backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  starterChipText: { fontSize: 13, color: colors.accent, fontWeight: "500", lineHeight: 18 },
  msgRow: { marginBottom: 12 },
  msgRowUser: { alignItems: "flex-end" },
  bubble: { maxWidth: "85%", borderRadius: 16, padding: 14 },
  bubbleUser: { backgroundColor: colors.accent, borderBottomRightRadius: 4 },
  bubbleAssistant: { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 22 },
  bubbleTextUser: { color: colors.background },
  refRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8, paddingLeft: 4 },
  refChip: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.accent + "40",
  },
  refChipText: { fontSize: 12, color: colors.accent, fontWeight: "600" },
  typingRow: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: spacing.md, paddingVertical: 8,
  },
  typingText: { fontSize: 13, color: colors.textSecondary },
  inputRow: {
    flexDirection: "row", alignItems: "flex-end", gap: 8,
    padding: spacing.md, paddingBottom: Platform.OS === "ios" ? 8 : spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, backgroundColor: colors.surface, borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 12, paddingTop: 12,
    fontSize: 15, color: colors.text, maxHeight: 100,
    borderWidth: 1, borderColor: colors.border,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
});
