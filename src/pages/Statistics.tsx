import { useState } from 'react';
import Header from '@/components/Header';
import PlayerTable from '@/components/PlayerTable';
import GoalieTable from '@/components/GoalieTable';
import { mockPlayers, mockGoalies, seasons } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Shield, Loader2 } from 'lucide-react';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';

const Statistics = () => {
  const [selectedSeason, setSelectedSeason] = useState('20252026');
  
  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);

  // Use database data if available, otherwise fall back to mock data
  const displayPlayers = players && players.length > 0 ? players : mockPlayers;
  const displayGoalies = goalies && goalies.length > 0 ? goalies : mockGoalies;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
            Swedish Player Statistics
          </h1>
          <p className="text-lg text-muted-foreground">
            Complete statistics for all Swedish players in the NHL
          </p>
        </div>

        {/* Season Filter */}
        <div className="mb-6 flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Season:</label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select season" />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stats Tabs */}
        <Tabs defaultValue="skaters" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="skaters" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Skaters ({displayPlayers.length})
            </TabsTrigger>
            <TabsTrigger value="goalies" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Goalies ({displayGoalies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skaters" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click on column headers to sort. Showing {selectedSeason === '20252026' ? '2025-26' : selectedSeason === '20242025' ? '2024-25' : '2023-24'} season stats.
              </p>
            </div>
            {playersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <PlayerTable players={displayPlayers} />
            )}
          </TabsContent>

          <TabsContent value="goalies" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click on column headers to sort. Showing {selectedSeason === '20252026' ? '2025-26' : selectedSeason === '20242025' ? '2024-25' : '2023-24'} season stats.
              </p>
            </div>
            {goaliesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <GoalieTable goalies={displayGoalies} />
            )}
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-8 rounded-lg border bg-card p-4">
          <h3 className="mb-2 font-semibold text-foreground">Statistics Legend</h3>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            <div><strong>GP:</strong> Games Played</div>
            <div><strong>G:</strong> Goals</div>
            <div><strong>A:</strong> Assists</div>
            <div><strong>PTS:</strong> Points</div>
            <div><strong>+/-:</strong> Plus/Minus</div>
            <div><strong>PIM:</strong> Penalty Minutes</div>
            <div><strong>PPG:</strong> Power Play Goals</div>
            <div><strong>GWG:</strong> Game Winning Goals</div>
            <div><strong>S%:</strong> Shooting Percentage</div>
            <div><strong>SV%:</strong> Save Percentage</div>
            <div><strong>GAA:</strong> Goals Against Average</div>
            <div><strong>SO:</strong> Shutouts</div>
          </div>
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

export default Statistics;
