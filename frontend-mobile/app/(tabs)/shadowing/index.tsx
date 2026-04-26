import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShadowingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa] justify-center items-center">
      <Text className="text-xl font-bold">Shadowing</Text>
      <Text className="text-slate-500">Coming soon in Module 4</Text>
    </SafeAreaView>
  );
}
