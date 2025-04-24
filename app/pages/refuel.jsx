import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageHeader from '../../components/PageHeader';
import FuelHistoryCard from '../../components/FuelHistoryCard';
import { fetchFleetFuels } from '../../services/fleets/fetchFleetFuels';
import { Ionicons } from '@expo/vector-icons';
import NewFuel from '../forms/newfuel';
import { useFleets } from '../../services/fleets/fetchAllFleets';

const Refuel = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // Get fleetId from route params if provided
  const routeFleetId = route.params?.fleetId;

  // Use the fleet hook to get all fleets
  const { fleets, loading: loadingFleets } = useFleets();

  const [selectedTruck, setSelectedTruck] = useState(null);
  // New state for fuel history
  const [fuelHistory, setFuelHistory] = useState([]);
  const [loadingFuelData, setLoadingFuelData] = useState(false);
  const [showNewFuelModal, setShowNewFuelModal] = useState(false);

  // Find the selected truck from fleets when data is loaded
  useEffect(() => {
    if (routeFleetId && fleets.fleetPairs?.length > 0) {
      const foundTruck = fleets.fleetPairs.find(truck => truck.id === routeFleetId);
      if (foundTruck) {
        setSelectedTruck(foundTruck);
      }
    }
  }, [routeFleetId, fleets.fleetPairs]);

  // Fetch fuel history when a truck is selected
  useEffect(() => {
    async function loadFuelHistory() {
      if (!selectedTruck) {
        setFuelHistory([]);
        return;
      }

      try {
        setLoadingFuelData(true);
        const fuelData = await fetchFleetFuels(selectedTruck.id);
        console.log("Fetched fuel data:", fuelData);
        setFuelHistory(fuelData);
      } catch (error) {
        console.error("Error loading fuel history:", error);
        setFuelHistory([]);
      } finally {
        setLoadingFuelData(false);
      }
    }

    loadFuelHistory();
  }, [selectedTruck]);

  // Handle add new refuel - Updated to show modal instead of navigate
  const handleAddNewRefuel = () => {
    if (selectedTruck) {
      console.log('Showing new refuel form for truck:', selectedTruck?.plate);
      setShowNewFuelModal(true);
    }
  };

  // Map API fuel history data to the format expected by FuelHistoryCard
  const mapFuelDataToCardFormat = (fuelData) => {
    // Format the date to human readable format including time
    let formattedDate = "Unknown date";
    if (fuelData.created) {
      try {
        const dateObj = new Date(fuelData.created);
        formattedDate = dateObj.toLocaleString('en-PH', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: false
        });
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }

    return {
      id: fuelData.id,
      date: formattedDate,
      liters: fuelData.fuelAmount,
      pricePerLiter: fuelData.fuelPrice,
      odometer: fuelData.odometerReading
    };
  };

  // Pull to refresh functionality
  const handleRefresh = () => {
    if (selectedTruck) {
      loadFuelHistory(selectedTruck.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Use the PageHeader component */}
      <PageHeader
        title={selectedTruck ? `${selectedTruck.plate} Fuel History` : "Fuel History"}
        showBack={true}
      />

      {/* Main Content Area */}
      <View className="flex-1 relative">
        {selectedTruck ? (
          <ScrollView
            className="flex-1 p-4 pb-24 bg-gray-100"
            refreshing={loadingFuelData}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          >
            {/* Selected Truck Info */}
            <View className="mb-4 bg-white p-4 rounded-lg shadow-sm">
              <Text className="text-sm text-gray-500">Selected Truck</Text>
              <Text className="text-lg font-bold text-gray-900">{selectedTruck.plate}</Text>
            </View>

            {/* Loading state for fuel data */}
            {loadingFuelData ? (
              <View className="flex-1 justify-center items-center py-10">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-gray-500 mt-3">Loading fuel history...</Text>
              </View>
            ) : fuelHistory.length > 0 ? (
              fuelHistory.map(entry => (
                <FuelHistoryCard key={entry.id} refuelData={mapFuelDataToCardFormat(entry)} />
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-10 ">
                <Ionicons name="water-outline" size={48} color="#d1d5db" />
                <Text className="text-gray-500 mt-3 text-center">No fuel history found for this truck</Text>
              </View>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center p-4 bg-gray-100">
            <Ionicons name="car-outline" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-500 mt-4 mb-2">No truck selected</Text>
            <Text className="text-gray-400 text-center">
              Go back and select a truck from the driver page to view its fuel history
            </Text>
          </View>
        )}

        {/* Fixed Bottom Area with Add Button */}
        {selectedTruck && (
          <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <TouchableOpacity
              onPress={handleAddNewRefuel}
              className="bg-blue-600 rounded-lg py-3 flex-row justify-center items-center"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Add New Refuel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* New Fuel Modal */}
      {selectedTruck && (
        <Modal
          visible={showNewFuelModal}
          animationType="slide"
          onRequestClose={() => setShowNewFuelModal(false)}
        >
          <NewFuel
            route={{ params: { truckId: selectedTruck.id } }}
            closeModal={() => {
              setShowNewFuelModal(false);
              // Refresh fuel history after adding a new record
              if (selectedTruck) {
                fetchFleetFuels(selectedTruck.id).then(data => {
                  setFuelHistory(data);
                }).catch(err => {
                  console.error("Failed to refresh fuel history:", err);
                });
              }
            }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Refuel;