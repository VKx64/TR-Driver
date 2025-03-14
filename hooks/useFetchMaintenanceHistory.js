import { useState, useEffect } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to fetch maintenance history records based on fleetId
const useFetchMaintenanceHistory = (fleetId) => {
  // State to store maintenance history data
  const [maintenanceHistoryRecords, setMaintenanceHistoryRecords] = useState([]);
  // State to track loading state
  const [loading, setLoading] = useState(true);
  // State to track errors
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaintenanceHistory = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("maintenance_history").getList(1, 100, {
          filter: `fleet="${fleetId}"`, // Fetch maintenance history records based on fleetId
          expand: 'maintenance', // Include related maintenance data
        });
        setMaintenanceHistoryRecords(result.items);
        console.log("Fetched maintenance history from hook:", result.items);
      } catch (error) {
        setError("Error fetching maintenance history.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch maintenance history when the fleetId prop changes or component mounts
    if (fleetId) fetchMaintenanceHistory();
  }, [fleetId]);

  // Return the maintenance history data, loading state, and errors
  return { maintenanceHistoryRecords, loading, error };
};

export default useFetchMaintenanceHistory;