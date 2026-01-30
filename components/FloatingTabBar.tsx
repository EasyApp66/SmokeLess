
import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Href } from 'expo-router';

export interface TabBarItem {
  name: string;
  route: Href;
  iosIcon: string;
  androidIcon: string;
  label: string;
}

interface FloatingTabBarProps {
  tabs: TabBarItem[];
}

export default function FloatingTabBar({ tabs }: FloatingTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  console.log('FloatingTabBar: Current pathname:', pathname);

  const activeTabIndex = React.useMemo(() => {
    let bestMatch = -1;
    let bestMatchScore = 0;

    tabs.forEach((tab, index) => {
      let score = 0;

      if (pathname === tab.route) {
        score = 100;
      } else if (pathname.startsWith(tab.route as string)) {
        score = 80;
      } else if (pathname.includes(tab.name)) {
        score = 60;
      }

      if (score > bestMatchScore) {
        bestMatchScore = score;
        bestMatch = index;
      }
    });

    return bestMatch >= 0 ? bestMatch : 0;
  }, [pathname, tabs]);

  const handleTabPress = (route: Href, index: number) => {
    console.log('FloatingTabBar: Tab pressed:', route);
    router.push(route);
  };

  return (
    <View style={styles.container}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        style={[
          styles.blurContainer,
          {
            backgroundColor: isDark
              ? 'rgba(28, 28, 30, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
      >
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => {
            const isActive = activeTabIndex === index;

            return (
              <React.Fragment key={index}>
                <AnimatedTabButton
                  isActive={isActive}
                  isDark={isDark}
                  tab={tab}
                  onPress={() => handleTabPress(tab.route, index)}
                />
              </React.Fragment>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

interface AnimatedTabButtonProps {
  isActive: boolean;
  isDark: boolean;
  tab: TabBarItem;
  onPress: () => void;
}

function AnimatedTabButton({ isActive, isDark, tab, onPress }: AnimatedTabButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value, { damping: 15, stiffness: 150 }) }],
    };
  });

  const handlePressIn = () => {
    scale.value = 0.9;
  };

  const handlePressOut = () => {
    scale.value = 1;
  };

  const activeBackgroundColor = 'rgba(52, 199, 89, 1)';
  const inactiveBackgroundColor = 'transparent';
  const activeIconColor = '#FFFFFF';
  const inactiveIconColor = isDark ? 'rgba(152, 152, 157, 1)' : 'rgba(142, 142, 147, 1)';

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        style={[
          styles.tabButton,
          {
            backgroundColor: isActive ? activeBackgroundColor : inactiveBackgroundColor,
          },
        ]}
      >
        <IconSymbol
          ios_icon_name={tab.iosIcon}
          android_material_icon_name={tab.androidIcon}
          size={26}
          color={isActive ? activeIconColor : inactiveIconColor}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    pointerEvents: 'box-none',
  },
  blurContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(40px)',
      },
      default: {},
    }),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabButton: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
