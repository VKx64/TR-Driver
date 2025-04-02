import PocketBase from 'pocketbase';

let pb = null;

// Initialize PocketBase on client side only
if (typeof window !== 'undefined') {
  try {
    pb = new PocketBase(process.env.EXPO_PUBLIC_POCKETBASE_URL);
  } catch (error) {
    console.error('Failed to initialize PocketBase:', error);
  }
}

export { pb };

// Helper to get the current auth store state
export const getCurrentUser = () => {
  return pb?.authStore?.model || null;
};

// Export auth store to access isValid, token etc.
export const authStore = pb?.authStore || null;