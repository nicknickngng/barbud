import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";
import { buildInstructionsPrompt } from "../services/instructions-prompt.js";

const router = Router();

let anthropicClient: Anthropic | null = null;

router.post("/", async (req: Request, res: Response) => {
  const { cocktailName, recipe } = req.body;

  if (!cocktailName || typeof cocktailName !== "string") {
    res.status(400).json({ error: "Missing cocktailName" });
    return;
  }

  if (!Array.isArray(recipe) || recipe.length === 0) {
    res.status(400).json({ error: "Missing or empty recipe array" });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "ANTHROPIC_API_KEY is not configured" });
    return;
  }

  try {
    if (!anthropicClient) anthropicClient = new Anthropic();

    const prompt = buildInstructionsPrompt(cocktailName, recipe);
    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const block = response.content.find((b) => b.type === "text");
    const raw = block ? block.text : "";

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: "Failed to parse instructions from model" });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    res.json({
      ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients : [],
      tools: Array.isArray(parsed.tools) ? parsed.tools : [],
      steps: Array.isArray(parsed.steps) ? parsed.steps : [],
    });
  } catch (err: any) {
    console.error("Instructions error:", err);
    res.status(500).json({ error: err.message || "Instructions failed" });
  }
});

export default router;
