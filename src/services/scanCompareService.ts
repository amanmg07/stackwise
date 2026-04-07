import { File } from "expo-file-system";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { peptides as peptideDB } from "../data/peptides";
import { Cycle, ScanComparison, ScanRecord } from "../types";
import { callGroqProxy } from "../utils/supabase";

function buildPeptideContext(activeCycle: Cycle | null): string {
  if (!activeCycle || activeCycle.peptides.length === 0) {
    return "The user is not currently on any peptides.";
  }
  const lines = activeCycle.peptides
    .map((cp) => {
      const p = peptideDB.find((pp) => pp.id === cp.peptideId);
      if (!p) return null;
      return `- ${p.name} (id: ${p.id}, categories: ${p.categories.join(", ")})`;
    })
    .filter(Boolean);
  return `The user is currently on these peptides:\n${lines.join("\n")}`;
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
    .map((p) => `${p.id}: ${p.name} (${p.categories.join(", ")})`)
    .join("\n");

  const genderCtx = gender ? `The user is ${gender}. Tailor observations to sex-specific factors (hormonal profiles, body composition patterns, skin differences).\n` : "";

  const systemPrompt = `You are comparing two progress photos of the SAME person taken ${daysBetween} days apart to track visible changes.
${genderCtx}
${peptideContext}

AVAILABLE PEPTIDES (use these exact ids in your response):
${peptideIndex}

CATEGORIES: recovery, fat_loss, muscle_gain, anti_aging, sleep, cognitive, immune, sexual_health, hormone

Photo 1 is the earlier scan. Photo 2 is the later scan. Be specific and honest about what you observe.

For "workingPeptides": ONLY include a peptide from the user's current stack if there is a visible improvement that aligns with that peptide's categories. Do not fabricate. If nothing visibly improved, return an empty array.

For "newRecommendations": suggest peptides for any NEW issues visible in photo 2 that aren't addressed by the current stack, OR for issues that haven't improved despite the current stack. suggestedPeptideIds must be valid ids from the list above.

Respond with ONLY valid JSON:
{
  "summary": "1-2 sentence overall progress summary",
  "changes": [
    {"category": "anti_aging", "change": "Skin tone appears more even, less redness around cheeks", "direction": "improved"},
    {"category": "sleep", "change": "Dark circles under eyes still present", "direction": "unchanged"}
  ],
  "workingPeptides": [
    {"peptideId": "ghkcu", "reason": "Skin texture improvement over ${daysBetween} days aligns with GHK-Cu's skin repair mechanism"}
  ],
  "newRecommendations": [
    {"category": "sleep", "observation": "Dark circles haven't improved", "suggestedPeptideIds": ["dsip", "sleep_blend"]}
  ]
}

If the photos are unclear, of different people, or you cannot make a reliable comparison, return:
{"summary": "Could not reliably compare these photos.", "changes": [], "workingPeptides": [], "newRecommendations": []}`;

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
            text: `Photo 1 is from ${earlier.date.split("T")[0]}. Photo 2 is from ${later.date.split("T")[0]} (${daysBetween} days later). Compare them and respond with JSON only.`,
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
  return {
    summary: parsed.summary || "",
    changes: parsed.changes || [],
    workingPeptides: parsed.workingPeptides || [],
    newRecommendations: parsed.newRecommendations || [],
  };
}
