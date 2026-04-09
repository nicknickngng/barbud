export function buildInstructionsPrompt(cocktailName: string, recipe: string[]): string {
  const recipeList = recipe.map((line: string) => `- ${line}`).join("\n");

  return `You are a bartender explaining how to make a cocktail.

Cocktail: ${cocktailName}
Recipe:
${recipeList}

Provide detailed instructions for making this cocktail. Respond in this exact JSON format and nothing else:
{
  "ingredients": [
    "2 oz Tequila",
    "1 oz Triple Sec"
  ],
  "tools": [
    "Cocktail shaker",
    "Rocks glass",
    "Strainer"
  ],
  "steps": [
    "Fill a cocktail shaker with ice.",
    "Add tequila, triple sec, and lime juice.",
    "Shake vigorously for 15 seconds.",
    "Strain into a rocks glass over fresh ice.",
    "Garnish with a lime wedge and salt rim."
  ]
}

The "ingredients" array should list each ingredient with its exact measurement.
The "tools" array should list all equipment needed (glassware, shaker, strainer, muddler, etc.).
The "steps" array should be clear numbered instructions — each step as a single sentence starting with an action verb.`;
}
