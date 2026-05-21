import { FONTS } from '@/constants';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { GradingProvider } from '@/contexts/GradingContext';
import { Toaster, UpgradeModal } from '@/components/ui/index';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useFonts } from 'expo-font';
import {
  Farro_300Light,
  Farro_400Regular,
  Farro_500Medium,
  Farro_700Bold,
} from '@expo-google-fonts/farro';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Text, TextInput } from 'react-native';

SplashScreen.preventAutoHideAsync();

interface TextWithDefaultProps extends Text {
  defaultProps?: { style?: any };
}
interface TextInputWithDefaultProps extends TextInput {
  defaultProps?: { style?: any };
}

(Text as unknown as TextWithDefaultProps).defaultProps =
  (Text as unknown as TextWithDefaultProps).defaultProps || {};
(Text as unknown as TextWithDefaultProps).defaultProps!.style = { fontFamily: FONTS.bold };

(TextInput as unknown as TextInputWithDefaultProps).defaultProps =
  (TextInput as unknown as TextInputWithDefaultProps).defaultProps || {};
(TextInput as unknown as TextInputWithDefaultProps).defaultProps!.style = {
  fontFamily: FONTS.bold,
};

export default function RootLayout() {
  const [loaded] = useFonts({
    'Farro-Light': Farro_300Light,
    'Farro-Regular': Farro_400Regular,
    'Farro-Medium': Farro_500Medium,
    'Farro-Bold': Farro_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <ErrorBoundary>
      <AuthProvider>
        <SubscriptionProvider>
          <GradingProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="notification" options={{ presentation: 'modal' }} />
              <Stack.Screen name="chat-ai" options={{ presentation: 'modal' }} />

              {/* Vocabulary nested */}
              <Stack.Screen
                name="vocabulary/[bookId]"
                options={{
                  headerShown: true,
                  title: 'Units',
                  headerStyle: { backgroundColor: '#FFC600' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="vocabulary/[bookId]/[unitId]"
                options={{
                  headerShown: true,
                  title: 'Learning',
                  headerStyle: { backgroundColor: '#FFC600' },
                  headerTintColor: '#FFFFFF',
                }}
              />

              {/* Grammar nested */}
              <Stack.Screen
                name="grammar/[bookSlug]"
                options={{
                  headerShown: true,
                  title: 'Units',
                  headerStyle: { backgroundColor: '#5B9557' },
                  headerTintColor: '#FFFFFF',
                }}
              />
              <Stack.Screen
                name="grammar/[bookSlug]/[unitId]"
                options={{
                  headerShown: true,
                  title: 'Lesson',
                  headerStyle: { backgroundColor: '#5B9557' },
                  headerTintColor: '#FFFFFF',
                }}
              />

              {/* IELTS screens */}
              <Stack.Screen name="ielts/intensive/index" />
              <Stack.Screen name="ielts/intensive/[examId]" />
              <Stack.Screen name="ielts/intensive/result/[sessionId]" />
              <Stack.Screen name="ielts/advanced/index" />
              <Stack.Screen name="ielts/advanced/writing/index" />
              <Stack.Screen name="ielts/advanced/writing/[promptId]" />
              <Stack.Screen name="ielts/advanced/writing/result/[sessionId]" />
              <Stack.Screen name="ielts/advanced/speaking/index" />
              <Stack.Screen name="ielts/advanced/speaking/[partId]" />
              <Stack.Screen name="ielts/advanced/speaking/result/[sessionId]" />
              <Stack.Screen name="ielts/advanced/history/index" />
              <Stack.Screen name="ielts/advanced/[skill]/[partId]" />
              <Stack.Screen name="ielts/advanced/[skill]/[partId]/result/[resultId]" />
              <Stack.Screen name="ielts/statistics" />
              <Stack.Screen name="ielts/history" />
              <Stack.Screen name="ielts/roadmap" />
              <Stack.Screen name="ielts/onboarding" />
              <Stack.Screen name="ielts/intensive/custom" />
              <Stack.Screen name="ielts/student-teacher/index" />
              <Stack.Screen name="ielts/student-teacher/[studentId]" />
              <Stack.Screen name="ielts/grammar/index" />
              <Stack.Screen name="ielts/grammar/[bookSlug]" />
              <Stack.Screen name="ielts/grammar/[bookSlug]/[unitId]" />
              <Stack.Screen name="ielts/pronunciation/index" />
              <Stack.Screen name="ielts/pronunciation/[symbol]" />

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

              {/* Pricing / Subscription */}
              <Stack.Screen name="pricing" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
            <Toaster />
            <UpgradeModal />
          </GradingProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
