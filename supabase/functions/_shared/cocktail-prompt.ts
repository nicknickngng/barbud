import { Ingredient } from "./types.ts";

export function buildCocktailPrompt(ingredients: Ingredient[]): string {
  const list = ingredients
    .map((i) => `- ${i.name} (${i.quantity}, ${i.volume})`)
    .join("\n");

  return `Given ONLY these available ingredients:

${list}

List every classic or well-known cocktail that can be made using ONLY the ingredients above. Do NOT include cocktails that require any ingredient not on this list. Every ingredient in the recipe must be available above.

For each cocktail, list the recipe with specific volumes. Also include a short 1-2 sentence description — a punchy tagline capturing the drink's character (e.g. "The classic tequila cocktail. Refreshing, citrusy, tried-and-true.").

Respond in this exact JSON format and nothing else:
{
  "cocktails": [
    {
      "name": "Cocktail Name",
      "description": "Short punchy tagline for the cocktail.",
      "recipe": [
        "2 oz ingredient",
        "1 oz ingredient",
        "Dash of ingredient"
      ]
    }
  ]
}

If no cocktails can be made with only these ingredients, return:
{ "cocktails": [] }`;
}
