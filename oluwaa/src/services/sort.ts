import { Song, SortPref } from "../types";

export function sortSongs(songs: Song[], pref: SortPref): Song[] {
  const sorted = [...songs].sort((a, b) => {
    switch (pref.field) {
      case "name":
        return a.title.localeCompare(b.title);
      case "length":
        return a.duration - b.duration;
      case "size":
        // expo-media-library doesn't expose file size directly; duration
        // is used as a reasonable proxy until a native tag/size reader is
        // wired in.
        return a.duration - b.duration;
      case "date":
      default:
        return a.modificationTime - b.modificationTime;
    }
  });
  return pref.direction === "newOld" ? sorted.reverse() : sorted;
}
