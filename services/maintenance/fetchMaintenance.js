import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  return records.map(record => {
    // Format recurrence intervals in a readable format
    const kmInterval = record.recurrence_interval_km || 0;
    const daysInterval = record.recurrence_interval_days || 0;

    let intervalType = "unknown";
    if (kmInterval > 0 && daysInterval > 0) {
      intervalType = "km_and_days";
    } else if (kmInterval > 0) {
      intervalType = "km";
    } else if (daysInterval > 0) {
      intervalType = "days";
    }

    // Format the interval text based on what type of interval is set
    let formattedInterval;
    if (intervalType === "km_and_days") {
      formattedInterval = `${kmInterval} km or ${daysInterval} days`;
    } else if (intervalType === "km") {
      formattedInterval = `${kmInterval} km`;
    } else if (intervalType === "days") {
      formattedInterval = `${daysInterval} days`;
    } else {
      formattedInterval = "No interval set";
    }

    return {
      id: record.id,
      taskName: record.name || "Unnamed Maintenance",
      description: record.description || "",
      intervalKm: kmInterval,
      intervalDays: daysInterval,
      intervalType: intervalType,
      formattedInterval: formattedInterval,
      formSchema: record.form_schema || null
    };
  });
}

// Fetches all maintenance types from the maintenance_type collection
export async function fetchMaintenanceByFleet(fleetId) {
  try {
    console.log("🔍 Fetching maintenance types...");

    // Fetch all maintenance types (fleetId parameter kept for backward compatibility)
    const records = await pb.collection('maintenance_type').getFullList({
      sort: "name",
      requestKey: null,
      $autoCancel: false,
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched ${records.length} maintenance types`);
    console.log('Maintenance types data sample:', records.length > 0 ? JSON.stringify(records[0], null, 2) : 'No records');

    const formattedData = formatData(records);
    return formattedData;
  } catch (error) {
    // Handle errors and return empty array
    console.error("❌ Error fetching maintenance types:", error);
    if (error.data) {
      console.error("API error response:", error.data);
    }
    return formatData([]);
  }
}