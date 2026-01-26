
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { useColorScheme, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "react-native-reanimated";
import { useNetworkState } from "expo-network";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Log backend URL at app startup for debugging
const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "";
console.log('🔗 Backend URL configured:', BACKEND_URL);

SplashScreen.preventAutoHideAsync();

const customLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'rgb(245, 252, 248)',
    card: 'rgb(237, 247, 242)',
    text: 'rgb(29, 48, 38)',
    border: 'rgb(209, 227, 217)',
    primary: 'rgb(29, 200, 130)',
  },
};

const customDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: 'rgb(28, 28, 30)',
    card: 'rgb(36, 36, 38)',
    text: 'rgb(242, 242, 242)',
    border: 'rgb(51, 51, 54)',
    primary: 'rgb(29, 200, 130)',
  },
};

export default function RootLayout() {
  console.log('RootLayout: Initializing app');
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    if (loaded) {
      console.log('RootLayout: Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem('smoke-onboarding-completed');
        console.log('RootLayout: Onboarding status:', completed);
        setHasCompletedOnboarding(completed === 'true');
        setIsReady(true);
      } catch (error) {
        console.error('RootLayout: Error checking onboarding:', error);
        setIsReady(true);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isReady || !loaded) return;

    const inAuthGroup = segments[0] === 'onboarding';

    if (!hasCompletedOnboarding && !inAuthGroup) {
      console.log('RootLayout: Redirecting to onboarding');
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inAuthGroup) {
      console.log('RootLayout: Redirecting to home');
      router.replace('/(tabs)/(home)/');
    }
  }, [hasCompletedOnboarding, segments, isReady, loaded, router]);

  if (!loaded || !isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? customDarkTheme : customLightTheme}>
        <AuthProvider>
          <WidgetProvider>
            <SystemBars style={colorScheme === "dark" ? "light" : "dark"} />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          </WidgetProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
