'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import PocketBase from 'pocketbase';

// Create context
const AuthContext = createContext(null);
const pb_url = process.env.EXPO_PUBLIC_POCKETBASE_URL;

// PocketBase client initialization with error handling
const initPocketBase = () => {
  try {
    const pb = new PocketBase(pb_url);
    return pb;
  } catch (error) {
    console.error('Failed to initialize PocketBase:', error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [pb, setPb] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Initialize PocketBase on client-side only
  useEffect(() => {
    // Make sure we're in the browser
    if (typeof window !== 'undefined') {
      const pocketbase = initPocketBase();
      setPb(pocketbase);
      setInitialized(true);
    }
  }, []);

  // Setup auth state after PocketBase is initialized
  useEffect(() => {
    if (!initialized || !pb) return;

    // Get initial user state
    setUser(pb.authStore.model);
    setLoading(false);

    // Listen for auth changes
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    return () => {
      unsubscribe?.();
    };
  }, [pb, initialized]);

  const login = async (email, password) => {
    try {
      await pb.collection('drivers').authWithPassword(email, password);
      setUser(pb.authStore.model);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    pb.authStore.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);