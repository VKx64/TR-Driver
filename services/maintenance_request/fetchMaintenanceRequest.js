import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  return records.map(record => {
    // Extract just the task name from expanded maintenance data
    const taskName = record.expand?.maintenance?.task_name || "Unknown Maintenance";

    // Return the formatted record with just the task name
    return {
      id: record.id,
      fleetId: record.fleet,
      maintenanceId: record.maintenance,
      status: record.status || "pending",
      created: record.created,
      updated: record.updated,
      taskName: taskName
    };
  });
}

// Fetches maintenance request records for a specific fleet
export async function fetchMaintenanceRequestByFleet(fleetId) {
  try {
    // Check if fleetId was provided
    if (!fleetId) {
      console.warn("⚠️ No valid fleetId provided when fetching maintenance requests");
      return formatData([]);
    }

    // Fetch maintenance request records filtered by fleet ID with expanded maintenance data
    const records = await pb.collection('maintenance_request').getFullList({
      filter: `fleet = "${fleetId}"`,
      sort: "-created",
      expand: "maintenance",
      requestKey: null,
      $autoCancel: false
    });

    // Log success
    console.log(`✅ Successfully fetched ${records.length} maintenance requests for fleet ${fleetId}`);

    // Format the data
    const formattedData = formatData(records);

    // Log the formatted data
    console.log('📊 Formatted maintenance request data:', JSON.stringify(formattedData, null, 2));

    // Return the formatted data
    return formattedData;
  } catch (error) {
    // Handle errors and return empty array
    console.error("❌ Error fetching maintenance requests:", error);
    return formatData([]);
  }
}
