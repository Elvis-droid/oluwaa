import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import Slider from "@react-native-community/slider";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TrackPlayer, {
  useActiveTrack,
  usePlaybackState,
  useProgress,
  State,
  RepeatMode,
} from "react-native-track-player";

import { ScreenBackground } from "../components/ScreenBackground";
import { WavePulse } from "../components/WavePulse";
import { LyricsDrawer } from "../components/LyricsDrawer";
import { SleepTimerModal } from "../components/SleepTimerModal";
import { getFavoriteIds, toggleFavorite, getSkin, getProfile } from "../services/appState";
import { shuffleUpcoming } from "../services/TrackPlayerService";
import { getSkinById } from "../theme/skins";
import { RepeatCycleMode } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const CYCLE_ORDER: RepeatCycleMode[] = ["off", "random", "single", "repeat"];
const CYCLE_ICON: Record<RepeatCycleMode, keyof typeof Ionicons.glyphMap> = {
  off: "repeat",
  random: "shuffle",
  single: "repeat",
  repeat: "infinite",
};

export function NowPlayingScreen() {
  const navigation = useNavigation();
  const track = useActiveTrack();
  const playback = usePlaybackState();
  const progress = useProgress(250);
  const isPlaying = playback.state === State.Playing;

  const [cycleMode, setCycleMode] = useState<RepeatCycleMode>("off");
  const [isFavorite, setIsFavorite] = useState(false);
  const [accent, setAccent] = useState(colors.brandBright);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [sleepTimerOpen, setSleepTimerOpen] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const sleepTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const profile = await getProfile();
        setPhotoUri(profile.photoUri);
        if (!track) return;
        const favs = await getFavoriteIds();
        setIsFavorite(favs.includes(track.id));
        const skin = getSkinById(await getSkin());
        setAccent(skin.accent);
      })();
    }, [track?.id])
  );

  useEffect(() => {
    return () => {
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
    };
  }, []);

  const togglePlay = useCallback(async () => {
    if (isPlaying) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  }, [isPlaying]);

  const cycleRepeat = useCallback(async () => {
    const currentPos = CYCLE_ORDER.indexOf(cycleMode);
    const next = CYCLE_ORDER[(currentPos + 1) % CYCLE_ORDER.length];
    setCycleMode(next);

    if (next === "off") {
      await TrackPlayer.setRepeatMode(RepeatMode.Off);
    } else if (next === "random") {
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
      await shuffleUpcoming();
    } else if (next === "single") {
      await TrackPlayer.setRepeatMode(RepeatMode.Track);
    } else if (next === "repeat") {
      await TrackPlayer.setRepeatMode(RepeatMode.Queue);
    }
  }, [cycleMode]);

  const handleToggleFavorite = useCallback(async () => {
    if (!track) return;
    const next = await toggleFavorite(track.id);
    setIsFavorite(next.includes(track.id));
  }, [track]);

  const handleSleepSelect = useCallback((minutes: number | null) => {
    setSleepMinutes(minutes);
    setSleepTimerOpen(false);
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    if (minutes !== null) {
      sleepTimeoutRef.current = setTimeout(() => {
        TrackPlayer.pause();
        setSleepMinutes(null);
      }, minutes * 60 * 1000);
    }
  }, []);

  if (!track) {
    return (
      <ScreenBackground>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Nothing playing</Text>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.topBarMeta}>
          <Text numberOfLines={1} style={styles.topBarTitle}>
            {track.title}
          </Text>
          <Text numberOfLines={1} style={styles.topBarArtist}>
            {track.artist}
          </Text>
        </View>
        <Pressable
          hitSlop={12}
          onPress={() => Alert.alert("Share / Cast", "Hook up a share sheet or cast target here.")}
        >
          <Ionicons name="share-outline" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.artStage}>
        <View style={styles.visualizerLayer}>
          <WavePulse playing={isPlaying} height={260} />
        </View>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.art} />
        ) : (
          <View style={styles.art} />
        )}
      </View>

      <View style={styles.meta}>
        <Text numberOfLines={1} style={styles.title}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={styles.artist}>
          {track.artist}
        </Text>
      </View>

      <View style={styles.quickActions}>
        <Pressable onPress={handleToggleFavorite} hitSlop={8}>
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={20}
            color={isFavorite ? accent : colors.textSecondary}
          />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => Alert.alert("Equalizer", "Effects/EQ panel goes here.")}
        >
          <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => setSleepTimerOpen(true)}>
          <Ionicons
            name="timer-outline"
            size={20}
            color={sleepMinutes ? accent : colors.textSecondary}
          />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => navigation.navigate("Skins" as never)}>
          <Ionicons name="shirt-outline" size={20} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={() => Alert.alert("More", "Additional per-track actions go here.")}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.progressWrap}>
        <Slider
          style={{ width: "100%", height: 32 }}
          minimumValue={0}
          maximumValue={Math.max(progress.duration, 1)}
          value={progress.position}
          minimumTrackTintColor={accent}
          maximumTrackTintColor={colors.hairline}
          thumbTintColor={accent}
          onSlidingComplete={(value) => TrackPlayer.seekTo(value)}
        />
        <View style={styles.timeRow}>
          <Text style={styles.time}>{formatTime(progress.position)}</Text>
          <Text style={styles.time}>{formatTime(progress.duration)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={cycleRepeat} hitSlop={10} style={styles.cycleBtn}>
          <Ionicons
            name={CYCLE_ICON[cycleMode]}
            size={22}
            color={cycleMode === "off" ? colors.textSecondary : accent}
          />
          {cycleMode === "single" && <View style={[styles.cycleBadge, { backgroundColor: accent }]} />}
        </Pressable>
        <Pressable onPress={() => TrackPlayer.skipToPrevious()} hitSlop={10}>
          <Ionicons name="play-skip-back" size={30} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={togglePlay} style={[styles.playBtn, { backgroundColor: accent }]}>
          <Ionicons name={isPlaying ? "pause" : "play"} size={30} color={colors.bg} />
        </Pressable>
        <Pressable onPress={() => TrackPlayer.skipToNext()} hitSlop={10}>
          <Ionicons name="play-skip-forward" size={30} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Queue" as never)} hitSlop={10}>
          <Ionicons name="list" size={22} color={colors.textSecondary} />
        </Pressable>
      </View>
      <Text style={styles.cycleLabel}>
        {cycleMode === "off" && "Repeat off"}
        {cycleMode === "random" && "Shuffling upcoming songs"}
        {cycleMode === "single" && "Repeating this song"}
        {cycleMode === "repeat" && "Repeating queue"}
      </Text>

      <LyricsDrawer trackTitle={track.title ?? "this track"} />

      <SleepTimerModal
        visible={sleepTimerOpen}
        activeMinutes={sleepMinutes}
        onCancel={() => setSleepTimerOpen(false)}
        onSelect={handleSleepSelect}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: spacing(12),
  },
  topBarMeta: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  topBarTitle: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 13 },
  topBarArtist: { fontFamily: type.body, color: colors.textSecondary, fontSize: 11, marginTop: 1 },
  artStage: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing(4),
    height: 260,
  },
  visualizerLayer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.6,
  },
  art: {
    width: 220,
    height: 220,
    borderRadius: radius.lg,
    backgroundColor: colors.bgElevated,
  },
  meta: { alignItems: "center", marginTop: spacing(4), paddingHorizontal: 32 },
  title: {
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 20,
    textAlign: "center",
  },
  artist: {
    fontFamily: type.body,
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  quickActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 44,
    marginTop: spacing(5),
  },
  progressWrap: { paddingHorizontal: 24, marginTop: spacing(3) },
  timeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -4 },
  time: { fontFamily: type.body, color: colors.textMuted, fontSize: 11 },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 28,
    marginTop: spacing(4),
  },
  cycleBtn: { alignItems: "center", justifyContent: "center" },
  cycleBadge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cycleLabel: {
    fontFamily: type.body,
    color: colors.textMuted,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing(2),
  },
  playBtn: {
    width: 62,
    height: 62,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: type.body, color: colors.textSecondary },
});
