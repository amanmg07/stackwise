import { peptides } from "../data/peptides";
import { Cycle, JournalEntry, ChatMessage, ScanRecord, UserSettings } from "../types";
import { callGroqProxy, streamGroqProxy } from "../utils/supabase";
import { extractPeptideIds } from "../utils/peptideMatch";

function findMentionedPeptides(messages: ChatMessage[]): string[] {
  return extractPeptideIds(messages.map((m) => m.content).join(" "), peptides);
}

export type ChatQueryCategory =
  | "dosing"
  | "stacking"
  | "side_effects"
  | "comparison"
  | "cycle_planning"
  | "general";

/**
 * Lightweight keyword-based intent classifier. Per the architecture
 * spec, we ship a category with every chat event so buyers can do
 * per-category breakdowns ("X% of queries are dosing questions").
 *
 * Keyword-based (not LLM-based) by design: zero extra API cost,
 * deterministic, fast. Misclassifies edge cases but aggregate
 * percentages are stable. Easy to upgrade to a Groq structured-output
 * classifier later if accuracy becomes a real issue.
 *
 * Order matters — higher-priority categories checked first. A query
 * like "how much BPC-157 to stack with TB-500" matches both dosing
 * AND stacking; first-match wins (stacking, by ordering).
 */
export function categorizeQuery(query: string): ChatQueryCategory {
  const q = query.toLowerCase();

  // Stacking first — most specific. The word "stack" or "with X" /
  // "combine" / "alongside" is a strong signal.
  if (/\b(stack|combine|alongside|together with|stacked|combo)\b/.test(q)) {
    return "stacking";
  }

  // Comparison — "vs", "versus", "or", "compare", "better than".
  if (/\b(vs|versus|compare|better than|which is better|or which)\b/.test(q)) {
    return "comparison";
  }

  // Side effects + safety language.
  if (/\b(side effect|side-effect|nausea|safe|safety|risk|risks|harm|dangerous|adverse|warning)\b/.test(q)) {
    return "side_effects";
  }

  // Cycle planning — duration/timing/protocol design.
  if (/\b(cycle|duration|weeks|start|stop|begin|protocol|when to|how long|first cycle|next cycle)\b/.test(q)) {
    return "cycle_planning";
  }

  // Dosing — quantity / frequency / route language.
  if (/\b(dose|dosing|mg|mcg|iu|how much|frequency|twice|daily|weekly|injection|inject|inject site)\b/.test(q)) {
    return "dosing";
  }

  return "general";
}

