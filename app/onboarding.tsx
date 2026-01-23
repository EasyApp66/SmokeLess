
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  console.log('OnboardingScreen: Rendering onboarding screen');
  const colorScheme = useColorScheme();
  const router = useRouter();

  const orb1Scale = useSharedValue(1);
  const orb1Opacity = useSharedValue(0.3);
  const orb2Scale = useSharedValue(1);
  const orb2Opacity = useSharedValue(0.3);
  const orb3Rotate = useSharedValue(0);

  useEffect(() => {
    console.log('OnboardingScreen: Starting orb animations');
    orb1Scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.6, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb2Scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb2Opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    orb3Rotate.value = withRepeat(
      withTiming(360, { duration: 120000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: orb1Scale.value }],
      opacity: orb1Opacity.value,
    };
  });

  const orb2Style = useAnimatedStyle(() => {
    return {
      transform: [{ scale: orb2Scale.value }],
      opacity: orb2Opacity.value,
    };
  });

  const orb3Style = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${orb3Rotate.value}deg` }],
      opacity: 0.4,
    };
  });

  const handleStart = async () => {
    console.log('OnboardingScreen: User tapped "Los geht\'s" button');
    try {
      await AsyncStorage.setItem('smoke-onboarding-completed', 'true');
      console.log('OnboardingScreen: Onboarding completed, navigating to home');
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('OnboardingScreen: Error saving onboarding state:', error);
    }
  };

  const handleSkip = async () => {
    console.log('OnboardingScreen: User tapped "Überspringen" link');
    try {
      await AsyncStorage.setItem('smoke-onboarding-completed', 'true');
      console.log('OnboardingScreen: Onboarding skipped, navigating to home');
      router.replace('/(tabs)/(home)/');
    } catch (error) {
      console.error('OnboardingScreen: Error saving onboarding state:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['rgb(29, 200, 130)', 'rgb(51, 204, 153)', 'rgb(174, 217, 38)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.orb1, orb1Style]} />
        <Animated.View style={[styles.orb2, orb2Style]} />
        <Animated.View style={[styles.orb3, orb3Style]} />

        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Smoke</Text>
            
            <View style={styles.textContainer}>
              <Text style={styles.subtitle}>Reduziere in deinem Tempo.</Text>
              
              <Text style={styles.description}>
                Lege deine Wach-Zeiten fest → wähle dein Tagesziel → erhalte sanfte Erinnerungen.
              </Text>
              
              <Text style={styles.description}>
                Weniger Zigaretten = längere Pausen = mehr Erfolg.
              </Text>
              
              <Text style={styles.encouragement}>Du schaffst das.</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.startButtonText}>Los geht&apos;s</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleSkip} activeOpacity={0.6}>
                <Text style={styles.skipText}>Überspringen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  orb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orb2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  orb3: {
    position: 'absolute',
    top: height * 0.3,
    left: width * 0.2,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  title: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 40,
    letterSpacing: -2,
  },
  textContainer: {
    alignItems: 'center',
    gap: 24,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  description: {
    fontSize: 18,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  encouragement: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 16,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  startButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgb(29, 200, 130)',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textDecorationLine: 'underline',
  },
});
