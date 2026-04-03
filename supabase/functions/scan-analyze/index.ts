import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const SYSTEM_PROMPT = `You are a peptide recommendation AI for the StackWise app. You analyze photos of people and suggest peptides based on visible characteristics.

Analyze the photo and identify visible signs that map to these categories:
- recovery: visible injuries, joint issues, post-workout fatigue signs
- fat_loss: body composition suggesting fat loss goals
- muscle_gain: physique suggesting muscle building goals
- anti_aging: visible skin aging, wrinkles, fine lines, sun damage
- sleep: dark circles, tired appearance
- cognitive: (cannot assess visually — skip unless other signs present)
- immune: skin conditions, inflammation signs
- sexual_health: (cannot assess visually — skip)

For each observation, be respectful, factual, and non-judgmental. Focus on what peptides could support their wellness goals.

Respond ONLY with valid JSON in this exact format:
{
  "observations": [
    {
      "category": "anti_aging",
      "observation": "Fine lines visible around eyes and forehead",
      "confidence": "high"
    }
  ],
  "recommendedCategories": ["anti_aging", "recovery"],
  "summary": "A brief 1-2 sentence personalized summary of what you see and what peptide categories would be most relevant."
}

Rules:
- Be encouraging and positive
- Never diagnose medical conditions
- Only include categories where you have genuine visual evidence
- If the photo is unclear or not of a person, return: {"error": "Could not analyze photo. Please take a clear, well-lit photo."}
- confidence must be "high", "medium", or "low"
- recommendedCategories should be ordered by relevance`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
      },
    });
  }

  if (!ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    let body = await req.json();
    // Handle double-stringified body
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
    const { imageBase64, mediaType } = body;

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType || "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                type: "text",
                text: "Analyze this person's photo and recommend peptide categories based on what you observe. Be respectful and positive.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(JSON.stringify({ error: "Analysis failed. Please try again." }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "Could not parse analysis" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: "Something went wrong. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
