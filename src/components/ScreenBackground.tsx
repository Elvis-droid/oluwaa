import React from "react";
import { ImageBackground, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../theme/colors";

export function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={require("../../assets/wave-background.jpg")}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={[colors.bg, "rgba(11,11,18,0.88)", colors.bg]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  bgImage: { opacity: 0.35 },
  content: { flex: 1 },
});
