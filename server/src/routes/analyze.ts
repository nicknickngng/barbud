import { Router, Request, Response } from "express";
import { analyzeWithClaude, ImageInput } from "../services/claude.js";
import { analyzeWithOpenAI } from "../services/openai.js";
import { analyzeWithGemini } from "../services/gemini.js";

const router = Router();

// Detect actual image mime type from base64 magic bytes
function detectMimeType(base64: string): string {
  const header = base64.slice(0, 24);
  if (header.startsWith("/9j/")) return "image/jpeg";
  if (header.startsWith("iVBOR")) return "image/png";
  if (header.startsWith("R0lGO")) return "image/gif";
  if (header.startsWith("UklGR")) return "image/webp";
  return "image/jpeg"; // fallback
}

const VALID_MODELS = ["claude", "gpt4o", "gemini"] as const;
type ModelType = (typeof VALID_MODELS)[number];

const analyzers: Record<ModelType, (images: ImageInput[]) => Promise<string>> = {
  claude: analyzeWithClaude,
  gpt4o: analyzeWithOpenAI,
  gemini: analyzeWithGemini,
};

interface Ingredient {
  name: string;
  quantity: string;
}

router.post("/", async (req: Request, res: Response) => {
  const { images, model } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    res.status(400).json({ error: "Missing or empty images array" });
    return;
  }

  for (const img of images) {
    if (!img.base64 || !img.mimeType) {
      res.status(400).json({ error: "Each image must have base64 and mimeType" });
      return;
    }
  }

  if (!VALID_MODELS.includes(model)) {
    res.status(400).json({ error: `Invalid model. Must be one of: ${VALID_MODELS.join(", ")}` });
    return;
  }

  // Fix mime types by detecting from actual image data
  const fixedImages: ImageInput[] = images.map((img: ImageInput) => ({
    base64: img.base64,
    mimeType: detectMimeType(img.base64),
  }));

  try {
    const raw = await analyzers[model as ModelType](fixedImages);

    // Extract JSON from the response (handle markdown code fences)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.json({ descriptions: [raw], ingredients: [], model });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Support both old "description" string and new "descriptions" array
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

    res.json({ descriptions, ingredients, model });
  } catch (err: any) {
    console.error(`Error from ${model}:`, err);
    res.status(500).json({ error: err.message || "VLM request failed" });
  }
});

export default router;
