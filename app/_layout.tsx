
import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import { SystemBars } from "react-native-edge-to-edge";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFonts } from "expo-font";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SuperwallProvider } from "expo-superwall";
import "react-native-reanimated";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || "";
console.log('🔗 Backend URL configured:', BACKEND_URL);

// ⚠️ IMPORTANT: Replace this with your actual Superwall API key from https://superwall.com/dashboard
// Get your API key from: Superwall Dashboard → Settings → API Keys → iOS API Key
const SUPERWALL_API_KEY = "pk_d1c3c5e8e8f8e8e8e8e8e8e8e8e8e8e8";

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
  console.log('RootLayout: Initializing app with Superwall payment integration');
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
        console.log('RootLayout: Checking onboarding status from AsyncStorage');
        const completed = await AsyncStorage.getItem('smoke-onboarding-completed');
        console.log('RootLayout: Onboarding status retrieved:', completed);
        const isCompleted = completed === 'true';
        setHasCompletedOnboarding(isCompleted);
        setIsReady(true);
        console.log('RootLayout: App ready, onboarding completed:', isCompleted);
      } catch (error) {
        console.error('RootLayout: Error checking onboarding:', error);
        setIsReady(true);
      }
    };

    checkOnboarding();
  }, []);

  useEffect(() => {
    if (!isReady || !loaded) {
      console.log('RootLayout: Not ready yet, waiting... (isReady:', isReady, ', loaded:', loaded, ')');
      return;
    }

    const inOnboardingScreen = segments[0] === 'onboarding';
    const inTabsScreen = segments[0] === '(tabs)';

    console.log('RootLayout: Navigation check - segments:', segments, 'hasCompletedOnboarding:', hasCompletedOnboarding);

    if (!hasCompletedOnboarding && !inOnboardingScreen) {
      console.log('RootLayout: ➡️ User has not completed onboarding, redirecting to /onboarding');
      router.replace('/onboarding');
    } else if (hasCompletedOnboarding && inOnboardingScreen) {
      console.log('RootLayout: ➡️ User has completed onboarding but is on onboarding screen, redirecting to home');
      router.replace('/(tabs)/(home)');
    } else {
      console.log('RootLayout: ✅ User is on correct screen, no redirect needed');
    }
  }, [hasCompletedOnboarding, segments, isReady, loaded, router]);

  if (!loaded || !isReady) {
    console.log('RootLayout: Waiting for app to be ready...');
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SuperwallProvider
        apiKeys={{ ios: SUPERWALL_API_KEY }}
        onConfigurationError={(error) => {
          console.error('❌ Superwall configuration error:', error);
          console.error('⚠️ Make sure you have replaced SUPERWALL_API_KEY with your actual API key from Superwall dashboard');
        }}
      >
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
      </SuperwallProvider>
    </GestureHandlerRootView>
  );
}
