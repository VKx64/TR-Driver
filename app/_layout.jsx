import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext'; // Import the AuthProvider
import "../global.css";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Define your screens here */}
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="screens/home" />
        {/* Other screens */}
      </Stack>
    </AuthProvider>
  );
}
