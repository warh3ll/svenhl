import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Game } from '@/types/nhl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import TeamLogo from './TeamLogo';
import PlayerHeadshot from './PlayerHeadshot';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';

interface UpcomingGamesStripProps {
  games: Game[];
}

interface Swede {
  id: string;
  name: string;
  position: string;
  jerseyNumber: number;
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

// Forwards first, then defense, then goalies
const POSITION_ORDER: Record<string, number> = { C: 0, L: 0, R: 0, D: 1, G: 2 };
const byPosition = (a: Swede, b: Swede) => (POSITION_ORDER[a.position] ?? 0) - (POSITION_ORDER[b.position] ?? 0);

const TeamSwedes = ({ teamAbbr, swedes }: { teamAbbr: string; swedes: Swede[] }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <TeamLogo teamAbbr={teamAbbr} size="sm" className="!h-6 !w-6" />
      <span className="text-sm font-semibold text-foreground">{teamAbbr}</span>
    </div>
    {swedes.length === 0 ? (
      <p className="text-sm text-muted-foreground">No Swedish players</p>
    ) : (
      <ul className="space-y-1">
        {swedes.map((swede) => (
          <li key={swede.id}>
            <Link
              to={`/player/${swede.id}`}
              className="flex items-center gap-2 rounded-md px-1 py-1 transition-colors hover:bg-muted"
            >
              <PlayerHeadshot playerId={swede.id} playerName={swede.name} teamAbbr={teamAbbr} size="sm" />
              <span className="flex-1 truncate text-sm font-medium text-foreground">{swede.name}</span>
              <span className="text-xs text-muted-foreground">
                {swede.position} #{swede.jerseyNumber}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const UpcomingGamesStrip = ({ games }: UpcomingGamesStripProps) => {
  const { data: players } = useSwedishPlayers();
  const { data: goalies } = useSwedishGoalies();

  // Swedish players per team for the current season
  const swedesByTeam = useMemo(() => {
    const byTeam: Record<string, Swede[]> = {};
    for (const { id, name, teamAbbr, position, jerseyNumber } of players ?? []) {
      (byTeam[teamAbbr] ??= []).push({ id, name, position, jerseyNumber });
    }
    for (const { id, name, teamAbbr, jerseyNumber } of goalies ?? []) {
      (byTeam[teamAbbr] ??= []).push({ id, name, position: 'G', jerseyNumber });
    }
    for (const swedes of Object.values(byTeam)) swedes.sort(byPosition);
    return byTeam;
  }, [players, goalies]);

  if (games.length === 0) return null;

  return (
    <section className="mb-8 space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Tonight</h2>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2">
        {games.map((game) => {
          const awaySwedes = swedesByTeam[game.awayTeamAbbr] ?? [];
          const homeSwedes = swedesByTeam[game.homeTeamAbbr] ?? [];
          const swedeCount = awaySwedes.length + homeSwedes.length;

          return (
            <Popover key={game.id}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="shrink-0 snap-start rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`${game.awayTeamAbbr} at ${game.homeTeamAbbr}: show Swedish players`}
                >
                  <Card className="flex h-full flex-col items-center gap-2 px-4 py-3 transition-shadow hover:shadow-md">
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
                    {swedeCount > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {swedeCount} Swede{swedeCount !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </Card>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 space-y-4" collisionPadding={16}>
                <TeamSwedes teamAbbr={game.awayTeamAbbr} swedes={awaySwedes} />
                <TeamSwedes teamAbbr={game.homeTeamAbbr} swedes={homeSwedes} />
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </section>
  );
};

export default UpcomingGamesStrip;
