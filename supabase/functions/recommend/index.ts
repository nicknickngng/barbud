import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { buildCocktailPrompt } from "../_shared/cocktail-prompt.ts";
import type { Ingredient } from "../_shared/types.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.81.0";
import OpenAI from "npm:openai@^6.33.0";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";

// ─── LLM Services ────────────────────────────────────────

async function recommendWithClaude(prompt: string): Promise<string> {
  const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = response.content.find((b: any) => b.type === "text");
  return textBlock ? textBlock.text : "No response returned.";
}

async function recommendWithOpenAI(prompt: string): Promise<string> {
  const client = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content ?? "No response returned.";
}

async function recommendWithGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_API_KEY")!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── Models map ─────────────────────────────────────────
const VALID_MODELS = ["claude", "gpt4o", "gemini"] as const;
type ModelType = (typeof VALID_MODELS)[number];

const recommenders: Record<ModelType, (prompt: string) => Promise<string>> = {
  claude: recommendWithClaude,
  gpt4o: recommendWithOpenAI,
  gemini: recommendWithGemini,
};

// ─── Handler ─────────────────────────────────────────────
Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { ingredients, model } = await req.json();

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return json({ error: "Missing or empty ingredients array" }, 400);
    }

    if (!VALID_MODELS.includes(model)) {
      return json(
        { error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}` },
        400
      );
    }

    const prompt = buildCocktailPrompt(ingredients as Ingredient[]);
    const raw = await recommenders[model as ModelType](prompt);

    // Extract JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ cocktails: [], model });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const cocktails = Array.isArray(parsed.cocktails) ? parsed.cocktails : [];

    return json({ cocktails, model });
  } catch (err: any) {
    console.error("Recommend error:", err);
    return json({ error: err.message || "Recommendation request failed" }, 500);
  }
});
