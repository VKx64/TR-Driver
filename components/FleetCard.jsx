import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FleetCard = ({
  plateNumber,
  fleetType,
  imageUrl,
  onPress,
  selected = false
}) => {
  // Default image if none provided
  const defaultImage = 'https://t4.ftcdn.net/jpg/00/26/80/01/360_F_26800115_YlmErNLIVZeNZXPzUc3z4GAD1gGkVABu.jpg';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`mb-3 rounded-xl overflow-hidden ${selected ? 'border-2 border-blue-500' : 'border border-gray-200'}`}
      style={{ elevation: selected ? 4 : 1 }}
    >
      <View className="relative">
        {/* Fleet Image */}
        <Image
          source={{ uri: imageUrl || defaultImage }}
          className="w-full h-40"
          resizeMode="cover"
        />

        {/* Plate Number Badge */}
        <View className="absolute top-2 left-2 bg-black bg-opacity-70 px-3 py-1 rounded-lg">
          <Text className="text-white font-bold">{plateNumber || 'Unknown'}</Text>
        </View>

        {/* Selection indicator */}
        {selected && (
          <View className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>
        )}
      </View>

      {/* Fleet Details */}
      <View className="p-3 bg-white">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-gray-500 text-xs">FLEET TYPE</Text>
            <Text className="text-gray-800 font-medium text-base">{fleetType || 'Unknown Type'}</Text>
          </View>

          <View>
            <Text className="text-blue-600 font-bold">{plateNumber}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default FleetCard;