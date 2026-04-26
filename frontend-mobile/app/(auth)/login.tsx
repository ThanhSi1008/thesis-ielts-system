import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../core/auth/store';
import { tokens } from '../../core/design-system/tokens';

export default function LoginScreen() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const handleFakeLogin = () => {
    // This is just to test navigation for now
    // In real app, this would be a full form
    setAccessToken('fake-token');
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Text style={{ fontFamily: 'Farro-Bold' }} className="text-3xl mb-2 text-gray-900">
        Welcome Back
      </Text>
      <Text style={{ fontFamily: 'Farro-Regular' }} className="text-gray-500 mb-10 text-center">
        Master your English, ace your IELTS with AI
      </Text>
      
      <Pressable 
        onPress={handleFakeLogin}
        className="w-full bg-amber-400 py-4 rounded-2xl shadow-lg shadow-amber-200 active:opacity-90"
      >
        <Text style={{ fontFamily: 'Farro-Bold' }} className="text-center text-gray-900 uppercase tracking-wider">
          Sign In
        </Text>
      </Pressable>
    </View>
  );
}
