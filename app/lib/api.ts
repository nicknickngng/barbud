const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Supabase uses /functions/v1/ prefix, Express uses /api/
const isSupabase = API_BASE.includes("supabase");
const analyzePath = isSupabase ? "/functions/v1/analyze" : "/api/analyze";
const verifyPasswordPath = isSupabase
  ? "/functions/v1/verify-password"
  : "/api/verify-password";

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
  const response = await fetch(`${API_BASE}${analyzePath}`, {
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

export async function verifyPassword(password: string): Promise<boolean> {
  const response = await fetch(`${API_BASE}${verifyPasswordPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = await response.json();
  return data.success === true;
}
