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
import { defaultSearchText, guessQuery } from "../services/lyrics";
import { ShareLyricsModal } from "./ShareLyricsModal";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  trackId?: string;
  title: string;
  duration: number;
  position: number;
  accent: string;
};

type Row = { text: string; time: number | null };

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
  const [selected, setSelected] = useState<number[]>([]);
  const [shareOpen, setShareOpen] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const lineY = useRef<number[]>([]);

  useEffect(() => {
    setSearchText(defaultSearchText(title));
    setEditing(false);
    setSelected([]);
  }, [title]);

  const synced = state.status === "found" ? state.data.synced : null;
  const plain = state.status === "found" ? state.data.plain : null;

  // Synced and plain lyrics share one row model so both can be selected.
  const rows = useMemo<Row[]>(() => {
    if (synced) return synced.map((l) => ({ text: l.text, time: l.time }));
    if (plain) return plain.split(/\r?\n/).map((t) => ({ text: t.trim(), time: null }));
    return [];
  }, [synced, plain]);

  const times = useMemo(() => (synced ? synced.map((l) => l.time) : []), [synced]);
  const activeIndex = synced ? activeIndexFor(times, position) : -1;
  const selecting = selected.length > 0;

  // Keep the current line centred while the sheet is open — but not while
  // the user is picking lines, so the list doesn't move under their finger.
  useEffect(() => {
    if (!open || selecting || activeIndex < 0) return;
    const y = lineY.current[activeIndex];
    if (y !== undefined) scrollRef.current?.scrollTo({ y: Math.max(0, y - 140), animated: true });
  }, [activeIndex, open, selecting]);

  const closeSheet = () => {
    setOpen(false);
    setSelected([]);
  };

  const toggleSelected = (i: number) =>
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const onRowPress = (row: Row, i: number) => {
    if (selecting) {
      if (row.text) toggleSelected(i);
    } else if (row.time !== null) {
      TrackPlayer.seekTo(row.time);
    }
  };

  const onRowLongPress = (row: Row, i: number) => {
    if (row.text && !selected.includes(i)) setSelected((prev) => [...prev, i]);
  };

  const selectedText = [...selected]
    .sort((a, b) => a - b)
    .map((i) => rows[i]?.text)
    .filter(Boolean)
    .join("\n");

  const guessed = guessQuery(title);
  const cardTitle = state.status === "found" ? state.data.matchedTitle : guessed.title || title;
  const cardArtist =
    (state.status === "found" ? state.data.matchedArtist : "") || guessed.artist || "Unknown artist";

  let preview = "Lyrics";
  if (state.status === "loading") preview = "Looking for lyrics…";
  else if (state.status === "notFound") preview = "Lyrics not found — tap to search";
  else if (state.status === "offline") preview = "No connection — tap to retry";
  else if (synced) preview = activeIndex >= 0 && synced[activeIndex].text ? synced[activeIndex].text : "♪";
  else if (plain) preview = "Tap to read lyrics";

  const showSearchForm = state.status === "notFound" || state.status === "offline" || editing;
  const showLyrics = state.status === "found" && !editing && rows.length > 0;

  const submitSearch = () => {
    setEditing(false);
    setSelected([]);
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

      <Modal visible={open} transparent animationType="slide" onRequestClose={closeSheet}>
        <Pressable style={styles.scrim} onPress={closeSheet}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHeader}>
              <Pressable onPress={closeSheet} hitSlop={12}>
                <Ionicons name="chevron-down" size={24} color={colors.textPrimary} />
              </Pressable>
              <View style={styles.sheetTitleWrap}>
                <Text numberOfLines={1} style={styles.sheetTitle}>
                  {cardTitle}
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

            {showLyrics && (
              <ScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.lines}
                showsVerticalScrollIndicator={false}
              >
                {rows.map((row, i) => {
                  const isSelected = selected.includes(i);
                  const isBlank = !row.text;
                  if (!synced && isBlank) return <View key={i} style={styles.spacer} />;
                  return (
                    <Pressable
                      key={`${row.time ?? "p"}-${i}`}
                      onLayout={(e) => {
                        lineY.current[i] = e.nativeEvent.layout.y;
                      }}
                      onPress={() => onRowPress(row, i)}
                      onLongPress={() => onRowLongPress(row, i)}
                      delayLongPress={300}
                      style={[styles.row, isSelected && { backgroundColor: accent + "33" }]}
                    >
                      <Text
                        style={[
                          synced ? styles.line : styles.plainLine,
                          synced && i === activeIndex && { color: accent, fontSize: 21 },
                          synced && i < activeIndex && styles.linePast,
                          isSelected && styles.lineSelected,
                        ]}
                      >
                        {row.text || "♪"}
                      </Text>
                    </Pressable>
                  );
                })}
                {!synced && (
                  <Text style={styles.footnote}>
                    This version isn't time-synced, so lines don't follow the song.
                  </Text>
                )}
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

            {selecting ? (
              <View style={styles.selectBar}>
                <Pressable onPress={() => setSelected([])} hitSlop={8} style={styles.cancelBtn}>
                  <Text style={styles.cancelLabel}>Cancel</Text>
                </Pressable>
                <Text style={styles.selectCount}>
                  {selected.length} {selected.length === 1 ? "line" : "lines"} selected
                </Text>
                <Pressable
                  onPress={() => setShareOpen(true)}
                  style={[styles.shareBtn, { backgroundColor: accent }]}
                >
                  <Ionicons name="share-social" size={16} color={colors.bg} />
                  <Text style={styles.shareLabel}>Share</Text>
                </Pressable>
              </View>
            ) : (
              showLyrics && (
                <View style={styles.footer}>
                  <Text style={styles.hint}>Hold a line to select it and share</Text>
                  <Pressable onPress={() => setEditing(true)} hitSlop={8}>
                    <Text style={styles.wrongLabel}>Wrong lyrics? Edit the search</Text>
                  </Pressable>
                </View>
              )
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <ShareLyricsModal
        visible={shareOpen}
        lyrics={selectedText}
        title={cardTitle}
        artist={cardArtist}
        onClose={() => setShareOpen(false)}
        onShared={() => {
          setShareOpen(false);
          setSelected([]);
        }}
      />
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
  scroll: { flex: 1 },
  lines: { paddingHorizontal: 24, paddingTop: spacing(6), paddingBottom: spacing(10) },
  row: { borderRadius: 10, paddingHorizontal: 8, marginHorizontal: -8, marginBottom: 6 },
  spacer: { height: 14 },
  line: { fontFamily: type.displayBold, color: colors.textSecondary, fontSize: 18, lineHeight: 28, paddingVertical: 4 },
  linePast: { color: colors.textMuted },
  lineSelected: { color: colors.textPrimary },
  plainLine: { fontFamily: type.body, color: colors.textPrimary, fontSize: 16, lineHeight: 26, paddingVertical: 2 },
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
  footer: { alignItems: "center", paddingVertical: 12, gap: 6 },
  hint: { fontFamily: type.body, color: colors.textSecondary, fontSize: 12 },
  wrongLabel: { fontFamily: type.body, color: colors.textMuted, fontSize: 12 },
  selectBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
    backgroundColor: colors.bgCard,
  },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 4 },
  cancelLabel: { fontFamily: type.bodySemiBold, color: colors.textSecondary, fontSize: 14 },
  selectCount: { fontFamily: type.body, color: colors.textSecondary, fontSize: 13 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  shareLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 14 },
});
