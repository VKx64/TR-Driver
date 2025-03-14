import React, { useState } from 'react';
import { Text,ScrollView,TouchableOpacity,KeyboardAvoidingView,Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';

import MaintenanceRecordCard from './MaintenanceRecordCard';
import NewMaintenanceForm from './NewMaintenanceForm';

export default function FleetMaintenanceScreen() {
  const [records, setRecords] = useState([
    { id: 1, vehicle: 'Truck A', date: '2024-03-12', description: 'Oil Change' },
    { id: 2, vehicle: 'Van B', date: '2024-03-10', description: 'Brake Inspection' },
    { id: 3, vehicle: 'Van C', date: '2024-02-10', description: 'Brake LOL' },
  ]);

  const [showForm, setShowForm] = useState(false);

  const addRecord = (record) => {
    const updated = [...records, { ...record, id: records.length + 1 }];
    console.log('Added record:', record);
    setRecords(updated);
    setShowForm(false);
  };

  const toggleForm = () => {
    console.log(`Form is now: ${!showForm ? 'Open' : 'Closed'}`);
    setShowForm((prev) => !prev);
  };

  console.log('Render FleetMaintenanceScreen - Records:', records.length);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 p-4">
        <Text className="text-xl font-bold mb-4 text-gray-800">
          Fleet Maintenance Records
        </Text>

        <ScrollView className="mb-4">
          {records.map((record) => (
            <MaintenanceRecordCard key={record.id} record={record} />
          ))}
        </ScrollView>

        {showForm ? (
          <NewMaintenanceForm
            onSave={addRecord}
            onCancel={toggleForm}
          />
        ) : (
          <TouchableOpacity
            className="bg-indigo-600 w-16 h-16 rounded-full absolute bottom-5 right-5 items-center justify-center shadow-lg"
            onPress={toggleForm}
          >
            <Plus color="white" size={28} />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
