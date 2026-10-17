import React, { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenBackground } from "../components/ScreenBackground";
import { ensureMediaPermission } from "../services/deviceLibrary";
import { getProfile, setProfile } from "../services/appState";
import { setGlobalArtwork } from "../services/TrackPlayerService";
import { Profile } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

export function MeScreen() {
  const [profile, setProfileState] = useState<Profile>({ name: "Listener", photoUri: null });
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfileState);
    }, [])
  );

  const changePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const next = { ...profile, photoUri: result.assets[0].uri };
      setProfileState(next);
      await setProfile(next);
      setGlobalArtwork(next.photoUri);
    }
  };

  const startEditName = () => {
    setDraftName(profile.name);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = draftName.trim();
    const next = { ...profile, name: trimmed || profile.name };
    setProfileState(next);
    await setProfile(next);
    setEditingName(false);
  };

  return (
    <ScreenBackground>
      <View style={styles.header}>
        <Pressable onPress={changePhoto} style={styles.avatarWrap}>
          {profile.photoUri ? (
            <Image source={{ uri: profile.photoUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={30} color={colors.textPrimary} />
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="camera" size={13} color={colors.bg} />
          </View>
        </Pressable>

        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              value={draftName}
              onChangeText={setDraftName}
              style={styles.nameInput}
              autoFocus
              onSubmitEditing={saveName}
              returnKeyType="done"
            />
            <Pressable onPress={saveName} hitSlop={10}>
              <Ionicons name="checkmark-circle" size={24} color={colors.brandBright} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={startEditName} style={styles.nameRow}>
            <Text style={styles.name}>{profile.name}</Text>
            <Ionicons name="pencil" size={14} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      <View style={styles.section}>
        <Pressable style={styles.row} onPress={ensureMediaPermission}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          <Text style={styles.rowLabel}>Re-check media access</Text>
        </Pressable>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.rowLabel}>
            Oluwaa reads audio live from your device — nothing is copied or stored.
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>created by chinula @ FUSEBOX♤</Text>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: spacing(16), paddingBottom: spacing(6) },
  avatarWrap: { position: "relative" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.pill,
  },
  avatarPlaceholder: {
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.brandBright,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.bg,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: spacing(3),
  },
  name: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 18 },
  nameEditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: spacing(3),
    width: "70%",
  },
  nameInput: {
    flex: 1,
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    paddingVertical: 2,
  },
  section: { paddingHorizontal: 20, gap: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  rowLabel: { fontFamily: type.body, color: colors.textSecondary, fontSize: 13, flex: 1, lineHeight: 18 },
  footer: { marginTop: "auto", alignItems: "center", paddingVertical: spacing(6) },
  footerText: { fontFamily: type.body, color: colors.textMuted, fontSize: 12 },
});
