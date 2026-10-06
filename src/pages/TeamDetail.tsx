import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeamLogo from '@/components/TeamLogo';
import PlayerHeadshot from '@/components/PlayerHeadshot';
import GameCard from '@/components/GameCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSwedishPlayers, useSwedishGoalies, useNHLGames } from '@/hooks/useNHLData';
import { CURRENT_SEASON, formatSeason } from '@/lib/season';
import { getTeamColor, getTeamBackgroundColor } from '@/lib/teamColors';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';

// Full team names mapped from abbreviations
const TEAM_NAMES: Record<string, string> = {
  ANA: 'Anaheim Ducks',
  ARI: 'Arizona Coyotes',
  BOS: 'Boston Bruins',
  BUF: 'Buffalo Sabres',
  CGY: 'Calgary Flames',
  CAR: 'Carolina Hurricanes',
  CHI: 'Chicago Blackhawks',
  COL: 'Colorado Avalanche',
  CBJ: 'Columbus Blue Jackets',
  DAL: 'Dallas Stars',
  DET: 'Detroit Red Wings',
  EDM: 'Edmonton Oilers',
  FLA: 'Florida Panthers',
  LAK: 'Los Angeles Kings',
  MIN: 'Minnesota Wild',
  MTL: 'Montreal Canadiens',
  NSH: 'Nashville Predators',
  NJD: 'New Jersey Devils',
  NYI: 'New York Islanders',
  NYR: 'New York Rangers',
  OTT: 'Ottawa Senators',
  PHI: 'Philadelphia Flyers',
  PIT: 'Pittsburgh Penguins',
  SJS: 'San Jose Sharks',
  SEA: 'Seattle Kraken',
  STL: 'St. Louis Blues',
  TBL: 'Tampa Bay Lightning',
  TOR: 'Toronto Maple Leafs',
  UTA: 'Utah Mammoth',
  VAN: 'Vancouver Canucks',
  VGK: 'Vegas Golden Knights',
  WSH: 'Washington Capitals',
  WPG: 'Winnipeg Jets',
};

