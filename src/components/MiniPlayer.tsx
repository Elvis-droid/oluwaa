import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, type } from "../theme/colors";

type Props = {
  title: string;
  artist: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPress: () => void;
  onOpenQueue: () => void;
  onClose: () => void;
};

export function MiniPlayer({
  title,
  artist,
  isPlaying,
  onTogglePlay,
  onPress,
  onOpenQueue,
  onClose,
}: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <Image source={require("../../assets/wave-background.jpg")} style={styles.art} />
      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {artist}
        </Text>
      </View>

      <Pressable hitSlop={8} onPress={onOpenQueue} style={styles.iconBtn}>
        <Ionicons name="list" size={19} color={colors.textSecondary} />
      </Pressable>

      <Pressable hitSlop={8} onPress={onTogglePlay} style={styles.playBtn}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={18} color={colors.bg} />
      </Pressable>

      <Pressable hitSlop={8} onPress={onClose} style={styles.iconBtn}>
        <Ionicons name="close" size={19} color={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.bgCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  art: { width: 40, height: 40, borderRadius: radius.sm },
  meta: { flex: 1, marginLeft: 10, marginRight: 4 },
  title: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 13 },
  artist: { fontFamily: type.body, color: colors.textSecondary, fontSize: 12, marginTop: 1 },
  iconBtn: { padding: 6 },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    backgroundColor: colors.brandBright,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
  },
});
