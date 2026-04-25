import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused }: { name: IoniconsName; focused: boolean }) {
  return (
    <Ionicons
      name={focused ? name : `${name}-outline` as IoniconsName}
      size={24}
      color={focused ? COLORS.primary : COLORS.textMuted}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 6,
          paddingBottom: insets.bottom + 6,
          height: 56 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      {/* Hidden redirect screen */}
      <Tabs.Screen name="index" options={{ href: null }} />

      {/* ── Visible tabs ── */}
      <Tabs.Screen
        name="ielts"
        options={{
          title: 'IELTS',
          tabBarIcon: ({ focused }) => <TabIcon name="school" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="shadowing"
        options={{
          title: 'Shadowing',
          tabBarIcon: ({ focused }) => <TabIcon name="mic" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="vocablab"
        options={{
          title: 'Vocab Lab',
          tabBarIcon: ({ focused }) => <TabIcon name="layers" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} />,
        }}
      />

      {/* ── Hidden tabs (accessible via links, not tab bar) ── */}
      <Tabs.Screen name="vocabulary" options={{ href: null }} />
      <Tabs.Screen name="grammar" options={{ href: null }} />
      <Tabs.Screen name="pronunciation" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  );
}
