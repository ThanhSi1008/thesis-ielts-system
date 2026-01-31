import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';

// Tab icons
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 20 }}>{name}</Text>
  </View>
);

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="vocabulary"
        options={{
          title: 'Từ vựng',
          tabBarIcon: ({ focused }) => <TabIcon name="📚" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="grammar"
        options={{
          title: 'Ngữ pháp',
          tabBarIcon: ({ focused }) => <TabIcon name="📖" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pronunciation"
        options={{
          title: 'Phát âm',
          tabBarIcon: ({ focused }) => <TabIcon name="🎤" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Hồ sơ',
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
