import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from "react-native-track-player";

import { ScreenBackground } from "../components/ScreenBackground";
import { SongRow } from "../components/SongRow";
import { SongActionSheet } from "../components/SongActionSheet";
import { scanDeviceAudio, confirmAndDeleteSong } from "../services/deviceLibrary";
import { getFavoriteIds, toggleFavorite, getPlaylists, addSongToPlaylist } from "../services/appState";
import { loadQueue, playNext } from "../services/TrackPlayerService";
import { Playlist, Song } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

export function SearchScreen() {
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();
  const playback = usePlaybackState();
  const isPlaying = playback.state === State.Playing;

  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [actionSheetSong, setActionSheetSong] = useState<Song | null>(null);

  useEffect(() => {
    (async () => {
      const [all, favs, pls] = await Promise.all([
        scanDeviceAudio(),
        getFavoriteIds(),
        getPlaylists(),
      ]);
      setSongs(all);
      setFavoriteIds(favs);
      setPlaylists(pls);
    })();
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return songs.filter((s) => s.title.toLowerCase().includes(q));
  }, [songs, query]);

  const playAt = useCallback(
    async (index: number) => {
      await loadQueue(results, index);
      await TrackPlayer.play();
      navigation.navigate("NowPlaying" as never);
    },
    [results, navigation]
  );

  const handlePlayNext = useCallback(async () => {
    if (!actionSheetSong) return;
    await playNext(actionSheetSong);
    setActionSheetSong(null);
  }, [actionSheetSong]);

  const handleDelete = useCallback(async () => {
    if (!actionSheetSong) return;
    const song = actionSheetSong;
    setActionSheetSong(null);
    const deleted = await confirmAndDeleteSong(song);
    if (deleted) {
      setSongs((prev) => prev.filter((s) => s.id !== song.id));
    }
  }, [actionSheetSong]);

  return (
    <ScreenBackground>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={17} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search your songs"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={10}>
              <Ionicons name="close-circle" size={17} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            index={index}
            active={item.id === activeTrack?.id}
            playing={isPlaying}
            onPress={() => playAt(index)}
            onOverflow={() => setActionSheetSong(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              {query.trim() ? "No matches" : "Type to search your library"}
            </Text>
          </View>
        }
      />

      <SongActionSheet
        visible={!!actionSheetSong}
        song={actionSheetSong}
        isFavorite={!!actionSheetSong && favoriteIds.includes(actionSheetSong.id)}
        playlists={playlists}
        onClose={() => setActionSheetSong(null)}
        onToggleFavorite={async () => {
          if (!actionSheetSong) return;
          setFavoriteIds(await toggleFavorite(actionSheetSong.id));
        }}
        onAddToPlaylist={async (playlistId) => {
          if (!actionSheetSong) return;
          setPlaylists(await addSongToPlaylist(playlistId, actionSheetSong.id));
          setActionSheetSong(null);
        }}
        onCreatePlaylist={() => {}}
        onPlayNext={handlePlayNext}
        onDelete={handleDelete}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: spacing(12),
    paddingBottom: spacing(3),
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.bgCard,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  input: { flex: 1, fontFamily: type.body, color: colors.textPrimary, fontSize: 14 },
  list: { flex: 1 },
  listContent: { paddingBottom: 40 },
  empty: { paddingHorizontal: 24, marginTop: spacing(10) },
  emptyText: { fontFamily: type.body, color: colors.textSecondary, fontSize: 14 },
});
