import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  const fleetPairs = records.map(record => ({
    id: record.id || "Unknown",
    plate: record.plate || 'Unknown'
  }));

  return {
    fleetCount: records.length || 0,
    fleetPairs: fleetPairs || []
  };
}

/**
 * Fetches all fleet IDs and plates for the currently authenticated driver
 * Uses the current user from PocketBase auth store
 *
 * @returns {Promise<Object>} Object containing fleetCount and fleetPairs
 */
export async function fetchAllFleetIds() {
  try {
    // Check if user is authenticated
    if (!pb.authStore.isValid || !pb.authStore.model?.id) {
      console.warn("⚠️ No authenticated user when fetching fleet data");
      return formatData([]);
    }

    const driverId = pb.authStore.model.id;

    // Get all fleet records with ID and plate fields that are associated with the driver
    const records = await pb.collection("fleets").getFullList({
      fields: "id,plate",
      filter: `driver = "${driverId}"`,
      requestKey: null,
      $autoCancel: false,
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched ${records.length} fleets for driver ${driverId}`);
    return formatData(records);
  } catch (error) {
    // Handle errors and return empty structure
    console.error("❌ Error fetching fleet data:", error);
    return formatData([]);
  }
}