import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { buildInstructionsPrompt } from "../_shared/instructions-prompt.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.81.0";

Deno.serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const json = (data: any, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  try {
    const { cocktailName, recipe } = await req.json();

    if (!cocktailName || typeof cocktailName !== "string") {
      return json({ error: "Missing cocktailName" }, 400);
    }

    if (!Array.isArray(recipe) || recipe.length === 0) {
      return json({ error: "Missing or empty recipe array" }, 400);
    }

    const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
    const prompt = buildInstructionsPrompt(cocktailName, recipe);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = response.content.find((b: any) => b.type === "text");
    const raw = textBlock ? textBlock.text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ error: "Failed to parse instructions from model" }, 500);
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return json({
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    });
  } catch (err: any) {
    console.error("Instructions error:", err);
    return json({ error: err.message || "Instructions request failed" }, 500);
  }
});
