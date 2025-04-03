import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  return records.map(record => ({
    id: record.id,
    fleetId: record.fleet,
    taskName: record.task_name || "Unnamed Maintenance",
    interval: record.interval || 0,
    intervalType: record.interval_type || "km",
    formattedInterval: `${record.interval || 0} ${record.interval_type || 'km'}`
  }));
}

// Fetches all maintenance records for a specific fleet
export async function fetchMaintenanceByFleet(fleetId) {
  try {
    // Check if fleetId was provided
    if (!fleetId) {
      console.warn("⚠️ No valid fleetId provided when fetching maintenance records");
      return formatData([]);
    }

    // Fetch maintenance records filtered by fleet ID
    const records = await pb.collection('maintenance').getFullList({
      filter: `fleet = "${fleetId}"`,
      requestKey: null,
      $autoCancel: false,
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched ${records.length} maintenance records for fleet ${fleetId}`);
    return formatData(records);
  } catch (error) {
    // Handle errors and return empty array
    console.error("❌ Error fetching maintenance records:", error);
    return formatData([]);
  }
}