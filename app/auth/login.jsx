import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CustomTextInput from './components/CustomTextInput';
import { useRouter } from 'expo-router';
export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter(); 

  const handleLogin = () => {
      // console print r
      console.log('Login Button Pressed');
      console.log('Current Email Value', email);
      console.log('Current Password Value', password);
    
    // input handler
      if (email && password) {
        router.replace('(tabs)');
    } else {
      alert('Please fill in both fields');
    }
  };

  return (
    <View className="flex-1 justify-center bg-white px-6">
      <Text className="text-3xl font-bold mb-10 text-center text-gray-800">Login</Text>
{/* inputs  */}
      <CustomTextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <CustomTextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
      />

      <TouchableOpacity
        className="bg-indigo-600 py-3 rounded-lg mb-4"
        onPress={handleLogin}

      >
        <Text className="text-center text-white font-semibold text-base">Log In</Text>
      </TouchableOpacity>

  
    </View>
  );
}
