import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useFleets } from '../../services/fleets/fetchAllFleets';
import { pb } from '../../services/pocketbase';  // Changed from default to named import
import { useSelectedTruck } from '../../contexts/TruckContext';

export default function Alerts() {
  // Use the shared truck context instead of local selection
  const { selectedTruck } = useSelectedTruck();
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const maintenanceSubscription = useRef(null);
  const requestSubscription = useRef(null);

  // Subscribe to real-time maintenance status changes for the selected truck
  const subscribeToMaintenanceChanges = (truckId) => {
    // Unsubscribe from any existing subscriptions
    unsubscribeFromChanges();

    console.log('Subscribing to maintenance changes for truck:', truckId);

    // Subscribe to maintenance_status changes
    try {
      maintenanceSubscription.current = pb.collection('maintenance_status').subscribe('*', function(e) {
        console.log('Maintenance status change detected:', e.action);

        // Only process changes relevant to the selected truck
        if (e.record && e.record.truck_id === truckId) {
          console.log('Change for our truck detected:', e.record);

          // Process the maintenance status change and add it to alerts
          processMaintenanceStatusChange(e.action, e.record);
        }
      });

      // Also subscribe to maintenance_request changes to catch approvals/declines/completions
      requestSubscription.current = pb.collection('maintenance_request').subscribe('*', function(e) {
        console.log('Maintenance request change detected:', e.action);

        if (e.record && e.record.truck && e.record.truck.id === truckId) {
          console.log('Request change for our truck detected:', e.record);

          // Process the request status change
          processMaintenanceRequestChange(e.action, e.record);
        }
      });

      console.log('Subscribed to changes successfully');
    } catch (error) {
      console.error('Error subscribing to changes:', error);
    }
  };

  // Process maintenance status changes and create appropriate alerts
  const processMaintenanceStatusChange = (action, record) => {
    // Get maintenance type information
    let maintenanceTypeName = 'Maintenance';
    if (record.maintenance_type_id) {
      if (record.expand && record.expand.maintenance_type_id) {
        maintenanceTypeName = record.expand.maintenance_type_id.name;
      } else {
        maintenanceTypeName = `Maintenance #${record.maintenance_type_id}`;
      }
    }

    let message = '';
    let title = '';
    let severity = 'medium';

    if (action === 'update') {
      // Check if is_due status changed
      if (record.is_due) {
        title = `${maintenanceTypeName} Due`;
        message = `${maintenanceTypeName} is now due for your truck.`;
        severity = 'high';
      } else {
        title = `${maintenanceTypeName} Updated`;
        message = `${maintenanceTypeName} status has been updated.`;
        severity = 'medium';
      }
    } else if (action === 'create') {
      title = `New ${maintenanceTypeName}`;
      message = `A new ${maintenanceTypeName.toLowerCase()} schedule has been created.`;
      severity = 'low';
    }

    if (title) {
      const newAlert = {
        id: Date.now(), // Generate a unique ID based on timestamp
        title,
        message,
        severity,
        date: new Date(),
      };

      // Add the new alert to the existing alerts
      setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    }
  };

  // Process maintenance request changes and create appropriate alerts
  const processMaintenanceRequestChange = (action, record) => {
    if (!record.status) return;

    let message = '';
    let title = '';
    let severity = 'medium';

    // Get maintenance type information
    let maintenanceTypeName = 'Maintenance Request';
    if (record.maintenance_type) {
      if (record.expand && record.expand.maintenance_type) {
        maintenanceTypeName = record.expand.maintenance_type.name;
      } else {
        maintenanceTypeName = `Maintenance Request #${record.maintenance_type}`;
      }
    }

    switch (record.status) {
      case 'approved':
        title = 'Request Approved';
        message = `${maintenanceTypeName} request has been approved.`;
        severity = 'medium';
        break;
      case 'declined':
        title = 'Request Declined';
        message = `${maintenanceTypeName} request has been declined.`;
        severity = 'high';
        break;
      case 'completed':
        title = 'Maintenance Completed';
        message = `${maintenanceTypeName} has been marked as completed.`;
        severity = 'low';
        break;
      // 'pending' status doesn't need an alert
    }

    if (title) {
      const newAlert = {
        id: Date.now(), // Generate a unique ID based on timestamp
        title,
        message,
        severity,
        date: new Date(),
      };

      // Add the new alert to the existing alerts
      setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    }
  };

  // Unsubscribe from all active subscriptions
  const unsubscribeFromChanges = () => {
    try {
      if (maintenanceSubscription.current) {
        pb.collection('maintenance_status').unsubscribe();
        maintenanceSubscription.current = null;
        console.log('Unsubscribed from maintenance status changes');
      }

      if (requestSubscription.current) {
        pb.collection('maintenance_request').unsubscribe();
        requestSubscription.current = null;
        console.log('Unsubscribed from maintenance request changes');
      }
    } catch (error) {
      console.error('Error unsubscribing from changes:', error);
    }
  };

  // Fetch alerts for selected truck
  const fetchAlerts = async (truckId) => {
    if (!truckId) return;

    setLoading(true);
    try {
      // Fetch maintenance status alerts
      const maintenanceStatuses = await pb.collection('maintenance_status').getList(1, 50, {
        filter: `truck_id.id = "${truckId}" && is_due = true`,
        expand: 'maintenance_type_id,truck_id',
      });

      // Fetch maintenance requests
      const maintenanceRequests = await pb.collection('maintenance_request').getList(1, 50, {
        filter: `truck.id = "${truckId}" && (status = "approved" || status = "declined" || status = "completed")`,
        expand: 'maintenance_type,truck',
        sort: '-updated',
      });

      const generatedAlerts = [];

      // Process maintenance statuses
      maintenanceStatuses.items.forEach(status => {
        const maintenanceType = status.expand?.maintenance_type_id?.name || 'Maintenance';

        generatedAlerts.push({
          id: `status-${status.id}`,
          title: `${maintenanceType} Due`,
          message: `${maintenanceType} is due for your truck.`,
          severity: 'high',
          date: new Date(status.updated),
        });
      });

      // Process maintenance requests
      maintenanceRequests.items.forEach(request => {
        const maintenanceType = request.expand?.maintenance_type?.name || 'Maintenance';
        let title = '';
        let message = '';
        let severity = 'medium';

        switch (request.status) {
          case 'approved':
            title = 'Request Approved';
            message = `${maintenanceType} request has been approved.`;
            severity = 'medium';
            break;
          case 'declined':
            title = 'Request Declined';
            message = `${maintenanceType} request has been declined.`;
            severity = 'high';
            break;
          case 'completed':
            title = 'Maintenance Completed';
            message = `${maintenanceType} has been marked as completed.`;
            severity = 'low';
            break;
        }

        generatedAlerts.push({
          id: `request-${request.id}`,
          title,
          message,
          severity,
          date: new Date(request.updated),
        });
      });

      // Sort all alerts by date, newest first
      generatedAlerts.sort((a, b) => b.date - a.date);

      setAlerts(generatedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  // Clean up subscriptions when component unmounts
  useEffect(() => {
    return () => {
      unsubscribeFromChanges();
    };
  }, []);

  // Update alerts when selected truck changes
  useEffect(() => {
    if (selectedTruck) {
      fetchAlerts(selectedTruck.id);
      subscribeToMaintenanceChanges(selectedTruck.id);
    } else {
      setAlerts([]);
      unsubscribeFromChanges();
    }
  }, [selectedTruck]);

  // Pull to refresh functionality
  const handleRefresh = () => {
    if (selectedTruck) {
      fetchAlerts(selectedTruck.id);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content Area */}
      <View className="flex-1">
        {selectedTruck ? (
          <ScrollView
            className="flex-1 p-4 bg-gray-100"
            refreshing={loading}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
          >
            {/* Selected Truck Info */}
            <View className="bg-indigo-100 p-3 rounded-lg mb-4">
              <Text className="text-indigo-800 font-semibold">
                Showing alerts for: {selectedTruck.plate}
              </Text>
            </View>

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

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={handleRefresh}
              className="bg-indigo-600 rounded-lg py-3 flex-row justify-center items-center my-4"
            >
              <Ionicons name="refresh-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Refresh Alerts</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : (
          <View className="flex-1 justify-center items-center p-4 bg-gray-100">
            <Ionicons name="notifications-outline" size={64} color="#d1d5db" />
            <Text className="text-xl font-semibold text-gray-500 mt-4 mb-2">No truck selected</Text>
            <Text className="text-gray-400 text-center">
              Please select a truck on the Home tab to view alerts
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}