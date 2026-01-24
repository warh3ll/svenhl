import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeamCard from '@/components/TeamCard';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';
import { mockPlayers, mockGoalies, seasons } from '@/data/mockData';
import { SwedishPlayer, SwedishGoalie } from '@/types/nhl';

// All NHL team abbreviations for consistent ordering
const ALL_TEAMS = [
  'ANA', 'BOS', 'BUF', 'CGY', 'CAR', 'CHI', 'COL', 'CBJ', 'DAL', 'DET',
  'EDM', 'FLA', 'LAK', 'MIN', 'MTL', 'NSH', 'NJD', 'NYI', 'NYR', 'OTT',
  'PHI', 'PIT', 'SJS', 'SEA', 'STL', 'TBL', 'TOR', 'UTA', 'VAN', 'VGK',
  'WSH', 'WPG'
];

function groupByTeam(players: SwedishPlayer[], goalies: SwedishGoalie[]) {
  const teamMap: Record<string, { players: SwedishPlayer[]; goalies: SwedishGoalie[] }> = {};

  // Initialize all teams
  ALL_TEAMS.forEach(abbr => {
    teamMap[abbr] = { players: [], goalies: [] };
  });

  // Group players by team (handle traded players by using first team)
  players.forEach(player => {
    const teamAbbr = player.teamAbbr.split(',')[0].trim();
    if (teamMap[teamAbbr]) {
      teamMap[teamAbbr].players.push(player);
    }
  });

  // Group goalies by team
  goalies.forEach(goalie => {
    const teamAbbr = goalie.teamAbbr.split(',')[0].trim();
    if (teamMap[teamAbbr]) {
      teamMap[teamAbbr].goalies.push(goalie);
    }
  });

  // Filter to only teams with Swedish players and sort alphabetically
  return ALL_TEAMS
    .filter(abbr => teamMap[abbr].players.length > 0 || teamMap[abbr].goalies.length > 0)
    .map(abbr => ({
      teamAbbr: abbr,
      players: teamMap[abbr].players,
      goalies: teamMap[abbr].goalies,
    }));
}

const TeamCardSkeleton = () => (
  <div className="rounded-lg border border-border bg-card overflow-hidden">
    <div className="flex items-center gap-4 p-4 bg-muted/30">
      <Skeleton className="h-24 w-24 rounded" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="divide-y divide-border">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-6 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  </div>
);

const Teams = () => {
  const [selectedSeason, setSelectedSeason] = useState('20252026');
  
  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);
  
  const isLoading = playersLoading || goaliesLoading;
  
  // Use fetched data or fall back to mock data
  const displayPlayers = players?.length ? players : mockPlayers;
  const displayGoalies = goalies?.length ? goalies : mockGoalies;
  
  const teamsWithPlayers = useMemo(
    () => groupByTeam(displayPlayers, displayGoalies),
    [displayPlayers, displayGoalies]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <p className="text-muted-foreground mt-1">
              Swedish players by NHL team
            </p>
          </div>
          
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]">
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
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <TeamCardSkeleton key={i} />
            ))}
          </div>
        ) : teamsWithPlayers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No Swedish players found for this season.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {teamsWithPlayers.map(({ teamAbbr, players, goalies }) => (
              <TeamCard
                key={teamAbbr}
                teamAbbr={teamAbbr}
                players={players}
                goalies={goalies}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Teams;
