import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  trackTitle: string;
};

export function LyricsDrawer({ trackTitle }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.handle} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.handleLabel}>Lyrics preview</Text>
        <Ionicons
          name={open ? "chevron-down" : "chevron-up"}
          size={18}
          color={colors.textSecondary}
        />
      </Pressable>
      {open && (
        <View style={styles.body}>
          <Text style={styles.placeholder}>
            No lyrics source is connected yet for "{trackTitle}". Wire up a
            lyrics provider here to populate this drawer.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing(3),
    marginHorizontal: 20,
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  handle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  handleLabel: { fontFamily: type.bodySemiBold, color: colors.textPrimary, fontSize: 13 },
  body: { paddingHorizontal: 16, paddingBottom: 16 },
  placeholder: {
    fontFamily: type.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
  },
});
