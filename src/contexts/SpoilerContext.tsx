import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface SpoilerContextType {
  spoilerMode: boolean;
  toggleSpoilerMode: () => void;
  isGameRevealed: (gameId: string) => boolean;
  revealGame: (gameId: string) => void;
}

const SpoilerContext = createContext<SpoilerContextType | undefined>(undefined);

const STORAGE_KEY = 'svenhl-spoiler-mode';
const REVEALED_GAMES_KEY = 'svenhl-revealed-games';

export const SpoilerProvider = ({ children }: { children: ReactNode }) => {
  const [spoilerMode, setSpoilerMode] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  const [revealedGames, setRevealedGames] = useState<Set<string>>(() => {
    const stored = localStorage.getItem(REVEALED_GAMES_KEY);
    if (stored) {
      try {
        return new Set(JSON.parse(stored));
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(spoilerMode));
  }, [spoilerMode]);

  useEffect(() => {
    localStorage.setItem(REVEALED_GAMES_KEY, JSON.stringify([...revealedGames]));
  }, [revealedGames]);

  const toggleSpoilerMode = () => {
    setSpoilerMode((prev) => !prev);
  };

  const isGameRevealed = useCallback((gameId: string) => {
    return revealedGames.has(gameId);
  }, [revealedGames]);

  const revealGame = useCallback((gameId: string) => {
    setRevealedGames((prev) => new Set([...prev, gameId]));
  }, []);

  return (
    <SpoilerContext.Provider value={{ spoilerMode, toggleSpoilerMode, isGameRevealed, revealGame }}>
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
