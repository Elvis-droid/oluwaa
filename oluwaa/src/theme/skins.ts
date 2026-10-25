import { colors } from "./colors";
import { SkinId } from "../types";

export type Skin = {
  id: SkinId;
  label: string;
  gradient: string[];
  accent: string;
  background: any; // require()'d image, or null to use the default wave art
};

export const skins: Skin[] = [
  {
    id: "default",
    label: "Wave",
    gradient: [colors.waveAmber, colors.waveCoral, colors.waveViolet, colors.waveBlue],
    accent: colors.brandBright,
    background: require("../../assets/wave-background.jpg"),
  },
  {
    id: "floral",
    label: "Floral",
    gradient: ["#F2A6C6", "#E8748C", "#C65C9C", "#8C5AA8"],
    accent: "#E8748C",
    background: require("../../assets/wave-background.jpg"),
  },
  {
    id: "romantic",
    label: "Romantic",
    gradient: ["#F2C6D6", "#E88C9C", "#C65C6C", "#8C3C4C"],
    accent: "#E88C9C",
    background: require("../../assets/wave-background.jpg"),
  },
  {
    id: "smokePaint",
    label: "Smoke & Paint",
    gradient: ["#9AA0AC", "#6C7280", "#4A4E5C", "#2A2C36"],
    accent: "#9AA0AC",
    background: require("../../assets/wave-background.jpg"),
  },
  {
    id: "nature",
    label: "Nature",
    gradient: ["#B7D89A", "#7CB06A", "#4E8C52", "#2E6E42"],
    accent: colors.brandBright,
    background: require("../../assets/wave-background.jpg"),
  },
];

export function getSkinById(id: SkinId): Skin {
  return skins.find((s) => s.id === id) ?? skins[0];
}

/**
 * All five skins reuse wave-background.jpg as the base photo (that's the
 * only art asset provided) and differentiate purely through the gradient
 * + accent color overlay. Swap in per-skin art here once dedicated skin
 * artwork exists.
 */
