import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, type } from "../theme/colors";

type Props = {
  trackCount: number;
  onShufflePlay: () => void;
  onOpenSort: () => void;
};

export function ShuffleBar({ trackCount, onShufflePlay, onOpenSort }: Props) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onShufflePlay}
        style={({ pressed }) => [styles.shuffleBtn, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="shuffle" size={16} color={colors.bg} />
        <Text style={styles.shuffleLabel}>Shuffle Play</Text>
        <Text style={styles.count}>{trackCount}</Text>
      </Pressable>

      <Pressable onPress={onOpenSort} hitSlop={10} style={styles.sortBtn}>
        <Ionicons name="swap-vertical" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  shuffleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.brandBright,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  shuffleLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 13 },
  count: {
    fontFamily: type.bodySemiBold,
    color: colors.bg,
    fontSize: 12,
    backgroundColor: "rgba(0,0,0,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
  },
  sortBtn: { padding: 6 },
});
