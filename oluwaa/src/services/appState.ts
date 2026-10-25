import AsyncStorage from "@react-native-async-storage/async-storage";
import { Playlist, Profile, SkinId, SortPref } from "../types";

const KEYS = {
  favorites: "oluwaa:favorites", // string[] of song ids
  playlists: "oluwaa:playlists", // Playlist[]
  sortPref: "oluwaa:sortPref",
  skin: "oluwaa:skin",
  profile: "oluwaa:profile",
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

// ---------- Favorites ----------

export async function getFavoriteIds(): Promise<string[]> {
  return readJson<string[]>(KEYS.favorites, []);
}

export async function toggleFavorite(songId: string): Promise<string[]> {
  const current = await getFavoriteIds();
  const next = current.includes(songId)
    ? current.filter((id) => id !== songId)
    : [...current, songId];
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(next));
  return next;
}

// ---------- Playlists ----------

export async function getPlaylists(): Promise<Playlist[]> {
  return readJson<Playlist[]>(KEYS.playlists, []);
}

export async function createPlaylist(name: string): Promise<Playlist[]> {
  const current = await getPlaylists();
  const playlist: Playlist = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    songIds: [],
    createdAt: Date.now(),
  };
  const next = [...current, playlist];
  await AsyncStorage.setItem(KEYS.playlists, JSON.stringify(next));
  return next;
}

export async function addSongToPlaylist(
  playlistId: string,
  songId: string
): Promise<Playlist[]> {
  const current = await getPlaylists();
  const next = current.map((p) =>
    p.id === playlistId && !p.songIds.includes(songId)
      ? { ...p, songIds: [...p.songIds, songId] }
      : p
  );
  await AsyncStorage.setItem(KEYS.playlists, JSON.stringify(next));
  return next;
}

export async function removeSongFromPlaylist(
  playlistId: string,
  songId: string
): Promise<Playlist[]> {
  const current = await getPlaylists();
  const next = current.map((p) =>
    p.id === playlistId ? { ...p, songIds: p.songIds.filter((id) => id !== songId) } : p
  );
  await AsyncStorage.setItem(KEYS.playlists, JSON.stringify(next));
  return next;
}

// ---------- Sort preference ----------

const DEFAULT_SORT: SortPref = { field: "date", direction: "newOld" };

export async function getSortPref(): Promise<SortPref> {
  return readJson<SortPref>(KEYS.sortPref, DEFAULT_SORT);
}

export async function setSortPref(pref: SortPref): Promise<void> {
  await AsyncStorage.setItem(KEYS.sortPref, JSON.stringify(pref));
}

// ---------- Skin ----------

export async function getSkin(): Promise<SkinId> {
  return readJson<SkinId>(KEYS.skin, "default");
}

export async function setSkin(skin: SkinId): Promise<void> {
  await AsyncStorage.setItem(KEYS.skin, JSON.stringify(skin));
}

// ---------- Profile ----------

const DEFAULT_PROFILE: Profile = { name: "Listener", photoUri: null };

export async function getProfile(): Promise<Profile> {
  return readJson<Profile>(KEYS.profile, DEFAULT_PROFILE);
}

export async function setProfile(profile: Profile): Promise<void> {
  await AsyncStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

/** Onboarding is only complete once a photo has been set — it's a
 * required field, not optional. */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const profile = await getProfile();
  return !!profile.photoUri;
}
