import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

/**
 * Password setting/changing screen component
 * Handles both new user password setup and existing user password changes
 */
export default function ChangePasswordScreen() {
  // ===== STATE MANAGEMENT =====
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Hooks
  const router = useRouter();
  const { updatePassword, user } = useAuth();

  // ===== USER TYPE DETECTION =====
  
  /**
   * Determines if the user is new based on account creation date
   * @returns {boolean} True if user is new (created within last 24 hours)
   */
  const isNewUser = () => {
    if (!user || !user.created) return false;

    // Consider user new if account was created in the last 24 hours
    const createdDate = new Date(user.created);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    return createdDate > oneDayAgo;
  };

  // Cache the user type check result
  const userIsNew = isNewUser();

  // ===== PASSWORD VALIDATION =====
  
  // Password requirements validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";

  /**
   * Handles password validation and update
   */
  const handlePasswordChange = async () => {
    setErrorMessage("");

    // 1. Validate password requirements
    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      setErrorMessage("Please ensure your password meets all the requirements");
      return;
    }

    // 2. Confirm passwords match
    if (!passwordsMatch) {
      setErrorMessage("Passwords don't match");
      return;
    }

    // 3. Check current password (only for existing users)
    if (!userIsNew && !currentPassword) {
      setErrorMessage("Please enter your current password");
      return;
    }

    try {
      setIsLoading(true);
      
      // Use dummy password for new users (they don't know their auto-generated one)
      const passwordToUse = userIsNew ? "initialPassword" : currentPassword;
      
      // Update the password, passing the userIsNew flag
      await updatePassword(passwordToUse, newPassword, userIsNew);

      // Show success message and navigate
      Alert.alert(
        "Success",
        "Password changed successfully. Your account is now verified.",
        [{ 
          text: "OK", 
          onPress: () => router.push("/tabs/driver")
        }]
      );
    } catch (error) {
      setErrorMessage(error.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== RENDER COMPONENT =====
  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        {/* Header and back button */}
        <TouchableOpacity
          className="flex-row items-center mb-6"
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
          <Text className="ml-2 text-indigo-600 font-medium">Back</Text>
        </TouchableOpacity>

        {/* Title - different for new vs existing users */}
        <Text className="text-3xl font-bold text-gray-800 mb-6">
          {userIsNew ? "Set Password" : "Change Password"}
        </Text>

        {/* Password input section */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow">
          <Text className="text-gray-600 mb-4">
            {userIsNew
              ? "Please create a secure password for your account."
              : "To verify your account, please create a strong password that meets all requirements below."}
          </Text>

          {/* Current password field - only for existing users */}
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

          {/* New password field */}
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

          {/* Confirm password field */}
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

        {/* Password requirements checklist */}
        <View className="bg-white rounded-lg p-4 mb-6 shadow">
          <Text className="font-medium text-gray-700 mb-3">Password Requirements:</Text>

          {/* Render each requirement with appropriate styling */}
          {renderRequirement(hasMinLength, "At least 8 characters")}
          {renderRequirement(hasUppercase, "At least 1 uppercase letter")}
          {renderRequirement(hasLowercase, "At least 1 lowercase letter")}
          {renderRequirement(hasNumber, "At least 1 number")}
          {renderRequirement(hasSpecial, "At least 1 special character (!@#$%^&*)")}
          {renderRequirement(passwordsMatch, "Passwords match")}
        </View>

        {/* Error message display */}
        {errorMessage ? (
          <Text className="mb-4 text-center text-red-500">{errorMessage}</Text>
        ) : null}

        {/* Submit button */}
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

/**
 * Helper function to render a password requirement with checkmark
 * @param {boolean} isMet - Whether the requirement is met
 * @param {string} text - The requirement text to display
 * @returns {JSX.Element} The rendered requirement
 */
function renderRequirement(isMet, text) {
  return (
    <View className="flex-row items-center mb-2">
      <View className={`w-5 h-5 rounded-full justify-center items-center mr-3 ${isMet ? 'bg-green-500' : 'bg-gray-300'}`}>
        {isMet && <Ionicons name="checkmark" size={16} color="white" />}
      </View>
      <Text className={isMet ? 'text-green-700' : 'text-gray-600'}>
        {text}
      </Text>
    </View>
  );
}