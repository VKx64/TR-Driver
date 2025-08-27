import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import TruckDropdown from '../components/TruckDropdown';
import { useFleets } from '../services/fleets/fetchAllFleets';
import NewMaintenanceRequest from './forms/newmaintenancerequest';

const CHECKLIST_ITEMS = [
  {
    id: 'battery',
    icon: 'battery-charging-outline',
    title: 'Battery',
    description: 'Make sure your battery has a strong charge and a proper cable-to-terminal connection.',
    category: 'electrical'
  },
  {
    id: 'lights',
    icon: 'bulb-outline',
    title: 'Lights',
    description: 'Test your headlights, turn signals, brake lights, reverse lights, and tail lights.',
    category: 'electrical'
  },
  {
    id: 'oil',
    icon: 'water-outline',
    title: 'Oil',
    description: 'Check your engine\'s oil level and color. Look for leaks, too.',
    category: 'engine'
  },
  {
    id: 'water',
    icon: 'thermometer-outline',
    title: 'Water',
    description: 'Check the water in your radiator to prevent overheating.',
    category: 'engine'
  },
  {
    id: 'brakes',
    icon: 'disc-outline',
    title: 'Brakes',
    description: 'To avoid road accidents, ensure that your brake works properly.',
    category: 'safety'
  },
  {
    id: 'air',
    icon: 'speedometer-outline',
    title: 'Air',
    description: 'Keep the right tire pressure to prevent accidents and decreased fuel economy.',
    category: 'tires'
  },
  {
    id: 'gas',
    icon: 'car-outline',
    title: 'Gas',
    description: 'Check your fuel level through the fuel gauge to avoid running out while on the road.',
    category: 'fuel'
  },
  {
    id: 'engine',
    icon: 'settings-outline',
    title: 'Engine',
    description: 'If you hear any weird noises, ask a mechanic to check your engine.',
    category: 'engine'
  },
  {
    id: 'tires',
    icon: 'ellipse-outline',
    title: 'Tires',
    description: 'Spend a few minutes checking your tires for bulges, bumps, and other signs of damage.',
    category: 'tires'
  },
  {
    id: 'self',
    icon: 'person-outline',
    title: 'Self',
    description: 'Are you physically and emotionally fit? Don\'t forget your license and registration papers!',
    category: 'personal'
  }
];

const CATEGORY_COLORS = {
  electrical: '#3B82F6', // Blue
  engine: '#EF4444',     // Red
  safety: '#F59E0B',     // Amber
  tires: '#10B981',      // Emerald
  fuel: '#8B5CF6',       // Purple
  personal: '#06B6D4'    // Cyan
};

