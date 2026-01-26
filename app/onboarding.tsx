
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Modal,
  ScrollView,
  ActivityIndicator,
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
import * as Application from 'expo-application';
import * as Device from 'expo-device';

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

  const [showLegalModal, setShowLegalModal] = React.useState(false);
  const [isStarting, setIsStarting] = React.useState(false);

  const generateDeviceId = async () => {
    console.log('OnboardingScreen: Generating unique device ID');
    try {
      let deviceId = await AsyncStorage.getItem('smoke-device-id');
      
      if (!deviceId) {
        const androidId = Application.getAndroidId();
        const deviceName = Device.modelName || 'unknown';
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substr(2, 9);
        
        deviceId = `${androidId || deviceName}-${timestamp}-${randomPart}`;
        
        await AsyncStorage.setItem('smoke-device-id', deviceId);
        console.log('OnboardingScreen: Generated and stored device ID:', deviceId);
      } else {
        console.log('OnboardingScreen: Using existing device ID:', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('OnboardingScreen: Error generating device ID:', error);
      const fallbackId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem('smoke-device-id', fallbackId);
      return fallbackId;
    }
  };

  const handleStart = async () => {
    console.log('OnboardingScreen: User tapped "GO" button - Starting onboarding completion');
    setIsStarting(true);
    
    try {
      console.log('OnboardingScreen: Step 1 - Generating device ID');
      await generateDeviceId();
      
      console.log('OnboardingScreen: Step 2 - Setting onboarding completed flag');
      await AsyncStorage.setItem('smoke-onboarding-completed', 'true');
      
      console.log('OnboardingScreen: Step 3 - Verifying AsyncStorage write');
      const verification = await AsyncStorage.getItem('smoke-onboarding-completed');
      console.log('OnboardingScreen: Verification result:', verification);
      
      if (verification === 'true') {
        console.log('OnboardingScreen: ✅ Onboarding completed successfully, navigating to home screen');
        
        setTimeout(() => {
          router.replace('/(tabs)/(home)');
          console.log('OnboardingScreen: Navigation command executed');
        }, 100);
      } else {
        console.error('OnboardingScreen: ❌ Failed to verify onboarding completion');
        router.replace('/(tabs)/(home)');
      }
    } catch (error) {
      console.error('OnboardingScreen: ❌ Error during onboarding:', error);
      router.replace('/(tabs)/(home)');
    } finally {
      setTimeout(() => {
        setIsStarting(false);
      }, 500);
    }
  };

  const handleLegalPress = () => {
    console.log('OnboardingScreen: User tapped legal text link');
    setShowLegalModal(true);
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
              <Text style={styles.title}>{titleLine1}</Text>
              <Text style={styles.title}>{titleLine2}</Text>
            </View>
            
            <View style={styles.textContainer}>
              <Text style={styles.description}>{descLine1}</Text>
              <Text style={styles.description}>{descLine2}</Text>
              <Text style={styles.description}>{descLine3}</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStart}
                activeOpacity={0.8}
                disabled={isStarting}
              >
                {isStarting ? (
                  <ActivityIndicator color="rgb(15, 105, 65)" />
                ) : (
                  <Text style={styles.startButtonText}>GO</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLegalPress} activeOpacity={0.6}>
                <Text style={styles.legalText}>
                  Durch Fortfahren akzeptieren Sie unsere Nutzungsbedingungen (AGB), Datenschutzerklärung und rechtlichen Bedingungen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>

        <Modal
          visible={showLegalModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowLegalModal(false)}
        >
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }]}>
                Rechtliche Informationen
              </Text>
              <TouchableOpacity onPress={() => setShowLegalModal(false)} style={styles.closeButton}>
                <Text style={[styles.closeButtonText, { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
              <View style={styles.legalSection}>
                <Text style={[styles.legalSectionTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }]}>
                  AGB / Nutzungsbedingungen
                </Text>
                <Text style={[styles.legalSectionText, { color: colorScheme === 'dark' ? '#CCCCCC' : '#333333' }]}>
                  Willkommen bei Smoke on Smoke Less. Durch die Nutzung dieser Anwendung stimmen Sie den folgenden Bedingungen zu:{'\n\n'}
                  1. Diese App soll Ihnen helfen, das Rauchen schrittweise durch geplante Erinnerungen zu reduzieren.{'\n'}
                  2. Sie sind dafür verantwortlich, Ihre eigenen Ziele zu setzen und den Erinnerungen zu folgen.{'\n'}
                  3. Die App bietet keine medizinische Beratung. Konsultieren Sie einen Arzt für medizinische Beratung.{'\n'}
                  4. Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu aktualisieren.{'\n'}
                  5. Sie müssen mindestens 18 Jahre alt sein, um diese App zu nutzen.{'\n'}
                  6. Die App wird &quot;wie besehen&quot; ohne jegliche Garantien bereitgestellt.{'\n\n'}
                  Durch die weitere Nutzung der App akzeptieren Sie diese Bedingungen vollständig.
                </Text>
              </View>

              <View style={styles.legalSection}>
                <Text style={[styles.legalSectionTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }]}>
                  Datenschutzerklärung
                </Text>
                <Text style={[styles.legalSectionText, { color: colorScheme === 'dark' ? '#CCCCCC' : '#333333' }]}>
                  Ihre Privatsphäre ist uns wichtig. Diese Datenschutzerklärung erklärt, welche Daten wir sammeln und wie wir sie verwenden:{'\n\n'}
                  <Text style={styles.boldText}>Datenerfassung:</Text>{'\n'}
                  • Wir erfassen nur Ihre Benutzer-ID für die App-Funktionalität{'\n'}
                  • Wir erfassen NICHT Ihren Namen, E-Mail, Telefonnummer, Standort oder andere persönliche Daten{'\n'}
                  • Wir können allgemeine Nutzerverhaltensmuster nur in anonymisierter oder aggregierter Form beobachten und analysieren{'\n\n'}
                  <Text style={styles.boldText}>Datennutzung:</Text>{'\n'}
                  • Ihre Benutzer-ID wird ausschließlich zur Speicherung Ihres Rauchreduktionsplans und Fortschritts verwendet{'\n'}
                  • Anonymisierte Nutzungsdaten können zur Verbesserung der App-Erfahrung verwendet werden{'\n'}
                  • Wir teilen Ihre Daten NICHT mit Dritten{'\n'}
                  • Wir verkaufen Ihre Daten NICHT{'\n\n'}
                  <Text style={styles.boldText}>Datensicherheit:</Text>{'\n'}
                  • Ihre Daten werden sicher gespeichert{'\n'}
                  • Sie können alle Ihre Daten jederzeit über den Einstellungsbildschirm löschen{'\n\n'}
                  <Text style={styles.boldText}>Ihre Rechte:</Text>{'\n'}
                  • Sie haben das Recht auf Zugriff auf Ihre Daten{'\n'}
                  • Sie haben das Recht, Ihre Daten zu löschen{'\n'}
                  • Sie haben das Recht, Ihre Einwilligung jederzeit zu widerrufen{'\n\n'}
                  Für Fragen zu Ihrer Privatsphäre kontaktieren Sie uns unter: ivanmirosnic006@gmail.com
                </Text>
              </View>

              <View style={styles.legalSection}>
                <Text style={[styles.legalSectionTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#000000' }]}>
                  Impressum
                </Text>
                <Text style={[styles.legalSectionText, { color: colorScheme === 'dark' ? '#CCCCCC' : '#333333' }]}>
                  <Text style={styles.boldText}>Verantwortliche Person / Eigentümer:</Text>{'\n'}
                  Ivan Mirosnic (auch bekannt als Nugat / Ivan Mirosnic Nugat){'\n\n'}
                  <Text style={styles.boldText}>Adresse:</Text>{'\n'}
                  Ahornstrasse{'\n'}
                  8600 Dübendorf{'\n'}
                  Schweiz{'\n\n'}
                  <Text style={styles.boldText}>Kontakt:</Text>{'\n'}
                  E-Mail: ivanmirosnic006@gmail.com{'\n\n'}
                  <Text style={styles.boldText}>Gerichtsbarkeit:</Text>{'\n'}
                  Diese App wird nach Schweizer Recht betrieben. Alle Streitigkeiten werden unter der Gerichtsbarkeit der Schweizer Gerichte gelöst.{'\n\n'}
                  <Text style={styles.boldText}>Haftungsausschluss:</Text>{'\n'}
                  Der Inhalt dieser App dient nur zu Informationszwecken. Wir geben keine Zusicherungen oder Garantien jeglicher Art hinsichtlich der Richtigkeit, Vollständigkeit oder Eignung der bereitgestellten Informationen. Die Nutzung dieser App erfolgt auf eigenes Risiko.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
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
  },
  title: {
    fontSize: 57,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'left',
    letterSpacing: -1,
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
    color: 'rgb(15, 105, 65)',
  },
  legalText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    textDecorationLine: 'underline',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: '400',
  },
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  legalSection: {
    marginBottom: 32,
  },
  legalSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  legalSectionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  boldText: {
    fontWeight: '700',
  },
});
