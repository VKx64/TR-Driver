import React from 'react';
import { TextInput, View, Text } from 'react-native';

export default function CustomTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
}) {
  return (
    <View className="mb-5">
      {label && <Text className="text-base mb-2 text-gray-700">{label}</Text>}
      <TextInput
        className="h-12 px-4 bg-gray-100 border border-gray-300 rounded-lg text-base text-black"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF" // Tailwind gray-400
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
    </View>
  );
}
