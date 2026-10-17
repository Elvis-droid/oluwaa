import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Lyrics come from LRCLIB (https://lrclib.net) — a free, key-less lyrics
 * API that returns time-synced (LRC) and plain lyrics. Only the guessed
 * artist/title text and the song length are sent; no audio or file is.
 * Every hit is cached in AsyncStorage so that song works offline later.
 */

export type LyricLine = { time: number; text: string };

export type LyricsData = {
  synced: LyricLine[] | null;
  plain: string | null;
  matchedTitle: string;
  matchedArtist: string;
};

export type LyricsState =
  | { status: "loading" }
  | { status: "found"; data: LyricsData }
  | { status: "notFound" }
  | { status: "offline" };

const API = "https://lrclib.net/api";
const cacheKey = (songId: string) => `oluwaa:lyrics:${songId}`;

// ---------- Filename -> search query ----------

export type GuessedQuery = { artist: string; title: string };

/** "WSTRN_ft._BackRoad_Gee_-_Unload_[Official_Video](256k)" ->
 *  { artist: "WSTRN ft. BackRoad Gee", title: "Unload" } */
export function guessQuery(filename: string): GuessedQuery {
  let s = filename.replace(/\.[a-z0-9]{2,4}$/i, "");
  s = s.replace(/_/g, " ");
  s = s.replace(/\[[^\]]*\]|\([^)]*\)/g, " "); // [Official Video], (256k), (feat. X)
  s = s.replace(
    /\b(official|officiel|video|audio|lyrics?|visuali[sz]er|clip|hd|4k|\d{2,3}kbps|\d{3}k)\b/gi,
    " "
  );
  s = s.replace(/\s+/g, " ").trim();

  const parts = s.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { artist: parts[0].trim(), title: parts.slice(1).join(" ").trim() };
  }
  return { artist: "", title: s };
}

/** "WSTRN ft. BackRoad Gee" -> "WSTRN" — LRCLIB matches the main artist best. */
function mainArtist(artist: string): string {
  return artist.split(/\s+(?:ft\.?|feat\.?|featuring|x|&|,)\s+/i)[0].trim();
}

// ---------- LRC parsing ----------

export function parseLrc(lrc: string): LyricLine[] {
  const lines: LyricLine[] = [];
  for (const raw of lrc.split(/\r?\n/)) {
    const stamps = [...raw.matchAll(/\[(\d+):(\d+(?:\.\d+)?)\]/g)];
    if (stamps.length === 0) continue; // metadata tags like [ar:...]
    const text = raw.replace(/\[[^\]]*\]/g, "").trim();
    for (const m of stamps) {
      lines.push({ time: parseInt(m[1], 10) * 60 + parseFloat(m[2]), text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

// ---------- Network ----------

class NetworkError extends Error {}

async function getJson(url: string, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e: any) {
    if (e?.name === "AbortError" || e instanceof TypeError) {
      throw new NetworkError(e?.message ?? "network");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

type LrclibItem = {
  trackName: string;
  artistName: string;
  duration: number | null;
  plainLyrics: string | null;
  syncedLyrics: string | null;
};

function pickBest(items: LrclibItem[], durationSec: number): LrclibItem | null {
  const usable = items.filter((i) => i.syncedLyrics || i.plainLyrics);
  if (usable.length === 0) return null;

  const score = (i: LrclibItem) => {
    let sc = i.syncedLyrics ? 2 : 0;
    if (durationSec > 0 && i.duration) {
      const diff = Math.abs(i.duration - durationSec);
      if (diff <= 3) sc += 3;
      else if (diff <= 8) sc += 1;
      else if (diff > 20) sc -= 3;
    }
    return sc;
  };
  return [...usable].sort((a, b) => score(b) - score(a))[0];
}

function toData(item: LrclibItem): LyricsData {
  const synced = item.syncedLyrics ? parseLrc(item.syncedLyrics) : null;
  return {
    synced: synced && synced.length > 0 ? synced : null,
    plain: item.plainLyrics ?? null,
    matchedTitle: item.trackName,
    matchedArtist: item.artistName,
  };
}

export type LoadOptions = {
  /** Free-text override typed by the user, e.g. "Tayc Le Temps". */
  query?: string;
  /** Skip the cache and hit the network again. */
  force?: boolean;
};

export async function loadLyrics(
  songId: string,
  filenameTitle: string,
  durationSec: number,
  options: LoadOptions = {}
): Promise<LyricsState> {
  if (!options.force) {
    const cached = await AsyncStorage.getItem(cacheKey(songId));
    if (cached) {
      try {
        return { status: "found", data: JSON.parse(cached) as LyricsData };
      } catch {
        /* corrupt cache entry — fall through to a fresh lookup */
      }
    }
  }

  const guessed = guessQuery(filenameTitle);
  const urls: string[] = [];
  const enc = encodeURIComponent;

  if (options.query?.trim()) {
    urls.push(`${API}/search?q=${enc(options.query.trim())}`);
  } else {
    if (guessed.artist && guessed.title) {
      urls.push(
        `${API}/search?track_name=${enc(guessed.title)}&artist_name=${enc(mainArtist(guessed.artist))}`
      );
    }
    urls.push(`${API}/search?q=${enc(`${guessed.artist} ${guessed.title}`.trim())}`);
  }

  let sawNetworkError = false;
  let gotAnyResponse = false;

  for (const url of urls) {
    try {
      const items = (await getJson(url)) as LrclibItem[];
      gotAnyResponse = true;
      const best = pickBest(items, durationSec);
      if (best) {
        const data = toData(best);
        await AsyncStorage.setItem(cacheKey(songId), JSON.stringify(data));
        return { status: "found", data };
      }
    } catch (e) {
      if (e instanceof NetworkError) sawNetworkError = true;
    }
  }

  if (!gotAnyResponse && sawNetworkError) return { status: "offline" };
  return { status: "notFound" };
}

/** The text pre-filled in the "edit search" box. */
export function defaultSearchText(filenameTitle: string): string {
  const g = guessQuery(filenameTitle);
  return `${g.artist} ${g.title}`.trim();
}
