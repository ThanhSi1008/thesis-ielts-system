import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack } from 'expo-router';
import { grammarApi, GrammarUnitWithContent } from '../../../services/api';

export default function GrammarLessonScreen() {
  const { bookSlug, unitId } = useLocalSearchParams<{ bookSlug: string; unitId: string }>();
  const [unit, setUnit] = useState<GrammarUnitWithContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'theory' | 'exercises'>('theory');

  useEffect(() => {
    if (unitId) loadUnit();
  }, [unitId]);

  const loadUnit = async () => {
    try {
      setLoading(true);
      const data = await grammarApi.getUnit(unitId!);
      setUnit(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  if (!unit) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy bài học</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: unit.title }} />
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'theory' && styles.tabActive]}
            onPress={() => setSelectedTab('theory')}
          >
            <Text style={[styles.tabText, selectedTab === 'theory' && styles.tabTextActive]}>
              📖 Lý thuyết
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'exercises' && styles.tabActive]}
            onPress={() => setSelectedTab('exercises')}
          >
            <Text style={[styles.tabText, selectedTab === 'exercises' && styles.tabTextActive]}>
              ✏️ Bài tập ({unit.exercises.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {selectedTab === 'theory' ? (
            <View style={styles.theoryCard}>
              <Text style={styles.theoryText}>
                {unit.theoryContent || 'Nội dung lý thuyết đang được cập nhật...'}
              </Text>
            </View>
          ) : (
            unit.exercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <Text style={styles.exerciseNumber}>Câu {index + 1}</Text>
                <Text style={styles.exerciseQuestion}>{exercise.question}</Text>
                <TouchableOpacity style={styles.showAnswerBtn}>
                  <Text style={styles.showAnswerText}>Xem đáp án</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', padding: 8 },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: { backgroundColor: '#10B981' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#FFFFFF' },
  content: { flex: 1, padding: 16 },
  theoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  theoryText: { fontSize: 16, lineHeight: 26, color: '#374151' },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  exerciseNumber: { fontSize: 12, color: '#10B981', fontWeight: '600', marginBottom: 8 },
  exerciseQuestion: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  showAnswerBtn: {
    marginTop: 12,
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  showAnswerText: { color: '#10B981', fontWeight: '600' },
});
