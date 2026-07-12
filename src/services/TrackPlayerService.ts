import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode,
} from "react-native-track-player";
import { Song } from "../types";

let isSetup = false;

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
    // No embedded-artwork reader wired in yet -> lock screen art falls
    // back to the wave-art asset for every track.
    artwork: require("../../assets/wave-background.jpg"),
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
