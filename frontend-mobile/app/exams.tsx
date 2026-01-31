import { View, Text, StyleSheet } from 'react-native'

export default function ExamsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Exams</Text>
      <Text style={styles.subtitle}>Select an exam to begin</Text>
      {/* TODO: Implement exam list */}
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

