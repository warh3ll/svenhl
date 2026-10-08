import { useParams, Link } from 'react-router-dom';
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
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Date</TableHead>
                      <TableHead>Matchup</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead className="min-w-[200px]">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gameLog.map((entry, index) => (
                      <TableRow key={index} className="hover:bg-muted/30">
                        <TableCell className="text-muted-foreground">
                          {format(new Date(entry.gameDate), 'MMM d')}
                        </TableCell>
                        <TableCell className="font-medium">
                          {entry.awayTeamAbbr} @ {entry.homeTeamAbbr}
                        </TableCell>
                        <TableCell>
                          <Badge className={entry.type === 'goal' ? 'bg-[hsl(var(--goal))] text-[hsl(var(--goal-foreground))] hover:bg-[hsl(var(--goal))]' : 'bg-[hsl(var(--assist))] text-[hsl(var(--assist-foreground))] hover:bg-[hsl(var(--assist))]'}>
                            {entry.type}
                          </Badge>
                        </TableCell>
                        <TableCell>P{entry.period}</TableCell>
                        <TableCell>{entry.time}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
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

export default PlayerProfile;
