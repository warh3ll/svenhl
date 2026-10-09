import { useParams, Link } from 'react-router-dom';
import type { PlayerGameLogEntry } from '@/types/nhl';
import { usePlayer, useGoalie, usePlayerGameLog, usePlayerCareerStats } from '@/hooks/useNHLData';
import { CURRENT_SEASON, formatSeason } from '@/lib/season';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import MaterialIcon from '@/components/ui/material-icon';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import TeamLogo from '@/components/TeamLogo';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  
  const { data: player, isLoading: playerLoading } = usePlayer(playerId || '');
  const { data: goalie, isLoading: goalieLoading } = useGoalie(playerId || '');
  const { data: gameLog, isLoading: gameLogLoading } = usePlayerGameLog(playerId || '');
  const { data: careerStats, isLoading: careerLoading } = usePlayerCareerStats(playerId || '');

  const isLoading = playerLoading && goalieLoading;
  const isGoalie = !player && goalie;
  const currentPlayer = player || goalie;
  // Season of the stats row shown (the player's most recent season on record)
  const playerSeason = currentPlayer?.season ?? CURRENT_SEASON;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>Loading player | SVENHL</title></Helmet>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none container py-8 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </main>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>Player Not Found | SVENHL</title></Helmet>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Player Not Found</h1>
            <p className="text-muted-foreground mb-4">The player you're looking for doesn't exist.</p>
            <Link to="/statistics" className="text-primary hover:underline">
              ← Back to Statistics
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${currentPlayer.name} — Swedish NHL Player Stats | SVENHL`}
        description={`Season statistics, career numbers, and recent games for ${currentPlayer.name} of the ${currentPlayer.team}.`}
        path={`/player/${playerId}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: currentPlayer.name,
          nationality: 'Swedish',
          jobTitle: isGoalie ? 'Goaltender' : 'Hockey Player',
          memberOf: { '@type': 'SportsTeam', name: currentPlayer.team },
          url: `https://svenhl.com/player/${playerId}`,
        }}
      />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none container py-8 space-y-6">
        {/* Back Link */}
        <Link 
          to="/statistics" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <MaterialIcon name="arrow_back" size="sm" />
          Back to Statistics
        </Link>

        {/* Player Header */}
        <Card className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="relative h-24 w-24 overflow-hidden rounded-full bg-primary/10">
                <img 
                  src={`https://assets.nhle.com/mugs/nhl/${playerSeason}/${currentPlayer.teamAbbr.split(',').pop()}/${playerId}.png`}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  {isGoalie ? (
                    <MaterialIcon name="sports" size="xl" className="text-primary" />
                  ) : (
                    <MaterialIcon name="person" size="xl" className="text-primary" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-foreground">{currentPlayer.name}</h1>
                  <Badge variant="secondary" className="text-lg">#{currentPlayer.jerseyNumber}</Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <TeamLogo teamAbbr={currentPlayer.teamAbbr} size="md" />
                  <span className="font-medium">{currentPlayer.team}</span>
                  {!isGoalie && player && (
                    <Badge>{player.position}</Badge>
                  )}
                  {isGoalie && <Badge>G</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Season Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="emoji_events" size="md" />
              {formatSeason(playerSeason)} Season Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isGoalie && goalie ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatBox label="Games" value={goalie.games} />
                <StatBox label="Games Started" value={goalie.gamesStarted} />
                <StatBox label="Wins" value={goalie.wins} highlight />
                <StatBox label="Losses" value={goalie.losses} />
                <StatBox label="OT Losses" value={goalie.overtimeLosses} />
                <StatBox label="Save %" value={`${(goalie.savePercentage * 100).toFixed(1)}%`} highlight />
                <StatBox label="GAA" value={goalie.goalsAgainstAverage.toFixed(2)} />
                <StatBox label="Shutouts" value={goalie.shutouts} />
                <StatBox label="Saves" value={goalie.saves} />
                <StatBox label="Shots Against" value={goalie.shotsAgainst} />
              </div>
            ) : player ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <StatBox label="Games" value={player.games} />
                <StatBox label="Goals" value={player.goals} highlight />
                <StatBox label="Assists" value={player.assists} highlight />
                <StatBox label="Points" value={player.points} highlight />
                <StatBox label="+/-" value={player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus} />
                <StatBox label="PIM" value={player.penaltyMinutes} />
                <StatBox label="PP Goals" value={player.powerPlayGoals} />
                <StatBox label="PP Points" value={player.powerPlayPoints} />
                <StatBox label="GW Goals" value={player.gameWinningGoals} />
                <StatBox label="Shots" value={player.shots} />
                <StatBox label="Shooting %" value={`${player.shootingPct.toFixed(1)}%`} />
                <StatBox label="TOI" value={player.timeOnIce} />
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Game Log */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MaterialIcon name="sports_hockey" size="md" />
              Recent Point Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            {gameLogLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : gameLog && gameLog.length > 0 ? (
              <PointsByGame entries={gameLog} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No recorded points this season yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Career Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Career History</CardTitle>
          </CardHeader>
          <CardContent>
            {careerLoading ? (
              <Skeleton className="h-20 w-full" />
            ) : careerStats && careerStats.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Season</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>GP</TableHead>
                      {isGoalie ? (
                        <>
                          <TableHead>W</TableHead>
                          <TableHead>L</TableHead>
                          <TableHead>SV%</TableHead>
                          <TableHead>GAA</TableHead>
                          <TableHead>SO</TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead>G</TableHead>
                          <TableHead>A</TableHead>
                          <TableHead>PTS</TableHead>
                          <TableHead>+/-</TableHead>
                          <TableHead>PIM</TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {careerStats.map((season) => (
                      <TableRow key={season.season} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {formatSeason(season.season)}
                        </TableCell>
                        <TableCell>{season.teamAbbr}</TableCell>
                        <TableCell>{season.games}</TableCell>
                        {isGoalie ? (
                          <>
                            <TableCell className="text-[hsl(var(--positive))]">{season.wins}</TableCell>
                            <TableCell>{season.losses}</TableCell>
                            <TableCell className="font-bold text-primary">
                              {((season.savePercentage || 0) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell>{(season.goalsAgainstAverage || 0).toFixed(2)}</TableCell>
                            <TableCell>{season.shutouts}</TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell>{season.goals}</TableCell>
                            <TableCell>{season.assists}</TableCell>
                            <TableCell className="font-bold text-primary">{season.points}</TableCell>
                            <TableCell className={season.plusMinus >= 0 ? 'text-[hsl(var(--positive))]' : 'text-destructive'}>
                              {season.plusMinus > 0 ? '+' : ''}{season.plusMinus}
                            </TableCell>
                            <TableCell>{season.penaltyMinutes}</TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No career history available.
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

const StatBox = ({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) => (
  <div className="rounded-lg bg-muted/50 p-4 text-center">
    <div className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
      {value}
    </div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

// Recent points grouped into one row per game: date, matchup, a chip per point and a G/A summary.
// Goal/assist is spelled out for screen readers and shown as a G/A letter, not by color alone.
const periodLabel = (period: number) => (period >= 4 ? 'OT' : `P${period}`);
const periodName = (period: number) => (period >= 4 ? 'overtime' : `period ${period}`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const PointsByGame = ({ entries }: { entries: PlayerGameLogEntry[] }) => {
  const games: { gameId: string; entries: PlayerGameLogEntry[] }[] = [];
  for (const entry of entries) {
    const game = games.find((g) => g.gameId === entry.gameId);
    if (game) game.entries.push(entry);
    else games.push({ gameId: entry.gameId, entries: [entry] });
  }

  return (
    <ol className="rounded-lg border divide-y" aria-label="Points by game">
      {games.map(({ gameId, entries: points }) => {
        const first = points[0];
        const sorted = [...points].sort((a, b) => a.period - b.period || a.time.localeCompare(b.time));
        const goals = points.filter((p) => p.type === 'goal').length;
        const assists = points.length - goals;
        return (
          <li
            key={gameId}
            className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[4rem_7.5rem_1fr_auto]"
          >
            <time dateTime={first.gameDate} className="text-sm text-muted-foreground">
              {format(new Date(first.gameDate), 'MMM d')}
            </time>
            <span className="font-medium">
              {first.awayTeamAbbr} @ {first.homeTeamAbbr}
            </span>
            <ul className="order-last col-span-full flex flex-wrap gap-2 sm:order-none sm:col-span-1" aria-label="Points">
              {sorted.map((point, i) => (
                <PointChip key={i} point={point} />
              ))}
            </ul>
            <span className="text-right text-sm font-semibold tabular-nums whitespace-nowrap">
              <span aria-hidden="true">
                {[goals > 0 && `${goals} G`, assists > 0 && `${assists} A`].filter(Boolean).join(' · ')}
              </span>
              <span className="sr-only">
                {[goals > 0 && plural(goals, 'goal'), assists > 0 && plural(assists, 'assist')].filter(Boolean).join(', ')}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

const PointChip = ({ point }: { point: PlayerGameLogEntry }) => {
  const isGoal = point.type === 'goal';
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-0.5 pl-0.5 pr-2.5 text-sm">
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold leading-none ${isGoal ? 'bg-[hsl(var(--goal))] text-[hsl(var(--goal-foreground))]' : 'bg-[hsl(var(--assist))] text-[hsl(var(--assist-foreground))]'}`}
      >
        {isGoal ? 'G' : 'A'}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {periodLabel(point.period)} <span className="text-muted-foreground">{point.time}</span>
      </span>
      <span className="sr-only">
        {isGoal ? 'Goal' : 'Assist'}, {periodName(point.period)}, {point.time}
      </span>
    </li>
  );
};

export default PlayerProfile;
