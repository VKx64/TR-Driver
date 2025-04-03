import { pb } from "../pocketbase";

/**
 * Creates a new fleet fuel record in PocketBase
 *
 * @param {Object} data - The fuel record data
 * @param {string} data.fleet - The ID of the fleet (truck)
 * @param {Date|string} data.date - The date and time of refueling
 * @param {number} data.fuel_amount - The amount of fuel in liters
 * @param {number} data.fuel_price - The price per liter
 * @param {number} data.odometer_reading - The current odometer reading
 * @param {Object} [data.receiptImage] - Optional receipt image object (from expo-image-picker)
 * @returns {Promise<Object>} The created record or error information
 */
export async function newFleetFuel(data) {
  try {
    // Validate required fields
    if (!data.fleet) {
      console.warn("⚠️ No fleet ID provided when creating fuel record");
      return { success: false, error: "Fleet ID is required" };
    }

    // Create FormData for the complete request (data + image)
    const formData = new FormData();

    // Add all text fields to the FormData
    formData.append("fleet", data.fleet);
    formData.append("date", data.date instanceof Date ? data.date.toISOString() : data.date);
    formData.append("fuel_amount", data.fuel_amount.toString());
    formData.append("fuel_price", data.fuel_price.toString());
    formData.append("odometer_reading", data.odometer_reading.toString());

    // Add receipt image if provided
    if (data.receiptImage && data.receiptImage.uri) {
      // Extract file extension from URI for better MIME type handling
      const uriParts = data.receiptImage.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1];

      // Create the file object with the right structure for React Native
      const fileObj = {
        uri: data.receiptImage.uri,
        type: `image/${fileExtension.toLowerCase()}`,
        name: `receipt_${Date.now()}.${fileExtension}`
      };

      console.log("Attaching file to request:", fileObj);
      formData.append("receipt", fileObj);
    }

    // Log what we're sending
    console.log("Creating fuel record with FormData:", {
      fleet: data.fleet,
      date: data.date,
      fuel_amount: data.fuel_amount,
      fuel_price: data.fuel_price,
      odometer_reading: data.odometer_reading,
    });

    // Create the record with all data in one request
    const record = await pb.collection("fleet_fuels").create(formData);

    console.log(`✅ Successfully created fuel record for fleet ${data.fleet}`);
    return {
      success: true,
      record: {
        id: record.id,
        date: record.date,
        fuelAmount: record.fuel_amount,
        fuelPrice: record.fuel_price,
        odometerReading: record.odometer_reading,
        fleetId: record.fleet,
        receiptUrl: record.receipt ? pb.files.getURL(record, record.receipt) : null
      }
    };
  } catch (error) {
    // Get detailed error information
    let errorMessage = "Failed to create fuel record";
    let errorDetails = null;

    if (error.data && error.data.data) {
      errorMessage = "Validation errors:";
      errorDetails = error.data.data;
      console.error("PocketBase validation errors:", JSON.stringify(errorDetails));
    }

    console.error(`❌ Error creating fuel record:`, error);
    return {
      success: false,
      error: errorMessage,
      details: errorDetails || error
    };
  }
}
