import { createContext, useState, useContext } from 'react';

// Create the context
const TruckContext = createContext();

// Create a provider component
export function TruckProvider({ children }) {
  const [selectedTruck, setSelectedTruck] = useState(null);

  // Value to be provided to consuming components
  const value = {
    selectedTruck,
    setSelectedTruck
  };

  return (
    <TruckContext.Provider value={value}>
      {children}
    </TruckContext.Provider>
  );
}

// Custom hook for using the truck context
export function useSelectedTruck() {
  const context = useContext(TruckContext);
  if (context === undefined) {
    throw new Error('useSelectedTruck must be used within a TruckProvider');
  }
  return context;
}