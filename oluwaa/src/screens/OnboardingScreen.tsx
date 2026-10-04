import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenBackground } from "../components/ScreenBackground";
import { setProfile } from "../services/appState";
import { setGlobalArtwork } from "../services/TrackPlayerService";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  onDone: () => void;
};

export function OnboardingScreen({ onDone }: Props) {
  const [name, setName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const finish = async () => {
    if (!photoUri) return; // required field
    setSaving(true);
    const profile = { name: name.trim() || "Listener", photoUri };
    await setProfile(profile);
    setGlobalArtwork(profile.photoUri);
    setSaving(false);
    onDone();
  };

  return (
    <ScreenBackground>
      <View style={styles.wrap}>
        <Text style={styles.eyebrow}>Welcome</Text>
        <Text style={styles.title}>Set up your profile</Text>
        <Text style={styles.subtitle}>
          Your photo is used as the music thumbnail throughout Oluwaa, since
          songs read live from your device don't carry their own cover art.
        </Text>

        <Pressable style={styles.photoPicker} onPress={pickPhoto}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={28} color={colors.textSecondary} />
            </View>
          )}
          <Text style={styles.photoLabel}>
            {photoUri ? "Change photo" : "Choose a photo (required)"}
          </Text>
        </Pressable>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your name (optional)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          returnKeyType="done"
        />

        <Pressable
          onPress={finish}
          disabled={!photoUri || saving}
          style={[styles.continueBtn, (!photoUri || saving) && styles.continueBtnDisabled]}
        >
          <Text style={styles.continueLabel}>
            {saving ? "Saving…" : "Continue"}
          </Text>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", paddingHorizontal: 28 },
  eyebrow: {
    fontFamily: type.bodySemiBold,
    color: colors.brandBright,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 26,
    textAlign: "center",
    marginTop: spacing(2),
  },
  subtitle: {
    fontFamily: type.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: spacing(3),
    marginBottom: spacing(8),
  },
  photoPicker: { alignItems: "center", marginBottom: spacing(6) },
  photo: { width: 120, height: 120, borderRadius: radius.pill },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  photoLabel: {
    fontFamily: type.bodySemiBold,
    color: colors.brandBright,
    fontSize: 13,
    marginTop: spacing(3),
  },
  input: {
    fontFamily: type.body,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: spacing(6),
  },
  continueBtn: {
    backgroundColor: colors.brandBright,
    borderRadius: radius.pill,
    paddingVertical: 14,
    alignItems: "center",
  },
  continueBtnDisabled: { opacity: 0.4 },
  continueLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 15 },
});
