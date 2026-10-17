import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import TrackPlayer from "react-native-track-player";
import { useLyrics } from "../hooks/useLyrics";
import { defaultSearchText } from "../services/lyrics";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  trackId?: string;
  title: string;
  duration: number;
  position: number;
  accent: string;
};

/** Index of the last line whose timestamp has been reached. */
function activeIndexFor(times: number[], position: number): number {
  let lo = 0;
  let hi = times.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (times[mid] <= position + 0.25) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
}

export function LyricsDrawer({ trackId, title, duration, position, accent }: Props) {
  const { state, retry } = useLyrics(trackId, title, duration);
  const [open, setOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [editing, setEditing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lineY = useRef<number[]>([]);

  useEffect(() => {
    setSearchText(defaultSearchText(title));
    setEditing(false);
  }, [title]);

  const synced = state.status === "found" ? state.data.synced : null;
  const plain = state.status === "found" ? state.data.plain : null;

  const times = useMemo(() => (synced ? synced.map((l) => l.time) : []), [synced]);
  const activeIndex = synced ? activeIndexFor(times, position) : -1;

  // Keep the current line centred while the sheet is open.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const y = lineY.current[activeIndex];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 140), animated: true });
  }, [activeIndex, open]);

  let preview = "Lyrics";
  if (state.status === "loading") preview = "Looking for lyrics…";
  else if (state.status === "notFound") preview = "Lyrics not found — tap to search";
  else if (state.status === "offline") preview = "No connection — tap to retry";
  else if (synced) preview = activeIndex >= 0 && synced[activeIndex].text ? synced[activeIndex].text : "♪";
  else if (plain) preview = "Tap to read lyrics";

  const showSearchForm = state.status === "notFound" || state.status === "offline" || editing;

  const submitSearch = () => {
    setEditing(false);
    retry({ query: searchText, force: true });
  };

  return (
    <>
      <Pressable style={styles.handle} onPress={() => setOpen(true)}>
        <View style={styles.handleTextWrap}>
          <Text style={styles.handleLabel}>Lyrics preview</Text>
          <Text numberOfLines={1} style={[styles.previewLine, synced && { color: accent }]}>
            {preview}
          </Text>
        </View>
        {state.status === "loading" ? (
          <ActivityIndicator size="small" color={colors.textSecondary} />
        ) : (
          <Ionicons name="chevron-up" size={18} color={colors.textSecondary} />
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.scrim} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
              </Pressable>
              <View style={styles.sheetTitleWrap}>
                <Text numberOfLines={1} style={styles.sheetTitle}>
                  {state.status === "found" ? state.data.matchedTitle : title}
                </Text>
                {state.status === "found" && state.data.matchedArtist ? (
                  <Text numberOfLines={1} style={styles.sheetArtist}>
                    {state.data.matchedArtist}
                  </Text>
                ) : null}
              </View>
              <View style={{ width: 24 }} />
            </View>

            {state.status === "loading" && (
              <View style={styles.center}>
                <ActivityIndicator color={accent} />
                <Text style={styles.message}>Looking for lyrics…</Text>
              </View>
            )}

            {state.status === "found" && !editing && synced && (
              <ScrollView ref={scrollRef} contentContainerStyle={styles.lines} showsVerticalScrollIndicator={false}>
                {synced.map((line, i) => (
                  <Pressable
                    key={`${line.time}-${i}`}
                    onLayout={(e) => {
                      lineY.current[i] = e.nativeEvent.layout.y;
                    }}
                    onPress={() => TrackPlayer.seekTo(line.time)}
                  >
                    <Text
                      style={[
                        styles.line,
                        i === activeIndex && { color: accent, fontSize: 21 },
                        i < activeIndex && styles.linePast,
                      ]}
                    >
                      {line.text || "♪"}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {state.status === "found" && !editing && !synced && plain && (
              <ScrollView contentContainerStyle={styles.lines} showsVerticalScrollIndicator={false}>
                <Text style={styles.plain}>{plain}</Text>
                <Text style={styles.footnote}>This version isn't time-synced, so lines don't follow the song.</Text>
              </ScrollView>
            )}

            {showSearchForm && (
              <View style={styles.center}>
                <Ionicons
                  name={state.status === "offline" ? "cloud-offline-outline" : "search-outline"}
                  size={34}
                  color={colors.textMuted}
                />
                <Text style={styles.message}>
                  {state.status === "offline"
                    ? "Couldn't reach the lyrics service. Check your connection and try again."
                    : state.status === "found"
                    ? "Type the artist and song title to find a better match:"
                    : "No lyrics found for this file name. Try the artist and song title:"}
                </Text>
                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Artist and song title"
                  placeholderTextColor={colors.textMuted}
                  style={styles.input}
                  returnKeyType="search"
                  onSubmitEditing={submitSearch}
                />
                <Pressable style={[styles.searchBtn, { backgroundColor: accent }]} onPress={submitSearch}>
                  <Text style={styles.searchBtnLabel}>Search again</Text>
                </Pressable>
              </View>
            )}

            {state.status === "found" && !editing && (
              <Pressable style={styles.wrongRow} onPress={() => setEditing(true)}>
                <Text style={styles.wrongLabel}>Wrong lyrics? Edit the search</Text>
              </Pressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  handle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing(3),
    marginHorizontal: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
  },
  handleTextWrap: { flex: 1, marginRight: 10 },
  handleLabel: { fontFamily: type.bodySemiBold, color: colors.textMuted, fontSize: 10, textTransform: "uppercase", letterSpacing: 1 },
  previewLine: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 13, marginTop: 3 },
  scrim: { flex: 1, backgroundColor: colors.overlayScrim, justifyContent: "flex-end" },
  sheet: {
    height: "78%",
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingTop: spacing(4),
  },
  sheetHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: spacing(3) },
  sheetTitleWrap: { flex: 1, alignItems: "center", paddingHorizontal: 8 },
  sheetTitle: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 14 },
  sheetArtist: { fontFamily: type.body, color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  lines: { paddingHorizontal: 24, paddingTop: spacing(6), paddingBottom: spacing(20) },
  line: { fontFamily: type.displayBold, color: colors.textSecondary, fontSize: 18, lineHeight: 28, marginBottom: 14 },
  linePast: { color: colors.textMuted },
  plain: { fontFamily: type.body, color: colors.textPrimary, fontSize: 16, lineHeight: 26 },
  footnote: { fontFamily: type.body, color: colors.textMuted, fontSize: 11, marginTop: spacing(5) },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, gap: 14 },
  message: { fontFamily: type.body, color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: "center" },
  input: {
    width: "100%",
    fontFamily: type.body,
    color: colors.textPrimary,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBtn: { borderRadius: radius.pill, paddingVertical: 11, paddingHorizontal: 26 },
  searchBtnLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 14 },
  wrongRow: { alignItems: "center", paddingVertical: 14 },
  wrongLabel: { fontFamily: type.body, color: colors.textMuted, fontSize: 12 },
});
