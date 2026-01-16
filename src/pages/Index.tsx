import Header from '@/components/Header';
import GameFeed from '@/components/GameFeed';
import TopPlayersOfWeek from '@/components/TopPlayersOfWeek';
import { mockGames } from '@/data/mockData';
import { Loader2 } from 'lucide-react';
import { useNHLGames, useRecentGamesForStats } from '@/hooks/useNHLData';

const Index = () => {
  const { data: games, isLoading: gamesLoading } = useNHLGames();
  const { data: recentGames } = useRecentGamesForStats();

  // Use database games if available, otherwise fall back to mock data
  const displayGames = games && games.length > 0 ? games : mockGames;
  const statsGames = recentGames && recentGames.length > 0 ? recentGames : displayGames;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Top 3 of the Week */}
        <TopPlayersOfWeek games={statsGames} />

        {/* Game Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Games</h2>
          {gamesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <GameFeed games={displayGames} />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>Data updated every 2 hours. Stats provided for informational purposes.</p>
          <p className="mt-1">🇸🇪 Celebrating Swedish excellence in the NHL</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
