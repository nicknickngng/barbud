import { GoogleGenerativeAI, GenerativeModel, Part } from "@google/generative-ai";
import { ImageInput } from "./claude.js";
import { buildPrompt } from "./prompt.js";

let model: GenerativeModel | null = null;

function getModel(): GenerativeModel {
  if (!model) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }
  return model;
}

export async function analyzeWithGemini(
  images: ImageInput[]
): Promise<string> {
  if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("GOOGLE_AI_API_KEY is not configured");
  }

  const parts: Part[] = images.map((img) => ({
    inlineData: { mimeType: img.mimeType, data: img.base64 },
  }));

  parts.push({ text: buildPrompt(images.length) });

  const result = await getModel().generateContent(parts);
  return result.response.text();
}
