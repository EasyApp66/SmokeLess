
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function SettingsScreen() {
  console.log('SettingsScreen: Rendering settings screen (iOS)');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const router = useRouter();

  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [darkModeEnabled, setDarkModeEnabled] = useState(isDark);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalContent, setLegalContent] = useState<'agb' | 'privacy' | 'terms' | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app-language');
      const savedDarkMode = await AsyncStorage.getItem('app-dark-mode');
      
      if (savedLanguage) {
        setLanguage(savedLanguage as 'de' | 'en');
      }
      if (savedDarkMode !== null) {
        setDarkModeEnabled(savedDarkMode === 'true');
      }
    } catch (error) {
      console.error('SettingsScreen: Error loading settings:', error);
    }
  };

  const handleLanguageChange = async () => {
    const newLanguage = language === 'de' ? 'en' : 'de';
    console.log('SettingsScreen: Changing language to', newLanguage);
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('app-language', newLanguage);
    } catch (error) {
      console.error('SettingsScreen: Error saving language:', error);
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    console.log('SettingsScreen: Toggling dark mode to', value);
    setDarkModeEnabled(value);
    try {
      await AsyncStorage.setItem('app-dark-mode', value.toString());
    } catch (error) {
      console.error('SettingsScreen: Error saving dark mode:', error);
    }
  };

  const handleDeleteData = () => {
    console.log('SettingsScreen: User tapped delete data');
    Alert.alert(
      language === 'de' ? 'Alle Daten löschen' : 'Delete All Data',
      language === 'de' 
        ? 'Möchten Sie wirklich alle Ihre Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.'
        : 'Are you sure you want to delete all your data? This action cannot be undone.',
      [
        {
          text: language === 'de' ? 'Abbrechen' : 'Cancel',
          style: 'cancel',
        },
        {
          text: language === 'de' ? 'Löschen' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            console.log('SettingsScreen: Deleting all data');
            try {
              await AsyncStorage.clear();
              console.log('SettingsScreen: Data deleted, redirecting to onboarding');
              router.replace('/onboarding');
            } catch (error) {
              console.error('SettingsScreen: Error deleting data:', error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    console.log('SettingsScreen: User tapped logout');
    Alert.alert(
      language === 'de' ? 'Abmelden' : 'Sign Out',
      language === 'de' 
        ? 'Möchten Sie sich wirklich abmelden?'
        : 'Are you sure you want to sign out?',
      [
        {
          text: language === 'de' ? 'Abbrechen' : 'Cancel',
          style: 'cancel',
        },
        {
          text: language === 'de' ? 'Abmelden' : 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            console.log('SettingsScreen: Logging out');
            try {
              await AsyncStorage.removeItem('smoke-onboarding-completed');
              console.log('SettingsScreen: Logged out, redirecting to onboarding');
              router.replace('/onboarding');
            } catch (error) {
              console.error('SettingsScreen: Error logging out:', error);
            }
          },
        },
      ]
    );
  };

  const openLegalModal = (type: 'agb' | 'privacy' | 'terms') => {
    console.log('SettingsScreen: Opening legal modal:', type);
    setLegalContent(type);
    setShowLegalModal(true);
  };

  const getLegalContent = () => {
    if (legalContent === 'agb') {
      return {
        title: language === 'de' ? 'AGB' : 'Terms of Use',
        content: language === 'de'
          ? 'Willkommen bei Smoke on Smoke Less. Durch die Nutzung dieser Anwendung stimmen Sie den folgenden Bedingungen zu:\n\n1. Diese App soll Ihnen helfen, das Rauchen schrittweise durch geplante Erinnerungen zu reduzieren.\n2. Sie sind dafür verantwortlich, Ihre eigenen Ziele zu setzen und den Erinnerungen zu folgen.\n3. Die App bietet keine medizinische Beratung. Konsultieren Sie einen Arzt für medizinische Beratung.\n4. Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu aktualisieren.\n5. Sie müssen mindestens 18 Jahre alt sein, um diese App zu nutzen.\n6. Die App wird "wie besehen" ohne jegliche Garantien bereitgestellt.\n\nDurch die weitere Nutzung der App akzeptieren Sie diese Bedingungen vollständig.'
          : 'Welcome to Smoke on Smoke Less. By using this application, you agree to the following terms:\n\n1. This app is designed to help you reduce smoking gradually through scheduled reminders.\n2. You are responsible for setting your own goals and following the reminders.\n3. The app does not provide medical advice. Consult a healthcare professional for medical guidance.\n4. We reserve the right to update these terms at any time.\n5. You must be 18 years or older to use this app.\n6. The app is provided "as is" without warranties of any kind.\n\nBy continuing to use the app, you accept these terms in full.',
      };
    } else if (legalContent === 'privacy') {
      return {
        title: language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy',
        content: language === 'de'
          ? 'Ihre Privatsphäre ist uns wichtig. Diese Datenschutzerklärung erklärt, welche Daten wir sammeln und wie wir sie verwenden:\n\nDatenerfassung:\n• Wir erfassen nur Ihre Benutzer-ID für die App-Funktionalität\n• Wir erfassen NICHT Ihren Namen, E-Mail, Telefonnummer, Standort oder andere persönliche Daten\n• Wir können allgemeine Nutzerverhaltensmuster nur in anonymisierter oder aggregierter Form beobachten und analysieren\n\nDatennutzung:\n• Ihre Benutzer-ID wird ausschließlich zur Speicherung Ihres Rauchreduktionsplans und Fortschritts verwendet\n• Anonymisierte Nutzungsdaten können zur Verbesserung der App-Erfahrung verwendet werden\n• Wir teilen Ihre Daten NICHT mit Dritten\n• Wir verkaufen Ihre Daten NICHT\n\nDatensicherheit:\n• Ihre Daten werden sicher gespeichert\n• Sie können alle Ihre Daten jederzeit über den Einstellungsbildschirm löschen\n\nIhre Rechte:\n• Sie haben das Recht auf Zugriff auf Ihre Daten\n• Sie haben das Recht, Ihre Daten zu löschen\n• Sie haben das Recht, Ihre Einwilligung jederzeit zu widerrufen\n\nFür Fragen zu Ihrer Privatsphäre kontaktieren Sie uns unter: ivanmirosnic006@gmail.com'
          : 'Your privacy is important to us. This Privacy Policy explains what data we collect and how we use it:\n\nData Collection:\n• We collect only your user ID for app functionality\n• We do NOT collect your name, email, phone number, location, or any other personal data\n• We may observe and analyze general user behavior patterns in anonymized or aggregated form only\n\nData Usage:\n• Your user ID is used solely to store your smoking reduction schedule and progress\n• Anonymized usage data may be used to improve the app experience\n• We do NOT share your data with third parties\n• We do NOT sell your data\n\nData Security:\n• Your data is stored securely\n• You can delete all your data at any time from the Settings screen\n\nYour Rights:\n• You have the right to access your data\n• You have the right to delete your data\n• You have the right to withdraw consent at any time\n\nFor questions about your privacy, contact us at: ivanmirosnic006@gmail.com',
      };
    } else {
      return {
        title: language === 'de' ? 'Nutzungsbedingungen' : 'Terms of Use',
        content: language === 'de'
          ? 'Verantwortliche Person / Eigentümer:\nIvan Mirosnic (auch bekannt als Nugat / Ivan Mirosnic Nugat)\n\nAdresse:\nAhornstrasse\n8600 Dübendorf\nSchweiz\n\nKontakt:\nE-Mail: ivanmirosnic006@gmail.com\n\nGerichtsbarkeit:\nDiese App wird nach Schweizer Recht betrieben. Alle Streitigkeiten werden unter der Gerichtsbarkeit der Schweizer Gerichte gelöst.\n\nHaftungsausschluss:\nDer Inhalt dieser App dient nur zu Informationszwecken. Wir geben keine Zusicherungen oder Garantien jeglicher Art hinsichtlich der Richtigkeit, Vollständigkeit oder Eignung der bereitgestellten Informationen. Die Nutzung dieser App erfolgt auf eigenes Risiko.'
          : 'Responsible Person / Owner:\nIvan Mirosnic (also known as Nugat / Ivan Mirosnic Nugat)\n\nAddress:\nAhornstrasse\n8600 Dübendorf\nSwitzerland\n\nContact:\nEmail: ivanmirosnic006@gmail.com\n\nJurisdiction:\nThis app is operated under Swiss law. Any disputes shall be resolved under the jurisdiction of Swiss courts.\n\nDisclaimer:\nThe content of this app is provided for informational purposes only. We make no representations or warranties of any kind regarding the accuracy, completeness, or suitability of the information provided. Use of this app is at your own risk.',
      };
    }
  };

  const texts = {
    de: {
      title: 'Einstellungen',
      schedule: 'Zeitplan für alle Tage',
      scheduleDesc: 'Änderungen auf alle Tage anwenden',
      display: 'Darstellung',
      darkMode: 'Hellmodus',
      language: 'Sprache',
      german: 'Deutsch',
      active: 'Aktiv',
      unlock: 'Mehr freischalten',
      lifetimeAccess: 'Lebenslanger Zugang',
      lifetimePrice: 'Einmaliger Kauf • 20 CHF',
      subscribe: 'Abonnieren',
      subscribePrice: '1 CHF / Monat • Eigene Themes, Statistiken & mehr',
      signOut: 'Abmelden',
      legal: 'Rechtliches',
      agb: 'AGB',
      privacy: 'Datenschutzerklärung',
      terms: 'Nutzungsbedingungen',
      deleteData: 'Alle Daten löschen',
    },
    en: {
      title: 'Settings',
      schedule: 'Schedule for all days',
      scheduleDesc: 'Apply changes to all days',
      display: 'Display',
      darkMode: 'Light Mode',
      language: 'Language',
      german: 'German',
      active: 'Active',
      unlock: 'Unlock More',
      lifetimeAccess: 'Lifetime Access',
      lifetimePrice: 'One-time purchase • 20 CHF',
      subscribe: 'Subscribe',
      subscribePrice: '1 CHF / Month • Custom themes, statistics & more',
      signOut: 'Sign Out',
      legal: 'Legal',
      agb: 'Terms of Use',
      privacy: 'Privacy Policy',
      terms: 'Terms and Conditions',
      deleteData: 'Delete All Data',
    },
  };

  const t = texts[language];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {t.title}
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <IconSymbol
              ios_icon_name="xmark.circle"
              android_material_icon_name="close"
              size={28}
              color={theme.text}
            />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>
                  {t.schedule}
                </Text>
              </View>
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                {t.scheduleDesc}
              </Text>
              <Switch
                value={false}
                onValueChange={() => {}}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t.display}
            </Text>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.settingRow}>
                <Text style={[styles.settingLabel, { color: theme.text }]}>
                  {t.darkMode}
                </Text>
                <Switch
                  value={darkModeEnabled}
                  onValueChange={handleDarkModeToggle}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t.language}
            </Text>
            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={handleLanguageChange}
            >
              <View style={styles.languageRow}>
                <IconSymbol
                  ios_icon_name="globe"
                  android_material_icon_name="language"
                  size={24}
                  color={theme.text}
                />
                <Text style={[styles.languageText, { color: theme.text }]}>
                  {language === 'de' ? t.german : 'English'}
                </Text>
                <Text style={[styles.activeText, { color: theme.primary }]}>
                  {t.active}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t.unlock}
            </Text>
            <TouchableOpacity
              style={[styles.premiumCard, { backgroundColor: theme.primary }]}
              onPress={() => console.log('SettingsScreen: Lifetime access tapped')}
            >
              <Text style={styles.premiumTitle}>
                {t.lifetimeAccess}
              </Text>
              <Text style={styles.premiumPrice}>
                {t.lifetimePrice}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.card, { backgroundColor: theme.card }]}
              onPress={() => console.log('SettingsScreen: Subscribe tapped')}
            >
              <Text style={[styles.subscribeTitle, { color: theme.text }]}>
                {t.subscribe}
              </Text>
              <Text style={[styles.subscribePrice, { color: theme.textSecondary }]}>
                {t.subscribePrice}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleLogout}
            >
              <Text style={[styles.signOutText, { color: theme.text }]}>
                {t.signOut}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.text}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t.legal}
            </Text>
            <TouchableOpacity
              style={[styles.legalRow, { borderBottomColor: theme.border }]}
              onPress={() => openLegalModal('agb')}
            >
              <Text style={[styles.legalText, { color: theme.text }]}>
                {t.agb}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.legalRow, { borderBottomColor: theme.border }]}
              onPress={() => openLegalModal('privacy')}
            >
              <Text style={[styles.legalText, { color: theme.text }]}>
                {t.privacy}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.legalRow}
              onPress={() => openLegalModal('terms')}
            >
              <Text style={[styles.legalText, { color: theme.text }]}>
                {t.terms}
              </Text>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).duration(400)} style={styles.section}>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteData}
            >
              <IconSymbol
                ios_icon_name="exclamationmark.triangle"
                android_material_icon_name="warning"
                size={20}
                color="#FF3B30"
              />
              <Text style={styles.deleteText}>
                {t.deleteData}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <Modal
        visible={showLegalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLegalModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {legalContent && getLegalContent().title}
            </Text>
            <TouchableOpacity onPress={() => setShowLegalModal(false)} style={styles.closeButton}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalContentContainer}>
            <Text style={[styles.modalText, { color: theme.text }]}>
              {legalContent && getLegalContent().content}
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  card: {
    borderRadius: 16,
    padding: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  premiumCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  subscribeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  subscribePrice: {
    fontSize: 13,
    fontWeight: '500',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  legalText: {
    fontSize: 16,
    fontWeight: '500',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
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
  modalContent: {
    flex: 1,
  },
  modalContentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
