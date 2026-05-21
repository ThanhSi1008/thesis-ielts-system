import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useNotification } from '@/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function NotificationPermissionBanner() {
  const { showPermissionBanner, dismissPermissionBanner, requestPushPermission } = useNotification();
  const slideAnim = useRef(new Animated.Value(-300)).current;

  useEffect(() => {
    if (showPermissionBanner) {
      Animated.spring(slideAnim, {
        toValue: Platform.OS === 'ios' ? 60 : 40, // Adjust for top status bar
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showPermissionBanner]);

  if (!showPermissionBanner) return null;

  return (
    <Animated.View style={[styles.bannerContainer, { transform: [{ translateY: slideAnim }] }]}>
      <View style={styles.mainCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications-outline" size={24} color="#3B82F6" />
          </View>
          <View style={styles.textColumn}>
            <Text style={styles.title}>Reminders & Results</Text>
            <Text style={styles.description}>
              Get real-time streak reminders, instant feedback on speaking/writing tests, and special AI announcements!
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.laterButton} onPress={dismissPermissionBanner} activeOpacity={0.8}>
            <Text style={styles.laterText}>Maybe Later</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.enableButton} onPress={requestPushPermission} activeOpacity={0.8}>
            <Text style={styles.enableText}>Enable</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    zIndex: 9999,
    alignItems: 'center',
  },
  mainCard: {
    width: width - 40,
    backgroundColor: '#0F172A', // Slate 900
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#3B82F6', // Blue 500
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#F8FAFC', // Slate 50
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: '#94A3B8', // Slate 400
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 14,
    gap: 12,
  },
  laterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  laterText: {
    fontFamily: 'Outfit-Medium',
    fontSize: 14,
    color: '#94A3B8',
  },
  enableButton: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#3B82F6', // Vibrant Blue
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  enableText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
});
