import { pb } from "../pocketbase";

// Function to format the data returned from PocketBase
function formatData(record) {
  // Use optional chaining directly in the URL construction
  const avatarUrl = `${process.env.EXPO_PUBLIC_POCKETBASE_URL}/api/files/drivers/${record.id}/${record.avatar}`

  return { avatar: avatarUrl };
}

// Function to fetch driver avatar from PocketBase
export async function fetchDriverAvatar(driverId) {
  try {
    // Check if driverId was provided
    if (!driverId) {
      console.warn("⚠️ No driver ID provided when fetching avatar");
      return formatData(null);
    }

    // Fetch driver record with avatar field
    const record = await pb.collection('drivers').getOne(driverId, {
      fields: "avatar,id", // Make sure we request the id field as well
      requestKey: null,
      $autoCancel: false
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched avatar for driver ${driverId}`, record);
    return formatData(record);
  } catch (error) {
    // Handle errors and return empty avatar
    console.error(`❌ Error fetching avatar for driver ${driverId}:`, error);
    return formatData(null);
  }
}