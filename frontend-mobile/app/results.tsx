import { View, Text, StyleSheet } from 'react-native'

export default function ResultsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Results</Text>
      <Text style={styles.subtitle}>View your exam history and scores</Text>
      {/* TODO: Implement results list */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
})

