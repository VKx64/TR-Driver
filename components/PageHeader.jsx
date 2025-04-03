import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { router } from 'expo-router';

// This component is used to create a custom header for the pages in the app.
export default function PageHeader({ title }) {
  return (
    <Stack.Screen
      options={{
        title: title,
        headerShown: true,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => router.back()}
            className="">
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        ),
      }}
    />
  );
}