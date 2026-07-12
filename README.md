# Oluwaa — offline music player

Native Android/iOS music player that reads audio **directly and live**
from the device's media library — no copy step, no local database of
songs. Playback runs through a real foreground service with lock-screen
/ notification / Bluetooth controls (`react-native-track-player`).

> **Important:** `react-native-track-player` and `expo-media-library`
> both ship native code, so this app will **not** run inside Expo Go.
> You need a custom **dev client**, built once via EAS.

## Project

- Slug: `oluwaa` · Owner: `murdas-team`
- EAS project ID: `001ac863-9b9f-4ff1-9a20-5807a951a18d`

`app.json` and `eas.json` are already wired to this project.

## No-terminal build path (EAS website)

1. Push this folder to `github.com/murdas-team/oluwaa` (GitHub's web
   uploader/editor works fine, no git CLI required).
2. On expo.dev, open the `oluwaa` project → **Settings → GitHub** →
   connect the repo.
3. **Builds → Create a build → Android → development** (or
   `preview` for a plain installable APK) → Run. Expo's servers install
   dependencies and compile for you.
4. Install the resulting APK on your device via the QR code / download
   link on the build page.

(If you do have a terminal available: `npm install`, `eas build
--profile development --platform android`, then `npm start`.)

## How this app is structured now

### Live device scan, not a database
`src/services/deviceLibrary.ts` calls `expo-media-library` to read the
device's audio media store **every time** the Home screen needs songs —
on open, on pull-to-refresh, after a permission grant. Nothing is
copied into app storage and nothing about song content is persisted.
Tracks play directly from their original on-device `uri`.

The one caveat: `expo-media-library` doesn't expose ID3 artist tags, so
`song.artist` is always `"Unknown artist"` and the Artist tab explains
this rather than showing a fake grouping. A native tag-reading library
would be the follow-up if per-song artist/album-art matters.

### Lightweight preferences, not a song library
`src/services/appState.ts` uses `AsyncStorage` for the *small* bits of
state that genuinely need to persist across app opens — favorite song
ids, user-created playlists (which store song ids only, resolved
against a fresh scan at render time), the chosen sort order, and the
chosen player skin. None of this duplicates song metadata.

### Screens
```
Home                 Top tabs: All Songs · Playlist · Album · Artist
  All Songs           Shuffle bar (shuffle-play + sort icon), song list
  Playlist            "All" + "Favorite" system cards, user playlists,
                      + button to create a new one
  Album               Cards grouped via MediaLibrary albums
  Artist              Explains the tag-reading limitation above
NowPlaying            Wave visualizer behind the art, quick-action row
                      (favorite / equalizer stub / sleep timer / skin /
                      overflow), progress bar, transport controls,
                      collapsible lyrics drawer
Queue                 Modal sheet listing the live TrackPlayer queue
Skins                 2-column gallery, each card a mini live preview;
                      tap to apply — restyles NowPlaying's accent +
                      visualizer gradient only, not global app chrome
PlaylistDetail /
AlbumSongs            Song list for a single playlist/album
Me                    Minimal profile stub + "re-check media access"
```

Bottom nav is exactly two tabs — **Music** and **Me** — per your call.

### Lock screen buttons
`src/services/TrackPlayerService.ts` sets previous / play-pause / next
in the compact notification (Android's compact view caps out at 3
icons) and adds a close (Stop) button in the full notification /
lock-screen view. `src/services/PlaybackService.ts` handles the
corresponding remote events, including the close button calling
`TrackPlayer.stop()`.

### Mini player
Now shows queue and close (X) icons alongside play/pause, per spec.
Close stops playback and clears the queue.

## Known simplifications (flagged, not hidden)

- **Equalizer / effects**: the icon is wired up but opens a placeholder
  alert — no actual DSP/EQ chain is implemented.
- **Lyrics drawer**: expands/collapses correctly but shows a
  placeholder; no lyrics provider is connected.
- **Skins**: restyle NowPlaying's accent color and gradient overlay.
  All five reuse `wave-background.jpg` as the base photo since that's
  the only art asset provided — swap in dedicated skin art in
  `src/theme/skins.ts` if you want visually distinct photos per skin.
- **Shuffle** on the Now Playing transport row was removed in this pass
  in favor of the spec's dedicated Shuffle Play button on the Home
  screen's shuffle bar — reshuffling mid-queue isn't wired up.
- **Sort "size"** falls back to sorting by duration, since
  `expo-media-library` doesn't expose file size directly.
- **Album art**: no embedded-art extraction; every track falls back to
  the wave-art asset. A tag-reading library is the natural next step.

## Project structure

```
App.tsx                        Boot: fonts, TrackPlayer init, nav
index.js                       Registers the background playback service
src/
  services/
    deviceLibrary.ts            Live MediaLibrary scan (songs, albums)
    appState.ts                 AsyncStorage: favorites/playlists/sort/skin
    sort.ts                     Sort-dialog logic
    TrackPlayerService.ts       Player setup + lock-screen capabilities
    PlaybackService.ts          Background remote-control event handling
  screens/                      Home, NowPlaying, Queue, Skins, Me, …
  components/                   CategoryTabs, ShuffleBar, SortDialogModal,
                                 SongRow, SongActionSheet, MiniPlayer,
                                 WavePulse, EqualizerBars, LyricsDrawer, …
  theme/
    colors.ts                   Global design tokens
    skins.ts                    Now Playing skin variants
assets/
  icon.png / adaptive-icon.png  Your app icon (brand green)
  wave-background.jpg           Your wave art (visual identity)
```
