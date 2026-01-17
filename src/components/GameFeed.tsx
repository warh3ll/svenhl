import { useState } from 'react';
import { Game } from '@/types/nhl';
import GameCard from './GameCard';
import { Skeleton } from '@/components/ui/skeleton';

interface GameFeedProps {
  games: Game[];
  isLoading?: boolean;
}

const GameFeed = ({ games, isLoading }: GameFeedProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-96 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-4">🏒</div>
        <h3 className="text-lg font-semibold text-foreground">No games found</h3>
        <p className="text-sm text-muted-foreground">Check back later for updates</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
};

export default GameFeed;
