import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CustomTextInput from "./components/CustomTextInput";
import { useRouter } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      setErrorMessage("");
      await login(email, password);
      router.replace("/tabs/driver");
    } catch (error) {
      console.error("Login error:", error.message);

      if (error.message.includes("driver role")) {
        setErrorMessage("Access denied: You must be a registered driver to log in.");
      } else if (error.message.includes("email or password")) {
        setErrorMessage("Invalid email or password.");
      } else {
        setErrorMessage("Login failed. Please try again later.");
      }
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      {/* Login Text */}
      <Text className="mb-10 text-center text-3xl font-bold text-gray-800">
        Login 2
      </Text>

      {/* Email inputs */}
      <CustomTextInput
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrorMessage("");
        }}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      {/* Password Input */}
      <CustomTextInput
        label="Password"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrorMessage("");
        }}
        placeholder="Enter your password"
        secureTextEntry
      />

      {/* Error message */}
      {errorMessage ? (
        <Text className="mb-4 text-center text-red-500">{errorMessage}</Text>
      ) : null}

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
