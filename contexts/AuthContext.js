'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { pb, checkAuth } from '../services/pocketbase';

// Create context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    if (!pb) {
      console.log('❌ PocketBase instance is not available');
      setLoading(false);
      return;
    }

    console.log('🔄 Initializing AuthContext');

    // Check initial auth state
    console.log('🔍 Checking existing authentication...');
    if (pb.authStore.isValid) {
      console.log('✅ Found valid authentication');
      setUser(pb.authStore.model);
    } else {
      console.log('ℹ️ No valid authentication found');
      setUser(null);
    }

    setLoading(false);

    // Listen for auth changes
    console.log('👂 Setting up auth change listener');
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log('🔄 Auth state changed:', model ? 'Logged in' : 'Logged out');
      setUser(model);
    });

    return () => {
      console.log('🛑 Removing auth change listener');
      unsubscribe?.();
    };
  }, []);

  const login = async (email, password) => {
    if (!pb) throw new Error('PocketBase not initialized');
    console.log('🔑 Attempting login for:', email);
    console.log('🌐 PocketBase URL:', pb.baseURL);

    try {
      // Authenticate with users collection
      const authData = await pb.collection('users').authWithPassword(email, password);
      console.log('✅ Authentication successful');

      // If login is successful, check if user has driver role
      if (authData.record.role === 'driver') {
        console.log('👤 User has valid driver role');
        setUser(authData.record);

        // Debug: Check auth state after login
        checkAuth();

        return authData;
      } else {
        // User exists but doesn't have driver role
        console.warn('⚠️ User does not have driver role, logging out');
        pb.authStore.clear();
        throw new Error('User does not have driver role');
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));

      // If it's already the role error we raised, just rethrow it
      if (error.message === 'User does not have driver role') {
        throw error;
      }

      // Otherwise it's likely an auth error from PocketBase
      throw new Error('Invalid email or password');
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out user');
    if (pb) {
      pb.authStore.clear();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);