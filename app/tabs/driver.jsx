import React, { useEffect } from 'react';
import { View, Text, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import WelcomeCard from '../../components/WelcomeCard';
import NavigationCard from '../../components/NavigationCard';
import TruckDropdown from '../../components/TruckDropdown';
import { useFleets } from '../../services/fleets/fetchAllFleets';
import { useSelectedTruck } from '../../contexts/TruckContext';
import { useAuth } from '../../contexts/AuthContext';
import AccountVerificationModal from '../../components/AccountVerificationModal';

export default function Home() {
  const { fleets, loading: loadingFleets } = useFleets();
  const { selectedTruck, setSelectedTruck } = useSelectedTruck();
  const { user, isVerified } = useAuth();
  const [hasShownAlert, setHasShownAlert] = useState(false);
  const [hasShownNewUserAlert, setHasShownNewUserAlert] = useState(false);

  // States for custom modals instead of Alert
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  // Removed: showTestModal state

  // Check if user is new based on created date
  const isNewUser = () => {
    if (!user || !user.created) return false;

    // Consider user new if account was created in the last 24 hours
    const createdDate = new Date(user.created);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return createdDate > oneDayAgo;
  };

  // Check verification status AND new user status when component mounts
  useEffect(() => {
    console.log("===== USER STATE =====");
    console.log("User exists:", !!user);
    console.log("isVerified type:", typeof isVerified);
    console.log("isVerified value:", isVerified);
    console.log("hasShownAlert:", hasShownAlert);
    console.log("Condition result:", user && isVerified === false && !hasShownAlert);

    if (user) {
      console.log("User created date:", user.created);
      console.log("Is new user:", isNewUser());
      console.log("Is verified:", isVerified);

      // If user is new and we haven't shown the new user alert yet
      if (isNewUser() && !hasShownNewUserAlert) {
        // Show welcome modal instead of Alert
        setShowWelcomeModal(true);
        setHasShownNewUserAlert(true);
      }
      // Otherwise check verification status
      else if ((isVerified === false || isVerified === 0 || isVerified === "false" || !isVerified) && !hasShownAlert) {
        console.log("🚨 USER NEEDS VERIFICATION");

        // Show verification modal instead of Alert
        setShowVerificationModal(true);
        setHasShownAlert(true);
      }
    }
  }, [user, isVerified, hasShownAlert, hasShownNewUserAlert]);

  // Removed: debugUserStatus function

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

      <AccountVerificationModal
        visible={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
      />

      <View className="flex flex-col gap-5">
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