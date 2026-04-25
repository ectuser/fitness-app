import React, { createContext, useContext } from 'react';
import { usePersistentFitnessData } from '@/hooks/usePersistentFitnessData';
import type { FitnessDataValue } from '@/hooks/usePersistentFitnessData';

const DataContext = createContext<FitnessDataValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const value = usePersistentFitnessData();
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
