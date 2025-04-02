import { View, Text, TouchableOpacity, Picker, ScrollView, Modal } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router'; // Import the useRouter hook
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import useFetchFleets from '../../hooks/useFetchFleets'; // Import the useFetchFleets hook
import useFetchMaintenanceHistory from '../../hooks/useFetchMaintenanceHistory'; // Import the useFetchMaintenanceHistory hook
import useDeleteMaintenanceHistory from '../../hooks/useDeleteMaintenanceHistory'; // Import the useDeleteMaintenanceHistory hook
import NewMaintenanceHistoryForm from '../components/NewMaintenanceHistoryForm'; // Import the NewMaintenanceHistoryForm component

const History = () => {
  const router = useRouter(); // Access the router
  const { user } = useAuth(); // Access the user object from the context
  const driverId = user?.id;
  const { fleets, loading: fleetsLoading, error: fleetsError } = useFetchFleets(driverId);
  const [selectedFleet, setSelectedFleet] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const { maintenanceHistoryRecords, loading: historyLoading, error: historyError } = useFetchMaintenanceHistory(selectedFleet);
  const { deleteMaintenanceHistory, loading: deleteLoading, error: deleteError } = useDeleteMaintenanceHistory();

  const handleFleetChange = (fleetId) => {
    setSelectedFleet(fleetId);
    console.log(fleets.find(f => f.id === fleetId));
  };

  const handleDelete = async (recordId) => {
    const success = await deleteMaintenanceHistory(recordId);
    if (success) {
      // Optionally, you can refetch the maintenance history or update the state to remove the deleted record
      console.log(`Successfully deleted record with ID: ${recordId}`);
    }
  };

  const navigateBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  if (fleetsLoading) {
    return <Text>Loading fleets...</Text>;
  }

  if (fleetsError) {
    return <Text>Error: {fleetsError}</Text>;
  }

  return (
    <ScrollView className='w-screen h-screen p-4'>
      <Text className="text-2xl font-bold mb-4">Maintenance History</Text>
      {/* Dropdown for selecting a fleet */}
      <View className="bg-white rounded-lg shadow-md mb-4">
        <Picker
          selectedValue={selectedFleet || ''}
          onValueChange={(itemValue) => handleFleetChange(itemValue)}
          style={{ height: 50, width: '100%' }}
        >
          {fleets.map((fleet) => (
            <Picker.Item key={fleet.id} label={fleet.plate} value={fleet.id} />
          ))}
        </Picker>
      </View>
      {/* Maintenance History List */}
      {historyLoading ? (
        <Text>Loading maintenance history...</Text>
      ) : historyError ? (
        <Text>Error: {historyError}</Text>
      ) : (
        maintenanceHistoryRecords.map((record) => (
          <View key={record.id} className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md">
            <Text className="text-lg font-bold">Maintenance: {record.expand.maintenance.name}</Text>
            <Text>Date: {record.date}</Text>
            <Text>Remarks: {record.remarks}</Text>
            <Text>Result: {record.result}</Text>
            <TouchableOpacity
              onPress={() => handleDelete(record.id)}
              className="bg-red-500 p-2 rounded mt-2"
              disabled={deleteLoading}
            >
              <Text className="text-white text-center">{deleteLoading ? 'Deleting...' : 'Delete'}</Text>
            </TouchableOpacity>
            {deleteError && <Text className="text-red-500 mt-2">{deleteError}</Text>}
          </View>
        ))
      )}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="bg-green-500 p-2 rounded mt-4"
      >
        <Text className="text-white text-center">Add Maintenance History</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={navigateBack}
        className="bg-blue-500 p-2 rounded mt-4"
      >
        <Text className="text-white text-center">Go Back</Text>
      </TouchableOpacity>
      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <NewMaintenanceHistoryForm
            onSave={() => setModalVisible(false)}
            onCancel={() => setModalVisible(false)}
            fleetId={selectedFleet} // Pass the selected fleet ID to the form
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default History;