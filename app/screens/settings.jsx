import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#1d1f24]">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-white text-2xl font-bold mb-6">Settings</Text>
        <TouchableOpacity className="bg-[#384bb4] px-4 py-2 rounded-xl" onPress={handleLogout}>
          <Text className="text-white text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
