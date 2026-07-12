import React, { useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SongListDetailScreen } from "./SongListDetailScreen";
import { SongActionSheet } from "../components/SongActionSheet";
import { scanDeviceAudio } from "../services/deviceLibrary";
import {
  getFavoriteIds,
  getPlaylists,
  toggleFavorite,
  addSongToPlaylist,
  removeSongFromPlaylist,
} from "../services/appState";
import { MusicStackParamList, Playlist, Song } from "../types";

export function PlaylistDetailScreen() {
  const route = useRoute<RouteProp<MusicStackParamList, "PlaylistDetail">>();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [actionSheetSong, setActionSheetSong] = useState<Song | null>(null);

  useEffect(() => {
    (async () => {
      const [allSongs, pls, favs] = await Promise.all([
        scanDeviceAudio(),
        getPlaylists(),
        getFavoriteIds(),
      ]);
      const current = pls.find((p) => p.id === route.params.playlistId) ?? null;
      setPlaylist(current);
      setPlaylists(pls);
      setFavoriteIds(favs);
      setSongs(current ? allSongs.filter((s) => current.songIds.includes(s.id)) : []);
    })();
  }, [route.params.playlistId]);

  return (
    <>
      <SongListDetailScreen
        title={playlist?.name ?? "Playlist"}
        subtitle={`${songs.length} songs`}
        songs={songs}
        onOverflow={setActionSheetSong}
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
      />
    </>
  );
}
