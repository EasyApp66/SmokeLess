
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsScreen() {
  console.log('SettingsScreen: Rendering settings screen');
  const systemColorScheme = useColorScheme();
  const [manualDarkMode, setManualDarkMode] = useState<boolean | null>(null);
  const [backgroundColor, setBackgroundColor] = useState<'white' | 'black' | 'gray'>('gray');
  
  useEffect(() => {
    const loadSettings = async () => {
      const saved = await AsyncStorage.getItem('app-dark-mode');
      if (saved !== null) {
        setManualDarkMode(saved === 'true');
      }
      const savedBg = await AsyncStorage.getItem('app-background-color');
      if (savedBg) {
        setBackgroundColor(savedBg as 'white' | 'black' | 'gray');
      }
    };
    loadSettings();
  }, []);

  const isDark = manualDarkMode !== null ? manualDarkMode : systemColorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;
  const router = useRouter();
  const { signOut, user } = useAuth();

  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app-language');
      
      if (savedLanguage) {
        setLanguage(savedLanguage as 'de' | 'en');
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

  const handleBackgroundColorChange = async (color: 'white' | 'black' | 'gray') => {
    console.log('SettingsScreen: Changing background color to', color);
    setBackgroundColor(color);
    try {
      await AsyncStorage.setItem('app-background-color', color);
      setTimeout(() => {
        router.replace('/(tabs)/settings');
      }, 100);
    } catch (error) {
      console.error('SettingsScreen: Error saving background color:', error);
    }
  };

  const handleDeleteData = () => {
    console.log('SettingsScreen: User tapped delete data');
    setShowLogoutModal(true);
  };

  const confirmDelete = async () => {
    console.log('SettingsScreen: Confirming delete');
    try {
      await AsyncStorage.clear();
      console.log('SettingsScreen: Data deleted, redirecting to welcome');
      setShowLogoutModal(false);
      router.replace('/onboarding');
    } catch (error) {
      console.error('SettingsScreen: Error deleting data:', error);
      setShowLogoutModal(false);
      router.replace('/onboarding');
    }
  };

  const handleLogout = () => {
    console.log('SettingsScreen: User tapped logout');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('SettingsScreen: Confirming logout');
    try {
      if (signOut) {
        await signOut();
      }
      await AsyncStorage.removeItem('smoke-onboarding-completed');
      console.log('SettingsScreen: Logged out, redirecting to welcome');
      setShowLogoutModal(false);
      router.replace('/onboarding');
    } catch (error) {
      console.error('SettingsScreen: Error logging out:', error);
      setShowLogoutModal(false);
      router.replace('/onboarding');
    }
  };

  const openLegalModal = () => {
    console.log('SettingsScreen: Opening legal modal');
    setShowLegalModal(true);
  };

  const texts = {
    de: {
      title: 'Einstellungen',
      schedule: 'Zeitplan für alle Tage',
      scheduleDesc: 'Änderungen auf alle Tage anwenden',
      setupDay: 'Morgen einrichten',
      setupDayDesc: 'Zeiten und Ziel für alle Tage festlegen',
      display: 'Darstellung',
      backgroundColor: 'Hintergrundfarbe',
      bgWhite: 'Weiß',
      bgBlack: 'Schwarz',
      bgGray: 'Grau',
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
      deleteData: 'Alle Daten löschen',
      logoutTitle: 'Abmelden',
      logoutMessage: 'Möchten Sie sich wirklich abmelden?',
      logoutConfirm: 'Abmelden',
      cancel: 'Abbrechen',
    },
    en: {
      title: 'Settings',
      schedule: 'Schedule for all days',
      scheduleDesc: 'Apply changes to all days',
      setupDay: 'Setup Tomorrow',
      setupDayDesc: 'Set times and goal for all days',
      display: 'Display',
      backgroundColor: 'Background Color',
      bgWhite: 'White',
      bgBlack: 'Black',
      bgGray: 'Gray',
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
      deleteData: 'Delete All Data',
      logoutTitle: 'Sign Out',
      logoutMessage: 'Are you sure you want to sign out?',
      logoutConfirm: 'Sign Out',
      cancel: 'Cancel',
    },
  };

  const t = texts[language];

  const getBackgroundStyle = () => {
    switch (backgroundColor) {
      case 'white':
        return { backgroundColor: '#FFFFFF' };
      case 'black':
        return { backgroundColor: '#000000' };
      case 'gray':
      default:
        return { backgroundColor: theme.background };
    }
  };

  return (
    <View style={[styles.container, getBackgroundStyle()]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {t.title}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {user && (
            <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.userInfo}>
                  <IconSymbol
                    ios_icon_name="person.circle.fill"
                    android_material_icon_name="account-circle"
                    size={48}
                    color={theme.primary}
                  />
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {user.name || 'User'}
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                      {user.email || 'Signed in with Apple'}
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          )}
          
          <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.scheduleHeader}>
                <View style={styles.scheduleTextContainer}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>
                    {t.schedule}
                  </Text>
                  <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>
                    {t.scheduleDesc}
                  </Text>
                </View>
                <Switch
                  value={applyToAllDays}
                  onValueChange={setApplyToAllDays}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.setupDayCard, { backgroundColor: theme.card }]}
              onPress={() => {
                console.log('SettingsScreen: User tapped setup day');
              }}
            >
              <IconSymbol
                ios_icon_name="calendar"
                android_material_icon_name="calendar-today"
                size={24}
                color={theme.primary}
              />
              <View style={styles.setupDayTextContainer}>
                <Text style={[styles.setupDayTitle, { color: theme.text }]}>
                  {t.setupDay}
                </Text>
                <Text style={[styles.setupDayDescription, { color: theme.textSecondary }]}>
                  {t.setupDayDesc}
                </Text>
              </View>
              <IconSymbol
                ios_icon_name="chevron.right"
                android_material_icon_name="chevron-right"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              {t.display}
            </Text>

            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <Text style={[styles.settingLabel, { color: theme.text, marginBottom: 12 }]}>
                {t.backgroundColor}
              </Text>
              <View style={styles.colorOptions}>
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: backgroundColor === 'white' ? theme.primary : theme.border }
                  ]}
                  onPress={() => handleBackgroundColorChange('white')}
                >
                  <Text style={[styles.colorLabel, { color: '#000000' }]}>{t.bgWhite}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    { backgroundColor: '#000000', borderWidth: 2, borderColor: backgroundColor === 'black' ? theme.primary : theme.border }
                  ]}
                  onPress={() => handleBackgroundColorChange('black')}
                >
                  <Text style={[styles.colorLabel, { color: '#FFFFFF' }]}>{t.bgBlack}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    { backgroundColor: theme.background, borderWidth: 2, borderColor: backgroundColor === 'gray' ? theme.primary : theme.border }
                  ]}
                  onPress={() => handleBackgroundColorChange('gray')}
                >
                  <Text style={[styles.colorLabel, { color: theme.text }]}>{t.bgGray}</Text>
                </TouchableOpacity>
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
            <TouchableOpacity
              style={[styles.legalRow, { borderBottomColor: theme.border }]}
              onPress={openLegalModal}
            >
              <Text style={[styles.legalText, { color: theme.text }]}>
                {t.legal}
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
        visible={showLogoutModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmModal, { backgroundColor: theme.card }]}>
            <Text style={[styles.confirmTitle, { color: theme.text }]}>
              {t.logoutTitle}
            </Text>
            <Text style={[styles.confirmMessage, { color: theme.textSecondary }]}>
              {t.logoutMessage}
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: theme.background }]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.confirmButtonText, { color: theme.text }]}>
                  {t.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, { backgroundColor: '#FF3B30' }]}
                onPress={confirmLogout}
              >
                <Text style={[styles.confirmButtonText, { color: '#FFFFFF' }]}>
                  {t.logoutConfirm}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showLegalModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowLegalModal(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {language === 'de' ? 'Rechtliches' : 'Legal'}
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
            <View style={styles.legalSection}>
              <Text style={[styles.legalSectionTitle, { color: theme.text }]}>
                {language === 'de' ? 'AGB / Nutzungsbedingungen' : 'Terms of Use'}
              </Text>
              <Text style={[styles.legalSectionText, { color: theme.textSecondary }]}>
                {language === 'de'
                  ? 'Willkommen bei Smoke on Smoke Less. Durch die Nutzung dieser Anwendung stimmen Sie den folgenden Bedingungen zu:\n\n1. Diese App soll Ihnen helfen, das Rauchen schrittweise durch geplante Erinnerungen zu reduzieren.\n2. Sie sind dafür verantwortlich, Ihre eigenen Ziele zu setzen und den Erinnerungen zu folgen.\n3. Die App bietet keine medizinische Beratung. Konsultieren Sie einen Arzt für medizinische Beratung.\n4. Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu aktualisieren.\n5. Sie müssen mindestens 18 Jahre alt sein, um diese App zu nutzen.\n6. Die App wird "wie besehen" ohne jegliche Garantien bereitgestellt.\n\nDurch die weitere Nutzung der App akzeptieren Sie diese Bedingungen vollständig.'
                  : 'Welcome to Smoke on Smoke Less. By using this application, you agree to the following terms:\n\n1. This app is designed to help you reduce smoking gradually through scheduled reminders.\n2. You are responsible for setting your own goals and following the reminders.\n3. The app does not provide medical advice. Consult a healthcare professional for medical guidance.\n4. We reserve the right to update these terms at any time.\n5. You must be 18 years or older to use this app.\n6. The app is provided "as is" without warranties of any kind.\n\nBy continuing to use the app, you accept these terms in full.'}
              </Text>
            </View>

            <View style={styles.legalSection}>
              <Text style={[styles.legalSectionTitle, { color: theme.text }]}>
                {language === 'de' ? 'Datenschutzerklärung' : 'Privacy Policy'}
              </Text>
              <Text style={[styles.legalSectionText, { color: theme.textSecondary }]}>
                {language === 'de'
                  ? 'Ihre Privatsphäre ist uns wichtig. Diese Datenschutzerklärung erklärt, welche Daten wir sammeln und wie wir sie verwenden:\n\nDatenerfassung:\n• Wir erfassen nur Ihre Benutzer-ID für die App-Funktionalität\n• Wir erfassen NICHT Ihren Namen, E-Mail, Telefonnummer, Standort oder andere persönliche Daten\n• Wir können allgemeine Nutzerverhaltensmuster nur in anonymisierter oder aggregierter Form beobachten und analysieren\n\nDatennutzung:\n• Ihre Benutzer-ID wird ausschließlich zur Speicherung Ihres Rauchreduktionsplans und Fortschritts verwendet\n• Anonymisierte Nutzungsdaten können zur Verbesserung der App-Erfahrung verwendet werden\n• Wir teilen Ihre Daten NICHT mit Dritten\n• Wir verkaufen Ihre Daten NICHT\n\nDatensicherheit:\n• Ihre Daten werden sicher gespeichert\n• Sie können alle Ihre Daten jederzeit über den Einstellungsbildschirm löschen\n\nIhre Rechte:\n• Sie haben das Recht auf Zugriff auf Ihre Daten\n• Sie haben das Recht, Ihre Daten zu löschen\n• Sie haben das Recht, Ihre Einwilligung jederzeit zu widerrufen\n\nFür Fragen zu Ihrer Privatsphäre kontaktieren Sie uns unter: ivanmirosnic006@gmail.com'
                  : 'Your privacy is important to us. This Privacy Policy explains what data we collect and how we use it:\n\nData Collection:\n• We collect only your user ID for app functionality\n• We do NOT collect your name, email, phone number, location, or any other personal data\n• We may observe and analyze general user behavior patterns in anonymized or aggregated form only\n\nData Usage:\n• Your user ID is used solely to store your smoking reduction schedule and progress\n• Anonymized usage data may be used to improve the app experience\n• We do NOT share your data with third parties\n• We do NOT sell your data\n\nData Security:\n• Your data is stored securely\n• You can delete all your data at any time from the Settings screen\n\nYour Rights:\n• You have the right to access your data\n• You have the right to delete your data\n• You have the right to withdraw consent at any time\n\nFor questions about your privacy, contact us at: ivanmirosnic006@gmail.com'}
              </Text>
            </View>

            <View style={styles.legalSection}>
              <Text style={[styles.legalSectionTitle, { color: theme.text }]}>
                {language === 'de' ? 'Impressum' : 'Imprint'}
              </Text>
              <Text style={[styles.legalSectionText, { color: theme.textSecondary }]}>
                {language === 'de'
                  ? 'Verantwortliche Person / Eigentümer:\nIvan Mirosnic (auch bekannt als Nugat / Ivan Mirosnic Nugat)\n\nAdresse:\nAhornstrasse\n8600 Dübendorf\nSchweiz\n\nKontakt:\nE-Mail: ivanmirosnic006@gmail.com\n\nGerichtsbarkeit:\nDiese App wird nach Schweizer Recht betrieben. Alle Streitigkeiten werden unter der Gerichtsbarkeit der Schweizer Gerichte gelöst.\n\nHaftungsausschluss:\nDer Inhalt dieser App dient nur zu Informationszwecken. Wir geben keine Zusicherungen oder Garantien jeglicher Art hinsichtlich der Richtigkeit, Vollständigkeit oder Eignung der bereitgestellten Informationen. Die Nutzung dieser App erfolgt auf eigenes Risiko.'
                  : 'Responsible Person / Owner:\nIvan Mirosnic (also known as Nugat / Ivan Mirosnic Nugat)\n\nAddress:\nAhornstrasse\n8600 Dübendorf\nSwitzerland\n\nContact:\nEmail: ivanmirosnic006@gmail.com\n\nJurisdiction:\nThis app is operated under Swiss law. Any disputes shall be resolved under the jurisdiction of Swiss courts.\n\nDisclaimer:\nThe content of this app is provided for informational purposes only. We make no representations or warranties of any kind regarding the accuracy, completeness, or suitability of the information provided. Use of this app is at your own risk.'}
              </Text>
            </View>
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
  scheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scheduleTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
  },
  setupDayCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  setupDayTextContainer: {
    flex: 1,
  },
  setupDayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  setupDayDescription: {
    fontSize: 13,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  colorOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  colorOption: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorLabel: {
    fontSize: 14,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  confirmModal: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
  },
});
