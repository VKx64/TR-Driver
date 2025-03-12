import { Stack } from 'expo-router';
import "../global.css";
export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Login screen */}
      <Stack.Screen name="auth/login" />
      {/* Tabs layout */}
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
