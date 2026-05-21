import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const SECTIONS = [
  {
    title: 'Learning',
    items: [
      {
        label: 'Vocabulary Books',
        icon: 'book' as IoniconsName,
        color: '#FFC600',
        route: '/vocabulary',
      },
      { label: 'Grammar', icon: 'library' as IoniconsName, color: '#5B9557', route: '/grammar' },
      {
        label: 'Pronunciation',
        icon: 'mic-circle' as IoniconsName,
        color: '#E11D48',
        route: '/(tabs)/pronunciation',
      },
      {
        label: 'Student / Teacher',
        icon: 'people' as IoniconsName,
        color: '#7C3AED',
        route: '/student-teacher',
      },
    ],
  },
  {
    title: 'IELTS',
    items: [
      {
        label: 'Advanced Practice',
        icon: 'trending-up' as IoniconsName,
        color: '#2563EB',
        route: '/ielts/advanced',
      },
      {
        label: 'Mock Tests',
        icon: 'flash' as IoniconsName,
        color: '#D97706',
        route: '/ielts/intensive',
      },
      {
        label: 'Test History',
        icon: 'time' as IoniconsName,
        color: '#059669',
        route: '/ielts/history',
      },
      {
        label: 'Statistics',
        icon: 'bar-chart' as IoniconsName,
        color: '#0EA5E9',
        route: '/ielts/statistics',
      },
      { label: 'Roadmap', icon: 'map' as IoniconsName, color: '#6366F1', route: '/(tabs)/ielts' },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        label: 'Profile',
        icon: 'person' as IoniconsName,
        color: '#64748B',
        route: '/(tabs)/profile',
      },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const firstName = user?.firstName || user?.email?.split('@')[0] || 'Student';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.name}>{firstName}</Text>
        </View>
      </View>

      {/* Sections */}
      {SECTIONS.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.sectionCard}>
            {section.items.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.row, i < section.items.length - 1 && styles.rowBorder]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: item.color + '18' }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZES.xl, fontWeight: '800' },
  greeting: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary },
  name: { fontSize: FONT_SIZES.xl, fontWeight: '800', color: COLORS.text },

  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    gap: SPACING.md,
  },
  rowBorder: { borderBottomWidth: 1, borderColor: COLORS.border },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    paddingVertical: 14,
    paddingHorizontal: SPACING.lg,
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.error + '40',
  },
  logoutText: { fontSize: FONT_SIZES.md, fontWeight: '700', color: COLORS.error },
});
