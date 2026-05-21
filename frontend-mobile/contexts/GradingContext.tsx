import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GradingContextType {
  isGrading: boolean;
  submitEssay: (essay: string) => Promise<void>;
}

const GradingContext = createContext<GradingContextType | undefined>(undefined);

export function GradingProvider({ children }: { children: ReactNode }) {
  const [isGrading, setIsGrading] = useState(false);

  const submitEssay = async (essay: string) => {
    // Placeholder
  };

  return (
    <GradingContext.Provider value={{ isGrading, submitEssay }}>{children}</GradingContext.Provider>
  );
}

export function useGrading() {
  const context = useContext(GradingContext);
  if (context === undefined) {
    throw new Error('useGrading must be used within a GradingProvider');
  }
  return context;
}
