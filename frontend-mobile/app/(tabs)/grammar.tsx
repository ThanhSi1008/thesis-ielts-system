import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { grammarApi, GrammarBook } from '../../services/api';

export default function GrammarScreen() {
  const [books, setBooks] = useState<GrammarBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await grammarApi.getBooks();
      setBooks(data);
    } catch (err) {
      setError('Không thể tải danh sách sách');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      Elementary: 'Cơ bản',
      Intermediate: 'Trung cấp',
      Advanced: 'Nâng cao',
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBooks}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Ngữ pháp</Text>
        <Text style={styles.subtitle}>Cambridge Grammar in Use Series</Text>
      </View>

      <View style={styles.list}>
        {books.map((book) => (
          <Link key={book.id} href={`/grammar/${book.slug}`} asChild>
            <TouchableOpacity style={[styles.bookCard, { borderLeftColor: book.color }]}>
              <View style={styles.bookContent}>
                <Text style={styles.bookLevel}>{getLevelLabel(book.level)}</Text>
                <Text style={styles.bookTitle}>{book.name}</Text>
                <Text style={styles.bookAuthor}>by {book.author}</Text>
                <View style={styles.bookStats}>
                  <Text style={styles.statBadge}>{book.unitCount} units</Text>
                </View>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  errorText: { color: '#EF4444', fontSize: 16, marginBottom: 16 },
  retryButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  header: { padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  list: { padding: 16 },
  bookCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookContent: { flex: 1 },
  bookLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bookTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  bookAuthor: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  bookStats: { flexDirection: 'row' },
  statBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    color: '#4B5563',
  },
  arrow: { fontSize: 20, color: '#9CA3AF' },
});
