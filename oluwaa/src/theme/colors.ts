/**
 * Oluwaa design tokens.
 *
 * Palette is pulled directly from the two brand assets:
 *  - assets/icon.png            -> the "leaf" greens (brand / primary actions)
 *  - assets/wave-background.jpg -> the near-black base + warm/violet particle
 *                                   glow used for the Now Playing "signature"
 *                                   waveform and accents.
 */
export const colors = {
  // Base
  bg: "#0B0B12", // near-black, matches the wave art's background
  bgElevated: "#15151F",
  bgCard: "#1C1C29",
  hairline: "#2A2A38",

  // Brand (from app icon)
  brand: "#2E7D4F",
  brandBright: "#4CAF6D",

  // Wave accent gradient (from wave-background.jpg particle trail)
  waveAmber: "#F2A65A",
  waveCoral: "#E86A5C",
  waveViolet: "#8C6FE0",
  waveBlue: "#5B8DEF",

  // Text
  textPrimary: "#F5F4F7",
  textSecondary: "#A6A5B4",
  textMuted: "#6B6A78",

  // Utility
  danger: "#E5484D",
  overlayScrim: "rgba(6,6,10,0.72)",
} as const;

export const gradients = {
  wave: [colors.waveAmber, colors.waveCoral, colors.waveViolet, colors.waveBlue],
  scrim: ["transparent", colors.overlayScrim, colors.bg],
};

export const type = {
  display: "Sora_600SemiBold",
  displayBold: "Sora_700Bold",
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const spacing = (n: number) => n * 4;
