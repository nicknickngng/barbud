import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildCocktailPrompt } from "../services/cocktail-prompt.js";

const router = Router();

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

async function recommendWithClaude(prompt: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY)
    throw new Error("ANTHROPIC_API_KEY is not configured");
  if (!anthropicClient) anthropicClient = new Anthropic();
  const response = await anthropicClient.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  const block = response.content.find((b) => b.type === "text");
  return block ? block.text : "No response returned.";
}

async function recommendWithOpenAI(prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY)
    throw new Error("OPENAI_API_KEY is not configured");
  if (!openaiClient) openaiClient = new OpenAI();
  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  return response.choices[0]?.message?.content ?? "No response returned.";
}

async function recommendWithGemini(prompt: string): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY)
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

const VALID_MODELS = ["claude", "gpt4o", "gemini"] as const;
type ModelType = (typeof VALID_MODELS)[number];

const recommenders: Record<ModelType, (prompt: string) => Promise<string>> = {
  claude: recommendWithClaude,
  gpt4o: recommendWithOpenAI,
  gemini: recommendWithGemini,
};

router.post("/", async (req: Request, res: Response) => {
  const { ingredients, model } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    res.status(400).json({ error: "Missing or empty ingredients array" });
    return;
  }

  if (!VALID_MODELS.includes(model)) {
    res
      .status(400)
      .json({ error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}` });
    return;
  }

  try {
    const prompt = buildCocktailPrompt(ingredients);
    const raw = await recommenders[model as ModelType](prompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.json({ cocktails: [], model });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const cocktails = Array.isArray(parsed.cocktails) ? parsed.cocktails : [];

    res.json({ cocktails, model });
  } catch (err: any) {
    console.error("Recommend error:", err);
    res.status(500).json({ error: err.message || "Recommendation failed" });
  }
});

export default router;
