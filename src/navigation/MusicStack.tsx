import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MusicStackParamList } from "../types";
import { HomeScreen } from "../screens/HomeScreen";
import { NowPlayingScreen } from "../screens/NowPlayingScreen";
import { QueueScreen } from "../screens/QueueScreen";
import { SkinsScreen } from "../screens/SkinsScreen";
import { PlaylistDetailScreen } from "../screens/PlaylistDetailScreen";
import { AlbumSongsScreen } from "../screens/AlbumSongsScreen";

const Stack = createNativeStackNavigator<MusicStackParamList>();

export function MusicStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="NowPlaying"
        component={NowPlayingScreen}
        options={{ presentation: "card", animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="Queue"
        component={QueueScreen}
        options={{ presentation: "modal", animation: "slide_from_bottom" }}
      />
      <Stack.Screen name="Skins" component={SkinsScreen} />
      <Stack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <Stack.Screen name="AlbumSongs" component={AlbumSongsScreen} />
    </Stack.Navigator>
  );
}
