import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Link, Stack } from 'expo-router';
import { grammarApi, GrammarBookWithUnits } from '../../services/api';

export default function GrammarBookScreen() {
  const { bookSlug } = useLocalSearchParams<{ bookSlug: string }>();
  const [book, setBook] = useState<GrammarBookWithUnits | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookSlug) loadBook();
  }, [bookSlug]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const data = await grammarApi.getBook(bookSlug!);
      setBook(data);
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

  if (!book) {
    return (
      <View style={styles.centered}>
        <Text>Không tìm thấy sách</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: book.name }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{book.name}</Text>
          <Text style={styles.subtitle}>{book.units.length} units</Text>
        </View>

        <View style={styles.list}>
          {book.units.map((unit) => (
            <Link key={unit.id} href={`/grammar/${bookSlug}/${unit.id}`} asChild>
              <TouchableOpacity style={styles.unitCard}>
                <View style={styles.unitNumber}>
                  <Text style={styles.unitNumberText}>{unit.order}</Text>
                </View>
                <Text style={styles.unitTitle}>{unit.title}</Text>
                <Text style={styles.arrow}>→</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  list: { padding: 16 },
  unitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  unitNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unitNumberText: { color: '#FFFFFF', fontWeight: 'bold' },
  unitTitle: { flex: 1, fontSize: 15, color: '#1F2937' },
  arrow: { fontSize: 18, color: '#9CA3AF' },
});
