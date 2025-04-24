import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  return records.map(record => {
    // Extract maintenance type name from expanded maintenance_type relation
    const taskName = record.expand?.maintenance_type?.name || "Unknown Maintenance";

    // Return the formatted record with task name from maintenance_type
    return {
      id: record.id,
      truckId: record.truck,
      maintenanceTypeId: record.maintenance_type,
      status: record.status || "pending",
      created: record.created,
      updated: record.updated,
      taskName: taskName
    };
  });
}

// Fetches maintenance request records for a specific truck
export async function fetchMaintenanceRequestByFleet(truckId) {
  try {
    // Check if truckId was provided
    if (!truckId) {
      console.warn("⚠️ No valid truckId provided when fetching maintenance requests");
      return formatData([]);
    }

    // Fetch maintenance request records filtered by truck ID with expanded maintenance_type data
    const records = await pb.collection('maintenance_request').getFullList({
      filter: `truck = "${truckId}"`,
      sort: "-created",
      expand: "maintenance_type",
      requestKey: null,
      $autoCancel: false
    });

    // Log success
    console.log(`✅ Successfully fetched ${records.length} maintenance requests for truck ${truckId}`);

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
