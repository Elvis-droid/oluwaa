import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { CARD_THEMES, CardTheme, LyricShareCard } from "./LyricShareCard";
import { getProfile } from "../services/appState";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  visible: boolean;
  lyrics: string;
  title: string;
  artist: string;
  onClose: () => void;
  onShared: () => void;
};

const CARD_WIDTH = Math.min(Dimensions.get("window").width - 48, 380);

export function ShareLyricsModal({ visible, lyrics, title, artist, onClose, onShared }: Props) {
  const cardRef = useRef<View>(null);
  const [theme, setTheme] = useState<CardTheme>(CARD_THEMES[0]);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) getProfile().then((p) => setPhotoUri(p.photoUri));
  }, [visible]);

  const share = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing unavailable", "This device can't open the share menu.");
        return;
      }
      // Render the card to a PNG in the cache folder, then hand it to the
      // system share sheet so it works with WhatsApp, Instagram, Telegram…
      const uri = await captureRef(cardRef, { format: "png", quality: 1, result: "tmpfile" });
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Share lyrics",
        UTI: "public.png",
      });
      onShared();
    } catch {
      Alert.alert("Couldn't share", "Something went wrong while creating the image. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.scrim}>
        <View style={styles.topBar}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={26} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.heading}>Share lyrics</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView
          style={styles.previewScroll}
          contentContainerStyle={styles.previewContent}
          showsVerticalScrollIndicator={false}
        >
          <LyricShareCard
            ref={cardRef}
            width={CARD_WIDTH}
            theme={theme}
            lyrics={lyrics}
            title={title}
            artist={artist}
            photoUri={photoUri}
          />
        </ScrollView>

        <View style={styles.swatches}>
          {CARD_THEMES.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTheme(t)}
              style={[styles.swatch, { backgroundColor: t.bg }, t.id === theme.id && styles.swatchActive]}
            />
          ))}
        </View>

        <Pressable
          onPress={share}
          disabled={busy}
          style={[styles.shareBtn, busy && { opacity: 0.6 }]}
        >
          {busy ? (
            <ActivityIndicator color={colors.bg} />
          ) : (
            <>
              <Ionicons name="share-social" size={18} color={colors.bg} />
              <Text style={styles.shareLabel}>Share</Text>
            </>
          )}
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: "rgba(6,6,10,0.96)", paddingTop: spacing(12), paddingBottom: spacing(8) },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: spacing(3),
  },
  heading: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 17 },
  previewScroll: { flex: 1 },
  previewContent: { alignItems: "center", justifyContent: "center", flexGrow: 1, paddingVertical: 8 },
  swatches: { flexDirection: "row", justifyContent: "center", gap: 12, marginVertical: spacing(5) },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: "transparent" },
  swatchActive: { borderColor: colors.textPrimary },
  shareBtn: {
    marginHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.brandBright,
    borderRadius: radius.pill,
    paddingVertical: 14,
  },
  shareLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 15 },
});
