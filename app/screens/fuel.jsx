import { View, Text, Picker, ScrollView, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import useFetchFleets from '../../hooks/useFetchFleets'; // Import the useFetchFleets hook
import useFetchFuelHistory from '../../hooks/useFetchFuelHistory'; // Import the useFetchFuelHistory hook
import useDeleteFuelHistory from '../../hooks/useDeleteFuelHistory'; // Import the useDeleteFuelHistory hook
import NewFuelHistoryForm from '../components/NewFuelHistoryForm'; // Import the NewFuelHistoryForm component

const FuelPage = () => {
  const { user } = useAuth(); // Access the user object from the context
  const driverId = user?.id;
  const { fleets, loading: fleetsLoading, error: fleetsError } = useFetchFleets(driverId);
  const [selectedFleet, setSelectedFleet] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const { fuelHistoryRecords, loading: fuelHistoryLoading, error: fuelHistoryError } = useFetchFuelHistory(selectedFleet);
  const { deleteFuelHistory, loading: deleteLoading, error: deleteError } = useDeleteFuelHistory();

  const handleFleetChange = (fleetId) => {
    setSelectedFleet(fleetId);
    console.log(fleets.find(f => f.id === fleetId));
  };

  const handleDelete = async (recordId) => {
    const success = await deleteFuelHistory(recordId);
    if (success) {
      // Optionally, you can refetch the fuel history or update the state to remove the deleted record
      console.log(`Successfully deleted record with ID: ${recordId}`);
    }
  };

  if (fleetsLoading) {
    return <Text>Loading fleets...</Text>;
  }

  if (fleetsError) {
    return <Text>Error: {fleetsError}</Text>;
  }

  return (
    <ScrollView className='w-screen h-screen p-4'>
      <Text className="text-2xl font-bold mb-4">Fuel Management</Text>
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
      {/* Fuel History List */}
      {fuelHistoryLoading ? (
        <Text>Loading fuel history...</Text>
      ) : fuelHistoryError ? (
        <Text>Error: {fuelHistoryError}</Text>
      ) : (
        fuelHistoryRecords.map((record) => (
          <View key={record.id} className="bg-gray-100 p-4 mb-4 rounded-lg shadow-md">
            <Text className="text-lg font-bold">Fuel Type: {record.fuel_type}</Text>
            <Text>Date: {record.date}</Text>
            <Text>Quantity: {record.quantity}</Text>
            <Text>Cost per Unit: {record.cost_per_unit}₱</Text>
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
        <Text className="text-white text-center">Add Fuel History</Text>
      </TouchableOpacity>
      <Text>Selected Fleet: {selectedFleet}</Text>
      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <NewFuelHistoryForm
            onSave={() => setModalVisible(false)}
            onCancel={() => setModalVisible(false)}
            fleetId={selectedFleet} // Pass the selected fleet ID to the form
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default FuelPage;