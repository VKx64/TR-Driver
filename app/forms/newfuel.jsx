import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Alert, Image, Platform } from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import ModalHeader from '../../components/ModalHeader';
import { newFleetFuel } from '../../services/fleet_fuels/newFleetFuel';

// Mock images for development (add more as needed)
const MOCK_IMAGES = [
  { id: 1, url: 'https://placehold.co/300x200/png?text=Receipt+1', label: 'Sample Receipt 1' },
  { id: 2, url: 'https://placehold.co/300x200/png?text=Receipt+2', label: 'Sample Receipt 2' },
  { id: 3, url: 'https://placehold.co/300x200/png?text=Gas+Receipt', label: 'Gas Receipt' },
];

const NewFuel = ({ route, closeModal }) => {
  const { truckId } = route?.params || {};

  const [fuelAmount, setFuelAmount] = useState('');
  const [fuelPrice, setFuelPrice] = useState('');
  const [odometerReading, setOdometerReading] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for development image picker
  const [showDevImagePicker, setShowDevImagePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    setShowTimePicker(true);
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const newDateTime = new Date(date);
      newDateTime.setHours(selectedTime.getHours());
      newDateTime.setMinutes(selectedTime.getMinutes());
      setDate(newDateTime);
    }
  };

  const formatDateTime = (dateObj) => {
    return dateObj.toLocaleString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need camera permissions to take a photo');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0]);
        console.log('Photo taken:', result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need media library permissions to select a photo');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0]);
        console.log('Image selected:', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const removeImage = () => {
    setReceiptImage(null);
  };

  // Development-friendly image picker
  const handleDevImageSelection = (url) => {
    // Create a mock image object similar to what expo-image-picker would return
    const mockImage = {
      uri: url,
      width: 300,
      height: 200,
      type: 'image/jpeg',
      fileName: `mock_receipt_${Date.now()}.jpg`,
    };
    
    setReceiptImage(mockImage);
    setShowDevImagePicker(false);
    console.log('Selected mock image:', mockImage);
  };

  // Handle URL input for development
  const handleUrlSubmit = () => {
    if (!imageUrl) {
      Alert.alert('Error', 'Please enter a valid image URL');
      return;
    }
    
    handleDevImageSelection(imageUrl);
    setImageUrl('');
  };

  // Combined image picker that shows either native or dev options
  const showImageOptions = () => {
    if (Platform.OS === 'web' || __DEV__) {
      setShowDevImagePicker(true);
    } else {
      Alert.alert(
        'Add Receipt Image',
        'Choose an option',
        [
          { text: 'Take Photo', onPress: takePhoto },
          { text: 'Choose from Library', onPress: pickImage },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // UI for development image picker
  const renderDevImagePicker = () => {
    if (!showDevImagePicker) return null;
    
    return (
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-white z-10 p-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">Select Image (Development)</Text>
          <TouchableOpacity onPress={() => setShowDevImagePicker(false)}>
            <Ionicons name="close-circle" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text className="text-gray-600 mb-2">Enter image URL:</Text>
        <View className="flex-row mb-4">
          <TextInput
            className="border border-gray-300 rounded-lg px-3 py-2 flex-1 mr-2"
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity 
            onPress={handleUrlSubmit}
            className="bg-blue-500 px-4 rounded-lg justify-center"
          >
            <Text className="text-white font-medium">Use</Text>
          </TouchableOpacity>
        </View>
        
        <Text className="text-gray-600 mb-2">Or select a sample image:</Text>
        <ScrollView>
          {MOCK_IMAGES.map(img => (
            <TouchableOpacity 
              key={img.id} 
              className="mb-3 border border-gray-200 rounded-lg overflow-hidden"
              onPress={() => handleDevImageSelection(img.url)}
            >
              <Image 
                source={{ uri: img.url }} 
                className="w-full h-40" 
                resizeMode="cover"
              />
              <View className="p-2 bg-gray-50">
                <Text className="font-medium">{img.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const handleSubmit = async () => {
    if (!fuelAmount || !fuelPrice || !odometerReading) {
      Alert.alert('Missing Information', 'Please fill in all fields');
      return;
    }

    const payload = {
      fleet: truckId,
      date: date.toISOString(),
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
      {renderDevImagePicker()}
      <ScrollView className="flex-1 p-4 pb-24">
        <View className="bg-white rounded-lg mb-6">
          <Text className="text-gray-800 font-bold text-lg mb-4">Refuel Details</Text>
          <View className="mb-4">
            <Text className="text-gray-600 mb-1">Date and Time</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="border border-gray-300 rounded-lg px-3 py-2 flex-row justify-between items-center"
            >
              <Text>{formatDateTime(date)}</Text>
              <Ionicons name="calendar-outline" size={20} color="#666" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            {showTimePicker && (
              <DateTimePicker
                value={date}
                mode="time"
                display="default"
                onChange={onTimeChange}
                is24Hour={true}
              />
            )}
          </View>
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
              <View className="flex-row justify-center space-x-4">
                {/* Replace the two separate buttons with a single one for development */}
                <TouchableOpacity
                  onPress={showImageOptions}
                  className="bg-blue-500 p-3 rounded-lg flex-1 flex-row justify-center items-center"
                >
                  <Ionicons name="image" size={20} color="white" />
                  <Text className="text-white font-medium ml-2">
                    {Platform.OS === 'web' || __DEV__ ? 'Select Image' : 'Add Receipt Image'}
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