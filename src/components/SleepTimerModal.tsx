import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, type, spacing } from "../theme/colors";

const OPTIONS = [10, 20, 30, 45, 60];

type Props = {
  visible: boolean;
  activeMinutes: number | null;
  onCancel: () => void;
  onSelect: (minutes: number | null) => void;
};

export function SleepTimerModal({ visible, activeMinutes, onCancel, onSelect }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Sleep timer</Text>
          {OPTIONS.map((mins) => (
            <Pressable key={mins} style={styles.row} onPress={() => onSelect(mins)}>
              <Text style={styles.rowLabel}>{mins} minutes</Text>
              {activeMinutes === mins && <View style={styles.dot} />}
            </Pressable>
          ))}
          {activeMinutes !== null && (
            <Pressable style={styles.row} onPress={() => onSelect(null)}>
              <Text style={[styles.rowLabel, { color: colors.danger }]}>Turn off</Text>
            </Pressable>
          )}
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
    marginBottom: spacing(2),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.hairline,
  },
  rowLabel: { fontFamily: type.body, color: colors.textPrimary, fontSize: 14 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brandBright },
});
