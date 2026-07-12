import React from "react";
import { Modal, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Playlist, Song } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  visible: boolean;
  song: Song | null;
  isFavorite: boolean;
  playlists: Playlist[];
  onClose: () => void;
  onToggleFavorite: () => void;
  onAddToPlaylist: (playlistId: string) => void;
  onCreatePlaylist: () => void;
};

export function SongActionSheet({
  visible,
  song,
  isFavorite,
  playlists,
  onClose,
  onToggleFavorite,
  onAddToPlaylist,
  onCreatePlaylist,
}: Props) {
  if (!song) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text numberOfLines={1} style={styles.songTitle}>
            {song.title}
          </Text>

          <Pressable style={styles.actionRow} onPress={onToggleFavorite}>
            <Ionicons
              name={isFavorite ? "star" : "star-outline"}
              size={20}
              color={colors.brandBright}
            />
            <Text style={styles.actionLabel}>
              {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            </Text>
          </Pressable>

          <Text style={styles.sectionLabel}>Add to playlist</Text>
          <ScrollView style={styles.playlistList}>
            {playlists.length === 0 && (
              <Text style={styles.emptyPlaylists}>No playlists yet</Text>
            )}
            {playlists.map((p) => (
              <Pressable
                key={p.id}
                style={styles.actionRow}
                onPress={() => onAddToPlaylist(p.id)}
              >
                <Ionicons name="list" size={20} color={colors.textSecondary} />
                <Text style={styles.actionLabel}>{p.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable style={styles.actionRow} onPress={onCreatePlaylist}>
            <Ionicons name="add-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.actionLabel}>New playlist…</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: 20,
    paddingTop: spacing(5),
    paddingBottom: spacing(10),
    maxHeight: "70%",
  },
  songTitle: {
    fontFamily: type.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing(4),
  },
  sectionLabel: {
    fontFamily: type.bodySemiBold,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: spacing(3),
    marginBottom: spacing(1),
  },
  playlistList: { maxHeight: 180 },
  emptyPlaylists: {
    fontFamily: type.body,
    color: colors.textMuted,
    fontSize: 13,
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  actionLabel: { fontFamily: type.body, color: colors.textPrimary, fontSize: 14 },
});
