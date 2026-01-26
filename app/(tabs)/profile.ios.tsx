
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { colors } from '@/styles/commonStyles';
import { dayApi, reminderApi } from '@/utils/api';
import { IconSymbol } from '@/components/IconSymbol';

const { width } = Dimensions.get('window');

interface DayStats {
  date: string;
  completed: number;
  target: number;
}

const WEEKDAYS = ['Sa', 'So', 'Mo', 'Di', 'Mi', 'Do', 'Fr'];

export default function StatisticsScreen() {
  console.log('StatisticsScreen: Rendering statistics screen (iOS)');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const [weekStats, setWeekStats] = useState<DayStats[]>([]);
  const [totalSmoked, setTotalSmoked] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);
  const [bestDay, setBestDay] = useState<DayStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
    console.log('StatisticsScreen: Loading statistics');
    setLoading(true);
    setError(null);
    
    try {
      const stats: DayStats[] = [];
      let total = 0;
      let daysWithData = 0;
      let minSmoked = Infinity;
      let bestDayData: DayStats | null = null;

      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = formatDate(date);

        try {
          // Fetch day from backend
          const day = await dayApi.getByDate(dateStr);
          
          // Fetch reminders for this day
          const reminders = await reminderApi.getByDayId(day.id);
          
          const completed = reminders.filter(r => r.completed).length;
          stats.push({
            date: dateStr,
            completed,
            target: day.targetCigarettes,
          });
          total += completed;
          daysWithData++;

          if (completed < minSmoked) {
            minSmoked = completed;
            bestDayData = { date: dateStr, completed, target: day.targetCigarettes };
          }
        } catch (dayError: any) {
          // Day not found, add empty stats
          console.log(`StatisticsScreen: No data for ${dateStr}`);
          stats.push({
            date: dateStr,
            completed: 0,
            target: 0,
          });
        }
      }

      console.log('StatisticsScreen: Loaded stats:', { total, daysWithData, bestDayData });
      setWeekStats(stats);
      setTotalSmoked(total);
      setAvgPerDay(daysWithData > 0 ? total / daysWithData : 0);
      setBestDay(bestDayData);
    } catch (error: any) {
      console.error('StatisticsScreen: Error loading statistics:', error);
      setError('Fehler beim Laden der Statistiken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string): string => {
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.`;
  };

  const maxValue = Math.max(...weekStats.map(s => s.completed), 1);

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
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeIn.duration(600)} style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>Statistik</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Letzte 7 Tage
            </Text>
          </Animated.View>

          {loading && (
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              style={[styles.loadingCard, { backgroundColor: theme.card }]}
            >
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Lädt Statistiken...
              </Text>
            </Animated.View>
          )}

          {!loading && (
            <>
              <Animated.View
                entering={FadeInDown.delay(200).duration(600)}
                style={[styles.chartCard, { backgroundColor: theme.card }]}
              >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Wochenübersicht
            </Text>
            <View style={styles.chart}>
              {weekStats.map((stat, index) => {
                const date = new Date(stat.date);
                const weekday = WEEKDAYS[date.getDay()];
                const heightPercent = stat.completed > 0 ? (stat.completed / maxValue) * 100 : 0;

                return (
                  <View key={index} style={styles.chartBar}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${Math.max(heightPercent, 5)}%`,
                          backgroundColor: stat.completed > 0 ? theme.primaryRgb : theme.border,
                        },
                      ]}
                    />
                    <Text style={[styles.chartLabel, { color: theme.textSecondary }]}>
                      {weekday}
                    </Text>
                  </View>
                );
              })}
            </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(400).duration(600)}
                style={styles.statsGrid}
              >
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Gesamt geraucht
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalSmoked}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Ø pro Tag
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {avgPerDay.toFixed(1)}
              </Text>
            </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(600).duration(600)}
                style={styles.statsGrid}
              >
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Eingespart
              </Text>
              <Text style={[styles.statValue, { color: theme.primary }]}>
                {weekStats.reduce((sum, s) => sum + (s.target - s.completed), 0)}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                Bester Tag
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {bestDay ? bestDay.completed : 0}
              </Text>
              {bestDay && (
                <Text style={[styles.statSubtext, { color: theme.textSecondary }]}>
                  ({formatDisplayDate(bestDay.date)})
                </Text>
              )}
            </View>
              </Animated.View>

              <Animated.View
                entering={FadeInDown.delay(800).duration(600)}
                style={[styles.detailsCard, { backgroundColor: theme.card }]}
              >
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              Tagesdetails
            </Text>
            <View style={styles.detailsList}>
              {weekStats.map((stat, index) => {
                const date = new Date(stat.date);
                const weekday = WEEKDAYS[date.getDay()];
                const displayDate = formatDisplayDate(stat.date);

                return (
                  <View key={index} style={styles.detailRow}>
                    <View style={styles.detailLeft}>
                      <Text style={[styles.detailDay, { color: theme.text }]}>
                        {weekday}
                      </Text>
                      <Text style={[styles.detailDate, { color: theme.textSecondary }]}>
                        {displayDate}
                      </Text>
                    </View>
                    <Text style={[styles.detailValue, { color: theme.text }]}>
                      {stat.completed > 0 ? `${stat.completed}/${stat.target}` : 'Keine Daten'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Animated.View>

          <View style={{ height: 100 }} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  loadingCard: {
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 20,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '70%',
    borderRadius: 8,
    minHeight: 8,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
  },
  statSubtext: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  detailsCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
  },
  detailsList: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailDay: {
    fontSize: 16,
    fontWeight: '700',
    width: 30,
  },
  detailDate: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
  },
});
