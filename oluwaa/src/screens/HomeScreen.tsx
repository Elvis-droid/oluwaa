import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import TrackPlayer, { usePlaybackState, useActiveTrack, State } from "react-native-track-player";

import { ScreenBackground } from "../components/ScreenBackground";
import { SongRow } from "../components/SongRow";
import { MiniPlayer } from "../components/MiniPlayer";
import { SortDialogModal } from "../components/SortDialogModal";
import { ShuffleBar } from "../components/ShuffleBar";
import { CategoryTabs, CategoryKey } from "../components/CategoryTabs";
import { PlaylistCard } from "../components/PlaylistCard";
import { SongActionSheet } from "../components/SongActionSheet";
import { CreatePlaylistModal } from "../components/CreatePlaylistModal";

import {
  scanDeviceAudio,
  scanAlbums,
  ensureMediaPermission,
  confirmAndDeleteSong,
} from "../services/deviceLibrary";
import {
  getFavoriteIds,
  toggleFavorite,
  getPlaylists,
  createPlaylist,
  addSongToPlaylist,
  getSortPref,
  setSortPref,
} from "../services/appState";
import { sortSongs } from "../services/sort";
import { loadQueue, playNext } from "../services/TrackPlayerService";
import { Album, MusicStackParamList, Playlist, Song, SortPref } from "../types";
import { colors, type, spacing } from "../theme/colors";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MusicStackParamList>>();
  const activeTrack = useActiveTrack();
  const playback = usePlaybackState();
  const isPlaying = playback.state === State.Playing;

  const [permissionDenied, setPermissionDenied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState<CategoryKey>("songs");

  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [sortPref, setSortPrefState] = useState<SortPref>({ field: "date", direction: "newOld" });

  const [sortOpen, setSortOpen] = useState(false);
  const [actionSheetSong, setActionSheetSong] = useState<Song | null>(null);
  const [createPlaylistOpen, setCreatePlaylistOpen] = useState(false);

  const loadAll = useCallback(async () => {
    const granted = await ensureMediaPermission();
    if (!granted) {
      setPermissionDenied(true);
      return;
    }
    setPermissionDenied(false);

    const [scannedSongs, scannedAlbums, favs, pls, pref] = await Promise.all([
      scanDeviceAudio(),
      scanAlbums(),
      getFavoriteIds(),
      getPlaylists(),
      getSortPref(),
    ]);
    setSongs(scannedSongs);
    setAlbums(scannedAlbums);
    setFavoriteIds(favs);
    setPlaylists(pls);
    setSortPrefState(pref);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Re-check favorites/playlists whenever the screen regains focus (e.g.
  // coming back from Now Playing after favoriting a track there).
  useFocusEffect(
    useCallback(() => {
      (async () => {
        setFavoriteIds(await getFavoriteIds());
        setPlaylists(await getPlaylists());
      })();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  }, [loadAll]);

  const sortedSongs = useMemo(() => sortSongs(songs, sortPref), [songs, sortPref]);

  const playSongAt = useCallback(
    async (list: Song[], index: number) => {
      await loadQueue(list, index);
      await TrackPlayer.play();
      navigation.navigate("NowPlaying");
    },
    [navigation]
  );

  const shufflePlay = useCallback(async () => {
    if (sortedSongs.length === 0) return;
    const shuffled = [...sortedSongs].sort(() => Math.random() - 0.5);
    await loadQueue(shuffled, 0);
    await TrackPlayer.play();
    navigation.navigate("NowPlaying");
  }, [sortedSongs, navigation]);

  const toggleMiniPlayer = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  const closeMiniPlayer = useCallback(async () => {
    await TrackPlayer.stop();
    await TrackPlayer.reset();
  }, []);

  const handleToggleFavorite = useCallback(async () => {
    if (!actionSheetSong) return;
    const next = await toggleFavorite(actionSheetSong.id);
    setFavoriteIds(next);
  }, [actionSheetSong]);

  const handleAddToPlaylist = useCallback(
    async (playlistId: string) => {
      if (!actionSheetSong) return;
      const next = await addSongToPlaylist(playlistId, actionSheetSong.id);
      setPlaylists(next);
      setActionSheetSong(null);
    },
    [actionSheetSong]
  );

  const handleCreatePlaylist = useCallback(async (name: string) => {
    const next = await createPlaylist(name);
    setPlaylists(next);
    setCreatePlaylistOpen(false);
  }, []);

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

  const favoriteSongs = useMemo(
    () => songs.filter((s) => favoriteIds.includes(s.id)),
    [songs, favoriteIds]
  );

  if (permissionDenied) {
    return (
      <ScreenBackground>
        <View style={styles.permissionWrap}>
          <Ionicons name="musical-notes-outline" size={40} color={colors.textSecondary} />
          <Text style={styles.permissionTitle}>Access to your music is off</Text>
          <Text style={styles.permissionBody}>
            Oluwaa reads audio directly from your device's media library — nothing is
            copied or stored. Grant audio access to see your songs here.
          </Text>
          <Pressable style={styles.permissionBtn} onPress={loadAll}>
            <Text style={styles.permissionBtnLabel}>Grant access</Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>Live from your device</Text>
            <Text style={styles.headerTitle}>Oluwaa</Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate("Search")}
            hitSlop={12}
            style={styles.searchBtn}
          >
            <Ionicons name="search" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <CategoryTabs active={category} onChange={setCategory} />

      {/* Exactly one bounded flex region for whichever category is
          active. Previously each category's FlatList/View sat as its
          own top-level sibling next to the header, tabs, and MiniPlayer —
          valid in principle, but it meant Yoga had to re-measure the
          whole screen's column shape every time `category` swapped
          between a FlatList and a plain View. Wrapping them all in one
          stable `body` container removes that ambiguity entirely. */}
      <View style={styles.body}>
        {category === "songs" && (
          <>
            <View style={{ height: spacing(1) }} />
            <ShuffleBar
              trackCount={sortedSongs.length}
              onShufflePlay={shufflePlay}
              onOpenSort={() => setSortOpen(true)}
            />
            <FlatList
              style={styles.list}
              data={sortedSongs}
              keyExtractor={(s) => s.id}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.brandBright}
                />
              }
              renderItem={({ item, index }) => (
                <SongRow
                  song={item}
                  index={index}
                  active={item.id === activeTrack?.id}
                  playing={isPlaying}
                  onPress={() => playSongAt(sortedSongs, index)}
                  onOverflow={() => setActionSheetSong(item)}
                />
              )}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTitle}>No audio found</Text>
                  <Text style={styles.emptyBody}>
                    Nothing turned up in your device's media library yet. Pull down to
                    rescan after adding music.
                  </Text>
                </View>
              }
            />
          </>
        )}

        {category === "playlists" && (
          <FlatList
            style={styles.list}
            data={playlists}
            keyExtractor={(p) => p.id}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                <View style={styles.playlistHeaderRow}>
                  <Text style={styles.playlistHeaderTitle}>
                    Playlist({playlists.length + 2})
                  </Text>
                  <Pressable onPress={() => setCreatePlaylistOpen(true)} hitSlop={10}>
                    <Ionicons name="add" size={24} color={colors.brandBright} />
                  </Pressable>
                </View>
                <PlaylistCard
                  title="All"
                  count={songs.length}
                  icon="musical-notes"
                  iconColor={colors.brandBright}
                  onPress={() => playSongAt(sortedSongs, 0)}
                  onPlay={shufflePlay}
                />
                <PlaylistCard
                  title="Favorite"
                  count={favoriteSongs.length}
                  icon="star"
                  iconColor="#E8C34C"
                  onPress={() =>
                    favoriteSongs.length > 0 && playSongAt(favoriteSongs, 0)
                  }
                  onPlay={() => favoriteSongs.length > 0 && playSongAt(favoriteSongs, 0)}
                />
              </>
            }
            renderItem={({ item }) => (
              <PlaylistCard
                title={item.name}
                count={item.songIds.length}
                icon="list"
                iconColor={colors.waveViolet}
                onPress={() => navigation.navigate("PlaylistDetail", { playlistId: item.id })}
                onPlay={() => {
                  const list = songs.filter((s) => item.songIds.includes(s.id));
                  if (list.length > 0) playSongAt(list, 0);
                }}
              />
            )}
          />
        )}

        {category === "albums" && (
          <FlatList
            style={styles.list}
            data={albums}
            keyExtractor={(a) => a.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <PlaylistCard
                title={item.title}
                count={item.assetCount}
                icon="albums"
                iconColor={colors.waveBlue}
                onPress={() =>
                  navigation.navigate("AlbumSongs", { albumId: item.id, albumTitle: item.title })
                }
                onPlay={() =>
                  navigation.navigate("AlbumSongs", { albumId: item.id, albumTitle: item.title })
                }
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>No albums found</Text>
              </View>
            }
          />
        )}

        {category === "artists" && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Artist tags aren't available</Text>
            <Text style={styles.emptyBody}>
              The device media library doesn't expose ID3 artist tags without an
              additional native tag-reading library — that's a follow-up, not
              something built into Oluwaa yet.
            </Text>
          </View>
        )}
      </View>

      {activeTrack && (
        <MiniPlayer
          title={activeTrack.title ?? "Untitled"}
          artist={activeTrack.artist ?? "Unknown artist"}
          isPlaying={isPlaying}
          onTogglePlay={toggleMiniPlayer}
          onPress={() => navigation.navigate("NowPlaying")}
          onOpenQueue={() => navigation.navigate("Queue")}
          onClose={closeMiniPlayer}
        />
      )}

      <SortDialogModal
        visible={sortOpen}
        value={sortPref}
        onCancel={() => setSortOpen(false)}
        onConfirm={async (pref) => {
          setSortPrefState(pref);
          await setSortPref(pref);
          setSortOpen(false);
        }}
      />

      <SongActionSheet
        visible={!!actionSheetSong}
        song={actionSheetSong}
        isFavorite={!!actionSheetSong && favoriteIds.includes(actionSheetSong.id)}
        playlists={playlists}
        onClose={() => setActionSheetSong(null)}
        onToggleFavorite={handleToggleFavorite}
        onAddToPlaylist={handleAddToPlaylist}
        onCreatePlaylist={() => setCreatePlaylistOpen(true)}
        onPlayNext={handlePlayNext}
        onDelete={handleDelete}
      />

      <CreatePlaylistModal
        visible={createPlaylistOpen}
        onCancel={() => setCreatePlaylistOpen(false)}
        onCreate={handleCreatePlaylist}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: spacing(6), paddingBottom: spacing(1) },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgCard,
    marginTop: 2,
  },
  eyebrow: {
    fontFamily: type.bodySemiBold,
    color: colors.brandBright,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headerTitle: {
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 32,
    marginTop: 4,
  },
  body: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingBottom: 90 },
  empty: { paddingHorizontal: 24, marginTop: spacing(10) },
  emptyTitle: {
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 18,
    marginBottom: 8,
  },
  emptyBody: {
    fontFamily: type.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  playlistHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: spacing(3),
    marginTop: spacing(3),
  },
  playlistHeaderTitle: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 18 },
  permissionWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 18,
    marginTop: spacing(4),
    textAlign: "center",
  },
  permissionBody: {
    fontFamily: type.body,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginTop: spacing(2),
  },
  permissionBtn: {
    marginTop: spacing(5),
    backgroundColor: colors.brandBright,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  permissionBtnLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 14 },
});
