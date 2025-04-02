import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Custom header component designed for modals and forms
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The title to display in the header
 * @param {Function} props.onBack - Function to call when the back button is pressed
 */
export default function ModalHeader({ title, onBack }) {
  return (
    <View className="flex-row items-center p-4 border-b border-gray-200">
      <TouchableOpacity onPress={onBack} className="mr-4">
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
      <Text className="text-xl font-bold text-gray-800">{title}</Text>
    </View>
  );
}