export default function ChecklistScreen() {
  const [checklistItems, setChecklistItems] = useState(CHECKLIST_ITEMS.map(item => ({ ...item, checked: false })));
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const { fleets, loading: loadingFleets } = useFleets();

  const toggleItem = useCallback((itemId) => {
    console.log('Toggling item:', itemId); // Debug log
    setChecklistItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );
      console.log('New items state:', newItems.map(item => ({ id: item.id, checked: item.checked }))); // Debug log
      return newItems;
    });
  }, []);

  // Calculate how many items are checked
  const getCheckedCount = useMemo(() => {
    const count = checklistItems.filter(item => item.checked).length;
    console.log('Checked count:', count); // Debug log
    return count;
  }, [checklistItems]);

  const allItemsChecked = useMemo(() => getCheckedCount === checklistItems.length, [getCheckedCount, checklistItems.length]);

  const handleProceed = async () => {
    if (!allItemsChecked) {
      Alert.alert(
        "Incomplete Checklist",
        "Please complete all checklist items before proceeding. Your safety and the safety of others depends on it.",
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Ready to Drive",
      "Great! You've completed the pre-drive checklist. Drive safely!",
      [
        {
          text: "Continue",
          onPress: () => router.replace("/tabs/driver")
        }
      ]
    );
  };

  const handleSkip = () => {
    Alert.alert(
      "Skip Checklist?",
      "Skipping the pre-drive checklist may compromise safety. Are you sure you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Skip Anyway",
          style: "destructive",
          onPress: () => router.replace("/tabs/driver")
        }
      ]
    );
  };

  const handleReport = (item) => {
    if (!selectedTruck) {
      Alert.alert(
        "Select a Truck",
        "Please select a truck before reporting an issue with " + item.title.toLowerCase(),
        [{ text: "OK" }]
      );
      return;
    }

    Alert.alert(
      "Report Issue",
      `Report an issue with ${item.title.toLowerCase()} for truck ${selectedTruck.plate}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Report",
          onPress: () => setShowMaintenanceModal(true)
        }
      ]
    );
  };

  const closeMaintenanceModal = () => {
    setShowMaintenanceModal(false);
  };

  const getProgressPercentage = useMemo(() => {
    return Math.round((getCheckedCount / checklistItems.length) * 100);
  }, [getCheckedCount, checklistItems.length]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Stack.Screen
        options={{
          title: "BLOWBAGETS Checklist",
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTitleAlign: 'center',
          headerLeft: () => null, // No back button for mandatory checklist
        }}
      />

      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-center text-gray-700 text-base font-medium mb-2">
          Before you drive off, check the following:
        </Text>

        {/* Truck Selection Dropdown */}
        <View className="mb-4">
          <Text className="text-gray-700 text-sm font-medium mb-2">
            Select Truck for Reporting Issues:
          </Text>
          {loadingFleets ? (
            <View className="bg-gray-100 rounded-lg p-3 flex-row items-center justify-center">
              <Text className="text-gray-500">Loading trucks...</Text>
            </View>
          ) : (
            <TruckDropdown
              trucks={fleets.fleetPairs || []}
              selectedTruck={selectedTruck}
              onSelect={setSelectedTruck}
            />
          )}
        </View>

        {/* Progress Bar */}
        <View className="bg-gray-200 rounded-full h-2 mb-2">
          <View
            className="bg-indigo-600 h-2 rounded-full"
            style={{ width: `${getProgressPercentage}%` }}
          />
        </View>

        <Text className="text-center text-sm text-gray-600">
          {getCheckedCount} of {checklistItems.length} items completed ({getProgressPercentage}%)
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4">
        {checklistItems.map((item) => {
          const isChecked = item.checked;
          const categoryColor = CATEGORY_COLORS[item.category];

          return (
            <View
              key={item.id}
              className={`mb-3 p-4 rounded-xl border-2 ${
                isChecked
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200'
              }`}
              style={{
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 1,
                },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
                minHeight: 80,
              }}
            >
              <View className="flex-row items-start">
                {/* Icon and Category Indicator */}
                <View className="mr-4 items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-1"
                    style={{ backgroundColor: categoryColor + '20' }}
                  >
                    <Ionicons
                      name={item.icon}
                      size={24}
                      color={categoryColor}
                    />
                  </View>
                  <View
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: categoryColor }}
                  />
                </View>

                {/* Content */}
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-lg font-bold text-gray-800">
                      {item.title}
                    </Text>
                    <View className="flex-row items-center">
                      {/* Report Button */}
                      <TouchableOpacity
                        onPress={() => handleReport(item)}
                        className="bg-orange-500 rounded-full p-2 mr-2"
                        activeOpacity={0.7}
                      >
                        <Ionicons name="warning-outline" size={16} color="white" />
                      </TouchableOpacity>

                      {/* Check Button */}
                      <TouchableOpacity
                        onPress={() => toggleItem(item.id)}
                        activeOpacity={0.7}
                        className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                          isChecked
                            ? 'bg-green-500 border-green-500'
                            : 'border-gray-300'
                        }`}
                      >
                        {isChecked && (
                          <Ionicons name="checkmark" size={16} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text className="text-gray-600 text-sm leading-5">
                    {item.description}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View className="px-4 py-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleProceed}
          disabled={!allItemsChecked}
          className={`rounded-xl py-4 mb-3 ${
            allItemsChecked
              ? 'bg-indigo-600'
              : 'bg-gray-300'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color={allItemsChecked ? "white" : "#9CA3AF"}
              style={{ marginRight: 8 }}
            />
            <Text className={`text-lg font-semibold ${
              allItemsChecked ? 'text-white' : 'text-gray-500'
            }`}>
              Continue to App
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSkip}
          className="rounded-xl py-3 border border-gray-300"
        >
          <Text className="text-center text-gray-600 font-medium">
            Skip Checklist (Not Recommended)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Maintenance Request Modal */}
      <Modal
        visible={showMaintenanceModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <NewMaintenanceRequest
          truckId={selectedTruck?.id}
          closeModal={closeMaintenanceModal}
        />
      </Modal>
    </View>
  );
}
