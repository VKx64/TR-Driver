import { pb, checkAuth } from "../pocketbase";

// Format the data for the response
function formatData(record) {
  return {
    id: record.id,
    truckId: record.truck,
    maintenanceTypeId: record.maintenance_type,
    status: record.status || "pending",
    current_mileage_at_request: record.current_mileage_at_request,
    request_date: record.request_date,
    created: record.created,
    updated: record.updated
  };
}

/**
 * Creates a new maintenance request record
 * @param {Object} data - Maintenance request data
 * @param {string} data.truckId - ID of the truck
 * @param {string} data.maintenanceTypeId - ID of the maintenance type
 * @param {string} data.status - Status of the request (pending, approved, declined, completed)
 * @param {number} data.current_mileage_at_request - Current mileage of the truck at request time
 * @param {string} data.request_date - Date of the request (YYYY-MM-DD format)
 * @param {string} data.requesting_driver - ID of the driver requesting maintenance (optional)
 * @returns {Promise<Object>} Formatted maintenance request record
 */
export async function createMaintenanceRequest(data) {
  try {
    console.log('📥 Received maintenance request data:', JSON.stringify(data, null, 2));

    // Print detailed authentication state
    console.log('📊 Authentication Status:');
    const isAuthenticated = checkAuth();
    console.log(`🔑 Overall Auth Status: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);

    // Skip auth check in development for testing if needed
    // Comment this out in production
    if (!pb.authStore.isValid) {
      console.warn("⚠️ Auth not valid, but continuing for development testing");
      // If this is a real production environment, uncomment the line below:
      // throw new Error('Authentication required');
    }

    // Check if required data is provided
    if (!data.truckId) {
      console.warn("⚠️ No valid truckId provided when creating maintenance request");
      throw new Error('Truck ID is required');
    }

    if (!data.maintenanceTypeId) {
      console.warn("⚠️ No maintenance type ID provided when creating maintenance request");
      throw new Error('Maintenance type ID is required');
    }

    if (!data.current_mileage_at_request && data.current_mileage_at_request !== 0) {
      console.warn("⚠️ No current mileage provided when creating maintenance request");
      throw new Error('Current mileage is required');
    }
    console.log('✓ Data validation passed');

    // Determine the requesting driver - use explicit one from data or from auth store
    let requestingDriverId = data.requesting_driver;
    if (!requestingDriverId && pb.authStore.model) {
      requestingDriverId = pb.authStore.model.id;
      console.log(`👤 Using authenticated user as requesting driver: ${requestingDriverId}`);
    } else if (!requestingDriverId) {
      // For development, allow this to proceed with a placeholder
      console.warn("⚠️ No driver ID available - using placeholder for testing");
      requestingDriverId = "dev_driver_placeholder";  // Remove this in production
    }

    // Prepare the record data
    const recordData = {
      truck: data.truckId,
      maintenance_type: data.maintenanceTypeId,
      status: data.status || "pending", // Default to pending if not specified
      current_mileage_at_request: data.current_mileage_at_request,
      request_date: data.request_date || new Date().toISOString().split('T')[0], // Use provided date or today
      requesting_driver: requestingDriverId
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
