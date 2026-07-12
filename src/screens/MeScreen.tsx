import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ScreenBackground } from "../components/ScreenBackground";
import { ensureMediaPermission } from "../services/deviceLibrary";
import { colors, radius, type, spacing } from "../theme/colors";

export function MeScreen() {
  return (
    <ScreenBackground>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={30} color={colors.textPrimary} />
        </View>
        <Text style={styles.name}>Listener</Text>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.row} onPress={ensureMediaPermission}>
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
          <Text style={styles.rowLabel}>Re-check media access</Text>
        </Pressable>
        <View style={styles.row}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.rowLabel}>Oluwaa reads audio live from your device — nothing is copied or stored.</Text>
        </View>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", paddingTop: spacing(16), paddingBottom: spacing(6) },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 18, marginTop: spacing(3) },
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
});
