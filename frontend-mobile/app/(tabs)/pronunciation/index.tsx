import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PronunciationScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa] justify-center items-center">
      <Text className="text-xl font-bold">Pronunciation</Text>
      <Text className="text-slate-500">Coming soon in Module 4</Text>
    </SafeAreaView>
  );
}
