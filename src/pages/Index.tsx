import Header from '@/components/Header';
import GameFeed from '@/components/GameFeed';
import { mockGames } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { Clock, RefreshCw } from 'lucide-react';

const Index = () => {
  const lastUpdate = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
            Swedish NHL Tracker
          </h1>
          <p className="text-lg text-muted-foreground">
            Track Swedish players making an impact in the National Hockey League
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              Last update: {lastUpdate}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Updates bi-hourly
            </Badge>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Games Today" 
            value={mockGames.filter(g => {
              const today = new Date();
              const gameDate = new Date(g.date);
              return gameDate.toDateString() === today.toDateString();
            }).length.toString()} 
            subtitle="Active NHL games"
          />
          <StatCard 
            title="Swedish Points" 
            value={mockGames.reduce((acc, g) => acc + g.swedishPoints.length, 0).toString()} 
            subtitle="Goals & assists today"
          />
          <StatCard 
            title="Swedish Goals" 
            value={mockGames.reduce((acc, g) => acc + g.swedishPoints.filter(p => p.type === 'goal').length, 0).toString()} 
            subtitle="Pucks in the net"
          />
          <StatCard 
            title="Goalie Starts" 
            value={mockGames.reduce((acc, g) => acc + g.swedishGoalies.length, 0).toString()} 
            subtitle="Swedish goalies playing"
          />
        </div>

        {/* Game Feed */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Games</h2>
          <GameFeed games={mockGames} />
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

const StatCard = ({ title, value, subtitle }: { title: string; value: string; subtitle: string }) => (
  <div className="rounded-xl border bg-card p-4 text-center">
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    <p className="mt-1 text-3xl font-bold text-primary">{value}</p>
    <p className="text-xs text-muted-foreground">{subtitle}</p>
  </div>
);

export default Index;
