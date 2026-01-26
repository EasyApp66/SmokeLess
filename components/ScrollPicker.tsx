
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const { height } = Dimensions.get('window');
const ITEM_HEIGHT = 50;
const VISIBLE_ITEMS = 5;

interface ScrollPickerProps {
  items: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
  textColor: string;
  primaryColor: string;
}

export function ScrollPicker({
  items,
  selectedIndex,
  onValueChange,
  textColor,
  primaryColor,
}: ScrollPickerProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(selectedIndex);
  const lastHapticIndex = useRef(selectedIndex);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: selectedIndex * ITEM_HEIGHT,
        animated: false,
      });
    }, 100);
  }, [selectedIndex]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    
    if (index !== lastHapticIndex.current && index >= 0 && index < items.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      lastHapticIndex.current = index;
    }
    
    setCurrentIndex(index);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    
    if (index >= 0 && index < items.length) {
      scrollViewRef.current?.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true,
      });
      onValueChange(index);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.selectedIndicator, { borderColor: primaryColor }]} />
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScroll={handleScroll}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={{ height: ITEM_HEIGHT * 2 }} />
        {items.map((item, index) => {
          const distance = Math.abs(index - currentIndex);
          const opacity = Math.max(0.2, 1 - distance * 0.3);
          const scale = Math.max(0.7, 1 - distance * 0.15);
          
          return (
            <View
              key={index}
              style={[
                styles.item,
                {
                  height: ITEM_HEIGHT,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            >
              <Text
                style={[
                  styles.itemText,
                  {
                    color: index === currentIndex ? primaryColor : textColor,
                    fontWeight: index === currentIndex ? '700' : '500',
                  },
                ]}
              >
                {item}
              </Text>
            </View>
          );
        })}
        <View style={{ height: ITEM_HEIGHT * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    zIndex: 1,
    pointerEvents: 'none',
  },
  scrollContent: {
    paddingVertical: 0,
  },
  item: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 24,
  },
});
