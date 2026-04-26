import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { pronunciationApi, PronunciationSound, GroupedSounds } from '../../services/api';

export default function PronunciationScreen() {
  const [sounds, setSounds] = useState<GroupedSounds | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'monophthongs' | 'diphthongs' | 'consonants'>('monophthongs');

  useEffect(() => {
    loadSounds();
  }, []);

  const loadSounds = async () => {
    try {
      setLoading(true);
      const data = await pronunciationApi.getSounds();
      setSounds(data);
    } catch (err) {
      setError('Không thể tải danh sách âm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'monophthongs', label: 'Nguyên âm đơn', count: sounds?.monophthongs.length || 0 },
    { key: 'diphthongs', label: 'Nguyên âm đôi', count: sounds?.diphthongs.length || 0 },
    { key: 'consonants', label: 'Phụ âm', count: sounds?.consonants.length || 0 },
  ] as const;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error || !sounds) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSounds}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentSounds = sounds[selectedTab];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎤 Phát âm IPA</Text>
        <Text style={styles.subtitle}>44 âm tiếng Anh</Text>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.tabActive]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[styles.tabText, selectedTab === tab.key && styles.tabTextActive]}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sound Grid */}
      <ScrollView style={styles.soundGrid}>
        <View style={styles.grid}>
          {currentSounds.map((sound) => (
            <TouchableOpacity key={sound.id} style={styles.soundCard}>
              <Text style={styles.soundSymbol}>{sound.symbol}</Text>
              <Text style={styles.soundWord}>{sound.word}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  errorText: { color: '#EF4444', fontSize: 16, marginBottom: 16 },
  retryButton: { backgroundColor: '#F59E0B', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  header: { padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  tabContainer: { paddingHorizontal: 16, maxHeight: 50 },
  tab: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  tabActive: { backgroundColor: '#F59E0B' },
  tabText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  tabTextActive: { color: '#FFFFFF' },
  soundGrid: { flex: 1, padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  soundCard: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: '1%',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  soundSymbol: { fontSize: 24, fontWeight: 'bold', color: '#F59E0B' },
  soundWord: { fontSize: 11, color: '#6B7280', marginTop: 4 },
});
