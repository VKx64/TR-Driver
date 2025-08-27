import PocketBase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

let pb = null;

// Initialize PocketBase with fallback URL
try {
  const pocketbaseUrl = process.env.EXPO_PUBLIC_POCKETBASE_URL || 'https://pb-tr.rimuru.win/';
  console.log('🔗 Initializing PocketBase with URL:', pocketbaseUrl);
  pb = new PocketBase(pocketbaseUrl);

  // Set up auth state persistence with AsyncStorage
  pb.authStore.onChange(async (token, model) => {
    // Save auth state when it changes
    if (token && model) {
      try {
        await AsyncStorage.setItem('pocketbase_auth', JSON.stringify({
          token,
          model
        }));
        console.log('✅ Saved authentication to AsyncStorage');
      } catch (e) {
        console.error('Failed to save auth data:', e);
      }
    } else {
      // If logged out, remove the stored authentication
      try {
        await AsyncStorage.removeItem('pocketbase_auth');
        console.log('✅ Removed authentication from AsyncStorage');
      } catch (e) {
        console.error('Failed to remove auth data:', e);
      }
    }
  });

  // Try to restore auth on app load
  (async () => {
    try {
      const storedAuth = await AsyncStorage.getItem('pocketbase_auth');
      if (storedAuth) {
        const { token, model } = JSON.parse(storedAuth);
        pb.authStore.save(token, model);
        console.log('✅ Restored authentication from AsyncStorage');
      }
    } catch (e) {
      console.warn('Failed to restore auth:', e);
    }
  })();
} catch (error) {
  console.error('Failed to initialize PocketBase:', error);
}

export { pb };

// Helper to get the current auth store state
export const getCurrentUser = () => {
  return pb?.authStore?.model || null;
};

// Export auth store to access isValid, token etc.
export const authStore = pb?.authStore || null;

// Helper function to explicitly set auth data on this PB instance
export const setAuth = (token, userData) => {
  if (pb && token && userData) {
    pb.authStore.save(token, userData);
    return true;
  }
  return false;
};

// Export a function to check if the auth is valid and print debugging info
export const checkAuth = () => {
  if (!pb) {
    console.log('❌ PB instance is null');
    return false;
  }

  if (!pb.authStore) {
    console.log('❌ Auth store is not available');
    return false;
  }

  console.log('🔑 Auth valid:', pb.authStore.isValid);
  console.log('👤 Auth model:', pb.authStore.model ? 'Present' : 'None');

  return pb.authStore.isValid;
};