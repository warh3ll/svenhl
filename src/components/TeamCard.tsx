import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import TeamLogo from '@/components/TeamLogo';
import PlayerHeadshot from '@/components/PlayerHeadshot';
import { getTeamColor, getTeamBackgroundColor } from '@/lib/teamColors';
import { SwedishPlayer, SwedishGoalie } from '@/types/nhl';
import { cn } from '@/lib/utils';

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
  UTA: 'Utah Hockey Club',
  VAN: 'Vancouver Canucks',
  VGK: 'Vegas Golden Knights',
  WSH: 'Washington Capitals',
  WPG: 'Winnipeg Jets',
};

interface TeamCardProps {
  teamAbbr: string;
  players: SwedishPlayer[];
  goalies: SwedishGoalie[];
}

const TeamCard = ({ teamAbbr, players, goalies }: TeamCardProps) => {
  const teamColor = getTeamColor(teamAbbr);
  const teamName = TEAM_NAMES[teamAbbr] || teamAbbr;
  const bgColor = getTeamBackgroundColor(teamAbbr, 0.08);

  // Sort players by points (desc), goalies by wins (desc)
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
  const sortedGoalies = [...goalies].sort((a, b) => b.wins - a.wins);

  return (
    <Card 
      className="overflow-hidden transition-shadow hover:shadow-lg"
      style={{ borderLeftWidth: '4px', borderLeftColor: teamColor.primary }}
    >
      <Link to={`/teams/${teamAbbr}`}>
        <CardHeader 
          className="flex flex-row items-center gap-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
          style={{ backgroundColor: bgColor }}
        >
          <TeamLogo teamAbbr={teamAbbr} size="lg" />
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-foreground">{teamName}</h3>
            <span className="text-sm text-muted-foreground">
              {sortedPlayers.length + sortedGoalies.length} Swedish player{sortedPlayers.length + sortedGoalies.length !== 1 ? 's' : ''}
            </span>
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {sortedPlayers.map((player) => (
            <Link
              key={player.id}
              to={`/player/${player.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <span className={cn(
                "w-8 text-center text-xs font-semibold rounded px-1.5 py-0.5",
                "bg-muted text-muted-foreground"
              )}>
                {player.position}
              </span>
              <PlayerHeadshot 
                playerId={player.id} 
                playerName={player.name} 
                teamAbbr={teamAbbr}
                size="sm" 
              />
              <span className="flex-1 font-medium text-foreground truncate">
                {player.name}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {player.points} pts
              </span>
            </Link>
          ))}
          {sortedGoalies.map((goalie) => (
            <Link
              key={goalie.id}
              to={`/player/${goalie.id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
            >
              <span className={cn(
                "w-8 text-center text-xs font-semibold rounded px-1.5 py-0.5",
                "bg-primary/20 text-primary"
              )}>
                G
              </span>
              <PlayerHeadshot 
                playerId={goalie.id} 
                playerName={goalie.name} 
                teamAbbr={teamAbbr}
                size="sm" 
              />
              <span className="flex-1 font-medium text-foreground truncate">
                {goalie.name}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {(goalie.savePercentage * 100).toFixed(1)}%
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;
