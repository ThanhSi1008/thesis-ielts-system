import { View, Text } from 'react-native';

export default function IeltsScreen() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text style={{ fontFamily: 'Farro-Bold' }} className="text-xl">
        IELTS Preparation
      </Text>
      <Text style={{ fontFamily: 'Farro-Regular' }} className="text-gray-500">
        Coming Soon...
      </Text>
    </View>
  );
}
