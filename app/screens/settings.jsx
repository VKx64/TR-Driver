import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-[#1d1f24]">
      <View className="flex-1 justify-center items-center p-4">
        <Text className="text-white text-2xl font-bold mb-6">Settings</Text>

        <TouchableOpacity className="bg-[#384bb4] px-4 py-2 rounded-xl mb-4">
          <Text className="text-white text-lg">Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-[#384bb4] px-4 py-2 rounded-xl">
          <Text className="text-white text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
