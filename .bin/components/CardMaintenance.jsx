import { View, Text } from 'react-native'
import React from 'react'

const CardMaintenance = ({maintenance}) => {
  return (
    <View className="bg-gray-100 p-4 mb-3 rounded-lg shadow-sm">
      <Text className="text-lg font-semibold text-gray-800">{maintenance.name}</Text>
      <Text className="text-sm text-gray-600">Interval: {maintenance.interval_in_days} Days</Text>
      <Text className="text-sm text-gray-600">Importance: {maintenance.importance}</Text>
      <Text className="text-sm text-gray-600">Cost: {maintenance.cost}₱</Text>
    </View>
  )
}

export default CardMaintenance