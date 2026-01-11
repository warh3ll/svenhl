import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SpoilerContextType {
  spoilerMode: boolean;
  toggleSpoilerMode: () => void;
}

const SpoilerContext = createContext<SpoilerContextType | undefined>(undefined);

const STORAGE_KEY = 'svenhl-spoiler-mode';

export const SpoilerProvider = ({ children }: { children: ReactNode }) => {
  const [spoilerMode, setSpoilerMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(spoilerMode));
  }, [spoilerMode]);

  const toggleSpoilerMode = () => {
    setSpoilerMode((prev) => !prev);
  };

  return (
    <SpoilerContext.Provider value={{ spoilerMode, toggleSpoilerMode }}>
      {children}
    </SpoilerContext.Provider>
  );
};

export const useSpoiler = () => {
  const context = useContext(SpoilerContext);
  if (context === undefined) {
    throw new Error('useSpoiler must be used within a SpoilerProvider');
  }
  return context;
};
