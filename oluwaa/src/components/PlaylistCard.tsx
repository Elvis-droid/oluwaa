import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, type } from "../theme/colors";

type Props = {
  title: string;
  count: number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  onPress: () => void;
  onPlay: () => void;
};

export function PlaylistCard({ title, count, icon, iconColor, onPress, onPlay }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <View style={[styles.cover, { backgroundColor: iconColor + "22" }]}>
        <Ionicons name={icon} size={26} color={iconColor} />
      </View>
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text style={styles.count}>{count} songs</Text>
      </View>
      <Pressable onPress={onPlay} hitSlop={10} style={styles.playBtn}>
        <Ionicons name="play" size={16} color={colors.bg} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    padding: 10,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: { flex: 1, marginLeft: 12 },
  title: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 15 },
  count: { fontFamily: type.body, color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.brandBright,
    alignItems: "center",
    justifyContent: "center",
  },
});
