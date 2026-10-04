import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onCreate: (name: string) => void;
};

export function CreatePlaylistModal({ visible, onCancel, onCreate }: Props) {
  const [name, setName] = useState("");

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    setName("");
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>New playlist</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Playlist name"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <View style={styles.row}>
            <Pressable onPress={onCancel} style={styles.btn}>
              <Text style={styles.btnLabel}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} style={[styles.btn, styles.btnPrimary]}>
              <Text style={[styles.btnLabel, styles.btnPrimaryLabel]}>Create</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: colors.overlayScrim,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing(5),
  },
  title: {
    fontFamily: type.displayBold,
    color: colors.textPrimary,
    fontSize: 17,
    marginBottom: spacing(3),
  },
  input: {
    fontFamily: type.body,
    color: colors.textPrimary,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: spacing(4) },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.md },
  btnLabel: { fontFamily: type.bodySemiBold, color: colors.textSecondary, fontSize: 14 },
  btnPrimary: { backgroundColor: colors.brandBright },
  btnPrimaryLabel: { color: colors.bg },
});
