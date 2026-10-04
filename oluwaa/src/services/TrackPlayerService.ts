import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
} from "react-native-track-player";
import { Song } from "../types";

let isSetup = false;

// There's no embedded-art reader, so every track's lock-screen/UI
// artwork falls back to one shared image: the user's profile photo
// (mandatory at onboarding), or the wave-art asset before that's set.
let globalArtwork: string | number = require("../../assets/wave-background.jpg");

export function setGlobalArtwork(uri: string | null) {
  globalArtwork = uri ?? require("../../assets/wave-background.jpg");
}

/**
 * One-time setup. Must run before any queue/playback calls.
 * This is what makes controls appear on the Android/iOS lock screen,
 * the notification shade, and connected Bluetooth/car head units.
 *
 * Lock screen button set per spec: previous, play/pause, next, close (X).
 * Android's *compact* notification view only fits 3 icons, so
 * previous/play-pause/next go there; the close (Stop) button appears in
 * the full notification / lock-screen view alongside the rest.
 */
export async function setupTrackPlayer(): Promise<void> {
  if (isSetup) return;

  await TrackPlayer.setupPlayer({
    autoHandleInterruptions: true, // pause when a call/nav prompt interrupts us
  });

  await TrackPlayer.updateOptions({
    android: {
      appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
    },
    capabilities: [
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.SkipToPrevious,
      Capability.SeekTo,
      Capability.Stop,
    ],
    compactCapabilities: [
      Capability.SkipToPrevious,
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
    ],
    notificationCapabilities: [
      Capability.SkipToPrevious,
      Capability.Play,
      Capability.Pause,
      Capability.SkipToNext,
      Capability.Stop,
    ],
    // Shown as the notification/lock-screen icon color accent on Android
    color: 0x2e7d4f,
    icon: require("../../assets/icon.png"),
  });

  await TrackPlayer.setRepeatMode(RepeatMode.Off);

  isSetup = true;
}

export function songToTrack(song: Song) {
  return {
    id: song.id,
    url: song.uri, // played directly from its on-device location, no copy
    title: song.title,
    artist: song.artist,
    album: song.album ?? undefined,
    // No embedded-artwork reader wired in yet -> every track's art is
    // the user's profile photo (or the wave asset before one's set).
    artwork: globalArtwork,
    duration: song.duration,
  };
}

export async function loadQueue(songs: Song[], startIndex = 0) {
  await TrackPlayer.reset();
  await TrackPlayer.add(songs.map(songToTrack));
  if (startIndex > 0) {
    await TrackPlayer.skip(startIndex);
  }
}

/**
 * Inserts a song immediately after the currently active track so it
 * plays next, without disturbing the rest of the queue. If nothing is
 * queued yet, it just starts playing this song.
 */
export async function playNext(song: Song): Promise<void> {
  const queue = await TrackPlayer.getQueue();
  if (queue.length === 0) {
    await loadQueue([song], 0);
    await TrackPlayer.play();
    return;
  }
  const activeIndex = await TrackPlayer.getActiveTrackIndex();
  const insertBeforeIndex = (activeIndex ?? queue.length - 1) + 1;
  await TrackPlayer.add([songToTrack(song)], insertBeforeIndex);
}

/** Removes a single track from the live queue by its index, for the
 * Up Next screen's per-row close (X) button. */
export async function removeFromQueue(index: number): Promise<void> {
  await TrackPlayer.remove([index]);
}

/** Randomly reorders everything after the currently playing track,
 * leaving what's already played and the current track untouched. */
export async function shuffleUpcoming(): Promise<void> {
  const queue = await TrackPlayer.getQueue();
  const activeIndex = (await TrackPlayer.getActiveTrackIndex()) ?? 0;
  const upcoming = queue.slice(activeIndex + 1);
  if (upcoming.length < 2) return;

  const shuffled = [...upcoming].sort(() => Math.random() - 0.5);
  const removeIndices = upcoming.map((_, i) => activeIndex + 1 + i);
  await TrackPlayer.remove(removeIndices);
  await TrackPlayer.add(shuffled, activeIndex + 1);
}
