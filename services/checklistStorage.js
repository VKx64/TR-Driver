import AsyncStorage from '@react-native-async-storage/async-storage';

const CHECKLIST_KEY = 'daily_checklist_completion';

/**
 * Store checklist completion for today
 */
export const storeChecklistCompletion = async (userId) => {
  try {
    const today = new Date().toDateString(); // e.g., "Mon Oct 23 2023"
    const completionData = {
      userId,
      date: today,
      completedAt: new Date().toISOString()
    };

    await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(completionData));
    console.log('✅ Checklist completion stored for', today);
    return true;
  } catch (error) {
    console.error('Failed to store checklist completion:', error);
    return false;
  }
};

/**
 * Check if checklist was completed today for the current user
 */
export const isChecklistCompletedToday = async (userId) => {
  try {
    const storedData = await AsyncStorage.getItem(CHECKLIST_KEY);

    if (!storedData) {
      return false;
    }

    const completionData = JSON.parse(storedData);
    const today = new Date().toDateString();

    // Check if it's the same user and same day
    return completionData.userId === userId && completionData.date === today;
  } catch (error) {
    console.error('Failed to check checklist completion:', error);
    return false;
  }
};

/**
 * Clear checklist completion (useful for testing or manual reset)
 */
export const clearChecklistCompletion = async () => {
  try {
    await AsyncStorage.removeItem(CHECKLIST_KEY);
    console.log('✅ Checklist completion cleared');
    return true;
  } catch (error) {
    console.error('Failed to clear checklist completion:', error);
    return false;
  }
};

/**
 * Get checklist completion details
 */
export const getChecklistCompletionDetails = async () => {
  try {
    const storedData = await AsyncStorage.getItem(CHECKLIST_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error('Failed to get checklist completion details:', error);
    return null;
  }
};
