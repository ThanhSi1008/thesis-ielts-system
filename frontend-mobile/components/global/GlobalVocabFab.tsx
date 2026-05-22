import React, { useMemo, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePathname } from 'expo-router';
import { COLORS } from '@/constants';
import { useTheme } from '@/contexts/ThemeContext';

const ASYNC_STORAGE_KEY = 'vocab-fab-position';

export function GlobalVocabFab() {
  const pathname = usePathname();
  const pan = useRef(new Animated.ValueXY()).current;
  const val = useRef({ x: 0, y: 0 });
  const { colors } = useTheme();

  // Keep track of current coordinate values
  useEffect(() => {
    pan.addListener((value) => {
      val.current = value;
    });
    return () => pan.removeAllListeners();
  }, [pan]);

  // Load persisted position on mount
  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const { x, y } = JSON.parse(saved);
          pan.setValue({ x, y });
        }
      })
      .catch((err) => { if (__DEV__) console.log('Failed to load FAB position', err); })
  }, [pan]);

  // Determine if we should hide the FAB on the current screen
  const shouldHide = useMemo(() => {
    const hiddenPatterns = [
      /^\/ielts\/onboarding/,
      /^\/ielts\/intensive\/[^\/]+$/, // e.g. /ielts/intensive/123 (taking an exam)
      /^\/ielts\/basic\/exercise/,
      /^\/ielts\/advanced\/listening/,
      /^\/ielts\/advanced\/reading/,
      /^\/ielts\/advanced\/writing/,
      /^\/ielts\/advanced\/speaking/,
    ];
    return hiddenPatterns.some((pattern) => pattern.test(pathname));
  }, [pathname]);

  // Configure PanResponder for premium drag feel
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({ x: val.current.x, y: val.current.y });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();

        const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
        let targetX = val.current.x;
        let targetY = val.current.y;

        // Constraint calculations to keep the FAB completely on screen
        // Container has default right: 20, bottom: 80
        const fabSize = 56;
        const marginHorizontal = 20;
        const marginVertical = 80;

        const minX = -(SCREEN_W - fabSize - marginHorizontal - 16);
        const maxX = marginHorizontal; // Allow minimal right margin over-drag
        const minY = -(SCREEN_H - fabSize - marginVertical - 60);
        const maxY = 20; // Allow minimal bottom margin over-drag

        if (targetX < minX) targetX = minX;
        if (targetX > maxX) targetX = maxX;
        if (targetY < minY) targetY = minY;
        if (targetY > maxY) targetY = maxY;

        // Smooth physical bounce back inside screens
        Animated.spring(pan, {
          toValue: { x: targetX, y: targetY },
          useNativeDriver: false,
          tension: 70,
          friction: 10,
        }).start(() => {
          AsyncStorage.setItem(ASYNC_STORAGE_KEY, JSON.stringify({ x: targetX, y: targetY })).catch(
            () => {},
          );
        });

        // Distinguish drag from tap: distance moved < 5px is a tap
        if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          DeviceEventEmitter.emit('OPEN_QUICK_ADD_CARD', {
            front: '',
            back: '',
            tags: ['manual'],
          });
        }
      },
    }),
  ).current;

  if (shouldHide) return null;

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 80,
      right: 20,
      zIndex: 999,
    },
    fab: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 8,
      borderWidth: 2,
      borderColor: colors.border,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: pan.getTranslateTransform(),
        },
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <Ionicons name="book" size={24} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
}
