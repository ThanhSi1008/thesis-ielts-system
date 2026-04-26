import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExamsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#f8f9fa] justify-center items-center">
      <Text className="text-xl font-bold">IELTS Exams</Text>
      <Text className="text-slate-500">Coming soon in Module 3</Text>
    </SafeAreaView>
  );
}
