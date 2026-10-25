import TrackPlayer, { Event } from "react-native-track-player";

/**
 * Registered once in index.js via TrackPlayer.registerPlaybackService(() => PlaybackService).
 * Handles remote-control events: lock screen buttons, notification buttons,
 * Bluetooth headset buttons, Android Auto / car head units, smartwatch, etc.
 */
export async function PlaybackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) =>
    TrackPlayer.seekTo(position)
  );

  // Pause when a phone call or another app takes audio focus.
  TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }) => {
    if (permanent) {
      await TrackPlayer.pause();
      return;
    }
    if (paused) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  });

  // Auto-advance when a track ends and nothing else is queued handling is
  // done internally by TrackPlayer; this listener is for UI-side analytics
  // or "just finished" logic if you add it later.
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, () => {
    // No-op: queue simply stops. Hook up repeat-queue logic here if desired.
  });
}
