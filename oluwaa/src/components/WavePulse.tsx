import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Path, Stop } from "react-native-svg";
import { colors } from "../theme/colors";

const AnimatedPath = Animated.createAnimatedComponent(Path);

type Props = {
  playing: boolean;
  height?: number;
};

/**
 * Three overlapping sine paths, colored with the wave-art gradient
 * (amber -> coral -> violet -> blue). When playing, each layer drifts
 * horizontally at a different speed to feel like the wave-background.jpg
 * artwork come to life. When paused, everything settles.
 */
export function WavePulse({ playing, height = 120 }: Props) {
  const t1 = useRef(new Animated.Value(0)).current;
  const t2 = useRef(new Animated.Value(0)).current;
  const t3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loops = [
      Animated.loop(
        Animated.timing(t1, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(t2, {
          toValue: 1,
          duration: 5600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ),
      Animated.loop(
        Animated.timing(t3, {
          toValue: 1,
          duration: 7000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ),
    ];

    if (playing) {
      loops.forEach((l) => l.start());
    } else {
      loops.forEach((l) => l.stop());
    }
    return () => loops.forEach((l) => l.stop());
  }, [playing]);

  const translate = (v: Animated.Value, distance: number) =>
    v.interpolate({ inputRange: [0, 1], outputRange: [0, -distance] });

  return (
    <View style={[styles.wrap, { height }]} pointerEvents="none">
      <Svg width="200%" height="100%" viewBox="0 0 720 120" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.waveAmber} stopOpacity={0.85} />
            <Stop offset="0.4" stopColor={colors.waveCoral} stopOpacity={0.75} />
            <Stop offset="0.7" stopColor={colors.waveViolet} stopOpacity={0.65} />
            <Stop offset="1" stopColor={colors.waveBlue} stopOpacity={0.5} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d="M0,60 C 90,10 180,110 360,60 S 630,10 720,60 L720,120 L0,120 Z"
          fill="url(#waveGrad)"
          opacity={0.9}
          style={{ transform: [{ translateX: translate(t1, 360) }] }}
        />
        <AnimatedPath
          d="M0,70 C 100,30 200,100 360,70 S 620,30 720,70 L720,120 L0,120 Z"
          fill="url(#waveGrad)"
          opacity={0.55}
          style={{ transform: [{ translateX: translate(t2, 360) }] }}
        />
        <AnimatedPath
          d="M0,80 C 80,50 220,95 360,80 S 640,50 720,80 L720,120 L0,120 Z"
          fill="url(#waveGrad)"
          opacity={0.35}
          style={{ transform: [{ translateX: translate(t3, 360) }] }}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: "100%", overflow: "hidden" },
});
