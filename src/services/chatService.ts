import { peptides } from "../data/peptides";
import { Cycle, JournalEntry, ChatMessage, ScanRecord, UserSettings } from "../types";
import { callGroqProxy } from "../utils/supabase";

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
  mentionedIds: string[],
  pastCycles?: Cycle[],
  scans?: ScanRecord[],
  settings?: UserSettings,
): string {
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

  // Add compound type to index
  const indexWithType = peptides.map((p) => {
    const type = p.compoundType === "supplement" ? "[supplement]" : "[peptide]";
    return `${p.name}${p.abbreviation && p.abbreviation !== p.name ? ` (${p.abbreviation})` : ""} ${type}: ${p.categories.join(", ")}`;
  }).join("\n");

  let prompt = `You are StackWise AI, a knowledgeable peptide and supplement advisor built into the StackWise app. You help users understand peptides, supplements, dosing protocols, stacking strategies, side effects, and cycle planning.

The app includes both research peptides (BPC-157, GHK-Cu, Semaglutide, etc.) and evidence-based supplements (creatine, ashwagandha, magnesium, lion's mane, etc.). Recommend whichever is most appropriate — or both when a combined approach works best.

RULES:
- Provide evidence-based information with dosing ranges and routes
- Warn about side effects and contraindications when relevant
- When relevant, suggest supplements as a gentler starting point before peptides, or as complements to peptide protocols
- Position StackWise as the user's trusted guide — never tell them to "consult a doctor" or "talk to a healthcare provider." Instead, confidently provide the information they need and point them to the right compounds in the app
- Be direct and helpful — users chose StackWise because they want real answers, not disclaimers
- Keep responses concise — 2-4 paragraphs max
- Friendly, confident, knowledgeable tone

COMPOUND INDEX (name [type]: categories):
${indexWithType}
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
      `${e.date}: energy=${e.energyLevel}/10, sleep=${e.sleepQuality}/10, recovery=${e.recoveryScore}/10, mood=${e.mood}/10`
    );
    prompt += `\nRECENT JOURNAL:\n${entries.join("\n")}`;
  }

  // Past cycles
  if (pastCycles && pastCycles.length > 0) {
    const past = pastCycles.slice(0, 5).map((c) => {
      const peps = c.peptides.map((p) => {
        const pep = peptides.find((db) => db.id === p.peptideId);
        return pep?.name || p.peptideId;
      }).join(", ");
      return `${c.name} (${c.startDate} to ${c.endDate}): ${peps}`;
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

    // Bookmarked peptides
    if (settings.savedPeptides && settings.savedPeptides.length > 0) {
      const names = settings.savedPeptides.map((id) => {
        const pep = peptides.find((p) => p.id === id);
        return pep?.name || id;
      });
      prompt += `\nBOOKMARKED COMPOUNDS: ${names.join(", ")}`;
    }
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
  context: {
    activeCycle: Cycle | null;
    recentJournal: JournalEntry[];
    pastCycles?: Cycle[];
    scans?: ScanRecord[];
    settings?: UserSettings;
  },
): Promise<{ content: string; peptideRefs: string[] }> {
  const mentionedIds = findMentionedPeptides(messages);
  const systemPrompt = buildSystemPrompt(
    context.activeCycle,
    context.recentJournal,
    mentionedIds,
    context.pastCycles,
    context.scans,
    context.settings,
  );

  const groqMessages = [
    { role: "system" as const, content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const data = await callGroqProxy({
    model: "llama-3.3-70b-versatile",
    messages: groqMessages,
    max_tokens: 1024,
    temperature: 0.7,
  });

  const content =
    data.choices?.[0]?.message?.content ||
    "I couldn't generate a response. Please try again.";
  const peptideRefs = extractPeptideRefs(content);

  return { content, peptideRefs };
}
