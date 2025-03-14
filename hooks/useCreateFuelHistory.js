import { useState } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090"); // Use the environment variable

// Custom hook to create a fuel history record
const useCreateFuelHistory = () => {
  // State to track loading state
  const [loading, setLoading] = useState(false);
  // State to track errors
  const [error, setError] = useState(null);

  const createFuelHistory = async (formData) => {
    setLoading(true);
    setError(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('fleet', formData.fleet);
    formDataToSubmit.append('fuel_type', formData.fuel_type);
    formDataToSubmit.append('date', formData.date);
    formDataToSubmit.append('quantity', formData.quantity);
    formDataToSubmit.append('cost_per_unit', formData.cost_per_unit);

    // Log the formDataToSubmit
    for (let pair of formDataToSubmit.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      await pb.collection('fuel_history').create(formDataToSubmit);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Return the create function, loading state, and errors
  return { createFuelHistory, loading, error };
};

export default useCreateFuelHistory;