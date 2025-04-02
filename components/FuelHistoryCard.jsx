import React from 'react';
import { View, Text } from 'react-native';

/**
 * Displays fuel history information in a card format
 *
 * @param {Object} props - Component props
 * @param {Object} props.refuelData - The complete refuel record object
 */
export default function FuelHistoryCard({ refuelData }) {
  // Extract values from refuel data
  const { date, liters, pricePerLiter, odometer } = refuelData;

  // Calculate the total cost
  const totalCost = liters * pricePerLiter;

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3">
      <View className="flex-row justify-between mb-2">
        <Text className="text-lg font-medium text-gray-800">{date}</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-800 font-medium">₱{totalCost.toFixed(2)}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500">Fuel amount</Text>
          <Text className="text-lg font-semibold">{liters} liters</Text>
        </View>

        <View>
          <Text className="text-gray-500">Odometer</Text>
          <Text className="text-lg font-semibold">{odometer.toLocaleString()} km</Text>
        </View>

        <View>
          <Text className="text-gray-500">Price/L</Text>
          <Text className="text-lg font-semibold">₱{pricePerLiter.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}