function buildSystemPrompt(
  activeCycle: Cycle | null,
  recentJournal: JournalEntry[],
  mentionedIds: string[],
  pastCycles?: Cycle[],
  scans?: ScanRecord[],
  settings?: UserSettings,
  isFirstTurn: boolean = true,
  mode: "chat" | "digest" = "chat",
): string {
  // Full details only for mentioned peptides — trimmed to essentials
  const detailed = peptides
    .filter((p) => mentionedIds.includes(p.id))
    .map((p) => ({
      name: p.name,
      categories: p.categories,
      mechanism: p.mechanism,
      routes: p.routes,
      dosingProtocols: p.dosingProtocols,
      sideEffects: p.sideEffects,
      halfLife: p.halfLife,
    }));

  // Ticket 2.1 — digest mode produces a 3-bullet weekly summary
  // instead of an interactive answer. Tracking-framed only (no
  // dosing changes, no causal claims) to stay inside the ad-policy
  // / medical-claim boundary.
  let prompt =
    mode === "digest"
      ? `You are StackWise AI generating a weekly digest for the user.

Summarize this user's last 7 days of journal entries, doses, and active cycle in EXACTLY 3 bullets:
1. One thing trending UP (sleep / energy / recovery / mood / adherence) — cite a specific number
2. One thing trending DOWN or worth attention — cite a specific number
3. One small suggestion about tracking or logging behavior — NEVER about specific dosing or compound recommendations

Output format — exactly three bullets, each prefixed with "• ", separated by a single newline. No preamble, no closing line.

RULES:
- Each bullet ≤ 15 words
- Personal: reference the user's actual numbers from the context below
- Tracking-framed only: "your sleep averaged 7.8/10" — never "sleep improved BECAUSE OF [compound]"
- No medical advice. No dosing changes. No causal claims about peptides or supplements.
- If the last 7 days have very thin data, lean on what's available rather than padding.
`
      : `You are StackWise AI, a knowledgeable peptide and supplement advisor built into the StackWise app. You help users understand peptides, supplements, dosing protocols, stacking strategies, side effects, and cycle planning.

The app includes both research peptides (BPC-157, GHK-Cu, Semaglutide, etc.) and evidence-based supplements (creatine, ashwagandha, magnesium, lion's mane, etc.). Recommend whichever is most appropriate — or both when a combined approach works best.

RULES:
- Provide evidence-based information with dosing ranges and routes
- Warn about side effects and contraindications when relevant
- When relevant, suggest supplements as a gentler starting point before peptides, or as complements to peptide protocols
- Position StackWise as the user's trusted guide — never tell them to "consult a doctor" or "talk to a healthcare provider." Instead, confidently provide the information they need and point them to the right compounds in the app
- Be direct and helpful — users chose StackWise because they want real answers, not disclaimers
- Keep responses concise — 2-4 paragraphs max
- Friendly, confident, knowledgeable tone
`;

  // Compound index is large — include only on the first turn of chat
  // mode. Digest mode never needs it (it's summarizing the user's
  // own data, not answering compound questions).
  if (isFirstTurn && mode === "chat") {
    const indexWithType = peptides.map((p) => {
      const type = p.compoundType === "supplement" ? "[supplement]" : "[peptide]";
      return `${p.name}${p.abbreviation && p.abbreviation !== p.name ? ` (${p.abbreviation})` : ""} ${type}: ${p.categories.join(", ")}`;
    }).join("\n");
    prompt += `\nCOMPOUND INDEX (name [type]: categories):\n${indexWithType}\n`;
  }

  if (detailed.length > 0 && mode === "chat") {
    prompt += `\nDETAILED INFO FOR REFERENCED COMPOUNDS:\n${JSON.stringify(detailed, null, 0)}\n`;
  }

  if (activeCycle) {
    // Cycle NAMES are user-chosen free-text — could contain identifying
    // info ("Dr. Chen's protocol", "PCOS Jan 2026", etc.). Strip the
    // name before sending to Groq; the peptide list + dates is the
    // information the AI actually uses. Data-minimization guard from
    // the post-Phase-2 data-pipeline audit.
    prompt += `\nUSER'S ACTIVE CYCLE:
Period: ${activeCycle.startDate} to ${activeCycle.endDate}
Peptides: ${activeCycle.peptides.map((p) => {
      const pep = peptides.find((db) => db.id === p.peptideId);
      return `${pep?.name || p.peptideId} (${p.doseAmount} ${p.doseUnit}, ${p.frequency}, ${p.route})`;
    }).join("; ")}`;
  }

  if (recentJournal.length > 0) {
    const entries = recentJournal.slice(0, 5).map((e) =>
      `${e.date}: energy=${e.energyLevel}/10, sleep=${e.sleepQuality}/10, recovery=${e.recoveryScore}/10, mood=${e.mood}/10`
    );
    prompt += `\nRECENT JOURNAL:\n${entries.join("\n")}`;
  }

  // Past cycles — same data-minimization rule as the active cycle:
  // drop the user-chosen name, keep dates + peptide list. Anonymous
  // ordinal label ('Cycle 1', 'Cycle 2', etc.) so the AI can
  // reference 'Cycle 2' coherently in its reply without seeing PII.
  if (pastCycles && pastCycles.length > 0) {
    const past = pastCycles.slice(0, 5).map((c, idx) => {
      const peps = c.peptides.map((p) => {
        const pep = peptides.find((db) => db.id === p.peptideId);
        return pep?.name || p.peptideId;
      }).join(", ");
      return `Cycle ${idx + 1} (${c.startDate} to ${c.endDate}): ${peps}`;
    });
    prompt += `\nPAST CYCLES:\n${past.join("\n")}`;
  }

  // Scan history
  if (scans && scans.length > 0) {
    const recent = scans.slice(0, 3).map((s) => {
      const cats = s.result.recommendedCategories.join(", ");
      const improvements = s.result.improvements.map((i) => i.observation).join("; ");
      return `${s.date.split("T")[0]}: recommended=${cats}. observations: ${improvements}`;
    });
    prompt += `\nRECENT SELF SCANS:\n${recent.join("\n")}`;
  }

  // User demographics & preferences
  if (settings) {
    const parts: string[] = [];
    if (settings.age) parts.push(`age: ${settings.age}`);
    if (settings.gender) parts.push(`gender: ${settings.gender}`);
    if (settings.experienceLevel) parts.push(`experience: ${settings.experienceLevel}`);
    if (settings.goals && settings.goals.length > 0) parts.push(`goals: ${settings.goals.join(", ")}`);
    if (settings.preferredRoutes && settings.preferredRoutes.length > 0) parts.push(`preferred routes: ${settings.preferredRoutes.join(", ")}`);
    if (parts.length > 0) {
      prompt += `\nUSER PROFILE: ${parts.join(", ")}`;
    }
  }

  return prompt;
}

