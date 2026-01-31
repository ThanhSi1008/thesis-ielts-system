import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function HomeScreen() {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>TOEIC Master AI</Text>
      <Text style={styles.subtitle}>AI-powered TOEIC learning system</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/exams')}
        >
          <Text style={styles.buttonText}>Take Exam</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/results')}
        >
          <Text style={styles.buttonText}>View Results</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {}}
        >
          <Text style={styles.buttonText}>Learning Materials</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})

