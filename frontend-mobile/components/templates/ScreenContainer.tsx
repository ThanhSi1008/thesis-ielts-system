import React from 'react';
import { StyleSheet, View, ScrollView, ViewStyle, ScrollViewProps } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemedStyles } from '@/hooks/useThemedStyles';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  edges?: Edge[];
  statusBarStyle?: 'light' | 'dark' | 'auto';
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'style' | 'contentContainerStyle'>;
}

export default function ScreenContainer({
  children,
  scrollable = false,
  header,
  footer,
  edges = ['left', 'right'], // safe area edges, leave top/bottom to custom headers/footers often
  statusBarStyle = 'auto',
  style,
  contentContainerStyle,
  scrollViewProps,
}: ScreenContainerProps) {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(createStyles);

  // Automatically determine status bar styling matches theme
  const resolvedStatusBarStyle =
    statusBarStyle === 'auto' ? (isDark ? 'light' : 'dark') : statusBarStyle;

  const renderContent = () => {
    if (scrollable) {
      return (
        <ScrollView
          style={[styles.scrollView, style]}
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      );
    }

    return <View style={[styles.mainView, style, contentContainerStyle]}>{children}</View>;
  };

  return (
    <SafeAreaView edges={edges} style={styles.safeContainer}>
      <StatusBar style={resolvedStatusBarStyle} />

      {/* Header Slot */}
      {header && <View style={styles.headerSlot}>{header}</View>}

      {/* Main Body Content */}
      <View style={styles.bodySlot}>{renderContent()}</View>

      {/* Footer Slot */}
      {footer && <View style={styles.footerSlot}>{footer}</View>}
    </SafeAreaView>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background || '#FFFFFF',
    },
    headerSlot: {
      zIndex: 5,
    },
    bodySlot: {
      flex: 1,
    },
    footerSlot: {
      zIndex: 5,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
    },
    mainView: {
      flex: 1,
    },
  });
}
