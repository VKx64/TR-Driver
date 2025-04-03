import { pb } from "../pocketbase";
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Format the data for the response
function formatData(records) {
  const fleetPairs = records.map(record => ({
    id: record.id || "Unknown",
    plate: record.plate || 'Unknown'
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

        const driverId = user.id;

        const records = await pb.collection("fleets").getFullList({
          fields: "id,plate",
          filter: `driver = "${driverId}"`,
          requestKey: null,
          $autoCancel: false,
        });

        console.log(`✅ Successfully fetched ${records.length} fleets for driver ${driverId}`);
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