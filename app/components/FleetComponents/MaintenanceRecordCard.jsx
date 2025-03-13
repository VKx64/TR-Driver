import React from 'react';
import { View, Text } from 'react-native';

export default function MaintenanceRecordCard({ record }) {
  return (
    <View className="bg-gray-100 p-4 mb-3 rounded-lg shadow-sm">
      <Text className="text-lg font-semibold text-gray-800">{record.vehicle}</Text>
      <Text className="text-sm text-gray-600">Date: {record.date}</Text>
      <Text className="text-sm text-gray-600">Details: {record.description}</Text>
    </View>
  );
}