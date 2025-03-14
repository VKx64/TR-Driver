import { useState, useEffect } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to fetch fuel history records based on fleetId
const useFetchFuelHistory = (fleetId) => {
  // State to store fuel history data
  const [fuelHistoryRecords, setFuelHistoryRecords] = useState([]);
  // State to track loading state
  const [loading, setLoading] = useState(true);
  // State to track errors
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Received fleetId:", fleetId);
    const fetchFuelHistory = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("fuel_history").getList(1, 100, {
          filter: `fleet="${fleetId}"`, // Fetch fuel history records based on fleetId
        });
        setFuelHistoryRecords(result.items);
        console.log("Fetched fuel history from hook:", result.items);
      } catch (error) {
        setError("Error fetching fuel history.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch fuel history when the fleetId prop changes or component mounts
    if (fleetId) fetchFuelHistory();
  }, [fleetId]);

  // Return the fuel history data, loading state, and errors
  return { fuelHistoryRecords, loading, error };
};

export default useFetchFuelHistory;