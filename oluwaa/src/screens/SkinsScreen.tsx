import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

import { ScreenBackground } from "../components/ScreenBackground";
import { skins } from "../theme/skins";
import { getSkin, setSkin } from "../services/appState";
import { SkinId } from "../types";
import { colors, radius, type, spacing } from "../theme/colors";

export function SkinsScreen() {
  const navigation = useNavigation();
  const [active, setActive] = useState<SkinId>("default");

  useEffect(() => {
    getSkin().then(setActive);
  }, []);

  const choose = async (id: SkinId) => {
    setActive(id);
    await setSkin(id);
  };

  return (
    <ScreenBackground>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle}>Player skins</Text>
        <View style={{ width: 26 }} />
      </View>

      <FlatList
        style={styles.gridList}
        data={skins}
        keyExtractor={(s) => s.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 14 }}
        renderItem={({ item }) => {
          const isActive = item.id === active;
          return (
            <Pressable style={styles.card} onPress={() => choose(item.id)}>
              <ImageBackground
                source={item.background}
                style={styles.preview}
                imageStyle={{ borderRadius: radius.lg }}
              >
                <LinearGradient
                  colors={[...item.gradient, colors.bg] as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { opacity: 0.55, borderRadius: radius.lg }]}
                />
                <View style={styles.previewArt} />
                <View style={styles.previewControls}>
                  <Ionicons name="play-skip-back" size={12} color="#fff" />
                  <View style={styles.previewPlay}>
                    <Ionicons name="play" size={12} color={colors.bg} />
                  </View>
                  <Ionicons name="play-skip-forward" size={12} color="#fff" />
                </View>
              </ImageBackground>
              <Text style={styles.label}>{item.label}</Text>
              {isActive ? (
                <View style={styles.inUseBtn}>
                  <Text style={styles.inUseLabel}>In use</Text>
                </View>
              ) : (
                <Pressable style={styles.useBtn} onPress={() => choose(item.id)}>
                  <Text style={styles.useLabel}>Use skin</Text>
                </Pressable>
              )}
            </Pressable>
          );
        }}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: spacing(12),
    paddingBottom: spacing(4),
  },
  topBarTitle: { fontFamily: type.displayBold, color: colors.textPrimary, fontSize: 18 },
  gridList: { flex: 1 },
  grid: { paddingHorizontal: 20, paddingBottom: 40, gap: 14 },
  card: { flex: 1 },
  preview: {
    height: 150,
    borderRadius: radius.lg,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  previewArt: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginBottom: 10,
  },
  previewControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  previewPlay: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontFamily: type.bodySemiBold,
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: 8,
  },
  useBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.brandBright,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  useLabel: { fontFamily: type.bodySemiBold, color: colors.bg, fontSize: 11 },
  inUseBtn: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.hairline,
  },
  inUseLabel: { fontFamily: type.bodySemiBold, color: colors.textMuted, fontSize: 11 },
});
