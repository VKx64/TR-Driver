import { pb } from "../pocketbase";

// Function to format the data returned from PocketBase
function formatData(record) {
  if (!record || !record.avatar) {
    return { avatar: null };
  }

  // Use the updated URL structure for the users collection
  const avatarUrl = `${process.env.EXPO_PUBLIC_POCKETBASE_URL}/api/files/users/${record.id}/${record.avatar}`

  return { avatar: avatarUrl };
}

// Function to fetch driver avatar from PocketBase
export async function fetchDriverAvatar(userId) {
  try {
    // Check if userId was provided
    if (!userId) {
      console.warn("⚠️ No user ID provided when fetching avatar");
      return { avatar: null };
    }

    // Fetch user record with avatar field from the users collection
    const record = await pb.collection('users').getOne(userId, {
      fields: "avatar,id", // Make sure we request the id field as well
      requestKey: null,
      $autoCancel: false
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched avatar for user ${userId}`, record);
    return formatData(record);
  } catch (error) {
    // Handle errors and return empty avatar
    console.error(`❌ Error fetching avatar for user ${userId}:`, error);
    return { avatar: null };
  }
}