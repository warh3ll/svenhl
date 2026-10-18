import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TeamLogo from '@/components/TeamLogo';
import PlayerHeadshot from '@/components/PlayerHeadshot';
import GameCard from '@/components/GameCard';
import StatBar from '@/components/StatBar';
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
import { getTeamColor } from '@/lib/teamColors';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import { listNames, useI18n } from '@/i18n';

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
  const { lang, t, path, position, decimal, percent } = useI18n();
  const season = formatSeason(CURRENT_SEASON);
  
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
  
  // Points bars are scaled to the team's top scorer
  const maxPoints = Math.max(1, ...teamPlayers.map(p => p.points));
  const pointsBar = (player: (typeof teamPlayers)[number]) => (
    <StatBar
      total={player.points}
      max={maxPoints}
      segments={[
        { value: player.goals, className: 'bg-[hsl(var(--goal))]' },
        { value: player.assists, className: 'bg-[hsl(var(--assist))]' },
      ]}
      label={`${player.points}`}
      detail={`${player.goals} ${t('game.goalLetter')} · ${player.assists} ${t('game.assistLetter')}`}
      srLabel={`${t('count.points', { count: player.points })}: ${t('count.goals', { count: player.goals })}, ${t('count.assists', { count: player.assists })}`}
      alwaysShowDetail
    />
  );

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
  const bgColor = teamColor.tint;
  
  const totalPlayers = teamPlayers.length + teamGoalies.length;

  if (!normalizedAbbr || !TEAM_NAMES[normalizedAbbr]) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Helmet><title>{`${t('team.notFoundTitle')} | SVENHL`}</title></Helmet>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none flex-1 container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-4">{t('team.notFoundTitle')}</h1>
            <p className="text-muted-foreground mb-6">
              {t('team.notFoundText', { team: teamAbbr })}
            </p>
            <Button asChild>
              <Link to={path('/teams')}>
                <ArrowLeft className="h-4 w-4" />
                {t('team.back')}
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
        title={t('seo.team.title', { team: teamName })}
        description={
          totalPlayers
            ? t('seo.team.description', { team: teamName, names: listNames(lang, [...teamPlayers, ...teamGoalies].map(p => p.name)) })
            : t('seo.team.descriptionEmpty', { team: teamName })
        }
        path={`/teams/${normalizedAbbr}`}
      />
      <Header />
      
      
      <main id="main" tabIndex={-1} className="outline-none flex-1 container py-8">
        {/* Back button */}
        <Link 
          to={path('/teams')}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('team.back')}
        </Link>
        
        {/* Team Header */}
        <div 
          className="rounded-lg p-6 mb-8 flex items-center gap-6"
          style={{ 
            backgroundColor: bgColor,
            borderLeft: `4px solid ${teamColor.main}`
          }}
        >
          <TeamLogo teamAbbr={normalizedAbbr} size="lg" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{teamName}</h1>
            <p className="text-muted-foreground mt-1">
              {t('teams.swedishPlayers', { count: totalPlayers })} • {t('team.season', { season })}
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
            {t('team.empty', { season })}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Skaters Table */}
            {teamPlayers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{t('team.skaters', { count: teamPlayers.length })}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">{t('table.player')}</TableHead>
                          <TableHead className="text-center hidden sm:table-cell">{t('stat.pos')}</TableHead>
                          <TableHead className="text-center">{t('stat.gp')}</TableHead>
                          <TableHead className="min-w-[260px] pl-6 hidden sm:table-cell">{t('player.points')}</TableHead>
                          <TableHead className="text-center">{t('stat.plusMinus')}</TableHead>
                          <TableHead className="text-center">{t('stat.pim')}</TableHead>
                          <TableHead className="text-center">{t('stat.ppg')}</TableHead>
                          <TableHead className="text-center">{t('stat.ppp')}</TableHead>
                          <TableHead className="text-center">{t('stat.gwg')}</TableHead>
                          <TableHead className="text-center">{t('stat.s')}</TableHead>
                          <TableHead className="text-center">{t('stat.sPct')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamPlayers.map((player) => (
                          <TableRow key={player.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Link 
                                to={path(`/player/${player.id}`)}
                                className="flex items-center gap-3 hover:text-primary transition-colors"
                              >
                                <PlayerHeadshot 
                                  playerId={player.id} 
                                  playerName={player.name} 
                                  teamAbbr={normalizedAbbr}
                                  size="sm" 
                                />
                                <div>
                                  <div className="font-medium whitespace-nowrap">{player.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    #{player.jerseyNumber}
                                    <span className="sm:hidden"> · {position(player.position)}</span>
                                  </div>
                                </div>
                              </Link>
                              {/* On phones the bar runs under the name instead of in its own column */}
                              <div className="mt-2 min-w-[240px] sm:hidden">{pointsBar(player)}</div>
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              <span className="bg-muted text-muted-foreground text-xs font-semibold px-2 py-0.5 rounded">
                                {position(player.position)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">{player.games}</TableCell>
                            <TableCell className="pl-6 hidden sm:table-cell">
                              {pointsBar(player)}
                            </TableCell>
                            <TableCell className={cn(
                              "text-center",
                              player.plusMinus > 0 && "text-[hsl(var(--positive))]",
                              player.plusMinus < 0 && "text-destructive"
                            )}>
                              {player.plusMinus > 0 ? '+' : ''}{player.plusMinus}
                            </TableCell>
                            <TableCell className="text-center">{player.penaltyMinutes}</TableCell>
                            <TableCell className="text-center">{player.powerPlayGoals}</TableCell>
                            <TableCell className="text-center">{player.powerPlayPoints}</TableCell>
                            <TableCell className="text-center">{player.gameWinningGoals}</TableCell>
                            <TableCell className="text-center">{player.shots}</TableCell>
                            <TableCell className="text-center">{percent(player.shootingPct / 100)}</TableCell>
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
                  <CardTitle className="text-xl">{t('team.goalies', { count: teamGoalies.length })}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px]">{t('table.player')}</TableHead>
                          <TableHead className="text-center">{t('stat.gp')}</TableHead>
                          <TableHead className="text-center">{t('stat.gs')}</TableHead>
                          <TableHead className="text-center">{t('stat.w')}</TableHead>
                          <TableHead className="text-center">{t('stat.l')}</TableHead>
                          <TableHead className="text-center">{t('stat.ot')}</TableHead>
                          <TableHead className="text-center">{t('stat.svPct')}</TableHead>
                          <TableHead className="text-center">{t('stat.gaa')}</TableHead>
                          <TableHead className="text-center">{t('stat.so')}</TableHead>
                          <TableHead className="text-center">{t('stat.sv')}</TableHead>
                          <TableHead className="text-center">{t('stat.sa')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamGoalies.map((goalie) => (
                          <TableRow key={goalie.id} className="hover:bg-muted/50">
                            <TableCell>
                              <Link 
                                to={path(`/player/${goalie.id}`)}
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
                              {percent(goalie.savePercentage)}
                            </TableCell>
                            <TableCell className="text-center">{decimal(goalie.goalsAgainstAverage, 2)}</TableCell>
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
                  {t('team.recentGames', { count: teamGames.length })}
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
