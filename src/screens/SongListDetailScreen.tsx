import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import TrackPlayer, { useActiveTrack, usePlaybackState, State } from "react-native-track-player";

import { ScreenBackground } from "../components/ScreenBackground";
import { SongRow } from "../components/SongRow";
import { loadQueue } from "../services/TrackPlayerService";
import { Song } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  title: string;
  subtitle?: string;
  songs: Song[];
  onOverflow: (song: Song) => void;
};

export function SongListDetailScreen({ title, subtitle, songs, onOverflow }: Props) {
  const navigation = useNavigation();
  const activeTrack = useActiveTrack();
  const playback = usePlaybackState();
  const isPlaying = playback.state === State.Playing;

  const playAt = async (index: number) => {
    await loadQueue(songs, index);
    await TrackPlayer.play();
    navigation.navigate("NowPlaying" as never);
  };

  const shufflePlay = async () => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    await loadQueue(shuffled, 0);
    await TrackPlayer.play();
    navigation.navigate("NowPlaying" as never);
  };

  return (
    <ScreenBackground>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Pressable onPress={shufflePlay} style={styles.playAllBtn}>
          <Ionicons name="play" size={16} color={colors.bg} />
        </Pressable>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <FlatList
        style={styles.list}
        data={songs}
        keyExtractor={(s) => s.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <SongRow
            song={item}
            index={index}
            active={item.id === activeTrack?.id}
            playing={isPlaying}
            onPress={() => playAt(index)}
            onOverflow={() => onOverflow(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No songs here yet</Text>
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
  },
  playAllBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.brandBright,
    alignItems: "center",
    justifyContent: "center",
  },
  header: { paddingHorizontal: 20, paddingTop: spacing(4), paddingBottom: spacing(3) },
  title: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 26 },
  subtitle: { fontFamily: type.body, color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  list: { flex: 1 },
  listContent: { paddingBottom: 90 },
  empty: { paddingHorizontal: 24, marginTop: spacing(10) },
  emptyText: { fontFamily: type.body, color: colors.textSecondary, fontSize: 14 },
});
