import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlayerTable from '@/components/PlayerTable';
import GoalieTable from '@/components/GoalieTable';
import PlayerTableSkeleton from '@/components/PlayerTableSkeleton';
import GoalieTableSkeleton from '@/components/GoalieTableSkeleton';
import { CURRENT_SEASON, formatSeason, seasons } from '@/lib/season';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MaterialIcon from '@/components/ui/material-icon';
import SEO from '@/components/SEO';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';

const Statistics = () => {
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  
  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);

  const displayPlayers = players ?? [];
  const displayGoalies = goalies ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Swedish NHL Player Statistics — Season Stats | SVENHL"
        description="Full season statistics for every Swedish skater and goalie in the NHL. Goals, assists, points, save percentage and more, filterable by season."
        path="/statistics"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Swedish NHL Player Statistics',
          url: 'https://svenhl.com/statistics',
        }}
      />
      <Header />
      
      
      <main id="main" tabIndex={-1} className="outline-none container py-8">
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
          <label htmlFor="season-select" className="text-sm font-medium text-foreground">Season:</label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger id="season-select" className="w-[140px]">
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
              <MaterialIcon name="group" size="sm" />
              Skaters ({displayPlayers.length})
            </TabsTrigger>
            <TabsTrigger value="goalies" className="flex items-center gap-2">
              <MaterialIcon name="sports" size="sm" />
              Goalies ({displayGoalies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skaters" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click on column headers to sort. Showing {formatSeason(selectedSeason)} season stats.
              </p>
            </div>
            {playersLoading ? (
              <PlayerTableSkeleton />
            ) : displayPlayers.length === 0 ? (
              <p className="rounded-lg border bg-card py-12 text-center text-muted-foreground">
                No skater stats for the {formatSeason(selectedSeason)} season yet.
              </p>
            ) : (
              <PlayerTable players={displayPlayers} />
            )}
          </TabsContent>

          <TabsContent value="goalies" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Click on column headers to sort. Showing {formatSeason(selectedSeason)} season stats.
              </p>
            </div>
            {goaliesLoading ? (
              <GoalieTableSkeleton />
            ) : displayGoalies.length === 0 ? (
              <p className="rounded-lg border bg-card py-12 text-center text-muted-foreground">
                No goalie stats for the {formatSeason(selectedSeason)} season yet.
              </p>
            ) : (
              <GoalieTable goalies={displayGoalies} />
            )}
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-8 rounded-lg border bg-card p-4">
          <h2 className="mb-2 font-semibold text-foreground">Statistics Legend</h2>
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

      <Footer />
    </div>
  );
};

export default Statistics;
