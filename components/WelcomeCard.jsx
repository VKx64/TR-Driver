import { View, Text, Image } from 'react-native';
import { useState, useEffect } from 'react';
import { fetchDriverAvatar } from '../services/drivers/fetchDriverAvatar';
import { useAuth } from '../contexts/AuthContext';

export default function WelcomeCard() {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    // Fetch the avatar when the component mounts or user changes
    async function getDriverAvatar() {
      if (user?.id) {
        console.log(`WelcomeCard: Fetching avatar for user ID: ${user.id}`);
        const result = await fetchDriverAvatar(user.id);
        console.log("WelcomeCard: Avatar fetch result:", result);
        setAvatarUrl(result.avatar);
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

  // Get initials from name
  const getInitials = () => {
    if (!user?.name) return 'D';

    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View className="bg-white rounded-xl shadow-sm p-6">
      <View className="flex-row justify-between items-center h-fit">

        {/* Welcome Message */}
        <View>
          <Text className="text-gray-500 text-sm font-medium">
            {getGreeting()}
          </Text>
          <Text className="font-bold text-gray-800 text-xl">
            {user?.name || 'Driver'}
          </Text>
        </View>

        {/* User Avatar */}
        <View className="h-14 aspect-square rounded-full bg-blue-100 overflow-hidden items-center justify-center">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-14 w-14"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-blue-600 text-xl font-bold">
              {getInitials()}
            </Text>
          )}
        </View>

      </View>
    </View>
  );
}