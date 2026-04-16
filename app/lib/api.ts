const API_BASE =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

// Supabase uses /functions/v1/ prefix, Express uses /api/
const isSupabase = API_BASE.includes("supabase");
const analyzePath = isSupabase ? "/functions/v1/analyze" : "/api/analyze";
const recommendPath = isSupabase
  ? "/functions/v1/recommend"
  : "/api/recommend";
const verifyPasswordPath = isSupabase
  ? "/functions/v1/verify-password"
  : "/api/verify-password";
const instructionsPath = isSupabase
  ? "/functions/v1/instructions"
  : "/api/instructions";

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
    // Surface detailed error from Supabase or Edge Function
    const msg =
      data.error ||
      data.message ||
      data.msg ||
      JSON.stringify(data) ||
      `HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

export interface Cocktail {
  name: string;
  description?: string;
  recipe: string[];
}

export interface RecommendResponse {
  cocktails: Cocktail[];
  model: string;
}

export async function recommendCocktails(
  ingredients: Ingredient[],
  model: ModelType
): Promise<RecommendResponse> {
  const response = await fetch(`${API_BASE}${recommendPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients, model }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ||
      data.message ||
      data.msg ||
      JSON.stringify(data) ||
      `HTTP ${response.status}`;
    throw new Error(msg);
  }

  return data;
}

export interface InstructionsResponse {
  ingredients: string[];
  tools: string[];
  steps: string[];
}

export async function getInstructions(
  cocktailName: string,
  recipe: string[]
): Promise<InstructionsResponse> {
  const response = await fetch(`${API_BASE}${instructionsPath}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cocktailName, recipe }),
  });

  const data = await response.json();

  if (!response.ok) {
    const msg =
      data.error ||
      data.message ||
      data.msg ||
      JSON.stringify(data) ||
      `HTTP ${response.status}`;
    throw new Error(msg);
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
