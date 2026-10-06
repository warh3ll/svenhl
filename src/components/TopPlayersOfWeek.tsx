import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlayerHeadshot from './PlayerHeadshot';
import TeamLogo from './TeamLogo';
import { Game } from '@/types/nhl';
import MaterialIcon from '@/components/ui/material-icon';
interface TopPlayer {
  playerId: string;
  playerName: string;
  teamAbbr: string;
  goals: number;
  assists: number;
  points: number;
}
interface TopPlayersOfWeekProps {
  games: Game[];
}
const TopPlayersOfWeek = ({
  games
}: TopPlayersOfWeekProps) => {
  const topPlayers = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Filter games from last 7 days
    const recentGames = games.filter(game => {
      const gameDate = new Date(game.date);
      return gameDate >= sevenDaysAgo;
    });

    // Aggregate points by player
    const playerStats: Record<string, TopPlayer> = {};
    recentGames.forEach(game => {
      game.swedishPoints.forEach(point => {
        const key = point.playerId;
        if (!playerStats[key]) {
          playerStats[key] = {
            playerId: point.playerId,
            playerName: point.playerName,
            teamAbbr: point.playerTeamAbbr || '',
            goals: 0,
            assists: 0,
            points: 0
          };
        }
        if (point.type === 'goal') {
          playerStats[key].goals += 1;
        } else {
          playerStats[key].assists += 1;
        }
        playerStats[key].points += 1;

        // Update team abbr if we get a valid one
        if (point.playerTeamAbbr) {
          playerStats[key].teamAbbr = point.playerTeamAbbr;
        }
      });
    });

    // Sort by points (desc) and return top 3
    return Object.values(playerStats).sort((a, b) => b.points - a.points || b.goals - a.goals).slice(0, 3);
  }, [games]);
  // "Elias Pettersson" -> "E. Pettersson", used where space is tight (mobile)
  const shortName = (name: string) => {
    const [first, ...rest] = name.split(' ');
    return rest.length > 0 ? `${first[0]}. ${rest.join(' ')}` : name;
  };

  const heading = <div className="flex items-center justify-center gap-2 mb-4">
      <MaterialIcon name="emoji_events" size="md" className="text-[hsl(var(--sweden-yellow))]" />
      <h2 className="text-xl font-bold text-foreground sm:text-2xl">Top 3 of the Week</h2>
    </div>;

  if (topPlayers.length === 0) {
    return <div className="mb-8">
        {heading}
        <p className="text-center text-muted-foreground">No points recorded in the last 7 days</p>
      </div>;
  }
  const getRankStyles = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-[hsl(var(--sweden-yellow))/0.05]';
      case 1:
        return 'bg-muted/30';
      case 2:
        return 'bg-[hsl(var(--sweden-blue))/0.05]';
      default:
        return 'bg-card';
    }
  };
  const getRankBadge = (index: number) => {
    const badges = ['🥇', '🥈', '🥉'];
    return badges[index] || '';
  };
  return <div className="mb-8 rounded-xl bg-primary-foreground p-3 sm:p-5">
      {heading}

      {/* Always three columns, so all three players fit side by side on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {topPlayers.map((player, index) => <Link key={player.playerId} to={`/player/${player.playerId}`} className={`group flex min-w-0 flex-col items-center rounded-xl px-1 py-3 text-center transition-all hover:shadow-lg sm:px-4 sm:py-4 ${getRankStyles(index)}`}>
            {/* Headshot with rank medal on its corner */}
            <div className="relative">
              <PlayerHeadshot playerId={player.playerId} playerName={player.playerName} teamAbbr={player.teamAbbr} size="lg" priority={index === 0} // First player gets priority for LCP
          className="h-14 w-14 ring-2 ring-border transition-all group-hover:ring-primary/20 sm:h-20 sm:w-20 sm:ring-4" />
              <span className="absolute -left-1 -top-1 text-lg leading-none sm:text-2xl">{getRankBadge(index)}</span>
            </div>

            {/* Name: initial + last name on mobile, full name from sm up */}
            <h3 className="mt-2 line-clamp-2 w-full break-words text-xs font-bold leading-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
              <span className="sm:hidden">{shortName(player.playerName)}</span>
              <span className="hidden sm:inline">{player.playerName}</span>
            </h3>

            {/* Team */}
            <div className="mt-1 flex items-center justify-center gap-1">
              <TeamLogo teamAbbr={player.teamAbbr} size="sm" className="!h-4 !w-4 sm:!h-5 sm:!w-5" />
              <span className="text-xs text-muted-foreground">{player.teamAbbr}</span>
            </div>

            {/* Points, then goals/assists */}
            <div className="mt-2 flex flex-col items-center sm:flex-row sm:items-baseline sm:gap-3">
              <span className="text-2xl font-bold leading-none text-primary sm:text-3xl">
                {player.points}
                <span className="ml-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">pts</span>
              </span>
              <span className="mt-1 text-xs font-semibold sm:mt-0 sm:text-sm">
                <span className="text-[hsl(var(--goal))]">{player.goals}G</span>{' '}
                <span className="text-[hsl(var(--assist))]">{player.assists}A</span>
              </span>
            </div>
          </Link>)}
      </div>
    </div>;
};
export default TopPlayersOfWeek;