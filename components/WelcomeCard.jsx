import { View, Text, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { fetchDriverAvatar } from '../services/drivers/fetchDriverAvatar';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeCard() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the avatar when the component mounts or user changes
    async function getDriverAvatar() {
      if (user?.id) {
        try {
          setLoading(true);
          console.log(`WelcomeCard: Fetching avatar for user ID: ${user.id}`);
          const result = await fetchDriverAvatar(user.id);
          console.log("WelcomeCard: Avatar fetch result:", result);
          setAvatarUrl(result.avatar);
        } catch (error) {
          console.error("WelcomeCard: Error fetching avatar:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
    getDriverAvatar();
  }, [user]);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get initials from name or username
  const getInitials = () => {
    if (!user) return 'U';

    // Use name if available, otherwise fall back to username
    const displayName = user.name || user.username;

    if (!displayName) return 'U';

    const names = displayName.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View className="bg-white rounded-xl p-4 shadow-sm">
      <View className="flex-row items-center">
        {/* User Avatar */}
        <View className="h-10 w-10 rounded-lg bg-blue-100 overflow-hidden items-center justify-center mr-3">
          {!loading && avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-10 w-10"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-blue-600 font-bold">
              {getInitials()}
            </Text>
          )}
        </View>

        {/* Welcome Message */}
        <View className="flex-1">
          <Text className="text-gray-500 text-sm font-medium">
            {getGreeting()}
          </Text>
          <Text className="text-gray-900 font-semibold text-base">
            {user?.name || user?.username || 'Driver'}
          </Text>
        </View>
      </View>
    </View>
  );
}