const TeamDetail = () => {
  const { teamAbbr } = useParams<{ teamAbbr: string }>();
  const normalizedAbbr = teamAbbr?.toUpperCase() || '';
  
  const { data: allPlayers, isLoading: playersLoading } = useSwedishPlayers(CURRENT_SEASON);
  const { data: allGoalies, isLoading: goaliesLoading } = useSwedishGoalies(CURRENT_SEASON);
  const { data: allGames, isLoading: gamesLoading } = useNHLGames();
  
  const isLoading = playersLoading || goaliesLoading || gamesLoading;
  
  // Filter players and goalies for this team (use LAST team for traded players = current team)
  const teamPlayers = useMemo(() => {
    if (!allPlayers) return [];
    return allPlayers
      .filter(p => {
        const teams = p.teamAbbr.split(',').map(t => t.trim());
        return teams[teams.length - 1] === normalizedAbbr;
      })
      .sort((a, b) => b.points - a.points);
  }, [allPlayers, normalizedAbbr]);
  
  const teamGoalies = useMemo(() => {
    if (!allGoalies) return [];
    return allGoalies
      .filter(g => {
        const teams = g.teamAbbr.split(',').map(t => t.trim());
        return teams[teams.length - 1] === normalizedAbbr;
      })
      .sort((a, b) => b.wins - a.wins);
  }, [allGoalies, normalizedAbbr]);
  
  // Filter games where this team played (home or away)
  const teamGames = useMemo(() => {
    if (!allGames) return [];
    return allGames.filter(
      g => g.homeTeamAbbr === normalizedAbbr || g.awayTeamAbbr === normalizedAbbr
    );
  }, [allGames, normalizedAbbr]);
  
  const teamName = TEAM_NAMES[normalizedAbbr] || normalizedAbbr;
  const teamColor = getTeamColor(normalizedAbbr);
  const bgColor = getTeamBackgroundColor(normalizedAbbr, 0.08);
  
  const totalPlayers = teamPlayers.length + teamGoalies.length;

  if (!normalizedAbbr || !TEAM_NAMES[normalizedAbbr]) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">Team Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The team "{teamAbbr}" could not be found.
            </p>
            <Button asChild>
              <Link to="/teams">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teams
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`${teamName} — Swedish Players | SVENHL`}
        description={`Swedish players currently on the ${teamName} roster, with season stats and recent games.`}
        path={`/teams/${normalizedAbbr}`}
      />
      <Header />
      
      
      <main className="flex-1 container py-8">
        {/* Back button */}
        <Link 
          to="/teams" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Teams
        </Link>
        
        {/* Team Header */}
        <div 
          className="rounded-lg p-6 mb-8 flex items-center gap-6"
          style={{ 
            backgroundColor: bgColor,
            borderLeft: `4px solid ${teamColor.primary}`
          }}
        >
          <TeamLogo teamAbbr={normalizedAbbr} size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{teamName}</h1>
            <p className="text-muted-foreground mt-1">
              {totalPlayers} Swedish player{totalPlayers !== 1 ? 's' : ''} • {formatSeason(CURRENT_SEASON)} Season
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : totalPlayers === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No Swedish players on this team for the {formatSeason(CURRENT_SEASON)} season.
          </div>
        ) : (
          <div className="space-y-8">
            {/* Skaters Table */}
            {teamPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Skaters ({teamPlayers.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Player</TableHead>
                          <TableHead className="text-center">Pos</TableHead>
                          <TableHead className="text-center">GP</TableHead>
                          <TableHead className="text-center">G</TableHead>
                          <TableHead className="text-center">A</TableHead>
                          <TableHead className="text-center">P</TableHead>
                          <TableHead className="text-center">+/-</TableHead>
                          <TableHead className="text-center">PIM</TableHead>
                          <TableHead className="text-center">PPG</TableHead>
                          <TableHead className="text-center">PPP</TableHead>
                          <TableHead className="text-center">GWG</TableHead>
                          <TableHead className="text-center">S</TableHead>
                          <TableHead className="text-center">S%</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamPlayers.map((player) => (
                          <TableRow key={player.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Link 
                                to={`/player/${player.id}`}
                                className="flex items-center gap-3 hover:text-primary transition-colors"
                              >
                                <PlayerHeadshot 
                                  playerId={player.id} 
                                  playerName={player.name} 
                                  teamAbbr={normalizedAbbr}
                                  size="sm" 
                                />
                                <div>
                                  <div className="font-medium">{player.name}</div>
                                  <div className="text-xs text-muted-foreground">#{player.jerseyNumber}</div>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded">
                                {player.position}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{player.games}</TableCell>
                            <TableCell className="text-center font-medium">{player.goals}</TableCell>
                            <TableCell className="text-center font-medium">{player.assists}</TableCell>
                            <TableCell className="text-center font-bold">{player.points}</TableCell>
                            <TableCell className={cn(
                              "text-center",
                              player.plusMinus > 0 && "text-green-600",
                              player.plusMinus < 0 && "text-red-600"
                            )}>
                              {player.plusMinus > 0 ? '+' : ''}{player.plusMinus}
                            </TableCell>
                            <TableCell className="text-center">{player.penaltyMinutes}</TableCell>
                            <TableCell className="text-center">{player.powerPlayGoals}</TableCell>
                            <TableCell className="text-center">{player.powerPlayPoints}</TableCell>
                            <TableCell className="text-center">{player.gameWinningGoals}</TableCell>
                            <TableCell className="text-center">{player.shots}</TableCell>
                            <TableCell className="text-center">{player.shootingPct.toFixed(1)}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Goalies Table */}
            {teamGoalies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Goalies ({teamGoalies.length})</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">Player</TableHead>
                          <TableHead className="text-center">GP</TableHead>
                          <TableHead className="text-center">GS</TableHead>
                          <TableHead className="text-center">W</TableHead>
                          <TableHead className="text-center">L</TableHead>
                          <TableHead className="text-center">OT</TableHead>
                          <TableHead className="text-center">SV%</TableHead>
                          <TableHead className="text-center">GAA</TableHead>
                          <TableHead className="text-center">SO</TableHead>
                          <TableHead className="text-center">SV</TableHead>
                          <TableHead className="text-center">SA</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamGoalies.map((goalie) => (
                          <TableRow key={goalie.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Link 
                                to={`/player/${goalie.id}`}
                                className="flex items-center gap-3 hover:text-primary transition-colors"
                              >
                                <PlayerHeadshot 
                                  playerId={goalie.id} 
                                  playerName={goalie.name} 
                                  teamAbbr={normalizedAbbr}
                                  size="sm" 
                                />
                                <div>
                                  <div className="font-medium">{goalie.name}</div>
                                  <div className="text-xs text-muted-foreground">#{goalie.jerseyNumber}</div>
                                </div>
                              </Link>
                            </TableCell>
                            <TableCell className="text-center">{goalie.games}</TableCell>
                            <TableCell className="text-center">{goalie.gamesStarted}</TableCell>
                            <TableCell className="text-center font-bold">{goalie.wins}</TableCell>
                            <TableCell className="text-center">{goalie.losses}</TableCell>
                            <TableCell className="text-center">{goalie.overtimeLosses}</TableCell>
                            <TableCell className="text-center font-bold">
                              {(goalie.savePercentage * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-center">{goalie.goalsAgainstAverage.toFixed(2)}</TableCell>
                            <TableCell className="text-center">{goalie.shutouts}</TableCell>
                            <TableCell className="text-center">{goalie.saves}</TableCell>
                            <TableCell className="text-center">{goalie.shotsAgainst}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Team Games */}
            {teamGames.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-foreground">
                  Recent Games ({teamGames.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {teamGames.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default TeamDetail;
