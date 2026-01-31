import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="vocabulary/[bookId]" 
          options={{ 
            headerShown: true,
            title: 'Units',
            headerStyle: { backgroundColor: '#3B82F6' },
            headerTintColor: '#FFFFFF',
          }} 
        />
        <Stack.Screen 
          name="vocabulary/[bookId]/[unitId]" 
          options={{ 
            headerShown: true,
            title: 'Learning',
            headerStyle: { backgroundColor: '#3B82F6' },
            headerTintColor: '#FFFFFF',
          }} 
        />
        <Stack.Screen 
          name="grammar/[bookSlug]" 
          options={{ 
            headerShown: true,
            title: 'Units',
            headerStyle: { backgroundColor: '#10B981' },
            headerTintColor: '#FFFFFF',
          }} 
        />
        <Stack.Screen 
          name="grammar/[bookSlug]/[unitId]" 
          options={{ 
            headerShown: true,
            title: 'Lesson',
            headerStyle: { backgroundColor: '#10B981' },
            headerTintColor: '#FFFFFF',
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
