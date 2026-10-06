import { useMemo } from 'react';
import { Game } from '@/types/nhl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import TeamLogo from './TeamLogo';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';

interface UpcomingGamesStripProps {
  games: Game[];
}

// Game times are shown in Swedish time, since that's where the site's readers are
const TIME_ZONE = 'Europe/Stockholm';
const timeFormat = new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, weekday: 'short' });
const dateKey = new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

// "02:00", or "Thu 02:00" when the game isn't today in Sweden
const formatStartTime = (date: Date) => {
  const time = timeFormat.format(date);
  return dateKey.format(date) === dateKey.format(new Date()) ? time : `${dayFormat.format(date)} ${time}`;
};

const UpcomingGamesStrip = ({ games }: UpcomingGamesStripProps) => {
  const { data: players } = useSwedishPlayers();
  const { data: goalies } = useSwedishGoalies();

  // Swedish player names per team for the current season
  const swedesByTeam = useMemo(() => {
    const byTeam: Record<string, string[]> = {};
    for (const { teamAbbr, name } of [...(players ?? []), ...(goalies ?? [])]) {
      (byTeam[teamAbbr] ??= []).push(name);
    }
    return byTeam;
  }, [players, goalies]);

  if (games.length === 0) return null;

  return (
    <section className="mt-10 space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Tonight</h2>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {games.map((game) => {
          const swedes = [...(swedesByTeam[game.awayTeamAbbr] ?? []), ...(swedesByTeam[game.homeTeamAbbr] ?? [])];

          return (
            <Card key={game.id} className="flex shrink-0 snap-start flex-col items-center gap-2 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-center">
                  <TeamLogo teamAbbr={game.awayTeamAbbr} size="sm" />
                  <span className="text-xs font-semibold text-foreground">{game.awayTeamAbbr}</span>
                </div>
                <span className="text-sm text-muted-foreground">@</span>
                <div className="flex flex-col items-center">
                  <TeamLogo teamAbbr={game.homeTeamAbbr} size="sm" />
                  <span className="text-xs font-semibold text-foreground">{game.homeTeamAbbr}</span>
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">{formatStartTime(new Date(game.date))}</span>
              {swedes.length > 0 && (
                <Badge variant="secondary" className="text-xs" title={swedes.join(', ')}>
                  {swedes.length} Swede{swedes.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </Card>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingGamesStrip;
