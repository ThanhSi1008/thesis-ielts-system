import { View, Text, ScrollView } from 'react-native';
import { tokens } from '../../core/design-system/tokens';

export default function DashboardScreen() {
  return (
    <View className="flex-1 bg-white">
      <View className="pt-16 px-6 pb-6 bg-amber-400/10 border-b border-amber-100">
        <Text style={{ fontFamily: 'Farro-Bold' }} className="text-2xl text-gray-900">
          Hello, Learner! 👋
        </Text>
        <Text style={{ fontFamily: 'Farro-Regular' }} className="text-gray-600 mt-1">
          Ready to boost your IELTS score today?
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        <View className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-6">
          <Text style={{ fontFamily: 'Farro-Bold' }} className="text-lg mb-2">
            Weekly Progress
          </Text>
          <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <View className="h-full bg-amber-400 w-1/3" />
          </View>
          <Text style={{ fontFamily: 'Farro-Medium' }} className="text-xs text-gray-400 mt-2">
            3/10 goals completed
          </Text>
        </View>

        <Text style={{ fontFamily: 'Farro-Bold' }} className="text-xl mb-4">
          Recommended for you
        </Text>
        
        {/* Placeholders */}
        {[1, 2, 3].map((i) => (
          <View key={i} className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
            <View className="w-10 h-10 bg-amber-100 rounded-xl mb-3" />
            <Text style={{ fontFamily: 'Farro-Bold' }} className="text-base">
              IELTS Reading Practice #{i}
            </Text>
            <Text style={{ fontFamily: 'Farro-Regular' }} className="text-sm text-gray-500">
              Improve your skimming skills
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
