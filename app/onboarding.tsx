
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  Platform,
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

export default function OnboardingScreen() {
  console.log('OnboardingScreen: Rendering onboarding screen');
  const colorScheme = useColorScheme();
  const router = useRouter();

  const orb1Scale = useSharedValue(1);
  const orb1Opacity = useSharedValue(0.3);
  const orb2Scale = useSharedValue(1);
  const orb2Opacity = useSharedValue(0.3);

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
  }, [orb1Scale, orb1Opacity, orb2Scale, orb2Opacity]);

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

  const handleGoPress = async () => {
    console.log('OnboardingScreen: User tapped GO button');
    try {
      await AsyncStorage.setItem('smoke-onboarding-completed', 'true');
      console.log('OnboardingScreen: Onboarding completed, navigating to home');
      router.replace('/(tabs)/(home)');
    } catch (error) {
      console.error('OnboardingScreen: Error during onboarding:', error);
      router.replace('/(tabs)/(home)');
    }
  };

  const titleLine1 = 'BE SMART';
  const titleLine2 = 'SMOKE LESS';
  const descLine1 = 'Lege deine Wach-Zeiten fest';
  const descLine2 = 'Wähle dein Tagesziel';
  const descLine3 = 'Erhalte sanfte Erinnerungen';

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['rgb(15, 105, 65)', 'rgb(25, 120, 80)', 'rgb(90, 135, 25)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <Animated.View style={[styles.orb1, orb1Style]} />
        <Animated.View style={[styles.orb2, orb2Style]} />

        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{titleLine1}</Text>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>{titleLine2}</Text>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.description}>{descLine1}</Text>
              <Text style={styles.description}>{descLine2}</Text>
              <Text style={styles.description}>{descLine3}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={handleGoPress}
                style={styles.goButton}
                activeOpacity={0.8}
              >
                <Text style={styles.goButtonText}>GO</Text>
              </TouchableOpacity>

              <Text style={[
                styles.legalText,
                Platform.OS === 'ios' && { fontSize: 10, lineHeight: 14 }
              ]}>
                Durch Fortfahren akzeptieren Sie unsere Nutzungsbedingungen (AGB), Datenschutzerklärung und rechtlichen Bedingungen
              </Text>
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
    alignItems: 'flex-start',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
  },
  orb1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  orb2: {
    position: 'absolute',
    bottom: -150,
    left: -150,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  titleContainer: {
    alignItems: 'flex-start',
    marginTop: 20,
    width: '100%',
  },
  title: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -0.5,
  },
  textContainer: {
    alignItems: 'flex-start',
    gap: 16,
  },
  description: {
    fontSize: 15,
    fontWeight: '900',
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'left',
    lineHeight: 28,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  goButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 60,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  goButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: 'rgb(15, 105, 65)',
    letterSpacing: 1,
  },
  legalText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
