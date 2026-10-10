import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlayerHeadshot from './PlayerHeadshot';
import TeamLogo from './TeamLogo';
import { Game } from '@/types/nhl';
import MaterialIcon from '@/components/ui/material-icon';
import { useI18n } from '@/i18n';
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
  const { t, path } = useI18n();
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
    return <div className="mb-8 min-h-[360px] lg:min-h-[192px]">
        <div className="flex items-center justify-center gap-2 mb-6">
          <MaterialIcon name="emoji_events" size="lg" className="text-[hsl(var(--sweden-yellow))]" />
          <h2 className="text-2xl font-bold text-foreground">{t('topWeek.heading')}</h2>
        </div>
        <p className="text-center text-muted-foreground">{t('topWeek.empty')}</p>
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
  return <div className="mb-8 rounded-xl p-4 sm:p-6 bg-primary-foreground shadow-none">
      <div className="flex items-center justify-center gap-2 mb-4">
        <MaterialIcon name="emoji_events" size="lg" className="text-[hsl(var(--sweden-yellow))]" />
        <h2 className="text-2xl font-bold text-foreground">{t('topWeek.heading')}</h2>
      </div>
      
      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        {topPlayers.map((player, index) => <Link key={player.playerId} to={path(`/player/${player.playerId}`)} className={`group flex items-center gap-3 rounded-xl p-3 transition-all hover:shadow-lg sm:gap-4 sm:p-4 ${getRankStyles(index)}`}>
            {/* Headshot with rank medal */}
            <div className="relative shrink-0">
              <PlayerHeadshot playerId={player.playerId} playerName={player.playerName} teamAbbr={player.teamAbbr} size="lg" priority={index === 0} // First player gets priority for LCP
          className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/20 transition-all sm:h-16 sm:w-16" />
              <span className="absolute -bottom-1 -left-1 text-lg leading-none" aria-hidden="true">
                {getRankBadge(index)}
              </span>
            </div>
            
            {/* Name + team */}
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base leading-tight text-foreground group-hover:text-primary transition-colors sm:text-lg">
                {player.playerName}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <TeamLogo teamAbbr={player.teamAbbr} size="sm" className="h-5 w-5" />
                <span className="text-sm text-muted-foreground">{player.teamAbbr}</span>
              </div>
            </div>
            
            {/* Points + goals/assists */}
            <div className="flex shrink-0 items-center gap-3">
              <div className="text-center">
                <span className="block text-2xl font-bold leading-none text-primary sm:text-3xl">{player.points}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide sm:text-xs">{t('topWeek.points')}</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="rounded-full bg-[hsl(var(--goal))] px-2 text-sm font-semibold text-[hsl(var(--goal-foreground))]">{player.goals}{t('game.goalLetter')}</span>
                <span className="rounded-full bg-[hsl(var(--assist))] px-2 text-sm font-semibold text-[hsl(var(--assist-foreground))]">{player.assists}{t('game.assistLetter')}</span>
              </div>
            </div>
          </Link>)}
      </div>
    </div>;
};
export default TopPlayersOfWeek;