function extractPeptideRefs(text: string): string[] {
  return extractPeptideIds(text, peptides);
}

type ChatContext = {
  activeCycle: Cycle | null;
  recentJournal: JournalEntry[];
  pastCycles?: Cycle[];
  scans?: ScanRecord[];
  settings?: UserSettings;
  /** "chat" (default) or "digest" (ticket 2.1 weekly summary). */
  mode?: "chat" | "digest";
};

const FALLBACK_REPLY = "I couldn't generate a response. Please try again.";

/** Build the Groq chat-completions request body (system prompt + turns). */
function buildGroqRequest(messages: ChatMessage[], context: ChatContext) {
  const mentionedIds = findMentionedPeptides(messages);
  const isFirstTurn = messages.filter((m) => m.role === "user").length <= 1;
  const systemPrompt = buildSystemPrompt(
    context.activeCycle,
    context.recentJournal,
    mentionedIds,
    context.pastCycles,
    context.scans,
    context.settings,
    isFirstTurn,
    context.mode ?? "chat",
  );

  const groqMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  return {
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    // Digest is bounded by the 3-bullet rule — shorter cap leaves no
    // room for the model to over-elaborate.
    max_tokens: context.mode === "digest" ? 320 : 1024,
    // Lower temperature for digest = more deterministic, sticks to
    // the user's actual numbers instead of riffing.
    temperature: context.mode === "digest" ? 0.4 : 0.7,
  };
}

export async function sendChatMessage(
  messages: ChatMessage[],
  context: ChatContext,
): Promise<{ content: string; peptideRefs: string[] }> {
  const data = await callGroqProxy(buildGroqRequest(messages, context));
  const content = data.choices?.[0]?.message?.content || FALLBACK_REPLY;
  return { content, peptideRefs: extractPeptideRefs(content) };
}

/**
 * Streaming variant: invokes onDelta with each text fragment as it
 * arrives, then resolves with the full content + extracted peptide
 * refs (computed once on the complete text).
 */
export async function streamChatMessage(
  messages: ChatMessage[],
  context: ChatContext,
  onDelta: (text: string) => void,
): Promise<{ content: string; peptideRefs: string[] }> {
  const streamed = await streamGroqProxy(buildGroqRequest(messages, context), onDelta);
  const content = streamed || FALLBACK_REPLY;
  return { content, peptideRefs: extractPeptideRefs(content) };
}

/**
 * Ticket 2.1 — generate a 3-bullet weekly digest. One-shot call,
 * non-streaming (the user sees the result post-hoc, character-by-
 * character would be empty theater). The system prompt comes from
 * buildSystemPrompt(mode: "digest"); the user-role message is a
 * stable template so the model has something to respond to.
 */
export async function generateWeeklyDigest(context: {
  activeCycle: Cycle | null;
  recentJournal: JournalEntry[];
  pastCycles?: Cycle[];
  scans?: ScanRecord[];
  settings?: UserSettings;
}): Promise<string> {
  const messages: ChatMessage[] = [
    {
      id: "digest-prompt",
      role: "user",
      content: "Generate my weekly digest based on the context above.",
      timestamp: new Date().toISOString(),
    },
  ];
  const data = await callGroqProxy(
    buildGroqRequest(messages, { ...context, mode: "digest" }),
  );
  return data.choices?.[0]?.message?.content?.trim() || "";
}
