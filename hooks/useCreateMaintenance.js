import { useState } from "react";
import PocketBase from 'pocketbase';

const pb = new PocketBase("http://192.168.1.7:8090");

const useCreateMaintenance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createMaintenance = async (formData, fleetId) => {
    setLoading(true);
    setError(null);

    const formDataToSubmit = new FormData();
    formDataToSubmit.append('name', formData.name);
    formDataToSubmit.append('interval_in_days', formData.interval_in_days);
    formDataToSubmit.append('importance', formData.importance);
    formDataToSubmit.append('cost', formData.cost);
    formDataToSubmit.append('fleet', fleetId);

    // Log the formDataToSubmit
    for (let pair of formDataToSubmit.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      await pb.collection('maintenance').create(formDataToSubmit);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { createMaintenance, loading, error };
};

export default useCreateMaintenance;