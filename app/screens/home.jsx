import { View, Text, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext"; // Import the useAuth hook
import { useRouter } from "expo-router"; // Import the useRouter hook

export default function HomeScreen() {
  const { user } = useAuth(); // Access the user object from the context
  const router = useRouter(); // Access the router

  const navigateToMaintenanceHistory = () => {
    router.push("/maintenance/history"); // Navigate to the Maintenance History screen
  };

  return (
    <View className='w-screen h-screen'>
      <Text>Home Screen</Text>
      {user && (
        <Text>Welcome, {user.name}!</Text>
      )}
      <TouchableOpacity
        onPress={navigateToMaintenanceHistory}
        className="bg-blue-500 p-2 rounded mt-4">
        <Text className="text-white text-center">Go to Maintenance History</Text>
      </TouchableOpacity>
    </View>
  );
}
