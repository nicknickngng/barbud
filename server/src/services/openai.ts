import OpenAI from "openai";
import { ImageInput } from "./claude.js";
import { buildPrompt } from "./prompt.js";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export async function analyzeWithOpenAI(
  images: ImageInput[]
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const content: OpenAI.ChatCompletionContentPart[] = images.map((img) => ({
    type: "image_url" as const,
    image_url: { url: `data:${img.mimeType};base64,${img.base64}` },
  }));

  content.push({ type: "text", text: buildPrompt(images.length) });

  const response = await getClient().chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1024,
    messages: [{ role: "user", content }],
  });

  return response.choices[0]?.message?.content ?? "No response returned.";
}
