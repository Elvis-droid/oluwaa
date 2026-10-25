import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { type } from "../theme/colors";

export type CardTheme = { id: string; bg: string; fg: string };

/** Background + text colour pairs the user can pick from. The first is
 * the red-with-black-text look of the reference card. */
export const CARD_THEMES: CardTheme[] = [
  { id: "red", bg: "#EB1E1E", fg: "#000000" },
  { id: "amber", bg: "#F2A65A", fg: "#000000" },
  { id: "green", bg: "#4CAF6D", fg: "#000000" },
  { id: "violet", bg: "#8C6FE0", fg: "#FFFFFF" },
  { id: "blue", bg: "#2F6FED", fg: "#FFFFFF" },
  { id: "cream", bg: "#F4EFE6", fg: "#111111" },
  { id: "black", bg: "#0B0B12", fg: "#FFFFFF" },
];

type Props = {
  width: number;
  theme: CardTheme;
  lyrics: string; // selected lines, joined with \n
  title: string;
  artist: string;
  photoUri: string | null;
};

/** Longer selections get a smaller font so the card never overflows. */
function fontSizeFor(text: string, width: number): number {
  const chars = text.replace(/\s+/g, " ").length;
  const base = chars < 50 ? 44 : chars < 90 ? 36 : chars < 150 ? 29 : chars < 230 ? 24 : 20;
  return Math.round((base * width) / 340);
}

/**
 * The shareable card: small thumbnail + song title + "Song · Artist" on
 * top, big bold lyrics below. `collapsable={false}` is required on
 * Android so react-native-view-shot can capture this view.
 */
export const LyricShareCard = React.forwardRef<View, Props>(function LyricShareCard(
  { width, theme, lyrics, title, artist, photoUri },
  ref
) {
  const size = fontSizeFor(lyrics, width);
  return (
    <View
      ref={ref}
      collapsable={false}
      style={[styles.card, { width, minHeight: width, backgroundColor: theme.bg }]}
    >
      <View style={styles.header}>
        <Image
          source={photoUri ? { uri: photoUri } : require("../../assets/wave-background.jpg")}
          style={styles.thumb}
        />
        <View style={styles.headerText}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.fg }]}>
            {title}
          </Text>
          <Text numberOfLines={1} style={[styles.subtitle, { color: theme.fg }]}>
            Song · {artist}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.lyrics,
          { color: theme.fg, fontSize: size, lineHeight: Math.round(size * 1.12) },
        ]}
      >
        {lyrics}
      </Text>

      <Text style={[styles.brand, { color: theme.fg }]}>Oluwaa</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: { borderRadius: 22, padding: 22, justifyContent: "space-between" },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  thumb: { width: 50, height: 50, borderRadius: 9, backgroundColor: "#00000022" },
  headerText: { flex: 1 },
  title: { fontFamily: type.displayBold, fontSize: 16 },
  subtitle: { fontFamily: type.bodyMedium, fontSize: 13, opacity: 0.75, marginTop: 2 },
  lyrics: { fontFamily: type.displayBold, letterSpacing: -1, marginTop: 26, marginBottom: 26 },
  brand: { fontFamily: type.bodySemiBold, fontSize: 11, opacity: 0.5, letterSpacing: 1.2 },
});
