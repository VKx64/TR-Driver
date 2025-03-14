import { useState, useEffect } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to fetch maintenance records based on fleetId
const useFetchMaintenance = (fleetId) => {
  // State to store maintenance data
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  // State to track loading state
  const [loading, setLoading] = useState(true);
  // State to track errors
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("maintenance").getList(1, 100, {
          filter: `fleet="${fleetId}"`, // Fetch maintenance records based on the fleetId
          requestKey: null
        });
        setMaintenanceRecords(result.items);
        console.log("Fetched maintenance from hook:", result.items);
      } catch (error) {
        setError("Error fetching maintenance.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch maintenance when the fleetId prop changes or component mounts
    if (fleetId) fetchMaintenance();
  }, [fleetId]);

  // Return the maintenance data, loading state, and errors
  return { maintenanceRecords, loading, error };
};

export default useFetchMaintenance;
