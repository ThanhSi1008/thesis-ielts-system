import React from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  globalError?: string | null;
}

export function AuthLayout({ title, subtitle, children, globalError }: AuthLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-light">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            className="px-6 py-10"
            keyboardShouldPersistTaps="handled"
          >
            <View className="mb-10 mt-10">
              <Text className="text-4xl font-farro-bold text-dark mb-2">{title}</Text>
              <Text className="text-base font-farro text-slate-500">{subtitle}</Text>
            </View>

            {globalError && (
              <View className="bg-danger/10 p-4 rounded-lg mb-6 border border-danger/20">
                <Text className="text-danger text-sm font-medium">{globalError}</Text>
              </View>
            )}

            {children}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
