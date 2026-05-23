import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  PanResponder,
  Dimensions,
  Pressable,
  Platform,
  ViewStyle,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { spacing, radius } from '@/constants';
import Text from '../atoms/Text';
import IconButton from '../atoms/IconButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPointHeight?: number; // 0 to 1 representing percentage of screen height (e.g. 0.6)
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function BottomSheet({
  visible,
  onClose,
  snapPointHeight = 0.5,
  title,
  children,
  style,
}: BottomSheetProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  const sheetHeight = SCREEN_HEIGHT * Math.max(0.1, Math.min(1, snapPointHeight));

  // Animation values
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, sheetHeight]);

  const handleClose = () => {
    // Animate out first, then call onClose
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  // Configure PanResponder for swipe to dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only trigger pan responder if dragging down
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          handleClose();
        } else {
          // Snap back to open position
          Animated.spring(translateY, {
            toValue: 0,
            tension: 65,
            friction: 10,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Backdrop pressable */}
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        >
          <Pressable style={styles.backdropPress} onPress={handleClose} />
        </Animated.View>

        {/* Keyboard avoid wrappers */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          {/* Bottom Sheet main card container */}
          <Animated.View
            style={[
              styles.sheetContainer,
              {
                height: sheetHeight,
                transform: [{ translateY }],
              },
              style,
            ]}
          >
            {/* Grab handle bar for gesture interactions */}
            <View {...panResponder.panHandlers} style={styles.dragHandleContainer}>
              <View style={styles.dragIndicator} />
            </View>

            {/* Header row */}
            <View style={styles.header}>
              <View style={styles.titleWrapper}>
                {title && (
                  <Text variant="title" weight="bold" color="text" numberOfLines={1}>
                    {title}
                  </Text>
                )}
              </View>
              <IconButton
                icon="close"
                onPress={handleClose}
                size="md"
                accessibilityLabel="Close sheet"
              />
            </View>

            {/* Content box */}
            <View style={styles.content}>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: '#000000',
    },
    backdropPress: {
      flex: 1,
    },
    keyboardAvoid: {
      justifyContent: 'flex-end',
    },
    sheetContainer: {
      width: '100%',
      backgroundColor: colors.bgElevated || colors.card || '#FFFFFF',
      borderTopLeftRadius: radius.xl * 2,
      borderTopRightRadius: radius.xl * 2,
      paddingBottom: Platform.OS === 'ios' ? spacing[8] : spacing[4],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 10,
    },
    dragHandleContainer: {
      width: '100%',
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dragIndicator: {
      width: 40,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: colors.border || '#E2E8F0',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[2],
    },
    titleWrapper: {
      flex: 1,
      marginRight: spacing[4],
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing[4],
    },
  });
}
