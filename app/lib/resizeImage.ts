import { Platform } from "react-native";

const MAX_DIMENSION = 1536; // Max width or height

/**
 * Resize an image on web to keep base64 payloads reasonable.
 * On native, expo-image-picker handles this, so we pass through.
 */
export async function resizeImageIfNeeded(
  uri: string,
  base64: string,
  mimeType: string
): Promise<{ base64: string; mimeType: string }> {
  if (Platform.OS !== "web") {
    return { base64, mimeType };
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Skip resize if already small enough
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
        resolve({ base64, mimeType });
        return;
      }

      // Scale down proportionally
      if (width > height) {
        height = Math.round((height * MAX_DIMENSION) / width);
        width = MAX_DIMENSION;
      } else {
        width = Math.round((width * MAX_DIMENSION) / height);
        height = MAX_DIMENSION;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve({ base64, mimeType });
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Always output as JPEG for smaller size
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
      const resizedBase64 = dataUrl.split(",")[1];
      resolve({ base64: resizedBase64, mimeType: "image/jpeg" });
    };
    img.onerror = () => resolve({ base64, mimeType }); // fallback to original
    img.src = uri;
  });
}
