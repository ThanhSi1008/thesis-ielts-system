import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { COLORS, SPACING, FONT_SIZES, RADIUS } from '@/constants';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      const paddingLarge = SPACING?.lg ?? 24;
      const spacingXlarge = SPACING?.xl ?? 32;
      const spacingMedium = SPACING?.md ?? 16;
      const spacingSmall = SPACING?.sm ?? 12;
      const spacingXsmall = SPACING?.xs ?? 8;
      const radiusMedium = RADIUS?.md ?? 12;
      const radiusFull = RADIUS?.full ?? 9999;

      return (
        <SafeAreaView style={styles.container}>
          <StatusBar style="light" />
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
            </View>

            <Text style={styles.title}>Oops! Something went wrong</Text>
            <Text style={styles.subtitle}>
              An unexpected error occurred. You can try reloading the screen or restarting the app.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView style={styles.debugContainer} contentContainerStyle={styles.debugContent}>
                <Text style={styles.debugTitle}>Developer Info:</Text>
                <Text style={styles.debugText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugStack}>{this.state.errorInfo.componentStack}</Text>
                )}
              </ScrollView>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={this.handleReset}>
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Slate-900
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  errorIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  debugContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#334155',
  },
  debugContent: {
    paddingBottom: 16,
  },
  debugTitle: {
    color: '#EF4444',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 14,
  },
  debugText: {
    color: '#F1F5F9',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 13,
    marginBottom: 12,
  },
  debugStack: {
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  button: {
    backgroundColor: '#2563EB', // Brand blue
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
