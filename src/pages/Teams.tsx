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
import SEO from '@/components/SEO';
import { CURRENT_SEASON, seasons } from '@/lib/season';
import { SwedishPlayer, SwedishGoalie } from '@/types/nhl';
import { useI18n } from '@/i18n';

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

  // Group players by team (use LAST team for traded players = current team)
  players.forEach(player => {
    const teams = player.teamAbbr.split(',').map(t => t.trim());
    const currentTeam = teams[teams.length - 1]; // Last team is their current team
    if (teamMap[currentTeam]) {
      teamMap[currentTeam].players.push(player);
    }
  });

  // Group goalies by team (use LAST team for traded players = current team)
  goalies.forEach(goalie => {
    const teams = goalie.teamAbbr.split(',').map(t => t.trim());
    const currentTeam = teams[teams.length - 1]; // Last team is their current team
    if (teamMap[currentTeam]) {
      teamMap[currentTeam].goalies.push(goalie);
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
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const { t } = useI18n();
  
  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);
  
  const isLoading = playersLoading || goaliesLoading;
  
  const teamsWithPlayers = useMemo(
    () => groupByTeam(players ?? [], goalies ?? []),
    [players, goalies]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={t('seo.teams.title')}
        description={t('seo.teams.description')}
        path="/teams"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t('seo.teams.name'),
        }}
      />
      <Header />
      
      
      <main id="main" tabIndex={-1} className="outline-none flex-1 container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('teams.heading')}</h1>
            <p className="text-muted-foreground mt-1">
              {t('teams.intro')}
            </p>
          </div>
          
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger className="w-[180px]" aria-label={t('teams.season')}>
              <SelectValue placeholder={t('statistics.selectSeason')} />
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
            {t('teams.empty')}
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
