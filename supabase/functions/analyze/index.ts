import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { detectMimeType } from "../_shared/detect-mime.ts";
import { buildPrompt } from "../_shared/prompt.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.81.0";
import OpenAI from "npm:openai@^6.33.0";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@^0.24.1";

// ─── Types ───────────────────────────────────────────────
interface ImageInput {
  base64: string;
  mimeType: string;
}

interface Ingredient {
  name: string;
  quantity: string;
  volume: string;
}

// ─── VLM Services ────────────────────────────────────────

async function analyzeWithClaude(images: ImageInput[]): Promise<string> {
  const client = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY") });
  const content: any[] = [];

  for (const img of images) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: img.mimeType,
        data: img.base64,
      },
    });
  }
  content.push({ type: "text", text: buildPrompt(images.length) });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  const textBlock = response.content.find(
    (block: any) => block.type === "text"
  );
  return textBlock ? textBlock.text : "No response returned.";
}

async function analyzeWithOpenAI(images: ImageInput[]): Promise<string> {
  const client = new OpenAI({ apiKey: Deno.env.get("OPENAI_API_KEY") });
  const content: any[] = images.map((img) => ({
    type: "image_url",
    image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
  }));
  content.push({ type: "text", text: buildPrompt(images.length) });

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 4096,
    messages: [{ role: "user", content }],
  });

  return response.choices[0]?.message?.content ?? "No response returned.";
}

async function analyzeWithGemini(images: ImageInput[]): Promise<string> {
  const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_AI_API_KEY")!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const parts: any[] = images.map((img) => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 },
  }));
  parts.push({ text: buildPrompt(images.length) });

  const result = await model.generateContent(parts);
  return result.response.text();
}

// ─── Analyzers map ───────────────────────────────────────
const VALID_MODELS = ["claude", "gpt4o", "gemini"] as const;
type ModelType = (typeof VALID_MODELS)[number];

const analyzers: Record<ModelType, (images: ImageInput[]) => Promise<string>> =
  {
    claude: analyzeWithClaude,
    gpt4o: analyzeWithOpenAI,
    gemini: analyzeWithGemini,
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
    const { images, model } = await req.json();

    if (!Array.isArray(images) || images.length === 0) {
      return json({ error: "Missing or empty images array" }, 400);
    }

    for (const img of images) {
      if (!img.base64 || !img.mimeType) {
        return json(
          { error: "Each image must have base64 and mimeType" },
          400
        );
      }
    }

    if (!VALID_MODELS.includes(model)) {
      return json(
        { error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}` },
        400
      );
    }

    // Fix mime types by detecting from actual image data
    const fixedImages: ImageInput[] = images.map((img: ImageInput) => ({
      base64: img.base64,
      mimeType: detectMimeType(img.base64),
    }));

    const raw = await analyzers[model as ModelType](fixedImages);

    // Extract JSON from the response (handle markdown code fences)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return json({ descriptions: [raw], ingredients: [], model });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    let descriptions: string[];
    if (Array.isArray(parsed.descriptions)) {
      descriptions = parsed.descriptions;
    } else if (parsed.description) {
      descriptions = [parsed.description];
    } else {
      descriptions = [];
    }

    const ingredients: Ingredient[] = Array.isArray(parsed.ingredients)
      ? parsed.ingredients
      : [];

    return json({ descriptions, ingredients, model });
  } catch (err: any) {
    console.error("Analyze error:", err);
    return json({ error: err.message || "VLM request failed" }, 500);
  }
});
