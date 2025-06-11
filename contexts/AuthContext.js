'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { pb, checkAuth as pbCheckAuth } from '../services/pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create context
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationChecked, setVerificationChecked] = useState(false);

  // ===== INITIALIZATION =====
  useEffect(() => {
    // Validate PocketBase instance
    if (!pb) {
      console.log('PocketBase instance is not available');
      setLoading(false);
      return;
    }

    console.log('Initializing AuthContext');

    // Check if user is already authenticated
    if (pb.authStore.isValid) {
      console.log('Found valid authentication');
      setUser(pb.authStore.model);
      checkVerificationStatus(pb.authStore.model);
    } else {
      console.log('No valid authentication found');
      setUser(null);
    }

    setLoading(false);

    // Set up auth change listener
    const unsubscribe = pb.authStore.onChange((token, model) => {
      console.log('Auth state changed:', model ? 'Logged in' : 'Logged out');
      setUser(model);
      
      if (model) {
        checkVerificationStatus(model);
      }
    });

    // Cleanup listener on unmount
    return () => {
      console.log('Removing auth change listener');
      unsubscribe?.();
    };
  }, []);

  // ===== VERIFICATION HELPERS =====
  
  /**
   * Checks if a user is verified from both PocketBase and local storage
   * @param {Object} userObj - The user object to check
   * @returns {Promise<boolean>} - Whether the user is verified
   */
  const checkVerificationStatus = async (userObj) => {
    if (!userObj || !userObj.id) return false;
    
    // Check PocketBase verification first
    if (userObj.verified === true || userObj.verified === 1) {
      console.log('User is verified in PocketBase');
      setVerificationChecked(true);
      return true;
    }
    
    // Then check local storage
    try {
      const localVerified = await AsyncStorage.getItem(`user_${userObj.id}_verified`);
      
      if (localVerified === 'true') {
        console.log('User is verified in AsyncStorage');
        setUser(prev => ({ ...prev, verified: true }));
        setVerificationChecked(true);
        return true;
      }
    } catch (error) {
      console.warn('Failed to check AsyncStorage verification:', error);
    }
    
    console.log('User is not verified');
    setVerificationChecked(true);
    return false;
  };
  
  /**
   * Saves verification status to local storage
   * @param {string} userId - The user ID to mark as verified
   * @returns {Promise<void>}
   */
  const saveVerificationToStorage = async (userId) => {
    try {
      await AsyncStorage.setItem(`user_${userId}_verified`, 'true');
      console.log('Saved verification status to AsyncStorage');
    } catch (storageError) {
      console.warn('Failed to save to AsyncStorage:', storageError);
    }
  };

  // ===== AUTH FUNCTIONS =====
  
  /**
   * Logs in a user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Auth data if successful
   */
  const login = async (email, password) => {
    if (!pb) throw new Error('PocketBase not initialized');
    console.log('Attempting login for:', email);

    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      console.log('Authentication successful');

      if (authData.record.role === 'driver') {
        setUser(authData.record);
        pbCheckAuth();
        await checkVerificationStatus(authData.record);
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

  /**
   * Logs out the current user
   */
  const logout = async () => {
    console.log('Logging out user');
    if (pb) {
      pb.authStore.clear();
      setUser(null);
      setVerificationChecked(false);
    }
  };

  /**
   * Updates user password and handles verification status
   * @param {string} currentPassword - Current password (for existing users)
   * @param {string} newPassword - New password to set
   * @param {boolean} isNewUser - Whether this is a new user with unknown password
   * @returns {Promise<Object>} - Response data
   */
  const updatePassword = async (currentPassword, newPassword, isNewUser = false) => {
    if (!pb || !user) throw new Error('Not authenticated');
    console.log('Attempting password update, isNewUser:', isNewUser);

    try {
      let response = null;

      // Handle password update differently for new vs existing users
      if (isNewUser) {
        console.log('New user detected - setting verified flag locally only');
        response = { success: true, localOnly: true };
      } else {
        console.log('Existing user - updating password in PocketBase');
        response = await pb.collection('users').update(user.id, {
          password: newPassword,
          passwordConfirm: newPassword,
          oldPassword: currentPassword,
        });
      }

      // Mark as verified in local state
      console.log('Setting verified flag in local state');
      setUser(prev => ({ ...prev, verified: true }));
      
      // Store verification in AsyncStorage
      await saveVerificationToStorage(user.id);

      console.log('Password/verification update successful');
      return response;
    } catch (error) {
      console.error('Password update failed:', error);
      throw error;
    }
  };

  /**
   * Checks if the current user is verified
   * @returns {Promise<boolean>} - Whether the user is verified
   */
  const checkVerification = async () => {
    if (!user) return false;
    return await checkVerificationStatus(user);
  };

  // Computed property for verification status
  const isVerified = user && (
    user.verified === true ||
    user.verified === 1 ||
    user.verified === "true"
  );

  // Context provider values
  const contextValue = {
    user,
    login,
    logout,
    updatePassword,
    checkVerification,
    loading,
    isAuthenticated: !!user,
    isVerified,
    verificationChecked
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for using auth context
export const useAuth = () => useContext(AuthContext);