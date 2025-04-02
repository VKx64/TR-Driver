import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CustomTextInput from "./components/CustomTextInput";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/tabs/driver");
    } catch (error) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      {/* Login Text */}
      <Text className="mb-10 text-center text-3xl font-bold text-gray-800">
        Login
      </Text>

      {/* Email inputs */}
      <CustomTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <CustomTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity
        className="mb-4 rounded-lg bg-indigo-600 py-3"
        onPress={handleLogin}
      >
        <Text className="text-center text-base font-semibold text-white">
          Log In
        </Text>
      </TouchableOpacity>
    </View>
  );
}
