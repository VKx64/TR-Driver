import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import useCreateMaintenance from '../../../hooks/useCreateMaintenance'; // Import the useCreateMaintenance hook

const NewMaintenanceForm = ({ onSave, onCancel, fleetId }) => {
  const { createMaintenance, loading, error } = useCreateMaintenance(); // Use the hook
  const [name, setName] = useState('');
  const [intervalInDays, setIntervalInDays] = useState('');
  const [importance, setImportance] = useState('');
  const [cost, setCost] = useState('');

  // Handle form submission with validation
  const handleSubmit = useCallback(async () => {
    if (!name.trim() || !intervalInDays.trim() || !importance.trim() || !cost.trim()) {
      console.log('Validation failed: Some fields are empty');
      alert('Please fill all fields');
      return;
    }

    const maintenanceData = {
      name,
      interval_in_days: parseInt(intervalInDays, 10),
      importance,
      cost: parseFloat(cost),
    };

    console.log('Submitting new maintenance record:', maintenanceData);

    try {
      await createMaintenance(maintenanceData, fleetId);
      onSave(maintenanceData);
      resetForm();
    } catch (error) {
      console.error("Failed to create maintenance record:", error);
    }
  }, [name, intervalInDays, importance, cost, createMaintenance, fleetId, onSave]);

  // Reset all input fields
  const resetForm = () => {
    setName('');
    setIntervalInDays('');
    setImportance('');
    setCost('');
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <Text className="text-lg font-bold text-gray-800">New Maintenance Entry</Text>

      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Interval in Days"
        value={intervalInDays}
        onChangeText={setIntervalInDays}
        keyboardType="numeric"
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Importance"
        value={importance}
        onChangeText={setImportance}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Cost"
        value={cost}
        onChangeText={setCost}
        keyboardType="numeric"
        className="border border-gray-300 p-3 rounded text-base"
      />

      {error && <Text className="text-red-500 mb-4">{error}</Text>}

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
          disabled={loading}
        >
          <Text className="text-white font-medium">{loading ? 'Creating...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewMaintenanceForm;
