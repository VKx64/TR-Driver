import React, { useState } from 'react';
import { View, Text, Picker, ScrollView, TouchableOpacity, Modal } from 'react-native';
import useFetchFleets from '../../hooks/useFetchFleets'; // Import the useFetchFleets hook
import useFetchMaintenance from '../../hooks/useFetchMaintenance'; // Import the useFetchMaintenance hook
import { useAuth } from '../../contexts/AuthContext'; // Import the useAuth hook
import CardMaintenance from '../components/CardMaintenance';
import NewMaintenanceForm from '../components/FleetComponents/NewMaintenanceForm'; // Import the NewMaintenanceForm component

export default function MaintenancePage() {
  const { user } = useAuth(); // Access the user object from the context
  const driverId = user?.id;
  const { fleets, loading: fleetsLoading, error: fleetsError } = useFetchFleets(driverId);
  const [selectedFleet, setSelectedFleet] = useState('');
  const { maintenanceRecords, loading: maintenanceLoading, error: maintenanceError } = useFetchMaintenance(selectedFleet);
  const [modalVisible, setModalVisible] = useState(false);

  const handleFleetChange = (fleetId) => {
    setSelectedFleet(fleetId);
    console.log(fleets.find(f => f.id === fleetId));
  };

  const addMaintenanceRecord = (record) => {
    // Add the new maintenance record to the list
    maintenanceRecords.push(record);
    setModalVisible(false);
  };

  if (fleetsLoading) {
    return <Text>Loading fleets...</Text>;
  }

  if (fleetsError) {
    return <Text>Error: {fleetsError}</Text>;
  }

  return (
    <ScrollView className='bg-red-100 h-screen w-screen'>
      <View className='p-4'>
        {/* Header Text */}
        <Text className="text-center text-2xl font-bold mb-4">Select a Fleet</Text>
        {/* Drop Down */}
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
        {/* List */}
        {maintenanceRecords.length === 0 ? (
          <Text>No Record Found</Text>
        ) : (
          maintenanceRecords.map((maintenanceRecord) => (
            <CardMaintenance key={maintenanceRecord.id} maintenance={maintenanceRecord}/>
          ))
        )}
        {/* Add Maintenance Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-blue-500 p-2 rounded mt-4"
        >
          <Text className="text-white text-center">Add Maintenance</Text>
        </TouchableOpacity>
      </View>
      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
          <NewMaintenanceForm
            onSave={addMaintenanceRecord}
            onCancel={() => setModalVisible(false)}
            fleetId={selectedFleet} // Pass the selected fleet ID to the form
          />
        </View>
      </Modal>
    </ScrollView>
  );
}
