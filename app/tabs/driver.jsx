import { View, Text, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useState, useEffect } from 'react';
import PocketBase from 'pocketbase';
import WelcomeCard from '../../components/WelcomeCard';
import NavigationCard from '../../components/NavigationCard';
import TruckDropdown from '../../components/TruckDropdown';
import { useFleets } from '../../services/fleets/fetchAllFleets';
import { useSelectedTruck } from '../../contexts/TruckContext';

export default function Home() {
  const { fleets, loading: loadingFleets } = useFleets();
  const { selectedTruck, setSelectedTruck } = useSelectedTruck();

  // Initialize PocketBase
  const pb = new PocketBase("https://dk-tr.07130116.xyz");

  // State for analytics data
  const [fuelData, setFuelData] = useState([]);
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loadingFuel, setLoadingFuel] = useState(false);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  // Fetch fuel data when truck is selected
  useEffect(() => {
    const fetchFuelData = async () => {
      if (!selectedTruck?.id) {
        setFuelData([]);
        return;
      }

      try {
        setLoadingFuel(true);
        const result = await pb.collection("truck_fuel").getList(1, 100, {
          filter: pb.filter("truck_id = {:truckId}", { truckId: selectedTruck.id }),
        });
        setFuelData(result.items);
      } catch (error) {
        console.error('Error fetching fuel data:', error);
        setFuelData([]);
      } finally {
        setLoadingFuel(false);
      }
    };

    fetchFuelData();
  }, [selectedTruck?.id]);

  // Fetch maintenance data when truck is selected
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      if (!selectedTruck?.id) {
        setMaintenanceData([]);
        return;
      }

      try {
        setLoadingMaintenance(true);
        const result = await pb.collection("maintenance_request").getList(1, 100, {
          filter: pb.filter("truck = {:truckId}", { truckId: selectedTruck.id }),
        });
        setMaintenanceData(result.items);
      } catch (error) {
        console.error('Error fetching maintenance data:', error);
        setMaintenanceData([]);
      } finally {
        setLoadingMaintenance(false);
      }
    };

    fetchMaintenanceData();
  }, [selectedTruck?.id]);

  // Calculate fuel analytics
  const calculateFuelAnalytics = () => {
    if (!fuelData || fuelData.length === 0) {
      return {
        totalFuelPurchased: 0,
        totalSpent: 0,
        averageFuelPrice: 0,
        lastRefuelDate: null,
        totalRefuels: 0
      };
    }

    const totalFuelPurchased = fuelData.reduce((sum, record) => sum + (record.fuel_amount || 0), 0);
    const totalSpent = fuelData.reduce((sum, record) => sum + (record.fuel_price || 0), 0);
    const averageFuelPrice = totalSpent / totalFuelPurchased || 0;
    const lastRefuelDate = fuelData[0]?.created || null;

    return {
      totalFuelPurchased: totalFuelPurchased.toFixed(1),
      totalSpent: totalSpent.toFixed(2),
      averageFuelPrice: averageFuelPrice.toFixed(2),
      lastRefuelDate,
      totalRefuels: fuelData.length
    };
  };

  // Calculate maintenance analytics
  const calculateMaintenanceAnalytics = () => {
    if (!maintenanceData || maintenanceData.length === 0) {
      return {
        totalRequests: 0,
        pendingRequests: 0,
        completedRequests: 0,
        lastMaintenanceDate: null
      };
    }

    const pendingRequests = maintenanceData.filter(record => record.status === 'pending').length;
    const completedRequests = maintenanceData.filter(record => record.status === 'completed').length;
    const lastMaintenanceDate = maintenanceData[0]?.created || null;

    return {
      totalRequests: maintenanceData.length,
      pendingRequests,
      completedRequests,
      lastMaintenanceDate
    };
  };

  // Calculate fuel trend forecasting
  const calculateFuelTrends = () => {
    if (!fuelData || fuelData.length < 2) {
      return {
        nextMonthPredictedConsumption: 0,
        nextMonthPredictedCost: 0,
        trend: 'insufficient_data',
        confidence: 0
      };
    }

    // Sort fuel data by date
    const sortedData = [...fuelData].sort((a, b) => new Date(a.created) - new Date(b.created));

    // Group data by month
    const monthlyData = {};
    sortedData.forEach(record => {
      const date = new Date(record.created);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          totalFuel: 0,
          totalCost: 0,
          count: 0
        };
      }

      monthlyData[monthKey].totalFuel += record.fuel_amount || 0;
      monthlyData[monthKey].totalCost += record.fuel_price || 0;
      monthlyData[monthKey].count += 1;
    });

    const months = Object.keys(monthlyData).sort();

    if (months.length < 2) {
      return {
        nextMonthPredictedConsumption: 0,
        nextMonthPredictedCost: 0,
        trend: 'insufficient_data',
        confidence: 0
      };
    }

    // Calculate monthly averages
    const monthlyConsumption = months.map(month => monthlyData[month].totalFuel);
    const monthlyCosts = months.map(month => monthlyData[month].totalCost);

    // Simple linear trend calculation (last 3 months if available)
    const recentMonths = Math.min(3, months.length);
    const recentConsumption = monthlyConsumption.slice(-recentMonths);
    const recentCosts = monthlyCosts.slice(-recentMonths);

    // Calculate average growth rate
    let consumptionGrowthRate = 0;
    let costGrowthRate = 0;

    if (recentConsumption.length >= 2) {
      const consumptionRates = [];
      const costRates = [];

      for (let i = 1; i < recentConsumption.length; i++) {
        if (recentConsumption[i - 1] > 0) {
          consumptionRates.push((recentConsumption[i] - recentConsumption[i - 1]) / recentConsumption[i - 1]);
        }
        if (recentCosts[i - 1] > 0) {
          costRates.push((recentCosts[i] - recentCosts[i - 1]) / recentCosts[i - 1]);
        }
      }

      consumptionGrowthRate = consumptionRates.length > 0
        ? consumptionRates.reduce((sum, rate) => sum + rate, 0) / consumptionRates.length
        : 0;

      costGrowthRate = costRates.length > 0
        ? costRates.reduce((sum, rate) => sum + rate, 0) / costRates.length
        : 0;
    }

    // Predict next month based on last month's data + growth rate
    const lastMonthConsumption = monthlyConsumption[monthlyConsumption.length - 1];
    const lastMonthCost = monthlyCosts[monthlyCosts.length - 1];

    const predictedConsumption = Math.max(0, lastMonthConsumption * (1 + consumptionGrowthRate));
    const predictedCost = Math.max(0, lastMonthCost * (1 + costGrowthRate));

    // Determine trend direction
    let trend = 'stable';
    if (consumptionGrowthRate > 0.05) trend = 'increasing';
    else if (consumptionGrowthRate < -0.05) trend = 'decreasing';

    // Calculate confidence based on data consistency (simple heuristic)
    const variance = recentConsumption.reduce((sum, val) => {
      const mean = recentConsumption.reduce((s, v) => s + v, 0) / recentConsumption.length;
      return sum + Math.pow(val - mean, 2);
    }, 0) / recentConsumption.length;

    const confidence = Math.max(0, Math.min(100, 100 - (variance / lastMonthConsumption) * 200));

    return {
      nextMonthPredictedConsumption: predictedConsumption.toFixed(1),
      nextMonthPredictedCost: predictedCost.toFixed(2),
      trend,
      confidence: Math.round(confidence),
      monthlyAverage: (monthlyConsumption.reduce((sum, val) => sum + val, 0) / monthlyConsumption.length).toFixed(1)
    };
  };

  const fuelAnalytics = calculateFuelAnalytics();
  const maintenanceAnalytics = calculateMaintenanceAnalytics();
  const fuelTrends = calculateFuelTrends();

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
            />          ) : (
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

        {/* Analytics Section */}
        {selectedTruck && (
          <View className='flex flex-col gap-2'>
            <View className='flex flex-row justify-between items-center'>
              <Text className='font-semibold text-base'>Truck Analytics</Text>
              <Text className='text-sm text-gray-500'>{selectedTruck.plate}</Text>
            </View>

            {/* Fuel Analytics */}
            <View className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'>
              <Text className='font-medium text-gray-800 mb-3'>⛽ Fuel Statistics</Text>
              {loadingFuel ? (
                <Text className="text-gray-500 text-center py-2">Loading fuel data...</Text>
              ) : (
                <View className='flex flex-row flex-wrap justify-between'>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Total Fuel</Text>
                    <Text className='text-lg font-semibold text-blue-600'>{fuelAnalytics.totalFuelPurchased} L</Text>
                  </View>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Total Spent</Text>
                    <Text className='text-lg font-semibold text-green-600'>₱{fuelAnalytics.totalSpent}</Text>
                  </View>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Avg Price/L</Text>
                    <Text className='text-lg font-semibold text-orange-600'>₱{fuelAnalytics.averageFuelPrice}</Text>
                  </View>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Total Refuels</Text>
                    <Text className='text-lg font-semibold text-purple-600'>{fuelAnalytics.totalRefuels}</Text>
                  </View>
                  {fuelAnalytics.lastRefuelDate && (
                    <View className='w-full mt-2 pt-2 border-t border-gray-100'>
                      <Text className='text-xs text-gray-500'>Last Refuel</Text>
                      <Text className='text-sm font-medium text-gray-700'>
                        {new Date(fuelAnalytics.lastRefuelDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Fuel Forecasting */}
            <View className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'>
              <Text className='font-medium text-gray-800 mb-3'>📈 Fuel Forecasting</Text>
              {loadingFuel ? (
                <Text className="text-gray-500 text-center py-2">Loading forecasting data...</Text>
              ) : fuelTrends.trend === 'insufficient_data' ? (
                <View className='text-center py-4'>
                  <Text className='text-gray-500 text-sm'>Need at least 2 months of data</Text>
                  <Text className='text-gray-400 text-xs mt-1'>for accurate forecasting</Text>
                </View>
              ) : (
                <View>
                  {/* Next Month Predictions */}
                  <View className='flex flex-row flex-wrap justify-between mb-3'>
                    <View className='w-[48%] mb-2'>
                      <Text className='text-xs text-gray-500'>Next Month Fuel</Text>
                      <Text className='text-lg font-semibold text-cyan-600'>{fuelTrends.nextMonthPredictedConsumption} L</Text>
                    </View>
                    <View className='w-[48%] mb-2'>
                      <Text className='text-xs text-gray-500'>Next Month Cost</Text>
                      <Text className='text-lg font-semibold text-rose-600'>₱{fuelTrends.nextMonthPredictedCost}</Text>
                    </View>
                    <View className='w-[48%] mb-2'>
                      <Text className='text-xs text-gray-500'>Monthly Average</Text>
                      <Text className='text-lg font-semibold text-teal-600'>{fuelTrends.monthlyAverage} L</Text>
                    </View>
                    <View className='w-[48%] mb-2'>
                      <Text className='text-xs text-gray-500'>Confidence</Text>
                      <Text className='text-lg font-semibold text-amber-600'>{fuelTrends.confidence}%</Text>
                    </View>
                  </View>

                  {/* Trend Indicator */}
                  <View className='bg-gray-50 rounded-lg p-3'>
                    <View className='flex flex-row items-center justify-between'>
                      <Text className='text-xs text-gray-500'>Consumption Trend</Text>
                      <View className='flex flex-row items-center'>
                        {fuelTrends.trend === 'increasing' && (
                          <>
                            <Text className='text-red-500 font-medium text-sm mr-1'>↗ Increasing</Text>
                            <Text className='text-xs text-red-400'>Usage going up</Text>
                          </>
                        )}
                        {fuelTrends.trend === 'decreasing' && (
                          <>
                            <Text className='text-green-500 font-medium text-sm mr-1'>↘ Decreasing</Text>
                            <Text className='text-xs text-green-400'>Usage going down</Text>
                          </>
                        )}
                        {fuelTrends.trend === 'stable' && (
                          <>
                            <Text className='text-blue-500 font-medium text-sm mr-1'>→ Stable</Text>
                            <Text className='text-xs text-blue-400'>Consistent usage</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Confidence Level Indicator */}
                  {fuelTrends.confidence < 50 && (
                    <View className='mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400'>
                      <Text className='text-xs text-yellow-700'>
                        ⚠️ Low confidence prediction. More data needed for accuracy.
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Maintenance Analytics */}
            <View className='bg-white rounded-lg p-4 shadow-sm border border-gray-200'>
              <Text className='font-medium text-gray-800 mb-3'>🔧 Maintenance Statistics</Text>
              {loadingMaintenance ? (
                <Text className="text-gray-500 text-center py-2">Loading maintenance data...</Text>
              ) : (
                <View className='flex flex-row flex-wrap justify-between'>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Total Requests</Text>
                    <Text className='text-lg font-semibold text-blue-600'>{maintenanceAnalytics.totalRequests}</Text>
                  </View>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Pending</Text>
                    <Text className='text-lg font-semibold text-yellow-600'>{maintenanceAnalytics.pendingRequests}</Text>
                  </View>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Completed</Text>
                    <Text className='text-lg font-semibold text-green-600'>{maintenanceAnalytics.completedRequests}</Text>
                  </View>
                  <View className='w-[48%] mb-2'>
                    <Text className='text-xs text-gray-500'>Success Rate</Text>
                    <Text className='text-lg font-semibold text-indigo-600'>
                      {maintenanceAnalytics.totalRequests > 0
                        ? Math.round((maintenanceAnalytics.completedRequests / maintenanceAnalytics.totalRequests) * 100)
                        : 0}%
                    </Text>
                  </View>
                  {maintenanceAnalytics.lastMaintenanceDate && (
                    <View className='w-full mt-2 pt-2 border-t border-gray-100'>
                      <Text className='text-xs text-gray-500'>Last Request</Text>
                      <Text className='text-sm font-medium text-gray-700'>
                        {new Date(maintenanceAnalytics.lastMaintenanceDate).toLocaleDateString()}
                      </Text>
                    </View>
                  )}
                </View>
              )}            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}