import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TrackPlayer, {
  Track,
  useActiveTrack,
  usePlaybackState,
  Event,
  useTrackPlayerEvents,
  State,
} from "react-native-track-player";

import { ScreenBackground } from "../components/ScreenBackground";
import { EqualizerBars } from "../components/EqualizerBars";
import { colors, radius, type, spacing } from "../theme/colors";

export function QueueScreen() {
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();
  const playback = usePlaybackState();
  const isPlaying = playback.state === State.Playing;
  const [queue, setQueue] = useState<Track[]>([]);

  const refresh = useCallback(async () => {
    const q = await TrackPlayer.getQueue();
    setQueue(q);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged, Event.PlaybackQueueEnded], () => {
    refresh();
  });

  const playIndex = async (index: number) => {
    await TrackPlayer.skip(index);
    await TrackPlayer.play();
  };

  return (
    <ScreenBackground>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-down" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Up next</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        data={queue}
        keyExtractor={(t, i) => `${t.id ?? t.url}-${i}`}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => {
          const isActive = item.id === activeTrack?.id;
          return (
            <Pressable
              onPress={() => playIndex(index)}
              style={[styles.row, isActive && styles.rowActive]}
            >
              <View style={styles.indexSlot}>
                {isActive ? (
                  <EqualizerBars playing={isPlaying} />
                ) : (
                  <Text style={styles.indexText}>{index + 1}</Text>
                )}
              </View>
              <View style={styles.meta}>
                <Text numberOfLines={1} style={[styles.title, isActive && styles.titleActive]}>
                  {item.title ?? "Untitled"}
                </Text>
                <Text numberOfLines={1} style={styles.artist}>
                  {item.artist ?? "Unknown artist"}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Queue is empty</Text>
          </View>
        }
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
    paddingBottom: spacing(4),
  },
  topBarTitle: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 18 },
  list: { paddingBottom: 40 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.md,
  },
  rowActive: { backgroundColor: colors.bgCard },
  indexSlot: { width: 24, alignItems: "center" },
  indexText: { fontFamily: type.body, color: colors.textMuted, fontSize: 13 },
  meta: { flex: 1, marginLeft: 12 },
  title: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 15 },
  titleActive: { color: colors.brandBright },
  artist: { fontFamily: type.body, color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  empty: { paddingHorizontal: 24, marginTop: spacing(10) },
  emptyText: { fontFamily: type.body, color: colors.textSecondary, fontSize: 14 },
});
