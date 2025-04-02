import { View, Text } from 'react-native';
import { router } from 'expo-router';
import WelcomeCard from '../../components/WelcomeCard';
import NavigationCard from '../../components/NavigationCard';

export default function Home() {
  const navigateToMaintenance = () => {
    router.push('/pages/maintenance');
  };

  const navigateToRefuel = () => {
    router.push('/pages/refuel');
  };

  return (
    <View className="flex-1 flex flex-col bg-gray-100 p-4 gap-5">
      {/* Welcome Card Component */}
      <WelcomeCard />

      {/* Driver Forms */}
      <View className='flex flex-col gap-2'>
        <View className='flex flex-row justify-between items-center'>
          <Text className='font-semibold text-base'>Driver Forms</Text>
        </View>

        <NavigationCard
          icon="construct-outline"
          name="Truck Maintenance"
          description="Request maintenance issues or services"
          onPress={navigateToMaintenance}
        />

        <NavigationCard
          icon="help-buoy-outline"
          name="Truck Refuel"
          description="Log fuel purchases and refueling"
          onPress={navigateToRefuel}
        />
      </View>

      {/* You can add more components/sections below */}
    </View>
  );
}