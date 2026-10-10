import { Link } from 'react-router-dom';
import { Game, GamePoint, GoaliePerformance } from '@/types/nhl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MaterialIcon from '@/components/ui/material-icon';
import TeamLogo from './TeamLogo';
import PlayerHeadshot from './PlayerHeadshot';
import LazyYouTubeEmbed from './LazyYouTubeEmbed';
import { useSpoiler } from '@/contexts/SpoilerContext';
import { getTeamColor, getTeamBackgroundColor } from '@/lib/teamColors';
import { useI18n } from '@/i18n';

interface GameCardProps {
  game: Game;
}

const GameCard = ({
  game
}: GameCardProps) => {
  const { spoilerMode, isGameRevealed, revealGame } = useSpoiler();
  const { t, locale } = useI18n();
  
  // Show details if card is revealed (persisted) OR if global spoiler mode is off
  const showDetails = isGameRevealed(game.id) || !spoilerMode;
  const hasSwedishContribution = game.swedishPoints.length > 0 || game.swedishGoalies.length > 0;
  const gameDate = new Date(game.date);
  
  return <Card className={`h-full overflow-hidden transition-all hover:shadow-lg ${hasSwedishContribution ? 'ring-2 ring-accent' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={game.status === 'final' ? 'secondary' : 'default'} className="uppercase text-xs">
              {t(`game.status.${game.status}`)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {gameDate.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Embedded YouTube Highlight Video - Always visible regardless of spoiler mode */}
        {game.highlightVideoId && (
          <div className="relative">
            <div className="aspect-video rounded-lg overflow-hidden bg-muted">
              <LazyYouTubeEmbed
                videoId={game.highlightVideoId}
                title={t('game.highlights', { away: game.awayTeamAbbr, home: game.homeTeamAbbr })}
              />
            </div>
          </div>
        )}

        {/* Score Display */}
        <div className="flex flex-col items-center rounded-xl bg-muted/50 py-4">
          <div className="flex items-center justify-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <TeamLogo teamAbbr={game.awayTeamAbbr} size="lg" />
              <span className="text-lg font-bold text-foreground">{game.awayTeamAbbr}</span>
            </div>
            {/* While hidden, the blurred score is kept away from screen readers so it isn't read out */}
            <div className="flex items-center gap-3">
              {!showDetails && <span className="sr-only">{t('game.scoreHidden')}</span>}
              <span aria-hidden={!showDetails || undefined} className={`text-4xl font-bold text-foreground ${!showDetails ? 'blur-md select-none' : ''}`}>
                {game.awayScore}
              </span>
              <span aria-hidden={!showDetails || undefined} className="text-2xl text-muted-foreground">-</span>
              <span aria-hidden={!showDetails || undefined} className={`text-4xl font-bold text-foreground ${!showDetails ? 'blur-md select-none' : ''}`}>
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
            <span aria-hidden={!showDetails || undefined} className={`mt-1 text-sm font-medium text-muted-foreground ${!showDetails ? 'blur-md select-none' : ''}`}>
              {t(`game.overtime.${game.overtimeType}`)}
            </span>
          )}
        </div>

        {/* Spoiler Mode Hidden Content */}
        {!showDetails ? (
          <div className="rounded-lg bg-muted/30 py-4 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MaterialIcon name="visibility_off" size="sm" />
              <span className="text-sm">{t('game.spoilerOn')}</span>
            </div>
            <Button
              size="sm"
              onClick={() => revealGame(game.id)}
              aria-label={t('game.revealLabel', { away: game.awayTeamAbbr, home: game.homeTeamAbbr })}
            >
              <MaterialIcon name="visibility" size="sm" />
              {t('game.reveal')}
            </Button>
          </div>
        ) : (
          <>
            {game.status === 'final' && game.impact && game.impact.total > 0 && <ImpactMeter impact={game.impact} />}

            {/* Swedish Points */}
            {/* The Impact bar above already sums these up, so the list has no heading of its own */}
            {game.swedishPoints.length > 0 && <div className="space-y-2" role="group" aria-label={t('game.swedishPoints')}>
                {game.swedishPoints.map((point, index) => <PointItem key={index} point={point} />)}
              </div>}

            {/* Swedish Goalies - only show goalies who actually played (have saves) */}
            {game.swedishGoalies.filter(g => g.saves > 0).length > 0 && <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="sports" size="sm" className="text-accent-foreground" />
                  <span className="text-sm font-semibold text-foreground">{t('game.swedishGoalies')}</span>
                </div>
                <div className="space-y-2">
                  {game.swedishGoalies.filter(g => g.saves > 0).map((goalie, index) => <GoalieItem key={index} goalie={goalie} />)}
                </div>
              </div>}

            {/* No Swedish Contribution */}
            {!hasSwedishContribution && <div className="rounded-lg bg-muted/30 py-3 text-center">
                <span className="text-sm text-muted-foreground">{t('game.noSwedishPoints')}</span>
              </div>}
          </>
        )}
      </CardContent>
    </Card>;
};
// Share of the game's points (goals + assists, both teams) made by Swedish players,
// split into Swedish goals (blue) and assists (yellow). The split is also written out
// under the bar, so it doesn't rely on color alone.
const ImpactMeter = ({
  impact
}: {
  impact: NonNullable<Game['impact']>;
}) => {
  const { t } = useI18n();
  const swedish = impact.goals + impact.assists;
  const percent = Math.round((swedish / impact.total) * 100);
  const width = (count: number) => `${(count / impact.total) * 100}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold text-foreground">{t('game.impact')}</span>
        <span className="text-sm text-muted-foreground">
          {t('game.impactSummary', { swedish, total: impact.total })} · <span className="font-semibold text-foreground">{percent}%</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={t('game.impactLabel')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full bg-[hsl(var(--goal))]" style={{ width: width(impact.goals) }} />
        <div className="h-full bg-[hsl(var(--assist))]" style={{ width: width(impact.assists) }} />
      </div>
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[hsl(var(--goal))]" />
          {t('count.goals', { count: impact.goals })}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[hsl(var(--assist))]" />
          {t('count.assists', { count: impact.assists })}
        </span>
      </div>
    </div>
  );
};
const PointItem = ({
  point
}: {
  point: GamePoint;
}) => {
  const { t, path } = useI18n();
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
      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 leading-none ${isGoal ? 'bg-[hsl(var(--goal))] text-[hsl(var(--goal-foreground))]' : 'bg-[hsl(var(--assist))] text-[hsl(var(--assist-foreground))]'}`}>
        {isGoal ? t('game.goalLetter') : t('game.assistLetter')}
      </div>
      <PlayerHeadshot playerId={point.playerId} playerName={point.playerName} teamAbbr={point.playerTeamAbbr} size="sm" />
      <div className="flex flex-col min-w-0">
        <Link to={path(`/player/${point.playerId}`)} className="font-semibold text-foreground hover:text-primary transition-colors truncate">
          {point.playerName}
        </Link>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {point.period >= 4 ? t('period.overtimeShort') : t('period.short', { period: point.period })} • {point.time}
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
  const { t, path, percent } = useI18n();
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
      <div className="flex items-center gap-2 min-w-0">
        <Badge variant={isWin ? 'default' : 'secondary'} className="shrink-0">{t(`game.result.${goalie.result}`)}</Badge>
        <PlayerHeadshot playerId={goalie.goalieId} playerName={goalie.goalieName} teamAbbr={goalie.teamAbbr} size="sm" />
        <div className="flex flex-col min-w-0">
          <Link to={path(`/player/${goalie.goalieId}`)} className="font-semibold text-foreground hover:text-primary transition-colors leading-tight">
            {goalie.goalieName}
          </Link>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t('game.saves', { saves: goalie.saves, shots: goalie.shotsAgainst })}
          </span>
        </div>
      </div>
      <div className="flex flex-col shrink-0 pl-2 text-right">
        <span className="text-lg font-bold text-foreground">{percent(goalie.savePercentage)}</span>
        <span className="text-xs text-muted-foreground">{t('stat.svPct')}</span>
      </div>
    </div>
  );
};

export default GameCard;