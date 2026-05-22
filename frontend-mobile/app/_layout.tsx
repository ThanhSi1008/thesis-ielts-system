import { FONTS } from '@/constants';
import { Stack } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import { GradingProvider } from '@/contexts/GradingContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { Toaster, UpgradeModal } from '@/components/ui/index';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import {
  DictionaryPopup,
  GlobalVocabFab,
  GlobalAddCardFab,
  NotificationPermissionBanner,
} from '@/components';
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
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <SubscriptionProvider>
              <GradingProvider>
                <RootNavigator />
              </GradingProvider>
            </SubscriptionProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function RootNavigator() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', animationDuration: 250 }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notification" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="chat-ai" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />

        {/* Vocabulary nested (legacy redirect paths) */}
        <Stack.Screen
          name="vocabulary/[bookId]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="vocabulary/[bookId]/[unitId]"
          options={{
            headerShown: false,
          }}
        />

        {/* Grammar nested (legacy redirect paths) */}
        <Stack.Screen
          name="grammar/[bookSlug]"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="grammar/[bookSlug]/[unitId]"
          options={{
            headerShown: false,
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

        {/* Foundation (IELTS Foundation Modules) */}
        <Stack.Screen name="ielts/foundation/vocabulary/index" />
        <Stack.Screen name="ielts/foundation/vocabulary/[bookId]" />
        <Stack.Screen name="ielts/foundation/vocabulary/[bookId]/[unitId]" />
        <Stack.Screen name="ielts/foundation/grammar/index" />
        <Stack.Screen name="ielts/foundation/grammar/[bookSlug]" />
        <Stack.Screen name="ielts/foundation/grammar/[bookSlug]/[unitId]" />
        <Stack.Screen name="ielts/foundation/pronunciation/index" />
        <Stack.Screen name="ielts/foundation/pronunciation/[symbol]" />

        {/* Practice Tools */}
        <Stack.Screen name="practice-tools/index" />
        <Stack.Screen name="practice-tools/dictation/index" />
        <Stack.Screen name="practice-tools/shadowing/index" />
        <Stack.Screen name="practice-tools/shadowing/[lessonId]/[mode]" />

        {/* Legacy redirects */}
        <Stack.Screen name="ielts/grammar/index" options={{ headerShown: false }} />
        <Stack.Screen name="ielts/grammar/[bookSlug]" options={{ headerShown: false }} />
        <Stack.Screen name="ielts/grammar/[bookSlug]/[unitId]" options={{ headerShown: false }} />
        <Stack.Screen name="ielts/pronunciation/index" options={{ headerShown: false }} />
        <Stack.Screen name="ielts/pronunciation/[symbol]" options={{ headerShown: false }} />

        {/* Shadowing (legacy redirect paths) */}
        <Stack.Screen name="shadowing/index" options={{ headerShown: false }} />
        <Stack.Screen name="shadowing/[lessonId]/[mode]" options={{ headerShown: false }} />

        {/* Vocab Lab */}
        <Stack.Screen name="vocab-lab/index" />
        <Stack.Screen name="vocab-lab/[deckId]" />
        <Stack.Screen name="vocab-lab/study/[deckId]" />

        {/* Student / Teacher */}
        <Stack.Screen name="student-teacher/index" />
        <Stack.Screen name="student-teacher/[studentId]" />

        {/* Pricing / Subscription */}
        <Stack.Screen name="pricing" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: false }} />
        <Stack.Screen name="payment/vnpay-return" options={{ headerShown: false }} />

        {/* Dev Sandbox Route */}
        <Stack.Screen name="_dev/atom-gallery" options={{ headerShown: true }} />
      </Stack>
      <Toaster />
      <UpgradeModal />
      <GlobalAddCardFab hideFab={true} />
      <GlobalVocabFab />
      <DictionaryPopup />
      <NotificationPermissionBanner />
    </>
  );
}
