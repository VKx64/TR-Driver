import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import "../global.css";


export default function RootLayoutContent() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="tabs/driver" />
        <Stack.Screen name="tabs" />
        <Stack.Screen name="tabs/settings" />
        <Stack.Screen name="tabs/alerts" />
        <Stack.Screen name="pages/refuel" />
        <Stack.Screen name="pages/maintenance" />
        <Stack.Screen name="forms/newfuel" />
      </Stack>
    </AuthProvider>
  );
}
