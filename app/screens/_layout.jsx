import { Tabs } from "expo-router";
import { Home, User, Settings, Wrench } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1d1f24" }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#1d1f24",
            height: 50
          },
          tabBarActiveTintColor: "#384bb4",
          tabBarInactiveTintColor: "#bbb",
          headerShown: false,
        }}>

        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={25} color={color} />,
          }}
        />

        <Tabs.Screen
          name="maintenance"
          options={{
            title: "Maintenance",
            tabBarIcon: ({ color }) => <Wrench size={25} color={color} />,
          }}
        />

        <Tabs.Screen
          name="fuel"
          options={{
            title: "Fuel",
            tabBarIcon: ({ color }) => <Wrench size={25} color={color} />,
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "settings",
            tabBarIcon: ({ color }) => <Settings size={25} color={color} />,
          }}
        />

      </Tabs>
    </SafeAreaView>
  );
}
