import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Displays maintenance request information in a card format
 *
 * @param {Object} props - Component props
 * @param {Object} props.requestData - The complete maintenance request object
 * @param {Function} props.onPress - Optional callback for when the card is pressed
 */
export default function MaintenanceRequestCard({ requestData, onPress }) {
  // Extract values from request data
  const { taskName, created, status } = requestData;

  // Format the date from ISO string to a readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status color mapping
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'in progress':
      case 'in_progress':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'urgent':
      case 'rejected':
        return { bg: 'bg-red-100', text: 'text-red-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  const statusStyle = getStatusColor(status);
  const formattedDate = formatDate(created);

  const CardContent = () => (
    <>
      <View className="flex-row justify-between mb-2 items-center">
        <Text className="text-lg font-medium text-gray-800">{formattedDate}</Text>
        <View className={`${statusStyle.bg} px-3 py-1 rounded-full`}>
          <Text className={`${statusStyle.text} font-medium`}>
            {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
          </Text>
        </View>
      </View>

      <Text className="text-xl font-bold text-gray-900">{taskName}</Text>
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        className="bg-white p-4 rounded-xl shadow-sm mb-3"
        onPress={onPress}
        activeOpacity={0.7}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white p-4 rounded-xl shadow-sm mb-3">
      <CardContent />
    </View>
  );
}

// Example usage with dummy data that matches the structure from fetchMaintenanceRequest
export const MAINTENANCE_DUMMY_DATA = [
  {
    id: '1',
    fleetId: 'truck123',
    maintenanceId: 'maint456',
    taskName: 'Oil Change and Filter Replacement',
    created: '2025-03-28T14:30:00Z',
    updated: '2025-03-28T14:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    fleetId: 'truck124',
    maintenanceId: 'maint457',
    taskName: 'Brake Pad Replacement',
    created: '2025-03-27T10:15:00Z',
    updated: '2025-03-27T16:45:00Z',
    status: 'in_progress'
  },
  {
    id: '3',
    fleetId: 'truck125',
    maintenanceId: 'maint458',
    taskName: 'Tire Rotation and Alignment',
    created: '2025-03-25T09:00:00Z',
    updated: '2025-03-26T15:30:00Z',
    status: 'completed'
  },
  {
    id: '4',
    fleetId: 'truck126',
    maintenanceId: 'maint459',
    taskName: 'Engine Overheating Investigation',
    created: '2025-03-24T13:20:00Z',
    updated: '2025-03-24T13:20:00Z',
    status: 'urgent'
  }
];