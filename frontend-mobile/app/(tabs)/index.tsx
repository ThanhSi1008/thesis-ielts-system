import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Link } from 'expo-router';

const learningPath = [
  { id: 1, title: 'Từ vựng cơ bản', description: '4000 từ thông dụng', icon: '📚', route: '/vocabulary' as const, color: '#3B82F6' },
  { id: 2, title: 'Ngữ pháp', description: 'Cambridge Grammar Series', icon: '📖', route: '/grammar' as const, color: '#10B981' },
  { id: 3, title: 'Phát âm IPA', description: '44 âm tiếng Anh', icon: '🎤', route: '/pronunciation' as const, color: '#F59E0B' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Xin chào! 👋</Text>
        <Text style={styles.title}>TOEIC Master AI</Text>
        <Text style={styles.subtitle}>Lộ trình học tiếng Anh thông minh</Text>
      </View>

      {/* Learning Path */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lộ trình học</Text>
        {learningPath.map((item) => (
          <Link key={item.id} href={item.route} asChild>
            <TouchableOpacity style={[styles.card, { borderLeftColor: item.color }]}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thống kê hôm nay</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Từ đã học</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Bài tập</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Phút học</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greeting: { color: '#BFDBFE', fontSize: 16, marginBottom: 4 },
  title: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { color: '#BFDBFE', fontSize: 14 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: { fontSize: 32, marginRight: 16 },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  cardDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  arrow: { fontSize: 20, color: '#9CA3AF' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#3B82F6' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
});
