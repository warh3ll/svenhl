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
  if (topPlayers.length === 0) {
    return <div className="mb-8 min-h-[340px]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <MaterialIcon name="emoji_events" size="lg" className="text-[hsl(var(--sweden-yellow))]" />
          <h2 className="text-2xl font-bold text-foreground">Top 3 of the Week</h2>
        </div>
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
  return <div className="mb-8 min-h-[340px] rounded-xl mx-0 px-[24px] py-[24px] bg-primary-foreground shadow-none">
      <div className="flex items-center justify-center gap-2 mb-6">
        <MaterialIcon name="emoji_events" size="lg" className="text-[hsl(var(--sweden-yellow))]" />
        <h2 className="text-2xl font-bold text-foreground">Top 3 of the Week</h2>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-3">
        {topPlayers.map((player, index) => <Link key={player.playerId} to={`/player/${player.playerId}`} className={`group relative rounded-xl p-6 transition-all hover:shadow-lg ${getRankStyles(index)}`}>
            {/* Rank Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">
              {getRankBadge(index)}
            </div>
            
            {/* Large Headshot */}
            <div className="flex justify-center mb-4">
              <PlayerHeadshot playerId={player.playerId} playerName={player.playerName} teamAbbr={player.teamAbbr} size="lg" priority={index === 0} // First player gets priority for LCP
          className="h-24 w-24 ring-4 ring-border group-hover:ring-primary/20 transition-all" />
            </div>
            
            {/* Player Info */}
            <div className="text-center">
              <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                {player.playerName}
              </h3>
              
              {/* Team Logo + Name */}
              <div className="flex items-center justify-center gap-2 mt-2">
                <TeamLogo teamAbbr={player.teamAbbr} size="sm" className="h-6 w-6" />
                <span className="text-sm text-muted-foreground">{player.teamAbbr}</span>
              </div>
              
              {/* Points Display */}
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="text-center">
                  <span className="block text-3xl font-bold text-primary">{player.points}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Points</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col items-center gap-1">
                  <span className="rounded-full bg-[hsl(var(--goal))] px-2 text-sm font-semibold text-[hsl(var(--goal-foreground))]">{player.goals}G</span>
                  <span className="rounded-full bg-[hsl(var(--assist))] px-2 text-sm font-semibold text-[hsl(var(--assist-foreground))]">{player.assists}A</span>
                </div>
              </div>
            </div>
          </Link>)}
      </div>
    </div>;
};
export default TopPlayersOfWeek;