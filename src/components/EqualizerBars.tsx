import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

type Props = {
  playing: boolean;
  color?: string;
};

function Bar({ anim, color }: { anim: Animated.Value; color: string }) {
  const height = anim.interpolate({ inputRange: [0, 1], outputRange: [4, 14] });
  return <Animated.View style={[styles.bar, { height, backgroundColor: color }]} />;
}

export function EqualizerBars({ playing, color = colors.brandBright }: Props) {
  const a1 = useRef(new Animated.Value(0.3)).current;
  const a2 = useRef(new Animated.Value(0.6)).current;
  const a3 = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const make = (v: Animated.Value, duration: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration, easing: Easing.ease, useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.15, duration, easing: Easing.ease, useNativeDriver: false }),
        ])
      );
    const loops = [make(a1, 260), make(a2, 340), make(a3, 300)];
    if (playing) {
      loops.forEach((l) => l.start());
    } else {
      loops.forEach((l) => l.stop());
    }
    return () => loops.forEach((l) => l.stop());
  }, [playing]);

  return (
    <View style={styles.wrap}>
      <Bar anim={a1} color={color} />
      <Bar anim={a2} color={color} />
      <Bar anim={a3} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 22,
    height: 16,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 3,
  },
  bar: { width: 3, borderRadius: 2 },
});
