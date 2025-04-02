import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity, Picker } from 'react-native';
import useFetchMaintenance from '../../hooks/useFetchMaintenance'; // Import the useFetchMaintenance hook
import useCreateMaintenanceHistory from '../../hooks/useCreateMaintenanceHistory'; // Import the useCreateMaintenanceHistory hook

const NewMaintenanceHistoryForm = ({ onSave, onCancel, fleetId }) => {
  const { maintenanceRecords, loading: maintenanceLoading, error: maintenanceError } = useFetchMaintenance(fleetId);
  const { createMaintenanceHistory, loading: createLoading, error: createError } = useCreateMaintenanceHistory();
  const [selectedMaintenance, setSelectedMaintenance] = useState('');
  const [date, setDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [result, setResult] = useState('');

  // Handle form submission with validation
  const handleSubmit = useCallback(async () => {
    if (!selectedMaintenance || !date.trim() || !remarks.trim() || !result.trim()) {
      console.log('Validation failed: Some fields are empty');
      alert('Please fill all fields');
      return;
    }

    const maintenanceHistoryData = {
      fleet: fleetId,
      maintenance: selectedMaintenance,
      date,
      remarks,
      result,
    };

    console.log('Submitting new maintenance history record:', maintenanceHistoryData);

    try {
      await createMaintenanceHistory(maintenanceHistoryData);
      onSave(maintenanceHistoryData);
      resetForm();
    } catch (error) {
      console.error("Failed to create maintenance history record:", error);
    }
  }, [selectedMaintenance, date, remarks, result, createMaintenanceHistory, fleetId, onSave]);

  // Reset all input fields
  const resetForm = () => {
    setSelectedMaintenance('');
    setDate('');
    setRemarks('');
    setResult('');
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <Text className="text-lg font-bold text-gray-800">New Maintenance History Entry</Text>

      {/* Dropdown for selecting a maintenance record */}
      <View className="bg-white rounded-lg shadow-md mb-4">
        <Picker
          selectedValue={selectedMaintenance || ''}
          onValueChange={(itemValue) => setSelectedMaintenance(itemValue)}
          style={{ height: 50, width: '100%' }}
        >
          {maintenanceRecords.map((maintenance) => (
            <Picker.Item key={maintenance.id} label={maintenance.name} value={maintenance.id} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Date"
        value={date}
        onChangeText={setDate}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Remarks"
        value={remarks}
        onChangeText={setRemarks}
        className="border border-gray-300 p-3 rounded text-base"
      />

      {/* Dropdown for selecting a result */}
      <View className="bg-white rounded-lg shadow-md mb-4">
        <Picker
          selectedValue={result || ''}
          onValueChange={(itemValue) => setResult(itemValue)}
          style={{ height: 50, width: '100%' }}
        >
          <Picker.Item label="Select Result" value="" />
          <Picker.Item label="Good" value="good" />
          <Picker.Item label="Okay" value="okay" />
          <Picker.Item label="Bad" value="bad" />
          <Picker.Item label="Perfect" value="perfect" />
        </Picker>
      </View>

      {createError && <Text className="text-red-500 mb-4">{createError}</Text>}

      <View className="flex-row justify-end space-x-2">
        <TouchableOpacity
          onPress={onCancel}
          className="bg-gray-400 px-5 py-2 rounded"
        >
          <Text className="text-white font-medium">Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          className="bg-indigo-600 px-5 py-2 rounded"
          disabled={createLoading}
        >
          <Text className="text-white font-medium">{createLoading ? 'Creating...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewMaintenanceHistoryForm;