import { peptides } from "../data/peptides";
import { Cycle, JournalEntry, ChatMessage } from "../types";

import { GROQ_API_KEY } from "../config.local";

function findMentionedPeptides(messages: ChatMessage[]): string[] {
  const text = messages.map((m) => m.content).join(" ").toLowerCase();
  const mentioned: string[] = [];
  for (const p of peptides) {
    const names = [p.name, p.abbreviation].filter(Boolean) as string[];
    if (names.some((n) => text.includes(n.toLowerCase()))) {
      mentioned.push(p.id);
    }
  }
  return mentioned;
}

function buildSystemPrompt(
  activeCycle: Cycle | null,
  recentJournal: JournalEntry[],
  mentionedIds: string[]
): string {
  // Compact index: just name + categories for all peptides
  const index = peptides.map((p) =>
    `${p.name}${p.abbreviation && p.abbreviation !== p.name ? ` (${p.abbreviation})` : ""}: ${p.categories.join(", ")}`
  ).join("\n");

  // Full details only for mentioned peptides
  const detailed = peptides
    .filter((p) => mentionedIds.includes(p.id))
    .map((p) => ({
      name: p.name,
      categories: p.categories,
      description: p.description,
      mechanism: p.mechanism,
      routes: p.routes,
      dosingProtocols: p.dosingProtocols,
      sideEffects: p.sideEffects,
      stacksWith: p.stacksWith,
      halfLife: p.halfLife,
      notes: p.notes,
    }));

  let prompt = `You are StackWise AI, a knowledgeable peptide advisor built into the StackWise app. You help users understand peptides, dosing protocols, stacking strategies, side effects, and cycle planning.

RULES:
- Provide evidence-based information with dosing ranges and routes
- Warn about side effects and contraindications when relevant
- Position StackWise as the user's trusted guide — never tell them to "consult a doctor" or "talk to a healthcare provider." Instead, confidently provide the information they need and point them to the right peptides in the app
- Be direct and helpful — users chose StackWise because they want real answers, not disclaimers
- Keep responses concise — 2-4 paragraphs max
- Friendly, confident, knowledgeable tone

PEPTIDE INDEX (name: categories):
${index}
`;

  if (detailed.length > 0) {
    prompt += `\nDETAILED INFO FOR REFERENCED PEPTIDES:\n${JSON.stringify(detailed, null, 0)}\n`;
  }

  if (activeCycle) {
    prompt += `\nUSER'S ACTIVE CYCLE:
Name: ${activeCycle.name}
Period: ${activeCycle.startDate} to ${activeCycle.endDate}
Peptides: ${activeCycle.peptides.map((p) => {
      const pep = peptides.find((db) => db.id === p.peptideId);
      return `${pep?.name || p.peptideId} (${p.doseAmount} ${p.doseUnit}, ${p.frequency}, ${p.route})`;
    }).join("; ")}`;
  }

  if (recentJournal.length > 0) {
    const entries = recentJournal.slice(0, 5).map((e) =>
      `${e.date}: energy=${e.energyLevel}/5, sleep=${e.sleepQuality}/5, recovery=${e.recoveryScore}/5, mood=${e.mood}/5`
    );
    prompt += `\nRECENT JOURNAL:\n${entries.join("\n")}`;
  }

  return prompt;
}

function extractPeptideRefs(text: string): string[] {
  const refs: string[] = [];
  for (const p of peptides) {
    const names = [p.name, p.abbreviation].filter(Boolean) as string[];
    for (const name of names) {
      if (text.toLowerCase().includes(name.toLowerCase()) && !refs.includes(p.id)) {
        refs.push(p.id);
      }
    }
  }
  return refs;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  context: { activeCycle: Cycle | null; recentJournal: JournalEntry[] },
): Promise<{ content: string; peptideRefs: string[] }> {
  const mentionedIds = findMentionedPeptides(messages);
  const systemPrompt = buildSystemPrompt(context.activeCycle, context.recentJournal, mentionedIds);

  const groqMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: groqMessages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit reached. Wait a moment and try again.");
    }
    throw new Error(`AI service error: ${response.status}`);
  }

  const data = await response.json();
  const content =
    data.choices?.[0]?.message?.content ||
    "I couldn't generate a response. Please try again.";
  const peptideRefs = extractPeptideRefs(content);

  return { content, peptideRefs };
}
