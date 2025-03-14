import { useState } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to delete a maintenance history record
const useDeleteMaintenanceHistory = () => {
  // State to track loading state
  const [loading, setLoading] = useState(false);
  // State to track errors
  const [error, setError] = useState(null);

  const deleteMaintenanceHistory = async (recordId) => {
    setLoading(true);
    setError(null);

    try {
      await pb.collection("maintenance_history").delete(recordId);
      console.log(`Deleted maintenance history record with ID: ${recordId}`);
      return true;
    } catch (err) {
      setError(err.message);
      console.error(`Error deleting maintenance history record with ID: ${recordId}`, err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Return the delete function, loading state, and errors
  return { deleteMaintenanceHistory, loading, error };
};

export default useDeleteMaintenanceHistory;