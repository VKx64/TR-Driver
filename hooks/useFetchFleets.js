import { useState, useEffect } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to fetch fleets based on the driver
const useFetchFleets = (driverId) => {
  // State to store fleets data
  const [fleets, setFleets] = useState([]);
  // State to track loading state
  const [loading, setLoading] = useState(true);
  // State to track errors
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFleets = async () => {
      try {
        setLoading(true);
        const result = await pb.collection("fleets").getList(1, 100, {
          filter: `driver="${driverId}"`,
          requestKey: null
        });
        setFleets(result.items);
        console.log("Fetched fleets from hook:", result.items);
      } catch (error) {
        setError("Error fetching fleets.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    // Fetch fleets when the driverId prop changes or component mounts
    if (driverId) fetchFleets();
  }, [driverId]);

  // Return the fleets data, loading state, and errors
  return { fleets, loading, error };
};

export default useFetchFleets;