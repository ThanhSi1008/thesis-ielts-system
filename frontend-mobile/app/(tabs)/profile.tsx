import { View, Text, Pressable } from 'react-native';
import { useAuthStore } from '../../core/auth/store';
import { useRouter } from 'expo-router';
import { LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="pt-10 mb-10 items-center">
        <View className="w-24 h-24 bg-amber-100 rounded-full items-center justify-center mb-4">
          <Text style={{ fontFamily: 'Farro-Bold' }} className="text-2xl text-amber-600">JS</Text>
        </View>
        <Text style={{ fontFamily: 'Farro-Bold' }} className="text-2xl text-gray-900">John Smith</Text>
        <Text style={{ fontFamily: 'Farro-Regular' }} className="text-gray-500">john.smith@example.com</Text>
      </View>

      <View className="flex-1">
        <Pressable 
          onPress={handleLogout}
          className="flex-row items-center gap-3 p-4 bg-red-50 rounded-2xl border border-red-100"
        >
          <LogOut size={20} color="#ef4444" />
          <Text style={{ fontFamily: 'Farro-Bold' }} className="text-red-500">Log Out</Text>
        </Pressable>
      </View>
    </View>
  );
}
