import { View, Text } from 'react-native';

export default function VocabLabScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Farro-Bold' }} className="text-xl">
        Vocab Lab
      </Text>
      <Text style={{ fontFamily: 'Farro-Regular' }} className="text-gray-500">
        Review your flashcards here
      </Text>
    </View>
  );
}
