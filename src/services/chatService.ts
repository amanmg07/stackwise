import { peptides } from "../data/peptides";
import { Cycle, JournalEntry, ChatMessage } from "../types";

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";

function buildSystemPrompt(activeCycle: Cycle | null, recentJournal: JournalEntry[]): string {
  const peptideContext = peptides.map((p) => ({
    id: p.id,
    name: p.name,
    categories: p.categories,
    description: p.description,
    routes: p.routes,
    dosingProtocols: p.dosingProtocols,
    sideEffects: p.sideEffects,
    stacksWith: p.stacksWith,
    halfLife: p.halfLife,
    notes: p.notes,
  }));

  let prompt = `You are StackWise AI, a knowledgeable peptide advisor built into the StackWise app. You help users understand peptides, dosing protocols, stacking strategies, side effects, and cycle planning.

IMPORTANT RULES:
- Always provide evidence-based information
- Include dosing ranges and administration routes when discussing specific peptides
- Warn about potential side effects and contraindications
- Recommend consulting a healthcare provider for medical decisions
- Reference specific peptides by their exact name from the database
- Keep responses concise but thorough — aim for 2-4 paragraphs max
- Use a friendly, knowledgeable tone

PEPTIDE DATABASE:
${JSON.stringify(peptideContext, null, 0)}
`;

  if (activeCycle) {
    prompt += `\n\nUSER'S ACTIVE CYCLE:
Name: ${activeCycle.name}
Period: ${activeCycle.startDate} to ${activeCycle.endDate}
Peptides: ${activeCycle.peptides.map((p) => {
      const pep = peptides.find((db) => db.id === p.peptideId);
      return `${pep?.name || p.peptideId} (${p.doseAmount} ${p.doseUnit}, ${p.frequency}, ${p.route})`;
    }).join("; ")}
Notes: ${activeCycle.notes || "None"}`;
  }

  if (recentJournal.length > 0) {
    const entries = recentJournal.slice(0, 5).map((e) =>
      `${e.date}: energy=${e.energyLevel}/5, sleep=${e.sleepQuality}/5, recovery=${e.recoveryScore}/5, mood=${e.mood}/5, soreness=${e.soreness}/5${e.notes ? `, notes: "${e.notes}"` : ""}`
    );
    prompt += `\n\nUSER'S RECENT JOURNAL (last ${entries.length} entries):\n${entries.join("\n")}`;
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
  const systemPrompt = buildSystemPrompt(context.activeCycle, context.recentJournal);

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
