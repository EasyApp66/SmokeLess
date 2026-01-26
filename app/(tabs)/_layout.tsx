
import React from 'react';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';

export default function TabLayout() {
  console.log('TabLayout: Initializing tab navigation');
  
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      iosIcon: 'house.fill',
      androidIcon: 'home',
      label: 'Home',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      iosIcon: 'chart.bar.fill',
      androidIcon: 'insert-chart',
      label: 'Statistik',
    },
    {
      name: 'settings',
      route: '/(tabs)/settings',
      iosIcon: 'gearshape.fill',
      androidIcon: 'settings',
      label: 'Einstellungen',
    },
  ];

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen key="home" name="(home)" />
        <Stack.Screen key="profile" name="profile" />
        <Stack.Screen key="settings" name="settings" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
