import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import PageHeader from '../../components/PageHeader';
import MaintenanceRequestCard, { MAINTENANCE_DUMMY_DATA } from '../../components/MaintenanceRequestCard';
import TruckDropdown from '../../components/TruckDropdown';
import { Ionicons } from '@expo/vector-icons';
import { fetchMaintenanceRequestByFleet } from '../../services/maintenance_request/fetchMaintenanceRequest';
import { useFleets } from '../../services/fleets/fetchAllFleets';
import NewMaintenanceRequest from '../forms/newmaintenancerequest';

const Maintenance = () => {
  const route = useRoute();
  // If fleetId is provided in route params, use it as initial selected truck
  const routeFleetId = route.params?.fleetId;

  // Use the fleet hook to get all fleets
  const { fleets, loading: loadingFleets } = useFleets();

  const [loading, setLoading] = useState(true);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [error, setError] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [showNewMaintenanceModal, setShowNewMaintenanceModal] = useState(false);

  // Set initial selected truck if fleetId is provided in route
  useEffect(() => {
    if (routeFleetId && fleets.fleetPairs.length > 0) {
      const initialTruck = fleets.fleetPairs.find(truck => truck.id === routeFleetId);
      if (initialTruck) {
        setSelectedTruck(initialTruck);
      }
    }
  }, [routeFleetId, fleets.fleetPairs]);

  // Fetch maintenance requests when selected truck changes
  useEffect(() => {
    if (selectedTruck) {
      fetchMaintenanceData(selectedTruck.id);
    } else {
      // If no truck is selected, clear maintenance requests
      setMaintenanceRequests([]);
      setLoading(false);
    }
  }, [selectedTruck]);

  // Function to fetch maintenance data for a specific truck
  const fetchMaintenanceData = async (truckId) => {
    if (!truckId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`Fetching maintenance requests for truck ID: ${truckId}`);
      const requests = await fetchMaintenanceRequestByFleet(truckId);
      console.log(`Received ${requests.length} maintenance requests`);
      setMaintenanceRequests(requests);
    } catch (err) {
      console.error('Failed to fetch maintenance requests:', err);
      setError('Failed to load maintenance requests');
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle truck selection
  const handleTruckSelect = (truck) => {
    setSelectedTruck(truck);
    console.log('Selected truck ID:', truck.id);
    console.log('Selected truck plate:', truck.plate);
  };

  const handleRequestPress = (requestId) => {
    console.log(`Maintenance request ${requestId} pressed`);
    // Handle navigation to detail view or other actions
  };

  const handleAddRequest = () => {
    // Show modal for adding new maintenance request
    if (selectedTruck) {
      console.log('Showing new maintenance request form for truck:', selectedTruck?.plate);
      setShowNewMaintenanceModal(true);
    }
  };

  // Pull to refresh functionality
  const handleRefresh = () => {
    if (selectedTruck) {
      fetchMaintenanceData(selectedTruck.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <PageHeader
        title="Truck Maintenance"
        showBack={true}
      />

      {/* Main Content Area */}
      <View className="flex-1 relative">
        {selectedTruck ? (
          <ScrollView
            className="flex-1 p-4 pb-24 bg-gray-100"
            refreshing={loading}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading state for maintenance data */}
            {loading ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-gray-500 mt-3">Loading maintenance requests...</Text>
              </View>
            ) : error ? (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
                <Text className="text-xl font-semibold text-gray-700 mt-4">Something went wrong</Text>
                <Text className="text-gray-500 text-center mt-2 mb-4">{error}</Text>
                <TouchableOpacity
                  className="bg-blue-500 px-4 py-2 rounded-lg"
                  onPress={handleRefresh}
                >
                  <Text className="text-white font-medium">Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : maintenanceRequests.length > 0 ? (
              maintenanceRequests.map(request => (
                <MaintenanceRequestCard
                  key={request.id}
                  requestData={request}
                  onPress={() => handleRequestPress(request.id)}
                />
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-10">
                <Ionicons name="construct-outline" size={48} color="#d1d5db" />
                <Text className="text-xl font-semibold text-gray-500 mt-4">No maintenance requests</Text>
                <Text className="text-gray-400 text-center mt-2">
                  This truck doesn't have any maintenance requests yet.
                </Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center p-4 bg-gray-100">
            <Ionicons name="car-outline" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-500 mt-4 mb-2">No truck selected</Text>
            <Text className="text-gray-400 text-center">
              Select a truck from the dropdown below to view its maintenance history
            </Text>
          </View>
        )}

        {/* Fixed Bottom Area with Truck Dropdown and Button */}
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

          {/* Add Maintenance Button - Only shown when a truck is selected */}
          {selectedTruck && (
            <TouchableOpacity
              onPress={handleAddRequest}
              className="bg-blue-600 rounded-lg py-3 flex-row justify-center items-center"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Add Maintenance Request</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* New Maintenance Modal - Replace placeholder with actual form */}
      {selectedTruck && showNewMaintenanceModal && (
        <Modal
          visible={showNewMaintenanceModal}
          animationType="slide"
          onRequestClose={() => setShowNewMaintenanceModal(false)}
        >
          <NewMaintenanceRequest
            truckId={selectedTruck.id}
            closeModal={() => {
              setShowNewMaintenanceModal(false);
              // Refresh the maintenance requests list after adding a new one
              fetchMaintenanceData(selectedTruck.id);
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Maintenance;