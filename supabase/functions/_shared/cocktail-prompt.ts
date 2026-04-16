import { Ingredient } from "./types.ts";

export function buildCocktailPrompt(ingredients: Ingredient[]): string {
  const list = ingredients
    .map((i) => `- ${i.name} (${i.quantity}, ${i.volume})`)
    .join("\n");

  return `Given ONLY these available ingredients:

${list}

List every classic or well-known cocktail that can be made using ONLY the ingredients above. Do NOT include cocktails that require any ingredient not on this list. Every ingredient in the recipe must be available above.

For each cocktail provide: a short punchy description (1-2 sentences), the ingredient list with quantities in oz, the bartending gear required, and step-by-step instructions.

Respond in this exact JSON format and nothing else:
{
  "cocktails": [
    {
      "name": "Cocktail Name",
      "description": "Short punchy tagline for the cocktail.",
      "ingredients": [
        { "name": "lime juice, freshly squeezed", "quantity": "0.75 oz" },
        { "name": "simple syrup", "quantity": "0.5 oz" }
      ],
      "gear": [
        "cocktail shaker",
        "strainer",
        "chilled coupe glass"
      ],
      "steps": [
        "Combine all ingredients in a cocktail shaker with ice.",
        "Shake vigorously for 15 seconds.",
        "Double-strain into a chilled coupe glass.",
        "Garnish with a lime wheel."
      ]
    }
  ]
}

Rules for ingredients: quantities must be in oz (decimal notation, e.g. "1.5 oz", "0.75 oz"). For non-liquid ingredients (sugar, salt, garnishes), use natural units (e.g. "1 tsp", "2 dashes", "1 wedge").
Rules for steps: plain sentences with no numbering prefix — the UI adds numbering. Be specific and clear.

If no cocktails can be made with only these ingredients, return:
{ "cocktails": [] }`;
}
