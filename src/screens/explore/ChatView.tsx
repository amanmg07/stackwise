import React, { useState, useRef, useEffect } from "react";
import {
  View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback,
  StyleSheet, FlatList, Platform, ActivityIndicator, Keyboard,
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
  const { cycles, journal } = useApp();
  const activeCycle = cycles.find((c) => c.isActive) || null;
  const recentJournal = [...journal].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;

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

  const formatContent = (text: string, isUser: boolean) => {
    if (isUser) return <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{text}</Text>;

    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, pi) => {
      const lines = para.split("\n");
      return (
        <View key={pi} style={pi > 0 ? { marginTop: 10 } : undefined}>
          {lines.map((line, li) => {
            const bulletMatch = line.match(/^[\-\•\*]\s+(.+)/);
            const numberedMatch = line.match(/^(\d+)[\.\)]\s+(.+)/);

            if (bulletMatch) {
              return (
                <View key={li} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bubbleText}>{renderInline(bulletMatch[1])}</Text>
                </View>
              );
            }
            if (numberedMatch) {
              return (
                <View key={li} style={styles.bulletRow}>
                  <Text style={styles.numberedNum}>{numberedMatch[1]}.</Text>
                  <Text style={styles.bubbleText}>{renderInline(numberedMatch[2])}</Text>
                </View>
              );
            }
            return <Text key={li} style={styles.bubbleText}>{renderInline(line)}</Text>;
          })}
        </View>
      );
    });
  };

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      const boldMatch = part.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) {
        return <Text key={i} style={styles.boldText}>{boldMatch[1]}</Text>;
      }
      return <React.Fragment key={i}>{part}</React.Fragment>;
    });
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
          {formatContent(item.content, isUser)}
        </View>
        {!isUser && item.peptideRefs && item.peptideRefs.length > 0 && renderPeptideChips(item.peptideRefs)}
      </View>
    );
  };

  const bottomPadding = keyboardHeight > 0 ? keyboardHeight - 85 : 0;
  const keyboardOpen = keyboardHeight > 0;

  return (
    <View style={styles.container}>
      {messages.length === 0 ? (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.starterContainer}>
            {!keyboardOpen && (
              <>
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
              </>
            )}
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 8 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}

      {loading && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.typingText}>StackWise is thinking...</Text>
        </View>
      )}

      <View style={[styles.inputRow, { paddingBottom: Math.max(bottomPadding, Platform.OS === "ios" ? 8 : spacing.md) }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  bubbleText: { fontSize: 15, color: colors.text, lineHeight: 22, flex: 1 },
  bubbleTextUser: { color: colors.background },
  boldText: { fontWeight: "700" },
  bulletRow: { flexDirection: "row", gap: 6, marginTop: 4 },
  bulletDot: { fontSize: 15, color: colors.textSecondary, lineHeight: 22 },
  numberedNum: { fontSize: 15, color: colors.textSecondary, lineHeight: 22, fontWeight: "600", minWidth: 18 },
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
    padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.background,
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
