import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import ModalHeader from '../../components/ModalHeader';
import { fetchMaintenanceByFleet } from '../../services/maintenance/fetchMaintenance';
import { createMaintenanceRequest } from '../../services/maintenance_request/createMaintenanceRequest';
import { useAuth } from '../../contexts/AuthContext';

const NewMaintenanceRequest = ({ truckId, closeModal }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentMileage, setCurrentMileage] = useState('');
  const [mileageError, setMileageError] = useState(null);
  const [error, setError] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);

  // Fetch all maintenance tasks
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Getting all maintenance types from the maintenance_type collection
        const tasks = await fetchMaintenanceByFleet();
        console.log(`Fetched ${tasks.length} maintenance tasks`);
        setMaintenanceTasks(tasks);

        // Set the first task as default if available
        if (tasks.length > 0) {
          setSelectedTaskId(tasks[0].id);
          setSelectedTask(tasks[0]);
        }
      } catch (err) {
        console.error('Error fetching maintenance tasks:', err);
        setError('Failed to load maintenance tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleTaskSelect = (task) => {
    setSelectedTaskId(task.id);
    setSelectedTask(task);
    setShowTasksModal(false);
  };

  const validateMileage = () => {
    if (!currentMileage || currentMileage.trim() === '') {
      setMileageError('Current mileage is required');
      return false;
    }

    const mileageValue = parseFloat(currentMileage);
    if (isNaN(mileageValue) || mileageValue < 0) {
      setMileageError('Please enter a valid mileage value');
      return false;
    }

    setMileageError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedTaskId) {
      Alert.alert('Missing Information', 'Please select a maintenance task');
      return;
    }

    if (!validateMileage()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a new maintenance request using the service function with proper field names
      const data = {
        truckId: truckId,
        maintenanceTypeId: selectedTaskId,
        status: 'pending',
        current_mileage_at_request: parseFloat(currentMileage), // This matches the database column name
        request_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        requesting_driver: user?.id // Add the requesting driver ID from AuthContext
      };

      console.log('Submitting maintenance request:', data);

      // Call the service function to create the request
      await createMaintenanceRequest(data);

      Alert.alert('Success', 'Maintenance request submitted successfully', [
        { text: 'OK', onPress: closeModal }
      ]);
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      Alert.alert('Error', error.message || 'Failed to submit maintenance request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to display selected task name and interval
  const getSelectedTaskDisplay = () => {
    if (!selectedTask) return "Select a maintenance task";
    return selectedTask.taskName;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ModalHeader title="New Maintenance Request" onBack={closeModal} />

      <ScrollView className="flex-1 p-4 pb-24">
        <View className="bg-white rounded-lg mb-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">Request Details</Text>

          {isLoading ? (
            <View className="items-center justify-center py-8">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="text-gray-500 mt-3">Loading maintenance tasks...</Text>
            </View>
          ) : error ? (
            <View className="items-center justify-center py-8">
              <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
              <Text className="text-gray-700 text-center mt-3">{error}</Text>
            </View>
          ) : maintenanceTasks.length === 0 ? (
            <View className="bg-yellow-50 p-4 rounded-lg mb-4">
              <Text className="text-amber-800 text-center">
                No maintenance tasks available. Please contact an administrator to set up maintenance tasks.
              </Text>
            </View>
          ) : (
            <View>
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Maintenance Task</Text>
                <TouchableOpacity
                  className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                  onPress={() => setShowTasksModal(true)}
                  disabled={isSubmitting}
                >
                  <Text className="text-gray-700 font-medium">{getSelectedTaskDisplay()}</Text>
                  <Ionicons name="chevron-down" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {/* Current mileage input field */}
              <View className="mb-4">
                <Text className="text-gray-600 mb-1">Current Truck Mileage (km) *</Text>
                <TextInput
                  className={`border ${mileageError ? 'border-red-500' : 'border-gray-300'} rounded-lg p-3 text-gray-700`}
                  value={currentMileage}
                  onChangeText={(text) => {
                    setCurrentMileage(text.replace(/[^0-9.]/g, ''));
                    if (mileageError) validateMileage();
                  }}
                  placeholder="Enter current truck mileage"
                  keyboardType="numeric"
                  editable={!isSubmitting}
                />
                {mileageError && (
                  <Text className="text-red-500 text-sm mt-1">{mileageError}</Text>
                )}
              </View>

              {selectedTask && (
                <View className="mb-4 bg-gray-50 p-4 rounded-lg">
                  <View className="mb-2">
                    <Text className="text-gray-500 text-sm">Recurrence</Text>
                    <Text className="text-gray-700">{selectedTask.formattedInterval}</Text>
                  </View>

                  {selectedTask.description ? (
                    <View>
                      <Text className="text-gray-500 text-sm">Description</Text>
                      <Text className="text-gray-700">{selectedTask.description}</Text>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Modal for selecting maintenance task */}
      <Modal
        visible={showTasksModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTasksModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Select Maintenance Task</Text>
              <TouchableOpacity onPress={() => setShowTasksModal(false)}>
                <Ionicons name="close" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
              {maintenanceTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  className="p-4 border-b border-gray-100 flex-row justify-between items-center"
                  onPress={() => handleTaskSelect(task)}
                >
                  <View className="flex-1">
                    <Text className="text-gray-800 font-medium">{task.taskName}</Text>
                    <Text className="text-gray-500 text-sm">Every {task.formattedInterval}</Text>

                    {task.description ? (
                      <Text className="text-gray-500 text-sm mt-1 italic" numberOfLines={1}>
                        {task.description}
                      </Text>
                    ) : null}
                  </View>
                  {selectedTaskId === task.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#4f46e5" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting || isLoading || maintenanceTasks.length === 0 || !selectedTaskId}
          className={`${
            isSubmitting || isLoading || maintenanceTasks.length === 0 || !selectedTaskId
              ? 'bg-gray-400'
              : 'bg-blue-600'
          } rounded-lg py-3 flex-row justify-center items-center`}
        >
          {isSubmitting ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Submitting...</Text>
            </>
          ) : (
            <>
              <Ionicons name="construct-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Submit Request</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewMaintenanceRequest;