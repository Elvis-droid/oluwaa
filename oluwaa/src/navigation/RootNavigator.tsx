import React from "react";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { RootTabParamList } from "../types";
import { MusicStack } from "./MusicStack";
import { MeScreen } from "../screens/MeScreen";
import { colors } from "../theme/colors";

const Tab = createBottomTabNavigator<RootTabParamList>();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.textPrimary,
    border: colors.hairline,
  },
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.brandBright,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: { backgroundColor: colors.bgElevated, borderTopColor: colors.hairline },
        }}
      >
        <Tab.Screen
          name="MusicStack"
          component={MusicStack}
          options={{
            title: "Music",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="musical-notes" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Me"
          component={MeScreen}
          options={{
            title: "Me",
            tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} />,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
