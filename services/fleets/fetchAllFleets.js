import { pb } from "../pocketbase";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Format the data for the response
function formatData(records) {
  const fleetPairs = records.map(record => ({
    id: record.id || "Unknown",
    plate: record.plate_number || 'Unknown' // Updated to use plate_number field
  }));

  return {
    fleetCount: records.length || 0,
    fleetPairs: fleetPairs || []
  };
}

// Create a React hook version that uses AuthContext
export function useFleets() {
  const { user } = useAuth();
  const [data, setData] = useState({ fleetCount: 0, fleetPairs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFleets() {
      try {
        if (!user?.id) {
          console.warn("⚠️ No authenticated user when fetching fleet data");
          setData(formatData([]));
          setLoading(false);
          return;
        }

        const userId = user.id;
        console.log(`🔍 Fetching trucks for user ID: ${userId}`);

        // Updated to use trucks collection and users_id relation field
        const records = await pb.collection("trucks").getFullList({
          fields: "id,plate_number", // Updated to use plate_number
          filter: `users_id = "${userId}"`, // Updated to use users_id relation
          requestKey: null,
          $autoCancel: false,
        });

        console.log(`✅ Successfully fetched ${records.length} trucks for user ${userId}`);
        setData(formatData(records));
      } catch (error) {
        console.error("❌ Error fetching fleet data:", error);
        setData(formatData([]));
      } finally {
        setLoading(false);
      }
    }

    loadFleets();
  }, [user]);

  return { fleets: data, loading };
}