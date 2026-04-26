import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />

        {/* Vocabulary nested */}
        <Stack.Screen name="vocabulary/[bookId]" options={{ headerShown: true, title: 'Units', headerStyle: { backgroundColor: '#FFC600' }, headerTintColor: '#FFFFFF' }} />
        <Stack.Screen name="vocabulary/[bookId]/[unitId]" options={{ headerShown: true, title: 'Learning', headerStyle: { backgroundColor: '#FFC600' }, headerTintColor: '#FFFFFF' }} />

        {/* Grammar nested */}
        <Stack.Screen name="grammar/[bookSlug]" options={{ headerShown: true, title: 'Units', headerStyle: { backgroundColor: '#5B9557' }, headerTintColor: '#FFFFFF' }} />
        <Stack.Screen name="grammar/[bookSlug]/[unitId]" options={{ headerShown: true, title: 'Lesson', headerStyle: { backgroundColor: '#5B9557' }, headerTintColor: '#FFFFFF' }} />

        {/* IELTS screens */}
        <Stack.Screen name="ielts/intensive/index" />
        <Stack.Screen name="ielts/intensive/[examId]" />
        <Stack.Screen name="ielts/intensive/result/[sessionId]" />
        <Stack.Screen name="ielts/advanced/index" />
        <Stack.Screen name="ielts/advanced/[skill]/[partId]" />
        <Stack.Screen name="ielts/advanced/[skill]/[partId]/result/[resultId]" />
        <Stack.Screen name="ielts/statistics" />
        <Stack.Screen name="ielts/history" />
        <Stack.Screen name="ielts/roadmap" />
        <Stack.Screen name="ielts/onboarding" />

        {/* Shadowing */}
        <Stack.Screen name="shadowing/index" />
        <Stack.Screen name="shadowing/[lessonId]/[mode]" />

        {/* Vocab Lab */}
        <Stack.Screen name="vocab-lab/index" />
        <Stack.Screen name="vocab-lab/[deckId]" />
        <Stack.Screen name="vocab-lab/study/[deckId]" />

        {/* Student / Teacher */}
        <Stack.Screen name="student-teacher/index" />
        <Stack.Screen name="student-teacher/[studentId]" />
      </Stack>
    </AuthProvider>
  );
}
