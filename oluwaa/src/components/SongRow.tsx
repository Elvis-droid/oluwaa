import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Song } from "../types";
import { colors, radius, type } from "../theme/colors";
import { EqualizerBars } from "./EqualizerBars";

type Props = {
  song: Song;
  index: number;
  active: boolean;
  playing: boolean;
  onPress: () => void;
  onOverflow: () => void;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

export function SongRow({ song, index, active, playing, onPress, onOverflow }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        active && styles.rowActive,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={styles.indexSlot}>
        {active ? (
          <EqualizerBars playing={playing} />
        ) : (
          <Text style={styles.indexText}>{index + 1}</Text>
        )}
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={1} style={[styles.title, active && styles.titleActive]}>
          {song.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {song.artist}
          {song.album ? ` · ${song.album}` : ""}
        </Text>
      </View>

      <Text style={styles.duration}>{formatDuration(song.duration)}</Text>

      <Pressable onPress={onOverflow} hitSlop={10} style={styles.overflowBtn}>
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: colors.bgCard },
  rowPressed: { opacity: 0.7 },
  indexSlot: { width: 24, alignItems: "center" },
  indexText: { fontFamily: type.body, color: colors.textMuted, fontSize: 13 },
  meta: { flex: 1, marginLeft: 12, marginRight: 8 },
  title: {
    fontFamily: type.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
  },
  titleActive: { color: colors.brandBright },
  artist: {
    fontFamily: type.body,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  duration: {
    fontFamily: type.body,
    color: colors.textMuted,
    fontSize: 12,
    marginRight: 6,
  },
  overflowBtn: { padding: 4 },
});
