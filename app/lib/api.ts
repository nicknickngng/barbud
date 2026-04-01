// Change this to your machine's LAN IP when testing on a physical device
const API_BASE = "http://localhost:3000";

export type ModelType = "claude" | "gpt4o" | "gemini";

export interface ImageInput {
  base64: string;
  mimeType: string;
}

export interface Ingredient {
  name: string;
  quantity: string;
  volume: string;
}

export interface AnalyzeResponse {
  descriptions: string[];
  ingredients: Ingredient[];
  model: string;
}

export async function analyzeImages(
  images: ImageInput[],
  model: ModelType
): Promise<AnalyzeResponse> {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images, model }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}
