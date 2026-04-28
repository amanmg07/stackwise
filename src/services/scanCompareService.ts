import { File } from "expo-file-system";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { peptides as peptideDB } from "../data/peptides";
import { Cycle, ScanComparison, ScanRecord } from "../types";
import { callGroqProxy } from "../utils/supabase";

function buildPeptideContext(activeCycle: Cycle | null): string {
  if (!activeCycle || activeCycle.peptides.length === 0) {
    return "The user is not currently on any peptides or supplements.";
  }
  const lines = activeCycle.peptides
    .map((cp) => {
      const p = peptideDB.find((pp) => pp.id === cp.peptideId);
      if (!p) return null;
      const type = p.compoundType === "supplement" ? "supplement" : "peptide";
      return `- ${p.name} [${type}] (id: ${p.id}, categories: ${p.categories.join(", ")})`;
    })
    .filter(Boolean);
  return `The user is currently on these peptides and supplements:\n${lines.join("\n")}`;
}

function extensionToMime(uri: string): string {
  const ext = uri.split(".").pop()?.toLowerCase();
  return ext === "png" ? "image/png" : "image/jpeg";
}

export async function compareScans(
  earlier: ScanRecord,
  later: ScanRecord,
  activeCycle: Cycle | null,
  gender?: string
): Promise<ScanComparison> {
  const earlierB64 = await new File(earlier.imagePath).base64();
  const laterB64 = await new File(later.imagePath).base64();
  const earlierMime = extensionToMime(earlier.imagePath);
  const laterMime = extensionToMime(later.imagePath);

  const daysBetween = differenceInCalendarDays(parseISO(later.date), parseISO(earlier.date));
  const peptideContext = buildPeptideContext(activeCycle);

  const peptideIndex = peptideDB
    .map((p) => `${p.id}: ${p.name} [${p.compoundType === "supplement" ? "supplement" : "peptide"}] (${p.categories.join(", ")})`)
    .join("\n");

  const genderCtx = gender ? `The user is ${gender}. Tailor observations to sex-specific factors (hormonal profiles, body composition patterns, skin differences).\n` : "";

  const timeCtx = daysBetween > 0
    ? `These photos were taken ${daysBetween} days apart.`
    : "These photos may have been taken at different points in time — ignore the timestamps and focus purely on visible differences between the two images.";

  const systemPrompt = `You are comparing two photos of the SAME person. ${timeCtx}
${genderCtx}
${peptideContext}

AVAILABLE COMPOUNDS (use exact ids):
${peptideIndex}

VALID CATEGORIES: recovery, fat_loss, muscle_gain, anti_aging, sleep, cognitive, immune, sexual_health, hormone

Photo 1 = BEFORE. Photo 2 = AFTER. Compare them honestly.

RESPOND WITH ONLY VALID JSON matching this exact structure:

{
  "summary": "1-2 sentence summary of the most notable visible differences",
  "changes": [
    {
      "category": "muscle_gain",
      "change": "Description of what is DIFFERENT between the photos",
      "direction": "improved"
    }
  ],
  "newRecommendations": [
    {
      "category": "sleep",
      "observation": "Description of the visible PROBLEM",
      "suggestedPeptideIds": ["dsip", "magnesium_glycinate"]
    }
  ]
}

RULES:

"changes" — List ONLY things that are visibly DIFFERENT between Photo 1 and Photo 2:
- "improved" = Photo 2 looks BETTER (more muscle, clearer skin, less fat, less dark circles)
- "worsened" = Photo 2 looks WORSE
- Do NOT include "unchanged" items. Only list actual differences.
- The "direction" MUST match the description. If you say "more defined muscles in Photo 2" the direction MUST be "improved". If you say "more acne in Photo 2" the direction MUST be "worsened".

"newRecommendations" — ONLY for visible PROBLEMS in Photo 2:
- There must be something visibly WRONG that you can describe (dark circles, acne, excess fat, etc.)
- Do NOT recommend for anything that looks fine or healthy
- Do NOT recommend for categories that improved
- If you would write "no visible signs of X" — that means do NOT include X at all
- If there are no visible problems, return an empty array []

"workingPeptides" is NOT included — omit it entirely.

If photos are unclear or not comparable:
{"summary": "Could not reliably compare these photos.", "changes": [], "newRecommendations": []}`;

  const data = await callGroqProxy({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: `data:${earlierMime};base64,${earlierB64}` } },
          { type: "image_url", image_url: { url: `data:${laterMime};base64,${laterB64}` } },
          {
            type: "text",
            text: daysBetween > 0
              ? `Photo 1 is from ${earlier.date.split("T")[0]}. Photo 2 is from ${later.date.split("T")[0]} (${daysBetween} days later). Compare them and respond with JSON only.`
              : `Compare these two photos. Focus on all visible physical differences between Photo 1 and Photo 2. Respond with JSON only.`,
          },
        ],
      },
    ],
    max_tokens: 1024,
    temperature: 0.4,
  });
  const text = data.choices?.[0]?.message?.content || "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse comparison. Please try again.");

  const parsed = JSON.parse(jsonMatch[0]) as ScanComparison;

  // Filter out "unchanged" items the model may still return
  const changes = (parsed.changes || []).filter((c) => c.direction !== "unchanged");

  // Filter out recommendations that describe no problem (model sometimes ignores instructions)
  const noIssuePatterns = /no visible|looks? (fine|good|healthy|great|normal)|not? .*(issue|problem|concern)/i;
  const newRecs = (parsed.newRecommendations || []).filter((r) => !noIssuePatterns.test(r.observation));

  // Filter out recommendations for categories that improved
  const improvedCats = new Set(changes.filter((c) => c.direction === "improved").map((c) => c.category));
  const filteredRecs = newRecs.filter((r) => !improvedCats.has(r.category));

  return {
    summary: parsed.summary || "",
    changes,
    workingPeptides: parsed.workingPeptides || [],
    newRecommendations: filteredRecs,
  };
}
