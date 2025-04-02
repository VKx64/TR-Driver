import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../../components/PageHeader';
import TruckDropdown from '../../components/TruckDropdown';
import FuelHistoryCard from '../../components/FuelHistoryCard';
import { fetchAllFleetIds } from '../../services/fleets/fetchAllFleets';
import { fetchFleetFuels } from '../../services/fleets/fetchFleetFuels';
import { Ionicons } from '@expo/vector-icons';
import NewFuel from '../forms/newfuel';

const Refuel = () => {
  const navigation = useNavigation();
  // State for trucks and selected truck
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTruck, setSelectedTruck] = useState(null);
  // New state for fuel history
  const [fuelHistory, setFuelHistory] = useState([]);
  const [loadingFuelData, setLoadingFuelData] = useState(false);
  const [showNewFuelModal, setShowNewFuelModal] = useState(false);

  // Fetch trucks when component mounts
  useEffect(() => {
    async function loadTrucks() {
      try {
        setLoading(true);
        const result = await fetchAllFleetIds();
        console.log("Fetched fleet data:", result);

        // Update trucks state with the fleet pairs
        setTrucks(result.fleetPairs || []);
      } catch (error) {
        console.error("Error loading trucks:", error);
        setTrucks([]);
      } finally {
        setLoading(false);
      }
    }

    loadTrucks();
  }, []);

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

  // Handle truck selection
  const handleTruckSelect = (truck) => {
    setSelectedTruck(truck);
    // Log the ID and plate of the selected truck
    console.log('Selected truck ID:', truck.id);
    console.log('Selected truck plate:', truck.plate);
  };

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
    if (fuelData.date) {
      try {
        const dateObj = new Date(fuelData.date);
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

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Use the PageHeader component */}
      <PageHeader title="Fuel History" />

      {/* Main Content Area */}
      <View className="flex-1 relative">
        {selectedTruck ? (
          <ScrollView className="flex-1 p-4 pb-24 bg-gray-100">
            {/* Fuel History Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold">Refuel Log</Text>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-800 font-medium">{selectedTruck.plate}</Text>
              </View>
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
              Select a truck from the dropdown below to view its fuel history
            </Text>
          </View>
        )}

        {/* Fixed Bottom Area with Truck Dropdown and Button */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
          {/* Truck Selector Dropdown */}
          {loading ? (
            <Text className="text-gray-600 p-2 text-center mb-3">Loading trucks...</Text>
          ) : trucks.length === 0 ? (
            <Text className="text-gray-600 p-2 text-center mb-3">No trucks available</Text>
          ) : (
            <View className="mb-3">
              <TruckDropdown
                trucks={trucks}
                selectedTruck={selectedTruck}
                onSelect={handleTruckSelect}
              />
            </View>
          )}

          {/* Add Refuel Button - Only shown when a truck is selected */}
          {selectedTruck && (
            <TouchableOpacity
              onPress={handleAddNewRefuel}
              className="bg-blue-600 rounded-lg py-3 flex-row justify-center items-center"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Add New Refuel</Text>
            </TouchableOpacity>
          )}
        </View>
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
            closeModal={() => setShowNewFuelModal(false)}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Refuel;