import { Tabs } from "expo-router";
import { Home, User } from "lucide-react-native"; // If not installed, use icons from react-native-vector-icons or Expo Icons
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableOpacity, View } from "react-native";

export default function TabLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#1d1f24" }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#1d1f24",
            height: 72,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
          },
          tabBarActiveTintColor: "#7BE495",
          tabBarInactiveTintColor: "#bbb",
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={25} color={color} />,
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color }) => <User size={25} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
