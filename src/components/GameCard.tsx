import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Game, GamePoint, GoaliePerformance } from '@/types/nhl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MaterialIcon from '@/components/ui/material-icon';
import { format } from 'date-fns';
import TeamLogo from './TeamLogo';
import PlayerHeadshot from './PlayerHeadshot';
import LazyYouTubeEmbed from './LazyYouTubeEmbed';
import { useSpoiler } from '@/contexts/SpoilerContext';
import { getTeamColor, getTeamBackgroundColor } from '@/lib/teamColors';
import { useReportVideo } from '@/hooks/useNHLData';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface GameCardProps {
  game: Game;
}

const GameCard = ({
  game
}: GameCardProps) => {
  const { spoilerMode, isGameRevealed, revealGame } = useSpoiler();
  const reportVideo = useReportVideo();
  const [isReporting, setIsReporting] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  
  // Show details if card is revealed (persisted) OR if global spoiler mode is off
  const showDetails = isGameRevealed(game.id) || !spoilerMode;
  const hasSwedishContribution = game.swedishPoints.length > 0 || game.swedishGoalies.length > 0;
  const gameDate = new Date(game.date);
  
  const handleReportVideo = () => {
    if (hasReported || isReporting) return;
    setIsReporting(true);
    reportVideo.mutate(game.id, {
      onSuccess: () => setHasReported(true),
      onSettled: () => setIsReporting(false),
    });
  };
  return <Card className={`h-full overflow-hidden transition-all hover:shadow-lg ${hasSwedishContribution ? 'ring-2 ring-accent' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={game.status === 'final' ? 'secondary' : 'default'} className="uppercase text-xs">
              {game.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {format(gameDate, 'MMM d, yyyy • h:mm a')}
            </span>
          </div>
          {/* Show fallback link only if no embedded video */}
          {!game.highlightVideoId && game.highlightUrl && (
            <a href={game.highlightUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors text-primary bg-primary-foreground w-fit">
              <MaterialIcon name="play_arrow" size="sm" />
              Search Highlights
              <MaterialIcon name="open_in_new" size="sm" />
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Embedded YouTube Highlight Video - Always visible regardless of spoiler mode */}
        {game.highlightVideoId && (
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <LazyYouTubeEmbed
                videoId={game.highlightVideoId}
                title={`${game.awayTeamAbbr} vs ${game.homeTeamAbbr} Highlights`}
              />
            </div>
            {/* Report Video Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive disabled:opacity-50"
                  onClick={handleReportVideo}
                  disabled={isReporting || hasReported}
                >
                  <MaterialIcon name={hasReported ? "check" : isReporting ? "hourglass_empty" : "flag"} size="sm" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hasReported ? "Reported" : isReporting ? "Reporting..." : "Report wrong video"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Score Display */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 py-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <TeamLogo teamAbbr={game.awayTeamAbbr} size="lg" />
              <span className="text-lg font-bold text-foreground">{game.awayTeamAbbr}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-4xl font-bold text-foreground ${!showDetails ? 'blur-md select-none' : ''}`}>
                {game.awayScore}
              </span>
              <span className="text-2xl text-muted-foreground">-</span>
              <span className={`text-4xl font-bold text-foreground ${!showDetails ? 'blur-md select-none' : ''}`}>
                {game.homeScore}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <TeamLogo teamAbbr={game.homeTeamAbbr} size="lg" />
              <span className="text-lg font-bold text-foreground">{game.homeTeamAbbr}</span>
            </div>
          </div>
          {/* Overtime/Shootout indicator */}
          {game.overtimeType && (
            <span className={`mt-1 text-sm font-medium text-muted-foreground ${!showDetails ? 'blur-md select-none' : ''}`}>
              {game.overtimeType}
            </span>
          )}
        </div>

        {/* Spoiler Mode Hidden Content */}
        {!showDetails ? (
          <div className="rounded-lg bg-muted/30 py-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MaterialIcon name="visibility_off" size="sm" />
              <span className="text-sm">Spoiler mode enabled - details hidden</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => revealGame(game.id)}
              className="flex items-center gap-2"
            >
              <MaterialIcon name="visibility" size="sm" />
              Reveal Score
            </Button>
          </div>
        ) : (
          <>
            {/* Swedish Points */}
            {game.swedishPoints.length > 0 && <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="sports_hockey" size="sm" className="text-accent-foreground" />
                  <span className="text-sm font-semibold text-foreground">Swedish Points</span>
                  <Badge className="bg-accent text-accent-foreground">{game.swedishPoints.length}</Badge>
                </div>
                <div className="space-y-2">
                  {game.swedishPoints.map((point, index) => <PointItem key={index} point={point} />)}
                </div>
              </div>}

            {/* Swedish Goalies - only show goalies who actually played (have saves) */}
            {game.swedishGoalies.filter(g => g.saves > 0).length > 0 && <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="sports" size="sm" className="text-accent-foreground" />
                  <span className="text-sm font-semibold text-foreground">Swedish Goalies</span>
                </div>
                <div className="space-y-2">
                  {game.swedishGoalies.filter(g => g.saves > 0).map((goalie, index) => <GoalieItem key={index} goalie={goalie} />)}
                </div>
              </div>}

            {/* No Swedish Contribution */}
            {!hasSwedishContribution && <div className="rounded-lg bg-muted/30 py-3 text-center">
                <span className="text-sm text-muted-foreground">No Swedish players scored in this game</span>
              </div>}
          </>
        )}
      </CardContent>
    </Card>;
};
const PointItem = ({
  point
}: {
  point: GamePoint;
}) => {
  const isGoal = point.type === 'goal';
  const teamColor = getTeamColor(point.playerTeamAbbr || '');
  const bgColor = getTeamBackgroundColor(point.playerTeamAbbr || '', 0.1);
  
  return (
    <div 
      className="relative flex items-center gap-2 rounded-lg px-3 py-2 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: teamColor.primary }}
      />
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 leading-none ${isGoal ? 'bg-[hsl(var(--goal))] text-primary-foreground' : 'bg-[hsl(var(--assist))] text-primary-foreground'}`}>
        {isGoal ? 'G' : 'A'}
      </div>
      <PlayerHeadshot playerId={point.playerId} playerName={point.playerName} teamAbbr={point.playerTeamAbbr} size="sm" />
      <div className="flex flex-col min-w-0">
        <Link to={`/player/${point.playerId}`} className="font-semibold text-foreground hover:text-primary transition-colors truncate">
          {point.playerName}
        </Link>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          P{point.period} • {point.time}
        </span>
      </div>
    </div>
  );
};
const GoalieItem = ({
  goalie
}: {
  goalie: GoaliePerformance;
}) => {
  const svPct = (goalie.savePercentage * 100).toFixed(1);
  const isWin = goalie.result === 'W';
  const teamColor = getTeamColor(goalie.teamAbbr);
  const bgColor = getTeamBackgroundColor(goalie.teamAbbr, 0.1);
  
  return (
    <div 
      className="relative flex items-center justify-between rounded-lg px-3 py-2 overflow-hidden"
      style={{ backgroundColor: bgColor }}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-1.5"
        style={{ backgroundColor: teamColor.primary }}
      />
      <div className="flex items-center gap-3">
        <Badge variant={isWin ? 'default' : 'secondary'}>{goalie.result}</Badge>
        <PlayerHeadshot playerId={goalie.goalieId} playerName={goalie.goalieName} teamAbbr={goalie.teamAbbr} size="sm" />
        <div className="flex flex-col">
          <Link to={`/player/${goalie.goalieId}`} className="font-semibold text-foreground hover:text-primary transition-colors">
            {goalie.goalieName}
          </Link>
          <span className="text-xs text-muted-foreground">{goalie.team}</span>
        </div>
      </div>
      <div className="flex items-center gap-4 text-right">
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">{svPct}%</span>
          <span className="text-xs text-muted-foreground">SV%</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">{goalie.saves}/{goalie.shotsAgainst}</span>
          <span className="text-xs text-muted-foreground">Saves</span>
        </div>
      </div>
    </div>
  );
};

export default GameCard;