import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { updatePassword, user } = useAuth(); // Get the user

  // Check if user is new based on created date
  const isNewUser = () => {
    if (!user || !user.created) return false;

    // Consider user new if account was created in the last 24 hours
    const createdDate = new Date(user.created);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return createdDate > oneDayAgo;
  };

  // Store the result of the check
  const userIsNew = isNewUser();

  // Check password requirements
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";

  const handlePasswordChange = async () => {
    setErrorMessage("");

    // Validate all password requirements
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setErrorMessage("Please ensure your password meets all the requirements");
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage("Passwords don't match");
      return;
    }

    // Only check current password if user is not new
    if (!userIsNew && !currentPassword) {
      setErrorMessage("Please enter your current password");
      return;
    }

    try {
      setIsLoading(true);

  
      const passwordToUse = userIsNew ? "initialPassword" : currentPassword;

      await updatePassword(passwordToUse, newPassword);

      // Show success alert
      Alert.alert(
        "Success",
        "Password changed successfully. Your account is now verified.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      setErrorMessage(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <TouchableOpacity
          className="flex-row items-center mb-6"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          <Text className="ml-2 text-indigo-600 font-medium">Back</Text>
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-gray-800 mb-6">
          {userIsNew ? "Set Password" : "Change Password"}
        </Text>

        <View className="bg-white rounded-lg p-4 mb-6 shadow">
          <Text className="text-gray-600 mb-4">
            {userIsNew
              ? "Please create a secure password for your account."
              : "To verify your account, please create a strong password that meets all requirements below."}
          </Text>

          {/* Only show current password field for existing users */}
          {!userIsNew && (
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Current Password</Text>
              <View className="border border-gray-300 rounded-lg px-4 py-2">
                <TextInput
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter your current password"
                  secureTextEntry
                  className="h-10"
                />
              </View>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">
              {userIsNew ? "Password" : "New Password"}
            </Text>
            <View className="border border-gray-300 rounded-lg px-4 py-2">
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={userIsNew ? "Enter password" : "Enter new password"}
                secureTextEntry
                className="h-10"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-gray-700 font-medium mb-1">Confirm Password</Text>
            <View className="border border-gray-300 rounded-lg px-4 py-2">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                secureTextEntry
                className="h-10"
              />
            </View>
          </View>
        </View>

        {/* Password requirements */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow">
          <Text className="font-medium text-gray-700 mb-3">Password Requirements:</Text>

          <View className="flex-row items-center mb-2">
            <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}>
              {hasMinLength && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={hasMinLength ? 'text-green-700' : 'text-gray-600'}>
              At least 8 characters
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${hasUppercase ? 'bg-green-500' : 'bg-gray-300'}`}>
              {hasUppercase && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={hasUppercase ? 'text-green-700' : 'text-gray-600'}>
              At least 1 uppercase letter
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${hasLowercase ? 'bg-green-500' : 'bg-gray-300'}`}>
              {hasLowercase && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={hasLowercase ? 'text-green-700' : 'text-gray-600'}>
              At least 1 lowercase letter
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}>
              {hasNumber && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={hasNumber ? 'text-green-700' : 'text-gray-600'}>
              At least 1 number
            </Text>
          </View>

          <View className="flex-row items-center mb-2">
            <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${hasSpecial ? 'bg-green-500' : 'bg-gray-300'}`}>
              {hasSpecial && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={hasSpecial ? 'text-green-700' : 'text-gray-600'}>
              At least 1 special character (!@#$%^&*)
            </Text>
          </View>

          <View className="flex-row items-center">
            <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${passwordsMatch ? 'bg-green-500' : 'bg-gray-300'}`}>
              {passwordsMatch && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
            <Text className={passwordsMatch ? 'text-green-700' : 'text-gray-600'}>
              Passwords match
            </Text>
          </View>
        </View>

        {errorMessage ? (
          <Text className="mb-4 text-center text-red-500">{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          className={`rounded-lg py-4 ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
          onPress={handlePasswordChange}
          disabled={isLoading}
        >
          <Text className="text-center text-base font-semibold text-white">
            {isLoading ? "Changing..." : "Change Password"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}