
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ScrollPicker } from '@/components/ScrollPicker';
import { usePlacement, useUser } from 'expo-superwall';

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(String(i).padStart(2, '0'));
  }
  return hours;
};

const generateMinutes = () => {
  const minutes = [];
  for (let i = 0; i < 60; i++) {
    minutes.push(String(i).padStart(2, '0'));
  }
  return minutes;
};

const generateCigarettes = () => {
  const cigarettes = [];
  for (let i = 1; i <= 60; i++) {
    cigarettes.push(String(i));
  }
  return cigarettes;
};

export default function SettingsScreen() {
  console.log('SettingsScreen: Rendering settings screen (iOS)');
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

  // Superwall hooks for payment integration
  const { identify, subscriptionStatus, user: superwallUser } = useUser();
  
  // Lifetime Access Paywall
  const { registerPlacement: registerLifetimePlacement } = usePlacement({
    onPresent: (info) => {
      console.log('💳 SettingsScreen (iOS): Lifetime access paywall presented:', info);
    },
    onDismiss: (info, result) => {
      console.log('💳 SettingsScreen (iOS): Lifetime access paywall dismissed with result:', result);
      if (result === 'purchased') {
        console.log('✅ SettingsScreen (iOS): User purchased lifetime access!');
        Alert.alert('Erfolg!', 'Lebenslanger Zugang freigeschaltet!');
      } else if (result === 'declined') {
        console.log('❌ SettingsScreen (iOS): User declined lifetime access purchase');
      } else if (result === 'restored') {
        console.log('🔄 SettingsScreen (iOS): User restored lifetime access purchase');
        Alert.alert('Wiederhergestellt!', 'Ihr Kauf wurde wiederhergestellt!');
      }
    },
    onError: (error) => {
      console.error('❌ SettingsScreen (iOS): Lifetime paywall error:', error);
      Alert.alert('Fehler', 'Es gab ein Problem beim Laden der Zahlungsseite. Bitte versuchen Sie es später erneut.');
    },
  });

  // Monthly Subscription Paywall
  const { registerPlacement: registerSubscriptionPlacement } = usePlacement({
    onPresent: (info) => {
      console.log('💳 SettingsScreen (iOS): Subscription paywall presented:', info);
    },
    onDismiss: (info, result) => {
      console.log('💳 SettingsScreen (iOS): Subscription paywall dismissed with result:', result);
      if (result === 'purchased') {
        console.log('✅ SettingsScreen (iOS): User subscribed!');
        Alert.alert('Erfolg!', 'Abonnement aktiviert!');
      } else if (result === 'declined') {
        console.log('❌ SettingsScreen (iOS): User declined subscription');
      } else if (result === 'restored') {
        console.log('🔄 SettingsScreen (iOS): User restored subscription');
        Alert.alert('Wiederhergestellt!', 'Ihr Abonnement wurde wiederhergestellt!');
      }
    },
    onError: (error) => {
      console.error('❌ SettingsScreen (iOS): Subscription paywall error:', error);
      Alert.alert('Fehler', 'Es gab ein Problem beim Laden der Zahlungsseite. Bitte versuchen Sie es später erneut.');
    },
  });

  const [language, setLanguage] = useState<'de' | 'en'>('de');
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [applyToAllDays, setApplyToAllDays] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [scheduleWakeTime, setScheduleWakeTime] = useState('06:00');
  const [scheduleSleepTime, setScheduleSleepTime] = useState('23:00');
  const [scheduleTargetCigarettes, setScheduleTargetCigarettes] = useState(20);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showCigarettePicker, setShowCigarettePicker] = useState(false);

  const hours = generateHours();
  const minutes = generateMinutes();
  const cigarettes = generateCigarettes();

  useEffect(() => {
    loadAllSettings();
  }, []);

  useEffect(() => {
    // Identify user with Superwall when user is available
    // This connects the user with Superwall for payment tracking
    if (superwallUser?.appUserId) {
      console.log('💳 SettingsScreen (iOS): Identifying user with Superwall for payment tracking:', superwallUser.appUserId);
      identify(superwallUser.appUserId).catch((error) => {
        console.error('❌ SettingsScreen (iOS): Error identifying user with Superwall:', error);
      });
    }
  }, [superwallUser, identify]);

  const loadAllSettings = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('app-language');
      const savedApplyToAll = await AsyncStorage.getItem('apply-to-all-days');
      const savedWakeTime = await AsyncStorage.getItem('schedule-wake-time');
      const savedSleepTime = await AsyncStorage.getItem('schedule-sleep-time');
      const savedCigarettes = await AsyncStorage.getItem('schedule-cigarettes');
      
      if (savedLanguage) {
        setLanguage(savedLanguage as 'de' | 'en');
      }
      if (savedApplyToAll !== null) {
        setApplyToAllDays(savedApplyToAll === 'true');
      }
      if (savedWakeTime) {
        setScheduleWakeTime(savedWakeTime);
      }
      if (savedSleepTime) {
        setScheduleSleepTime(savedSleepTime);
      }
      if (savedCigarettes) {
        setScheduleTargetCigarettes(parseInt(savedCigarettes));
      }
    } catch (error) {
      console.error('SettingsScreen (iOS): Error loading settings:', error);
    }
  };

  const handleLanguageChange = async () => {
    const newLanguage = language === 'de' ? 'en' : 'de';
    console.log('SettingsScreen (iOS): Changing language to', newLanguage);
    setLanguage(newLanguage);
    try {
      await AsyncStorage.setItem('app-language', newLanguage);
    } catch (error) {
      console.error('SettingsScreen (iOS): Error saving language:', error);
    }
  };

  const handleBackgroundColorChange = async (color: 'white' | 'black' | 'gray') => {
    console.log('SettingsScreen (iOS): Changing background color to', color);
    setBackgroundColor(color);
    try {
      await AsyncStorage.setItem('app-background-color', color);
      setTimeout(() => {
        router.replace('/(tabs)/settings');
      }, 100);
    } catch (error) {
      console.error('SettingsScreen (iOS): Error saving background color:', error);
    }
  };

  const handleApplyToAllDaysToggle = async (value: boolean) => {
    console.log('SettingsScreen (iOS): Toggling apply to all days to', value);
    setApplyToAllDays(value);
    try {
      await AsyncStorage.setItem('apply-to-all-days', value.toString());
    } catch (error) {
      console.error('SettingsScreen (iOS): Error saving apply to all days:', error);
    }
  };

  const handleSaveSchedule = async () => {
    console.log('SettingsScreen (iOS): Saving schedule settings');
    try {
      await AsyncStorage.setItem('schedule-wake-time', scheduleWakeTime);
      await AsyncStorage.setItem('schedule-sleep-time', scheduleSleepTime);
      await AsyncStorage.setItem('schedule-cigarettes', scheduleTargetCigarettes.toString());
    } catch (error) {
      console.error('SettingsScreen (iOS): Error saving schedule:', error);
    }
  };

  const handleDeleteData = () => {
    console.log('SettingsScreen (iOS): User tapped delete data');
    AsyncStorage.clear()
      .then(() => {
        console.log('SettingsScreen (iOS): Data deleted, redirecting to welcome');
        router.replace('/onboarding');
      })
      .catch((error) => {
        console.error('SettingsScreen (iOS): Error deleting data:', error);
      });
  };

  const handleLogout = () => {
    console.log('SettingsScreen (iOS): User tapped logout');
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    console.log('SettingsScreen (iOS): Confirming logout');
    try {
      await AsyncStorage.removeItem('smoke-onboarding-completed');
      console.log('SettingsScreen (iOS): Logged out, redirecting to welcome');
      setShowLogoutModal(false);
      router.replace('/onboarding');
    } catch (error) {
      console.error('SettingsScreen (iOS): Error logging out:', error);
      setShowLogoutModal(false);
      router.replace('/onboarding');
    }
  };

  const openLegalModal = () => {
    console.log('SettingsScreen (iOS): Opening legal modal');
    setShowLegalModal(true);
  };

  const handleLifetimeAccess = async () => {
    console.log('💳 SettingsScreen (iOS): User tapped lifetime access - triggering Superwall paywall');
    try {
      await registerLifetimePlacement({
        placement: 'lifetime_access',
        feature: () => {
          console.log('✅ SettingsScreen (iOS): User already has lifetime access');
          Alert.alert('Bereits freigeschaltet!', 'Sie haben bereits lebenslangen Zugang!');
        },
      });
    } catch (error) {
      console.error('❌ SettingsScreen (iOS): Error showing lifetime paywall:', error);
      Alert.alert('Fehler', 'Es gab ein Problem beim Laden der Zahlungsseite. Bitte versuchen Sie es später erneut.');
    }
  };

  const handleSubscribe = async () => {
    console.log('💳 SettingsScreen (iOS): User tapped subscribe - triggering Superwall paywall');
    try {
      await registerSubscriptionPlacement({
        placement: 'monthly_subscription',
        feature: () => {
          console.log('✅ SettingsScreen (iOS): User already has active subscription');
          Alert.alert('Bereits abonniert!', 'Sie haben bereits ein aktives Abonnement!');
        },
      });
    } catch (error) {
      console.error('❌ SettingsScreen (iOS): Error showing subscription paywall:', error);
      Alert.alert('Fehler', 'Es gab ein Problem beim Laden der Zahlungsseite. Bitte versuchen Sie es später erneut.');
    }
  };

  const texts = {
    de: {
      title: 'Einstellungen',
      setupMorning: 'Morgen einrichten',
      schedule: 'Zeitplan für alle Tage',
      scheduleDesc: 'Änderungen auf alle Tage anwenden',
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
      subscriptionActive: 'Abonnement aktiv',
      signOut: 'Abmelden',
      legal: 'Rechtliches',
      deleteData: 'Alle Daten löschen',
      yourSchedule: 'Dein Zeitplan',
      wakeTime: 'AUFSTEHZEIT',
      sleepTime: 'SCHLAFENSZEIT',
      targetCigarettes: 'TAGESZIEL ZIGARETTEN',
      save: 'Speichern',
      cancel: 'Abbrechen',
      logoutTitle: 'Abmelden',
      logoutMessage: 'Möchten Sie sich wirklich abmelden?',
      logoutConfirm: 'Abmelden',
    },
    en: {
      title: 'Settings',
      setupMorning: 'Setup Tomorrow',
      schedule: 'Schedule for all days',
      scheduleDesc: 'Apply changes to all days',
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
      subscriptionActive: 'Subscription active',
      signOut: 'Sign Out',
      legal: 'Legal',
      deleteData: 'Delete All Data',
      yourSchedule: 'Your Schedule',
      wakeTime: 'WAKE TIME',
      sleepTime: 'SLEEP TIME',
      targetCigarettes: 'TARGET CIGARETTES',
      save: 'Save',
      cancel: 'Cancel',
      logoutTitle: 'Sign Out',
      logoutMessage: 'Are you sure you want to sign out?',
      logoutConfirm: 'Sign Out',
    },
  };

  const t = texts[language];
  const isSubscribed = subscriptionStatus?.status === 'ACTIVE';

  const [wakeHour, wakeMinute] = scheduleWakeTime.split(':');
  const [sleepHour, sleepMinute] = scheduleSleepTime.split(':');

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
          {superwallUser && (
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
                      User
                    </Text>
                    <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
                      {superwallUser.appUserId}
                    </Text>
                    {isSubscribed && (
                      <View style={[styles.subscriptionBadge, { backgroundColor: theme.primary }]}>
                        <Text style={styles.subscriptionBadgeText}>
                          {t.subscriptionActive}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeIn.duration(400)} style={styles.section}>
            <View style={[styles.card, { backgroundColor: theme.card }]}>
              <View style={styles.setupHeader}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={24}
                  color={theme.primary}
                />
                <Text style={[styles.setupTitle, { color: theme.text }]}>
                  {t.setupMorning}
                </Text>
              </View>
              
              <View style={styles.setupInputs}>
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                      {t.wakeTime}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowWakePicker(true)}
                      style={[styles.timePicker, { backgroundColor: theme.background }]}
                    >
                      <Text style={[styles.timeText, { color: theme.primary }]}>
                        {scheduleWakeTime}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeInput}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                      {t.sleepTime}
                    </Text>
                    <TouchableOpacity
                      onPress={() => setShowSleepPicker(true)}
                      style={[styles.timePicker, { backgroundColor: theme.background }]}
                    >
                      <Text style={[styles.timeText, { color: theme.primary }]}>
                        {scheduleSleepTime}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cigaretteInput}>
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    {t.targetCigarettes}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCigarettePicker(true)}
                    style={[styles.cigarettePicker, { backgroundColor: theme.background }]}
                  >
                    <Text style={[styles.cigaretteNumber, { color: theme.primary }]}>
                      {scheduleTargetCigarettes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.card, marginTop: 12 }]}>
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
                  onValueChange={handleApplyToAllDaysToggle}
                  trackColor={{ false: theme.border, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
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
              onPress={handleLifetimeAccess}
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
              onPress={handleSubscribe}
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
        visible={showWakePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWakePicker(false)}
        transparent={false}
      >
        <SafeAreaView style={[styles.pickerModal, { backgroundColor: theme.background }]}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowWakePicker(false)}>
              <Text style={[styles.pickerCancel, { color: theme.text }]}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: theme.text }]}>Aufstehzeit</Text>
            <TouchableOpacity onPress={() => {
              handleSaveSchedule();
              setShowWakePicker(false);
            }}>
              <Text style={[styles.pickerDone, { color: theme.primary }]}>Fertig</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerRow}>
              <ScrollPicker
                items={hours}
                selectedIndex={parseInt(wakeHour)}
                onValueChange={(index) => {
                  const newTime = `${hours[index]}:${wakeMinute}`;
                  setScheduleWakeTime(newTime);
                }}
                textColor={theme.textSecondary}
                primaryColor={theme.primary}
              />
              <Text style={[styles.pickerSeparator, { color: theme.text }]}>:</Text>
              <ScrollPicker
                items={minutes}
                selectedIndex={parseInt(wakeMinute)}
                onValueChange={(index) => {
                  const newTime = `${wakeHour}:${minutes[index]}`;
                  setScheduleWakeTime(newTime);
                }}
                textColor={theme.textSecondary}
                primaryColor={theme.primary}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showSleepPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSleepPicker(false)}
        transparent={false}
      >
        <SafeAreaView style={[styles.pickerModal, { backgroundColor: theme.background }]}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowSleepPicker(false)}>
              <Text style={[styles.pickerCancel, { color: theme.text }]}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: theme.text }]}>Schlafenszeit</Text>
            <TouchableOpacity onPress={() => {
              handleSaveSchedule();
              setShowSleepPicker(false);
            }}>
              <Text style={[styles.pickerDone, { color: theme.primary }]}>Fertig</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerRow}>
              <ScrollPicker
                items={hours}
                selectedIndex={parseInt(sleepHour)}
                onValueChange={(index) => {
                  const newTime = `${hours[index]}:${sleepMinute}`;
                  setScheduleSleepTime(newTime);
                }}
                textColor={theme.textSecondary}
                primaryColor={theme.primary}
              />
              <Text style={[styles.pickerSeparator, { color: theme.text }]}>:</Text>
              <ScrollPicker
                items={minutes}
                selectedIndex={parseInt(sleepMinute)}
                onValueChange={(index) => {
                  const newTime = `${sleepHour}:${minutes[index]}`;
                  setScheduleSleepTime(newTime);
                }}
                textColor={theme.textSecondary}
                primaryColor={theme.primary}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={showCigarettePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCigarettePicker(false)}
        transparent={false}
      >
        <SafeAreaView style={[styles.pickerModal, { backgroundColor: theme.background }]}>
          <View style={styles.pickerHeader}>
            <TouchableOpacity onPress={() => setShowCigarettePicker(false)}>
              <Text style={[styles.pickerCancel, { color: theme.text }]}>Abbrechen</Text>
            </TouchableOpacity>
            <Text style={[styles.pickerTitle, { color: theme.text }]}>Zigaretten</Text>
            <TouchableOpacity onPress={() => {
              handleSaveSchedule();
              setShowCigarettePicker(false);
            }}>
              <Text style={[styles.pickerDone, { color: theme.primary }]}>Fertig</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <ScrollPicker
              items={cigarettes}
              selectedIndex={scheduleTargetCigarettes - 1}
              onValueChange={(index) => {
                setScheduleTargetCigarettes(index + 1);
              }}
              textColor={theme.textSecondary}
              primaryColor={theme.primary}
            />
          </View>
        </SafeAreaView>
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
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  setupTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  setupInputs: {
    gap: 16,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  timePicker: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  cigaretteInput: {
    alignItems: 'center',
  },
  cigarettePicker: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 100,
  },
  cigaretteNumber: {
    fontSize: 36,
    fontWeight: '900',
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
  pickerModal: {
    flex: 1,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  pickerCancel: {
    fontSize: 17,
    fontWeight: '400',
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  pickerDone: {
    fontSize: 17,
    fontWeight: '600',
  },
  pickerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  pickerSeparator: {
    fontSize: 32,
    fontWeight: '700',
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
    marginBottom: 8,
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
