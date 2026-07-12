/**
 * Song is a live view of a device MediaLibrary audio asset — nothing is
 * persisted about it. It's re-derived from expo-media-library every time
 * the app scans (app open, pull-to-refresh, permission grant).
 */
export type Song = {
  id: string; // MediaLibrary asset id
  title: string; // filename, extension stripped
  artist: string; // "Unknown artist" — expo-media-library exposes no ID3 artist tag
  album: string | null; // from MediaLibrary album grouping, Android only
  albumId: string | null;
  uri: string; // original on-device location, played directly from here
  duration: number; // seconds
  modificationTime: number;
};

export type Album = {
  id: string;
  title: string;
  assetCount: number;
};

/** User-created or system playlist. Stores only song ids — resolved
 * against the live scan at render time, never its own copy of song data. */
export type Playlist = {
  id: string;
  name: string;
  songIds: string[];
  isSystem?: boolean; // "All" / "Favorites"
  createdAt: number;
};

export type SortField = "date" | "name" | "size" | "length";
export type SortDirection = "newOld" | "oldNew";
export type SortPref = { field: SortField; direction: SortDirection };

export type SkinId = "default" | "floral" | "romantic" | "smokePaint" | "nature";

export type MusicStackParamList = {
  Home: undefined;
  NowPlaying: undefined;
  Queue: undefined;
  Skins: undefined;
  PlaylistDetail: { playlistId: string };
  AlbumSongs: { albumId: string; albumTitle: string };
  ArtistSongs: { artist: string };
};

export type RootTabParamList = {
  MusicStack: undefined;
  Me: undefined;
};
