import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import TruckDropdown from '../../components/TruckDropdown';
import { useFleets } from '../../services/fleets/fetchAllFleets';

export default function Alerts() {
  // Use the fleet hook to get all fleets
  const { fleets, loading: loadingFleets } = useFleets();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Handle truck selection
  const handleTruckSelect = (truck) => {
    setSelectedTruck(truck);
    console.log('Selected truck ID:', truck.id);
    console.log('Selected truck plate:', truck.plate);
    // Here you would fetch alerts for this specific truck
    fetchAlerts(truck.id);
  };

  // Fetch alerts for selected truck
  const fetchAlerts = async (truckId) => {
    setLoading(true);
    try {
      // TODO: Replace with actual alert fetching service
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For now using dummy data
      setAlerts([
        { id: 1, title: 'Maintenance Due', message: 'Oil change due in 500km', severity: 'medium', date: new Date() },
        { id: 2, title: 'Low Fuel Warning', message: 'Fuel level below 15%', severity: 'high', date: new Date() },
      ]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh functionality
  const handleRefresh = () => {
    if (selectedTruck) {
      fetchAlerts(selectedTruck.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-indigo-600 p-4 shadow-md">
        <Text className="text-white text-xl font-bold">Alerts</Text>
        <Text className="text-indigo-100 text-sm">Monitor truck alerts and notifications</Text>
      </View>

      {/* Main Content Area */}
      <View className="flex-1 relative">
        {selectedTruck ? (
          <ScrollView
            className="flex-1 p-4 pb-24 bg-gray-100"
            refreshing={loading}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading state for alerts */}
            {loading ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-gray-500 mt-3">Loading alerts...</Text>
              </View>
            ) : alerts.length > 0 ? (
              alerts.map(alert => (
                <View
                  key={alert.id}
                  className={`mb-4 p-4 rounded-lg shadow-sm border-l-4 ${
                    alert.severity === 'high' ? 'border-red-500 bg-red-50' :
                    alert.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <Text className="font-bold text-gray-800">{alert.title}</Text>
                    <Text className="text-xs text-gray-500">
                      {alert.date.toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-gray-600 mt-1">{alert.message}</Text>
                </View>
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="notifications-off-outline" size={48} color="#d1d5db" />
                <Text className="text-xl font-semibold text-gray-500 mt-4">No alerts</Text>
                <Text className="text-gray-400 text-center mt-2">
                  This truck doesn't have any active alerts.
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center p-4 bg-gray-100">
            <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-500 mt-4 mb-2">No truck selected</Text>
            <Text className="text-gray-400 text-center">
              Select a truck from the dropdown below to view its alerts
            </Text>
          </View>
        )}

        {/* Fixed Bottom Area with Truck Dropdown */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          {/* Truck Selector Dropdown */}
          {loadingFleets ? (
            <Text className="text-gray-600 p-2 text-center mb-3">Loading trucks...</Text>
          ) : fleets.fleetPairs.length === 0 ? (
            <Text className="text-gray-600 p-2 text-center mb-3">No trucks available</Text>
          ) : (
            <View className="mb-3">
              <TruckDropdown
                trucks={fleets.fleetPairs}
                selectedTruck={selectedTruck}
                onSelect={handleTruckSelect}
              />
            </View>
          )}

          {/* Refresh Button - Only shown when a truck is selected */}
          {selectedTruck && (
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-indigo-600 rounded-lg py-3 flex-row justify-center items-center"
            >
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Refresh Alerts</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}