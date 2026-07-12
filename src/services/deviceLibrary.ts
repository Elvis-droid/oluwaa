import * as MediaLibrary from "expo-media-library";
import { Album, Song } from "../types";

function stripExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

export async function ensureMediaPermission(): Promise<boolean> {
  const current = await MediaLibrary.getPermissionsAsync();
  if (current.status === "granted") return true;
  const requested = await MediaLibrary.requestPermissionsAsync();
  return requested.status === "granted";
}

function assetToSong(asset: MediaLibrary.Asset): Song {
  return {
    id: asset.id,
    title: stripExtension(asset.filename),
    artist: "Unknown artist",
    album: null,
    albumId: (asset as any).albumId ?? null,
    uri: asset.uri,
    duration: asset.duration ?? 0,
    modificationTime: asset.modificationTime ?? 0,
  };
}

/**
 * Scans the device's audio media store live. No SQLite, no copy step —
 * this is called fresh every time the Home screen needs the song list.
 * Paginates in batches of 200 until the full audio library is read.
 */
export async function scanDeviceAudio(): Promise<Song[]> {
  const granted = await ensureMediaPermission();
  if (!granted) return [];

  const songs: Song[] = [];
  let after: string | undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: 200,
      after,
      sortBy: [MediaLibrary.SortBy.modificationTime],
    });
    songs.push(...page.assets.map(assetToSong));
    hasNextPage = page.hasNextPage;
    after = page.endCursor;
    // Safety cap so a huge library can't loop indefinitely.
    if (songs.length > 5000) break;
  }

  return songs;
}

export async function scanAlbums(): Promise<Album[]> {
  const granted = await ensureMediaPermission();
  if (!granted) return [];

  const albums = await MediaLibrary.getAlbumsAsync({
    includeSmartAlbums: false,
  });

  // Filter to albums that actually contain audio; getAlbumsAsync on
  // Android returns all media store buckets, not just audio ones.
  const audioAlbums: Album[] = [];
  for (const album of albums) {
    const probe = await MediaLibrary.getAssetsAsync({
      album,
      mediaType: MediaLibrary.MediaType.audio,
      first: 1,
    });
    if (probe.totalCount > 0) {
      audioAlbums.push({ id: album.id, title: album.title, assetCount: probe.totalCount });
    }
  }
  return audioAlbums;
}

export async function scanAlbumSongs(albumId: string): Promise<Song[]> {
  const granted = await ensureMediaPermission();
  if (!granted) return [];

  const page = await MediaLibrary.getAssetsAsync({
    album: albumId,
    mediaType: MediaLibrary.MediaType.audio,
    first: 500,
  });
  return page.assets.map(assetToSong);
}
