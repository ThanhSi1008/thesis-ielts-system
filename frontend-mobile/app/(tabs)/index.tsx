import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { COLORS, SPACING, RADIUS, FONT_SIZES } from '@/constants';

const { width } = Dimensions.get('window');

const levels = [
  {
    id: 1,
    level: 1,
    title: 'Nền tảng',
    description: 'Vocabulary & Pronunciation',
    color: COLORS.level1,
    route: '/vocabulary',
    alignment: 'flex-end' as const,
  },
  {
    id: 2,
    level: 2,
    title: 'TOEIC Cơ bản',
    description: 'Basic Grammar & Listening',
    color: COLORS.level2,
    route: '/grammar',
    alignment: 'flex-start' as const,
  },
  {
    id: 3,
    level: 3,
    title: 'TOEIC Nâng cao',
    description: 'Advanced Practice',
    color: COLORS.level3,
    route: '/(tabs)/pronunciation', // Temporary mapping or /exams
    alignment: 'flex-end' as const,
  },
  {
    id: 4,
    level: 4,
    title: 'TOEIC Chuyên sâu',
    description: 'Mastery & Simulation',
    color: COLORS.level4,
    route: '/exams',
    alignment: 'flex-start' as const,
  },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào! 👋</Text>
          <Text style={styles.headerTitle}>TOEIC Master AI</Text>
          <Text style={styles.headerSubtitle}>Lộ trình học tiếng Anh thông minh</Text>
        </View>
        <View style={styles.avatarPlaceholder} />
      </View>

      {/* Roadmap Container */}
      <View style={styles.roadmapContainer}>
        {/* Dashed Line */}
        <View style={styles.dashedLine} />

        {levels.map((item, index) => (
          <View key={item.id} style={[styles.levelRow, { justifyContent: item.alignment }]}>
            {/* Level Badge (Absolute Centered) */}
            <View style={[styles.badgeContainer, { backgroundColor: item.color }]}>
              <Text style={styles.badgeText}>{item.level}</Text>
            </View>

            {/* Content Card */}
            <Link href={item.route as any} asChild>
              <TouchableOpacity
                style={[
                  styles.card,
                  item.alignment === 'flex-end' ? styles.cardRight : styles.cardLeft,
                  { borderColor: item.color }
                ]}
                activeOpacity={0.9}
              >
                <Text style={[styles.cardTitle, { color: item.color }]}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        ))}
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.level1 }]}>12</Text>
            <Text style={styles.statLabel}>Từ mới</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.level2 }]}>5</Text>
            <Text style={styles.statLabel}>Ngữ pháp</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: COLORS.level4 }]}>15m</Text>
            <Text style={styles.statLabel}>Thời gian</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#BFDBFE',
    fontSize: FONT_SIZES.md,
    marginBottom: 4,
    fontFamily: 'System',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#E0F2FE',
    fontSize: FONT_SIZES.sm,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  roadmapContainer: {
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
    marginTop: SPACING.lg,
  },
  dashedLine: {
    position: 'absolute',
    left: '50%',
    top: 20,
    bottom: 20,
    width: 2,
    backgroundColor: '#E5E7EB',
    transform: [{ translateX: -1 }],
  },
  levelRow: {
    flexDirection: 'row',
    marginBottom: 40,
    position: 'relative',
    alignItems: 'center',
    width: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -20 }],
    zIndex: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    width: (width - SPACING.lg * 2) / 2 - 30, // Half width minus padding and space for center badge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  cardLeft: {
    marginRight: 'auto',
    borderLeftWidth: 0,
    borderRightWidth: 4,
  },
  cardRight: {
    marginLeft: 'auto',
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  statsSection: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
