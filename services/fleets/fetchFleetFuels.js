import { pb } from "../pocketbase";

// Format the data for the response
function formatData(records) {
  return records.map(record => ({
    id: record.id,
    date: record.date || null,
    fuelAmount: record.fuel_amount || 0,
    fuelPrice: record.fuel_price || 0,
    odometerReading: record.odometer_reading || 0,
    truckId: record.truck_id || ''
  }));
}

// fetch all fuel records for a specific truck
export async function fetchFleetFuels(truckId) {
  try {
    // Check if truckId was provided
    if (!truckId) {
      console.warn("⚠️ No truck ID provided when fetching fuel records");
      return formatData([]);
    }

    // Get all fuel records for the specified truck
    const records = await pb.collection("truck_fuel").getFullList({
      fields: "id,truck_id,created,fuel_amount,fuel_price,odometer_reading",
      filter: `truck_id = "${truckId}"`,
      sort: "-created", // Sort by date descending (newest first)
      requestKey: null,
      $autoCancel: false,
    });

    // Log success and return the formatted data
    console.log(`✅ Successfully fetched ${records.length} fuel records for truck ${truckId}`);
    return formatData(records);
  } catch (error) {
    // Handle errors and return empty structure
    console.error(`❌ Error fetching fuel records for truck ${truckId}:`, error);
    return formatData([]);
  }
}
