interface Ingredient {
  name: string;
  quantity: string;
  volume: string;
}

export function buildCocktailPrompt(ingredients: Ingredient[]): string {
  const list = ingredients
    .map((i) => `- ${i.name} (${i.quantity}, ${i.volume})`)
    .join("\n");

  return `Given ONLY these available ingredients:

${list}

List every classic or well-known cocktail that can be made using ONLY the ingredients above. Do NOT include cocktails that require any ingredient not on this list. Every ingredient in the recipe must be available above.

For each cocktail, list the recipe with specific volumes.

Respond in this exact JSON format and nothing else:
{
  "cocktails": [
    {
      "name": "Cocktail Name",
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
