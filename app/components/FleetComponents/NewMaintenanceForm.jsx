import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';

const NewMaintenanceForm = ({ onSave, onCancel }) => {
  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Handle form submission with validation
  const handleSubmit = useCallback(() => {
    if (!vehicle.trim() || !date.trim() || !description.trim()) {
      console.log('Validation failed: Some fields are empty');
      alert('Please fill all fields');
      return;
    }

    const newRecord = { vehicle, date, description };

    console.log('Submitting new record:', newRecord);

    onSave(newRecord);

    // Clear inputs after save
    resetForm();
  }, [vehicle, date, description, onSave]);

  // Reset all input fields
  const resetForm = () => {
    setVehicle('');
    setDate('');
    setDescription('');
  };

  return (
    <View className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <Text className="text-lg font-bold text-gray-800">New Maintenance Entry</Text>

      <TextInput
        placeholder="Vehicle Name"
        value={vehicle}
        onChangeText={setVehicle}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
        className="border border-gray-300 p-3 rounded text-base"
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        className="border border-gray-300 p-3 rounded text-base h-24"
      />

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
        >
          <Text className="text-white font-medium">Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewMaintenanceForm;
