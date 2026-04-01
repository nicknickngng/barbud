export function detectMimeType(base64: string): string {
  const header = base64.slice(0, 24);
  if (header.startsWith("/9j/")) return "image/jpeg";
  if (header.startsWith("iVBOR")) return "image/png";
  if (header.startsWith("R0lGO")) return "image/gif";
  if (header.startsWith("UklGR")) return "image/webp";
  return "image/jpeg";
}
