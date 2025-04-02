import { View, Text, TouchableOpacity, TouchableWithoutFeedback, ScrollView, TextInput } from 'react-native';
import React, { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Enhanced dropdown component for selecting trucks with search and scrollable list
 * Dropdown opens above the button instead of below it
 *
 * @param {Object} props - Component props
 * @param {Array} props.trucks - Array of truck objects to display in dropdown
 * @param {Function} props.onSelect - Callback function when a truck is selected
 * @param {Object} props.selectedTruck - Currently selected truck (optional)
 * @param {string} props.label - Label text above dropdown (optional)
 */
export default function TruckDropdown({
  trucks,
  onSelect,
  selectedTruck,
  label = "Select Truck"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Toggle dropdown open/closed
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    // Clear search when opening/closing
    if (!isOpen) {
      setSearchQuery('');
    }
  };

  // Handle truck selection
  const handleSelect = (truck) => {
    onSelect(truck);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Close dropdown when clicking outside
  const handleOutsideClick = () => {
    if (isOpen) {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  // Filter trucks based on search query
  const filteredTrucks = trucks.filter(truck => {
    const query = searchQuery.toLowerCase();
    return (
      truck.plate.toLowerCase().includes(query) ||
      (truck.name && truck.name.toLowerCase().includes(query))
    );
  });

  return (
    <View className="relative">
      {/* Dropdown Content - Positioned above the button */}
      {isOpen && (
        <View
          className="absolute bg-white border border-gray-300 rounded-lg shadow-lg z-20"
          style={{
            bottom: '100%',  // Position above the button
            left: 0,
            right: 0,
            marginBottom: 8,  // Space between dropdown and button
            elevation: 5
          }}
        >
          {/* Search Input - No border when focused */}
          <View className="p-2 border-b border-gray-200">
            <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
              <Ionicons name="search" size={18} color="#666" />
              <TextInput
                className="flex-1 text-gray-800 ml-2"
                placeholder="Search trucks..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                style={{ outlineStyle: 'none' }}
                selectionColor="#2563EB"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Scrollable Truck Options */}
          <ScrollView className="max-h-48">
            {filteredTrucks.length > 0 ? (
              filteredTrucks.map((truck) => (
                <TouchableOpacity
                  key={truck.id}
                  onPress={() => handleSelect(truck)}
                  className={`p-3 border-b border-gray-200 ${selectedTruck?.id === truck.id ? 'bg-gray-100' : ''}`}
                >
                  <Text className="text-gray-800 font-medium">{truck.name || truck.plate}</Text>
                  <Text className="text-gray-500 text-sm">{truck.plate}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View className="p-3 border-b border-gray-200">
                <Text className="text-gray-500 text-center">No matching trucks found</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      {/* Dropdown Button */}
      <TouchableOpacity
        ref={dropdownRef}
        onPress={toggleDropdown}
        className="bg-white border border-gray-300 rounded-lg p-3 flex-row justify-between items-center z-10"
      >
        <Text className="text-gray-800">
          {selectedTruck ? `${selectedTruck.plate}` : "Select a truck"}
        </Text>
        <Ionicons
          name={isOpen ? "chevron-down" : "chevron-up"} // Reversed the icon direction for better UX
          size={20}
          color="#666"
        />
      </TouchableOpacity>

      {/* Overlay to capture outside clicks when dropdown is open */}
      {isOpen && (
        <TouchableWithoutFeedback onPress={handleOutsideClick}>
          <View
            className="fixed inset-0"
            style={{
              position: 'absolute',
              top: -1000,
              left: 0,
              right: 0,
              bottom: 0,
              height: 9999,
              width: '100%',
              zIndex: 10
            }}
          />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
}