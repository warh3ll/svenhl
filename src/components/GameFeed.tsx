import { ReactNode } from 'react';
import { Game } from '@/types/nhl';
import GameCard from './GameCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useI18n } from '@/i18n';

interface GameFeedProps {
  games: Game[];
  isLoading?: boolean;
  insertAfter?: {
    count: number;
    element: ReactNode;
  };
}

const GameFeed = ({ games, isLoading, insertAfter }: GameFeedProps) => {
  const { t } = useI18n();

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
        <h3 className="text-lg font-semibold text-foreground">{t('home.noGames')}</h3>
        <p className="text-sm text-muted-foreground">{t('home.checkBack')}</p>
      </div>
    );
  }

  // If we have content to insert, split the games
  if (insertAfter && games.length > insertAfter.count) {
    const firstSection = games.slice(0, insertAfter.count);
    const secondSection = games.slice(insertAfter.count);

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {firstSection.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
        
        {insertAfter.element}
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {secondSection.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </>
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
