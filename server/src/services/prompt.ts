export function buildPrompt(imageCount: number): string {
  const volumeInstructions = `For each ingredient, estimate the total fluid volume available using standard assumptions:
- Standard wine bottle = 750ml
- Standard liquor bottle (750ml), estimate how full it appears
- A lemon yields ~30ml (1 oz) juice
- A lime yields ~22ml (0.75 oz) juice
- An orange yields ~60ml (2 oz) juice
- A can of soda/tonic = 355ml (12 oz)
- A small bottle of bitters = ~120ml (4 oz)
Express the volume as "Approx. Xml / Yoz" to indicate it's an estimate.`;

  if (imageCount === 1) {
    return `Look at the provided image and do two things:

1. Write a 2-3 sentence description of what you see, prefixed with "Image #1: ".
2. List every identifiable drink ingredient or mixer you can see, with an estimated quantity and estimated fluid volume.

${volumeInstructions}

Respond in this exact JSON format and nothing else:
{
  "descriptions": ["Image #1: Your 2-3 sentence description here."],
  "ingredients": [
    { "name": "ingredient name", "quantity": "estimated quantity", "volume": "Approx. Xml / Yoz" }
  ]
}`;
  }

  const imageRefs = Array.from(
    { length: imageCount },
    (_, i) => `Image #${i + 1}`
  ).join(", ");

  return `You are looking at ${imageCount} images (${imageRefs}). For each image:

1. Write a separate 2-3 sentence description of what you see, prefixed with the image number (e.g. "Image #1: ...").
2. Across ALL images, compile a single combined list of every identifiable drink ingredient or mixer, with an estimated quantity and estimated fluid volume. If the same ingredient appears in multiple images, combine the quantities.

${volumeInstructions}

Respond in this exact JSON format and nothing else:
{
  "descriptions": [
    "Image #1: Description of first image.",
    "Image #2: Description of second image."
  ],
  "ingredients": [
    { "name": "ingredient name", "quantity": "estimated quantity", "volume": "Approx. Xml / Yoz" }
  ]
}`;
}
