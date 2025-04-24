import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TruckProvider } from '../../contexts/TruckContext';

export default function TabLayout() {
  return (
    <TruckProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4F46E5',
          tabBarInactiveTintColor: '#9CA3AF',
        }}
      >
        <Tabs.Screen
          name="driver"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: 'Alerts',
            tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
          }}
        />
      </Tabs>
    </TruckProvider>
  );
}
