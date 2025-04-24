import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import WelcomeCard from '../../components/WelcomeCard';
import NavigationCard from '../../components/NavigationCard';
import TruckDropdown from '../../components/TruckDropdown';
import { useFleets } from '../../services/fleets/fetchAllFleets';
import { useSelectedTruck } from '../../contexts/TruckContext';

export default function Home() {
  const { fleets, loading: loadingFleets } = useFleets();
  const { selectedTruck, setSelectedTruck } = useSelectedTruck();

  const navigateToMaintenance = () => {
    // Pass the selected fleet ID to the maintenance page if one is selected
    if (selectedTruck) {
      router.push({
        pathname: '/pages/maintenance',
        params: { fleetId: selectedTruck.id }
      });
    } else {
      router.push('/pages/maintenance');
    }
  };

  const navigateToRefuel = () => {
    // Pass the selected fleet ID to the refuel page if one is selected
    if (selectedTruck) {
      router.push({
        pathname: '/pages/refuel',
        params: { fleetId: selectedTruck.id }
      });
    } else {
      router.push('/pages/refuel');
    }
  };

  const handleFleetSelect = (fleet) => {
    setSelectedTruck(fleet);
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-4">
      <View className="flex flex-col gap-5">
        {/* Welcome Card Component */}
        <WelcomeCard />

        {/* Truck Selection Dropdown */}
        <View className='flex flex-col gap-2 mb-2'>
          <Text className='font-semibold text-base'>Select a Truck</Text>
          {loadingFleets ? (
            <Text className="text-gray-500 p-4 text-center">Loading trucks...</Text>
          ) : fleets.fleetPairs && fleets.fleetPairs.length > 0 ? (
            <TruckDropdown
              trucks={fleets.fleetPairs}
              onSelect={handleFleetSelect}
              selectedTruck={selectedTruck}
              label="Select Truck"
            />
          ) : (
            <Text className="text-gray-500 p-4 text-center">No trucks available</Text>
          )}
        </View>

        {/* Driver Forms */}
        <View className='flex flex-col gap-2'>
          <View className='flex flex-row justify-between items-center'>
            <Text className='font-semibold text-base'>Driver Forms</Text>
          </View>

          <NavigationCard
            icon="construct-outline"
            name="Truck Maintenance"
            description={selectedTruck ? `Request maintenance for ${selectedTruck.plate}` : "Request maintenance issues or services"}
            onPress={navigateToMaintenance}
          />

          <NavigationCard
            icon="help-buoy-outline"
            name="Truck Refuel"
            description="Log fuel purchases and refueling"
            onPress={navigateToRefuel}
          />
        </View>
      </View>
    </ScrollView>
  );
}