
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
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
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { colors } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';
import { dayApi, reminderApi, Day, Reminder } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface DayData {
  id: string;
  date: string;
  wakeTime: string;
  sleepTime: string;
  targetCigarettes: number;
  reminders: Reminder[];
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

export default function HomeScreen() {
  console.log('HomeScreen: Rendering home screen (iOS)');
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (diffMins < 60) return `in ${diffMins} Min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `in ${hours}h ${mins}m`;
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
  if (dayData && completedCount === totalCount) {
    statusText = 'Tag geschafft! 🎉';
  } else if (dayData && remainingCount > 0) {
    statusText = `Noch ${remainingCount} übrig`;
  }

  const parseTime = (timeStr: string): Date => {
    const [hour, min] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, min, 0, 0);
    return date;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={[styles.counterCard, { backgroundColor: theme.card }]}
          >
            <View style={styles.counterRow}>
              <Text style={[styles.counterNumber, { color: theme.text }]}>
                {completedCount}
              </Text>
              <Text style={[styles.counterSeparator, { color: theme.textSecondary }]}>
                /
              </Text>
              <Text style={[styles.counterNumber, { color: theme.text }]}>
                {totalCount}
              </Text>
            </View>
            <Text style={[styles.counterStatus, { color: theme.textSecondary }]}>
              {statusText}
            </Text>
          </Animated.View>

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
                    Morgen einrichten
                  </Text>
                </View>
              </View>

              <View style={styles.setupInputs}>
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
                  <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    TAGESZIEL ZIGARETTEN
                  </Text>
                  <Text style={[styles.cigaretteLabel, { color: theme.textSecondary }]}>
                    Zigaretten pro Tag
                  </Text>
                  <View style={styles.cigaretteControls}>
                    <TouchableOpacity
                      onPress={() => {
                        if (targetCigarettes > 1) {
                          console.log('HomeScreen: Decreasing target cigarettes');
                          setTargetCigarettes(targetCigarettes - 1);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                      style={[styles.cigaretteButton, { backgroundColor: theme.background }]}
                    >
                      <IconSymbol
                        ios_icon_name="minus"
                        android_material_icon_name="remove"
                        size={24}
                        color={theme.text}
                      />
                    </TouchableOpacity>
                    <Text style={[styles.cigaretteNumber, { color: theme.primary }]}>
                      {targetCigarettes}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        if (targetCigarettes < 60) {
                          console.log('HomeScreen: Increasing target cigarettes');
                          setTargetCigarettes(targetCigarettes + 1);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                      style={[styles.cigaretteButton, { backgroundColor: theme.background }]}
                    >
                      <IconSymbol
                        ios_icon_name="plus"
                        android_material_icon_name="add"
                        size={24}
                        color={theme.text}
                      />
                    </TouchableOpacity>
                  </View>
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

          {dayData && dayData.reminders.length > 0 && (
            <Animated.View
              entering={FadeInDown.delay(400).duration(600)}
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

      {showWakePicker && (
        <DateTimePicker
          value={parseTime(wakeTime)}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event, date) => {
            setShowWakePicker(Platform.OS === 'ios');
            if (date) {
              const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              console.log('HomeScreen: Wake time changed to', timeStr);
              setWakeTime(timeStr);
            }
          }}
        />
      )}

      {showSleepPicker && (
        <DateTimePicker
          value={parseTime(sleepTime)}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={(event, date) => {
            setShowSleepPicker(Platform.OS === 'ios');
            if (date) {
              const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              console.log('HomeScreen: Sleep time changed to', timeStr);
              setSleepTime(timeStr);
            }
          }}
        />
      )}
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
    paddingTop: 0,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
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
  counterCard: {
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterNumber: {
    fontSize: 28,
    fontWeight: '900',
  },
  counterSeparator: {
    fontSize: 28,
    fontWeight: '900',
    marginHorizontal: 4,
  },
  counterStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
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
  },
  setupInputs: {
    gap: 20,
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  cigaretteControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  cigaretteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cigaretteNumber: {
    fontSize: 48,
    fontWeight: '900',
    minWidth: 80,
    textAlign: 'center',
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
});
