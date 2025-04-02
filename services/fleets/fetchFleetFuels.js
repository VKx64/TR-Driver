import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  return records.map(record => ({
    id: record.id,
    date: record.date || null,
    fuelAmount: record.fuel_amount || 0,
    fuelPrice: record.fuel_price || 0,
    odometerReading: record.odometer_reading || 0,
    fleetId: record.fleet || ''
  }));
}

// fetch all fuel records for a specific fleet
export async function fetchFleetFuels(fleetId) {
  try {
    // Check if fleetId was provided
    if (!fleetId) {
      console.warn("⚠️ No fleet ID provided when fetching fuel records");
      return formatData([]);
    }

    // Get all fuel records for the specified fleet
    const records = await pb.collection("fleet_fuels").getFullList({
      fields: "id,fleet,date,fuel_amount,fuel_price,odometer_reading",
      filter: `fleet = "${fleetId}"`,
      sort: "-date", // Sort by date descending (newest first)
      requestKey: null,
      $autoCancel: false,
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched ${records.length} fuel records for fleet ${fleetId}`);
    return formatData(records);
  } catch (error) {
    // Handle errors and return empty structure
    console.error(`❌ Error fetching fuel records for fleet ${fleetId}:`, error);
    return formatData([]);
  }
}
