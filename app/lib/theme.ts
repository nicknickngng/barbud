import { Platform, StyleSheet } from "react-native";

// ─── Colors ──────────────────────────────────────────────
export const colors = {
  // Backgrounds
  obsidian: "#121212",
  charcoal: "#1E1E1E",
  charcoalLight: "#2A2A2A",

  // Text
  parchment: "#F5F5DC",
  parchmentMuted: "rgba(245, 245, 220, 0.6)",
  parchmentFaint: "rgba(245, 245, 220, 0.15)",

  // Accents
  gold: "#B0B5C8",
  goldDim: "rgba(176, 181, 200, 0.3)",
  goldFaint: "rgba(176, 181, 200, 0.12)",

  // Status
  error: "#A0522D", // sienna
  errorBg: "rgba(160, 82, 45, 0.15)",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.7)",
};

// ─── Typography ──────────────────────────────────────────
// Heading: Cormorant Garamond (elegant serif)
// Body: Tenor Sans (clean sans-serif with gallery-like spacing)
export const fonts = {
  heading: "CormorantGaramond_700Bold",
  headingSemiBold: "CormorantGaramond_600SemiBold",
  headingRegular: "CormorantGaramond_400Regular",
  body: "TenorSans_400Regular",
};

// Tenor Sans gets wide letter-spacing for that "gallery" feel
export const letterSpacing = {
  heading: 1.5,
  label: 2,
  subtitle: 3,
  button: 2,
  gallery: 1.6, // 0.1em at ~16px
};

// ─── Spacing ─────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  containerPadding: 32,
  containerTop: 72,
  containerBottom: 48,
  section: 28,
};

// ─── Borders ─────────────────────────────────────────────
export const borders = {
  hairline: StyleSheet.hairlineWidth,
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
  },
};

// ─── Shadows ─────────────────────────────────────────────
export const shadows = {
  warm: {
    shadowColor: "#8A8FA0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  soft: {
    shadowColor: "#8A8FA0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
};

// ─── Frosted glass (web-only backdrop blur) ──────────────
export const frostedGlass = Platform.select({
  web: {
    backgroundColor: "rgba(30, 30, 30, 0.85)",
    // @ts-ignore — web-only CSS property
    backdropFilter: "blur(12px)",
    // @ts-ignore
    WebkitBackdropFilter: "blur(12px)",
  },
  default: {
    backgroundColor: "rgba(18, 18, 18, 0.95)",
  },
});
