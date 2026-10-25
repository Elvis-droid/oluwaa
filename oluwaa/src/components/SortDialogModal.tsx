import React, { useState, useEffect } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { SortDirection, SortField, SortPref } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

type Props = {
  visible: boolean;
  value: SortPref;
  onCancel: () => void;
  onConfirm: (pref: SortPref) => void;
};

const FIELDS: { value: SortField; label: string }[] = [
  { value: "date", label: "Date" },
  { value: "name", label: "Name" },
  { value: "size", label: "Size" },
  { value: "length", label: "Length" },
];

const DIRECTIONS: { value: SortDirection; label: string }[] = [
  { value: "newOld", label: "From new to old" },
  { value: "oldNew", label: "From old to new" },
];

function RadioRow<T extends string>({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.radioRow} onPress={onPress}>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={20}
        color={selected ? colors.brandBright : colors.textMuted}
      />
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

export function SortDialogModal({ visible, value, onCancel, onConfirm }: Props) {
  const [field, setField] = useState<SortField>(value.field);
  const [direction, setDirection] = useState<SortDirection>(value.direction);

  useEffect(() => {
    if (visible) {
      setField(value.field);
      setDirection(value.direction);
    }
  }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.scrim} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>Sort by</Text>

          {FIELDS.map((f) => (
            <RadioRow
              key={f.value}
              label={f.label}
              selected={field === f.value}
              onPress={() => setField(f.value)}
            />
          ))}

          <View style={styles.divider} />

          {DIRECTIONS.map((d) => (
            <RadioRow
              key={d.value}
              label={d.label}
              selected={direction === d.value}
              onPress={() => setDirection(d.value)}
            />
          ))}

          <View style={styles.actionsRow}>
            <Pressable onPress={onCancel} style={styles.btn}>
              <Text style={styles.btnLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm({ field, direction })}
              style={[styles.btn, styles.btnPrimary]}
            >
              <Text style={[styles.btnLabel, styles.btnPrimaryLabel]}>OK</Text>
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
    marginBottom: spacing(2),
  },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  radioLabel: { fontFamily: type.body, color: colors.textPrimary, fontSize: 14 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.hairline,
    marginVertical: spacing(2),
  },
  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 16, marginTop: spacing(4) },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.md },
  btnLabel: { fontFamily: type.bodySemiBold, color: colors.textSecondary, fontSize: 14 },
  btnPrimary: { backgroundColor: colors.brandBright },
  btnPrimaryLabel: { color: colors.bg },
});
