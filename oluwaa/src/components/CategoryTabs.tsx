import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, type } from "../theme/colors";

export type CategoryKey = "songs" | "playlists" | "albums" | "artists";

const TABS: { key: CategoryKey; label: string }[] = [
  { key: "songs", label: "All Songs" },
  { key: "playlists", label: "Playlist" },
  { key: "albums", label: "Album" },
  { key: "artists", label: "Artist" },
];

type Props = {
  active: CategoryKey;
  onChange: (key: CategoryKey) => void;
};

export function CategoryTabs({ active, onChange }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={styles.tab}>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { paddingHorizontal: 20, gap: 22, alignItems: "center" },
  tab: { paddingBottom: 2, alignItems: "center" },
  label: { fontFamily: type.bodySemiBold, color: colors.textSecondary, fontSize: 14 },
  labelActive: { color: colors.brandBright },
  underline: {
    height: 2,
    width: "100%",
    backgroundColor: colors.brandBright,
    borderRadius: 2,
    marginTop: 4,
  },
});
