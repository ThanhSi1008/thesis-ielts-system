import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { vocabularyApi, VocabularyBook } from '../../services/api';

export default function VocabularyScreen() {
  const [books, setBooks] = useState<VocabularyBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const data = await vocabularyApi.getBooks();
      setBooks(data);
    } catch (err) {
      setError('Không thể tải danh sách sách');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
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
        <Text style={styles.title}>📚 Từ vựng</Text>
        <Text style={styles.subtitle}>4000 Essential English Words</Text>
      </View>

      <View style={styles.grid}>
        {books.map((book, index) => (
          <Link key={book.id} href={`/vocabulary/${book.id}`} asChild>
            <TouchableOpacity style={styles.bookCard}>
              <View style={[styles.bookCover, { backgroundColor: getBookColor(index) }]}>
                <Text style={styles.bookNumber}>Book {index + 1}</Text>
              </View>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{book.name}</Text>
                <Text style={styles.bookStats}>
                  {book._count.units} units • {book.wordCount} words
                </Text>
              </View>
            </TouchableOpacity>
          </Link>
        ))}
      </View>
    </ScrollView>
  );
}

const getBookColor = (index: number) => {
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280' },
  errorText: { color: '#EF4444', fontSize: 16, marginBottom: 16 },
  retryButton: { backgroundColor: '#3B82F6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  header: { padding: 20, paddingTop: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  bookCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: '1.5%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookCover: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookNumber: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  bookInfo: { padding: 12 },
  bookTitle: { fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  bookStats: { fontSize: 12, color: '#6B7280' },
});
