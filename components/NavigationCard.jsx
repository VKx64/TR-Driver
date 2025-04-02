import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NavigationCard({ icon, name, description, onPress }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 flex-row items-center shadow-sm"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="h-10 w-10 bg-blue-100 rounded-lg items-center justify-center mr-3">
        <Ionicons name={icon} size={22} color="#3b82f6" />
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-semibold text-base">{name}</Text>
        <Text className="text-gray-500 text-sm">{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );
}