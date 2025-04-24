import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ModalHeader from '../../components/ModalHeader';
import { newFleetFuel } from '../../services/fleet_fuels/newFleetFuel';

const NewFuel = ({ route, closeModal }) => {
  const { truckId } = route?.params || {};

  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [odometerReading, setOdometerReading] = useState('');

  // Receipt image handling - we don't need date/time inputs anymore as we're using the 'created' field
  const [receiptImage, setReceiptImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add these image picker functions
  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need camera permission to take photos');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Camera photo taken:', result.assets[0]);
        setReceiptImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      // Request media library permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission needed', 'We need media library permission to select photos');
        return;
      }

      // Launch image library
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
        mediaTypes: ImagePicker.MediaTypeOptions.Images
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image selected from library:', result.assets[0]);
        setReceiptImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const removeImage = () => {
    setReceiptImage(null);
  };

  // Show only camera and gallery options
  const showImageOptions = () => {
    Alert.alert(
      'Add Receipt Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!fuelAmount || !fuelPrice || !odometerReading) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const payload = {
      fleet: truckId, // We keep using "fleet" in the payload for backward compatibility with the function
      fuel_amount: parseFloat(fuelAmount),
      fuel_price: parseFloat(fuelPrice),
      odometer_reading: parseInt(odometerReading),
      receiptImage: receiptImage // Just pass the raw image object from ImagePicker
    };

    console.log('Submitting fuel record:', payload);

    setIsSubmitting(true);

    try {
      const result = await newFleetFuel(payload);

      if (result.success) {
        Alert.alert('Success', 'Fuel record added successfully', [
          { text: 'OK', onPress: closeModal }
        ]);
      } else {
        // Improved error handling with better details
        let errorMessage = result.error || 'Failed to add fuel record';
        if (result.details) {
          // Show specific validation errors if available
          if (typeof result.details === 'object') {
            errorMessage += '\n\n' + Object.entries(result.details)
              .map(([field, msg]) => `• ${field}: ${msg}`)
              .join('\n');
          }
        }
        Alert.alert('Error', errorMessage);
        console.error('Error details:', result.details);
      }
    } catch (error) {
      console.error('Error submitting fuel record:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ModalHeader title="Add Refuel Record" onBack={closeModal} />
      <ScrollView className="flex-1 p-4 pb-24">
        <View className="bg-white rounded-lg mb-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">Refuel Details</Text>

          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Fuel Amount (liters)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2"
              keyboardType="decimal-pad"
              value={fuelAmount}
              onChangeText={setFuelAmount}
              placeholder="e.g., 45.5"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Fuel Price (per liter)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2"
              keyboardType="decimal-pad"
              value={fuelPrice}
              onChangeText={setFuelPrice}
              placeholder="e.g., 58.75"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Current Odometer Reading (km)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2"
              keyboardType="number-pad"
              value={odometerReading}
              onChangeText={setOdometerReading}
              placeholder="e.g., 12450"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View className="mb-2 mt-2">
            <Text className="text-gray-600 mb-2">Receipt Image (Optional)</Text>
            {receiptImage ? (
              <View className="border border-gray-200 rounded-lg overflow-hidden">
                <Image
                  source={{ uri: receiptImage.uri }}
                  className="w-full h-48"
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={removeImage}
                  className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                >
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <View className="flex-row justify-center space-x-3">
                {/* Camera button */}
                <TouchableOpacity
                  onPress={takePhoto}
                  className="bg-blue-600 p-3 rounded-lg flex-1 flex-row justify-center items-center"
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Take Photo
                  </Text>
                </TouchableOpacity>

                {/* Gallery button */}
                <TouchableOpacity
                  onPress={pickImage}
                  className="bg-blue-500 p-3 rounded-lg flex-1 flex-row justify-center items-center"
                >
                  <Ionicons name="images" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          className={`${isSubmitting ? 'bg-gray-400' : 'bg-blue-600'} rounded-lg py-3 flex-row justify-center items-center`}
        >
          {isSubmitting ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Saving...</Text>
            </>
          ) : (
            <>
              <Ionicons name="save-outline" size={20} color="white" />
              <Text className="text-white font-bold text-center ml-2">Save Record</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default NewFuel;