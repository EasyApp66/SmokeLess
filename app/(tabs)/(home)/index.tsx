
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { dayApi, reminderApi, Reminder } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollPicker } from '@/components/ScrollPicker';

interface DayData {
  id: string;
  date: string;
  wakeTime: string;
  sleepTime: string;
  targetCigarettes: number;
  reminders: Reminder[];
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

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

export default function HomeScreen() {
  console.log('HomeScreen: Rendering home screen');
  const systemColorScheme = useColorScheme();
  const [manualDarkMode, setManualDarkMode] = useState<boolean | null>(null);
  
  useEffect(() => {
    const loadDarkModeSetting = async () => {
      const saved = await AsyncStorage.getItem('app-dark-mode');
      if (saved !== null) {
        setManualDarkMode(saved === 'true');
      }
    };
    loadDarkModeSetting();
  }, []);

  const isDark = manualDarkMode !== null ? manualDarkMode : systemColorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dayData, setDayData] = useState<DayData | null>(null);
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState('23:00');
  const [targetCigarettes, setTargetCigarettes] = useState(20);
  const [showWakePicker, setShowWakePicker] = useState(false);
  const [showSleepPicker, setShowSleepPicker] = useState(false);
  const [showCigarettePicker, setShowCigarettePicker] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hours = generateHours();
  const minutes = generateMinutes();
  const cigarettes = generateCigarettes();

  const orbRotation = useSharedValue(0);

  useEffect(() => {
    console.log('HomeScreen: Starting background orb animation');
    orbRotation.value = withRepeat(
      withTiming(360, { duration: 120000, easing: Easing.linear }),
      -1,
      false
    );
  }, [orbRotation]);

  const orbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${orbRotation.value}deg` }],
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadDayData = useCallback(async () => {
    console.log('HomeScreen: Loading day data for', formatDate(selectedDate));
    setLoading(true);
    setError(null);
    
    try {
      const dateStr = formatDate(selectedDate);
      
      const day = await dayApi.getByDate(dateStr);
      console.log('HomeScreen: Loaded day from backend:', day);
      
      const reminders = await reminderApi.getByDayId(day.id);
      console.log('HomeScreen: Loaded reminders from backend:', reminders);
      
      const data: DayData = {
        ...day,
        reminders,
      };
      
      setDayData(data);
      setWakeTime(data.wakeTime);
      setSleepTime(data.sleepTime);
      setTargetCigarettes(data.targetCigarettes);
    } catch (error: any) {
      console.log('HomeScreen: No data found for this day or error:', error.message);
      setDayData(null);
      
      if (!error.message?.includes('404')) {
        setError('Fehler beim Laden der Daten');
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadDayData();
  }, [loadDayData]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const setupDay = async () => {
    console.log('HomeScreen: User tapped "Tag einrichten" button');
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    setLoading(true);
    setError(null);

    try {
      const day = await dayApi.create({
        date: formatDate(selectedDate),
        wakeTime,
        sleepTime,
        targetCigarettes,
      });
      
      console.log('HomeScreen: Day created successfully:', day);
      
      const reminders = await reminderApi.getByDayId(day.id);
      console.log('HomeScreen: Fetched generated reminders:', reminders);
      
      const newDayData: DayData = {
        ...day,
        reminders,
      };
      
      setDayData(newDayData);
    } catch (error: any) {
      console.error('HomeScreen: Error creating day:', error);
      setError('Fehler beim Erstellen des Tages');
    } finally {
      setLoading(false);
    }
  };

  const toggleReminder = async (reminderId: string) => {
    console.log('HomeScreen: User tapped reminder', reminderId);
    if (!dayData) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const reminder = dayData.reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    try {
      if (!reminder.completed) {
        const updatedReminder = await reminderApi.complete(reminderId);
        console.log('HomeScreen: Reminder marked as completed:', updatedReminder);
        
        const updatedReminders = dayData.reminders.map(r =>
          r.id === reminderId ? updatedReminder : r
        );
        setDayData({ ...dayData, reminders: updatedReminders });
      } else {
        console.log('HomeScreen: Reminder already completed');
      }
    } catch (error: any) {
      console.error('HomeScreen: Error updating reminder:', error);
      setError('Fehler beim Aktualisieren der Erinnerung');
    }
  };

  const getCalendarDays = () => {
    const days = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const getTimeUntil = (timeStr: string): string => {
    const [hour, min] = timeStr.split(':').map(Number);
    const now = currentTime;
    const target = new Date(now);
    target.setHours(hour, min, 0, 0);

    const diffMs = target.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 0) return 'abgelaufen';
    if (diffMins === 0) return 'jetzt';
    if (diffMins < 60) {
      const minText = `in ${diffMins} Min`;
      return minText;
    }
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const timeText = `in ${hours}h ${mins}m`;
    return timeText;
  };

  const getNextReminderIndex = (): number => {
    if (!dayData) return -1;
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (let i = 0; i < dayData.reminders.length; i++) {
      const reminder = dayData.reminders[i];
      if (!reminder.completed) {
        const [hour, min] = reminder.time.split(':').map(Number);
        const reminderMinutes = hour * 60 + min;
        if (reminderMinutes >= currentMinutes) {
          return i;
        }
      }
    }
    return -1;
  };

  const completedCount = dayData?.reminders.filter(r => r.completed).length || 0;
  const totalCount = dayData?.targetCigarettes || 0;
  const remainingCount = totalCount - completedCount;
  const nextReminderIdx = getNextReminderIndex();

  let statusText = 'Bereit wenn du es bist';
  if (dayData && completedCount === totalCount && totalCount > 0) {
    statusText = 'Tag geschafft! 🎉';
  } else if (dayData && remainingCount > 0) {
    const remainingText = `Noch ${remainingCount} übrig`;
    statusText = remainingText;
  }

  const [wakeHour, wakeMinute] = wakeTime.split(':');
  const [sleepHour, sleepMinute] = sleepTime.split(':');

  const counterScale = useSharedValue(1);

  useEffect(() => {
    counterScale.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
  }, [completedCount, counterScale]);

  const counterAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: counterScale.value }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Animated.View style={[styles.backgroundOrb, orbStyle]}>
        <LinearGradient
          colors={['rgba(29, 200, 130, 0.1)', 'rgba(0, 0, 0, 0)', 'rgba(51, 204, 153, 0.1)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.orbGradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: '#FF3B30' }]}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <IconSymbol
                ios_icon_name="xmark"
                android_material_icon_name="close"
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        )}
        
        <Animated.View entering={FadeIn.duration(600)} style={styles.calendarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScroll}
          >
            {getCalendarDays().map((date, index) => {
              const dayNum = date.getDate();
              const weekday = WEEKDAYS[date.getDay()];
              const isTodayDate = isToday(date);
              const isSelectedDate = isSelected(date);

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    console.log('HomeScreen: User selected date', formatDate(date));
                    setSelectedDate(date);
                  }}
                  style={[
                    styles.calendarDay,
                    { backgroundColor: theme.card },
                    isTodayDate && styles.calendarDayToday,
                    isSelectedDate && { backgroundColor: theme.primaryRgb },
                  ]}
                >
                  <Text
                    style={[
                      styles.calendarDayNumber,
                      { color: theme.text },
                      isSelectedDate && styles.calendarDaySelectedText,
                    ]}
                  >
                    {dayNum}
                  </Text>
                  <Text
                    style={[
                      styles.calendarDayName,
                      { color: theme.textSecondary },
                      isSelectedDate && styles.calendarDaySelectedText,
                    ]}
                  >
                    {weekday}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(200).duration(600)}
          style={[styles.stickyCounter, { backgroundColor: `${theme.background}F2` }]}
        >
          <Animated.View style={[styles.counterRow, counterAnimStyle]}>
            <Text style={[styles.counterNumberLarge, { color: theme.text }]}>
              {completedCount}
            </Text>
            <Text style={[styles.counterSeparator, { color: theme.textSecondary }]}>
              /
            </Text>
            <Text style={[styles.counterNumberSmall, { color: theme.textSecondary }]}>
              {totalCount}
            </Text>
          </Animated.View>
          <Text style={[styles.counterStatus, { color: theme.textSecondary }]}>
            {statusText}
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(600)}
              style={[styles.setupCard, { backgroundColor: theme.card }]}
            >
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Lädt...
              </Text>
            </Animated.View>
          )}

          {!loading && !dayData && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(600)}
              style={[styles.setupCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.setupHeader}>
                <IconSymbol
                  ios_icon_name="calendar"
                  android_material_icon_name="calendar-today"
                  size={32}
                  color={theme.primary}
                />
                <View style={styles.setupHeaderText}>
                  <Text style={[styles.setupTitle, { color: theme.text }]}>
                    Heute einrichten
                  </Text>
                  <Text style={[styles.setupSubtitle, { color: theme.textSecondary }]}>
                    Lege deine Zeiten und dein Ziel fest
                  </Text>
                </View>
              </View>

              <View style={styles.setupInputs}>
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                  DEIN ZEITPLAN
                </Text>
                <View style={styles.timeRow}>
                  <View style={styles.timeInput}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                      AUFSTEHZEIT
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('HomeScreen: User tapped wake time picker');
                        setShowWakePicker(true);
                      }}
                      style={[styles.timePicker, { backgroundColor: theme.background }]}
                    >
                      <Text style={[styles.timeText, { color: theme.primary }]}>
                        {wakeTime}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.timeInput}>
                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                      SCHLAFENSZEIT
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        console.log('HomeScreen: User tapped sleep time picker');
                        setShowSleepPicker(true);
                      }}
                      style={[styles.timePicker, { backgroundColor: theme.background }]}
                    >
                      <Text style={[styles.timeText, { color: theme.primary }]}>
                        {sleepTime}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.cigaretteInput}>
                  <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                    TAGESZIEL ZIGARETTEN
                  </Text>
                  <Text style={[styles.cigaretteLabel, { color: theme.textSecondary }]}>
                    Zigaretten pro Tag
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('HomeScreen: User tapped cigarette picker');
                      setShowCigarettePicker(true);
                    }}
                    style={[styles.cigarettePicker, { backgroundColor: theme.background }]}
                  >
                    <Text style={[styles.cigaretteNumber, { color: theme.primary }]}>
                      {targetCigarettes}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={setupDay}
                  style={styles.setupButton}
                  activeOpacity={0.8}
                  disabled={loading}
                >
                  <LinearGradient
                    colors={[theme.primaryRgb, theme.secondaryRgb]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.setupButtonGradient}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.setupButtonText}>Tag einrichten</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {!loading && dayData && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(600)}
              style={[styles.compactSetupCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.compactTimeRow}>
                <View style={styles.compactTimeInput}>
                  <Text style={[styles.compactInputLabel, { color: theme.textSecondary }]}>
                    AUFSTEHZEIT
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('HomeScreen: User tapped wake time picker (compact)');
                      setShowWakePicker(true);
                    }}
                    style={[styles.compactTimePicker, { backgroundColor: theme.background }]}
                  >
                    <Text style={[styles.compactTimeText, { color: theme.primary }]}>
                      {wakeTime}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.compactTimeInput}>
                  <Text style={[styles.compactInputLabel, { color: theme.textSecondary }]}>
                    SCHLAFENSZEIT
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('HomeScreen: User tapped sleep time picker (compact)');
                      setShowSleepPicker(true);
                    }}
                    style={[styles.compactTimePicker, { backgroundColor: theme.background }]}
                  >
                    <Text style={[styles.compactTimeText, { color: theme.primary }]}>
                      {sleepTime}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.compactCigaretteInput}>
                  <Text style={[styles.compactInputLabel, { color: theme.textSecondary }]}>
                    ZIEL
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      console.log('HomeScreen: User tapped cigarette picker (compact)');
                      setShowCigarettePicker(true);
                    }}
                    style={[styles.compactCigarettePicker, { backgroundColor: theme.background }]}
                  >
                    <Text style={[styles.compactCigaretteNumber, { color: theme.primary }]}>
                      {targetCigarettes}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          )}

          {dayData && dayData.reminders.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              style={styles.reminderList}
            >
              {dayData.reminders.map((reminder, index) => {
                const isNext = index === nextReminderIdx;
                const timeUntil = getTimeUntil(reminder.time);
                const isExpired = timeUntil === 'abgelaufen';

                return (
                  <TouchableOpacity
                    key={reminder.id}
                    onPress={() => toggleReminder(reminder.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.reminderItem,
                      { backgroundColor: theme.card },
                      reminder.completed && { backgroundColor: theme.primaryRgb, opacity: 0.7 },
                      isExpired && !reminder.completed && { opacity: 0.4 },
                      isNext && !reminder.completed && styles.reminderItemNext,
                    ]}
                  >
                    <View style={styles.reminderContent}>
                      <Text
                        style={[
                          styles.reminderTime,
                          { color: theme.text },
                          reminder.completed && styles.reminderTimeCompleted,
                        ]}
                      >
                        {reminder.time}
                      </Text>
                      <Text
                        style={[
                          styles.reminderCountdown,
                          { color: theme.textSecondary },
                          reminder.completed && styles.reminderTimeCompleted,
                        ]}
                      >
                        {reminder.completed ? 'Erledigt' : timeUntil}
                      </Text>
                      {isNext && !reminder.completed && (
                        <Text style={styles.reminderEncouragement}>
                          Halte durch – du schaffst das
                        </Text>
                      )}
                    </View>
                    <View
                      style={[
                        styles.reminderCheckbox,
                        { borderColor: theme.border },
                        reminder.completed && { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
                      ]}
                    >
                      {reminder.completed && (
                        <IconSymbol
                          ios_icon_name="checkmark"
                          android_material_icon_name="check"
                          size={20}
                          color={theme.primary}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

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
            <TouchableOpacity
              onPress={() => {
                console.log('HomeScreen: Wake time set to', wakeTime);
                setShowWakePicker(false);
              }}
            >
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
                  setWakeTime(newTime);
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
                  setWakeTime(newTime);
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
            <TouchableOpacity
              onPress={() => {
                console.log('HomeScreen: Sleep time set to', sleepTime);
                setShowSleepPicker(false);
              }}
            >
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
                  setSleepTime(newTime);
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
                  setSleepTime(newTime);
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
            <TouchableOpacity
              onPress={() => {
                console.log('HomeScreen: Cigarettes set to', targetCigarettes);
                setShowCigarettePicker(false);
              }}
            >
              <Text style={[styles.pickerDone, { color: theme.primary }]}>Fertig</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.pickerContainer}>
            <ScrollPicker
              items={cigarettes}
              selectedIndex={targetCigarettes - 1}
              onValueChange={(index) => {
                setTargetCigarettes(index + 1);
              }}
              textColor={theme.textSecondary}
              primaryColor={theme.primary}
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOrb: {
    position: 'absolute',
    top: -300,
    right: -300,
    width: 600,
    height: 600,
    borderRadius: 300,
    overflow: 'hidden',
  },
  orbGradient: {
    width: '100%',
    height: '100%',
  },
  safeArea: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  calendarContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  calendarScroll: {
    gap: 12,
  },
  calendarDay: {
    width: 60,
    height: 70,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: 'rgb(29, 200, 130)',
  },
  calendarDayNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  calendarDayName: {
    fontSize: 12,
    fontWeight: '600',
  },
  calendarDaySelectedText: {
    color: '#FFFFFF',
  },
  stickyCounter: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterNumberLarge: {
    fontSize: 48,
    fontWeight: '900',
  },
  counterSeparator: {
    fontSize: 24,
    fontWeight: '900',
    marginHorizontal: 4,
  },
  counterNumberSmall: {
    fontSize: 24,
    fontWeight: '900',
  },
  counterStatus: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  setupCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  setupHeaderText: {
    flex: 1,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  setupSubtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  setupInputs: {
    gap: 20,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
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
    padding: 16,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: '700',
  },
  cigaretteInput: {
    alignItems: 'center',
  },
  cigaretteLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  cigarettePicker: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  cigaretteNumber: {
    fontSize: 48,
    fontWeight: '900',
  },
  setupButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  setupButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  setupButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  compactSetupCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  compactTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactTimeInput: {
    flex: 1,
  },
  compactInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  compactTimePicker: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  compactTimeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  compactCigaretteInput: {
    flex: 1,
  },
  compactCigarettePicker: {
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  compactCigaretteNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  reminderList: {
    gap: 12,
  },
  reminderItem: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderItemNext: {
    borderWidth: 2,
    borderColor: 'rgb(29, 200, 130)',
    shadowColor: 'rgb(29, 200, 130)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  reminderTimeCompleted: {
    color: '#FFFFFF',
  },
  reminderCountdown: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderEncouragement: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgb(29, 200, 130)',
    marginTop: 4,
  },
  reminderCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
});
