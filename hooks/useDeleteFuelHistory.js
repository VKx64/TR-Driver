import { useState } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to delete a fuel history record
const useDeleteFuelHistory = () => {
  // State to track loading state
  const [loading, setLoading] = useState(false);
  // State to track errors
  const [error, setError] = useState(null);

  const deleteFuelHistory = async (recordId) => {
    setLoading(true);
    setError(null);

    try {
      await pb.collection("fuel_history").delete(recordId);
      console.log(`Deleted fuel history record with ID: ${recordId}`);
      return true;
    } catch (err) {
      setError(err.message);
      console.error(`Error deleting fuel history record with ID: ${recordId}`, err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Return the delete function, loading state, and errors
  return { deleteFuelHistory, loading, error };
};

export default useDeleteFuelHistory;