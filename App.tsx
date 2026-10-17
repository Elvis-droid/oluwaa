import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts as useSora,
  Sora_600SemiBold,
  Sora_700Bold,
} from "@expo-google-fonts/sora";
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";

import { setupTrackPlayer, setGlobalArtwork } from "./src/services/TrackPlayerService";
import { hasCompletedOnboarding, getProfile } from "./src/services/appState";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { colors } from "./src/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [soraLoaded] = useSora({ Sora_600SemiBold, Sora_700Bold });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await setupTrackPlayer();
        const profile = await getProfile();
        setGlobalArtwork(profile.photoUri);
        setOnboarded(await hasCompletedOnboarding());
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const onLayout = useCallback(async () => {
    if (ready && soraLoaded && interLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [ready, soraLoaded, interLoaded]);

  if (!ready || !soraLoaded || !interLoaded) {
    return <View style={styles.blank} />;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.blank} onLayout={onLayout}>
        <StatusBar style="light" />
        {onboarded ? (
          <RootNavigator />
        ) : (
          <OnboardingScreen onDone={() => setOnboarded(true)} />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: colors.bg },
});
