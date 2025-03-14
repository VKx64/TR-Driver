import { useState } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to create a maintenance history record
const useCreateMaintenanceHistory = () => {
  // State to track loading state
  const [loading, setLoading] = useState(false);
  // State to track errors
  const [error, setError] = useState(null);

  const createMaintenanceHistory = async (formData) => {
    setLoading(true);
    setError(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('fleet', formData.fleet);
    formDataToSubmit.append('maintenance', formData.maintenance);
    formDataToSubmit.append('date', formData.date);
    formDataToSubmit.append('remarks', formData.remarks);
    formDataToSubmit.append('result', formData.result);

    // Log the formDataToSubmit
    for (let pair of formDataToSubmit.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      await pb.collection('maintenance_history').create(formDataToSubmit);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Return the create function, loading state, and errors
  return { createMaintenanceHistory, loading, error };
};

export default useCreateMaintenanceHistory;