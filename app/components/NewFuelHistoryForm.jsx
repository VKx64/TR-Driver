import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import useCreateFuelHistory from '../../hooks/useCreateFuelHistory'; // Import the useCreateFuelHistory hook

const NewFuelHistoryForm = ({ onSave, onCancel, fleetId }) => {
  const { createFuelHistory, loading: createLoading, error: createError } = useCreateFuelHistory();
  const [fuelType, setFuelType] = useState('');
  const [date, setDate] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');

  // Handle form submission with validation
  const handleSubmit = useCallback(async () => {
    if (!fuelType.trim() || !date.trim() || !quantity.trim() || !costPerUnit.trim()) {
      console.log('Validation failed: Some fields are empty');
      alert('Please fill all fields');
      return;
    }

    const fuelHistoryData = {
      fleet: fleetId,
      fuel_type: fuelType,
      date,
      quantity,
      cost_per_unit: costPerUnit,
    };

    console.log('Submitting new fuel history record:', fuelHistoryData);

    try {
      await createFuelHistory(fuelHistoryData);
      onSave(fuelHistoryData);
      resetForm();
    } catch (error) {
      console.error("Failed to create fuel history record:", error);
    }
  }, [fuelType, date, quantity, costPerUnit, createFuelHistory, fleetId, onSave]);

  // Reset all input fields
  const resetForm = () => {
    setFuelType('');
    setDate('');
    setQuantity('');
    setCostPerUnit('');
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <Text className="text-lg font-bold text-gray-800">New Fuel History Entry</Text>

      <TextInput
        placeholder="Fuel Type"
        value={fuelType}
        onChangeText={setFuelType}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Date"
        value={date}
        onChangeText={setDate}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Cost per Unit"
        value={costPerUnit}
        onChangeText={setCostPerUnit}
        className="border border-gray-300 p-3 rounded text-base"
      />

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

export default NewFuelHistoryForm;