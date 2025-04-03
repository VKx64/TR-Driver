import { pb } from "../pocketbase";

// Format the data for the response
function formatData(record) {
  return {
    id: record.id,
    fleetId: record.fleet,
    maintenanceId: record.maintenance,
    status: record.status || "pending",
    created: record.created,
    updated: record.updated
  };
}

/**
 * Creates a new maintenance request record
 * @param {Object} data - Maintenance request data
 * @param {string} data.fleetId - ID of the fleet
 * @param {string} data.maintenanceId - ID of the maintenance record
 * @param {string} data.status - Status of the request (pending, approved, completed)
 * @returns {Promise<Object>} Formatted maintenance request record
 */
export async function createMaintenanceRequest(data) {
  try {
    console.log('📥 Received maintenance request data:', JSON.stringify(data, null, 2));

    // Check if user is authenticated
    if (!pb.authStore.isValid) {
      console.warn("⚠️ Authentication required to create maintenance request");
      throw new Error('Authentication required');
    }
    console.log('✓ Authentication check passed');

    // Check if required data is provided
    if (!data.fleetId) {
      console.warn("⚠️ No valid fleetId provided when creating maintenance request");
      throw new Error('Fleet ID is required');
    }

    if (!data.maintenanceId) {
      console.warn("⚠️ No maintenance ID provided when creating maintenance request");
      throw new Error('Maintenance ID is required');
    }
    console.log('✓ Data validation passed');

    // Prepare the record data
    const recordData = {
      fleet: data.fleetId,
      maintenance: data.maintenanceId,
      status: data.status || "pending" // Default to pending if not specified
    };

    console.log(`⌛ Creating maintenance request record with data:`, JSON.stringify(recordData, null, 2));

    // Create the maintenance request record
    const record = await pb.collection('maintenance_request').create(recordData);
    console.log(`✅ Request created successfully:`, JSON.stringify(record, null, 2));

    // Format the data for response
    const formattedResponse = formatData(record);
    console.log(`🔄 Returning formatted response:`, JSON.stringify(formattedResponse, null, 2));

    return formattedResponse;
  } catch (error) {
    // Handle errors
    console.error("❌ Error creating maintenance request record:", error);
    console.error("Error details:", error.message);
    if (error.data) {
      console.error("API error response:", JSON.stringify(error.data, null, 2));
    }
    throw error;
  }
}
