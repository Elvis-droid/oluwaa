import React, { useEffect, useState } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { SongListDetailScreen } from "./SongListDetailScreen";
import { SongActionSheet } from "../components/SongActionSheet";
import { scanAlbumSongs } from "../services/deviceLibrary";
import { getFavoriteIds, getPlaylists, toggleFavorite, addSongToPlaylist } from "../services/appState";
import { MusicStackParamList, Playlist, Song } from "../types";

export function AlbumSongsScreen() {
  const route = useRoute<RouteProp<MusicStackParamList, "AlbumSongs">>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [actionSheetSong, setActionSheetSong] = useState<Song | null>(null);

  useEffect(() => {
    (async () => {
      const [albumSongs, favs, pls] = await Promise.all([
        scanAlbumSongs(route.params.albumId),
        getFavoriteIds(),
        getPlaylists(),
      ]);
      setSongs(albumSongs);
      setFavoriteIds(favs);
      setPlaylists(pls);
    })();
  }, [route.params.albumId]);

  return (
    <>
      <SongListDetailScreen
        title={route.params.albumTitle}
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
