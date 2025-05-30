import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

const AccountVerificationModal = ({ visible, onClose }) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black bg-opacity-50 p-4">
      <View className="bg-white w-full max-w-md rounded-lg p-5">
        <Text className="text-xl font-bold mb-2">Account Verification Required</Text>
        <Text className="text-gray-700 mb-4">
          For security reasons, you need to change your password to verify your account.
        </Text>
        <View className="flex-row justify-end">
          <TouchableOpacity
            className="px-4 py-2"
            onPress={onClose}
          >
            <Text className="text-gray-500 font-medium">Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2"
            onPress={() => {
              onClose();
              router.push("/pages/newPassword");
            }}
          >
            <Text className="text-indigo-600 font-medium">Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default AccountVerificationModal;