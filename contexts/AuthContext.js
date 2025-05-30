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

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      console.log('✅ Authentication successful');

      if (authData.record.role === 'driver') {
        setUser(authData.record);
        checkAuth();
        return authData;
      } else {
        pb.authStore.clear();
        throw new Error('User does not have driver role');
      }
    } catch (error) {
      if (error.message === 'User does not have driver role') throw error;
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

  // --- SIMPLIFIED PASSWORD UPDATE USING SDK ---
  const updatePassword = async (currentPassword, newPassword) => {
    if (!pb || !user) throw new Error('Not authenticated');
    // This will only work if the user knows their current password!
    return pb.collection('users').update(user.id, {
      password: newPassword,
      passwordConfirm: newPassword,
      
    });
  };

  // Compute isVerified from the user record
  const isVerified =
    user &&
    (user.verified === true ||
      user.verified === 1 ||
      user.verified === "true");

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updatePassword, // <-- now just the SDK method
      loading,
      isAuthenticated: !!user,
      isVerified
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);