import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import MaterialIcon from '@/components/ui/material-icon';
import PlayerHeadshot from './PlayerHeadshot';
import TeamLogo from './TeamLogo';
import { useSpoiler } from '@/contexts/SpoilerContext';
import { Game } from '@/types/nhl';
import { useI18n } from '@/i18n';

// How long the card celebrates a first goal, counted from the game's start time
const SHOW_FOR_MS = 48 * 60 * 60 * 1000;

interface FirstGoal {
  playerId: string;
  playerName: string;
  teamAbbr: string;
  opponentAbbr: string;
  gameId: string;
  date: string;
}

interface FirstGoalCardProps {
  games: Game[];
}

// Small celebration under Top 3 of the Week for Swedes who scored their first NHL goal in the last 48 hours.
// Hidden when there are none. In spoiler mode (Hide Scores) it only shows goals from games the visitor revealed.
const FirstGoalCard = ({ games }: FirstGoalCardProps) => {
  const { t, path, locale } = useI18n();
  const { spoilerMode, isGameRevealed } = useSpoiler();

  const firstGoals = useMemo(() => {
    const since = Date.now() - SHOW_FOR_MS;
    const found = new Map<string, FirstGoal>();
    for (const game of games) {
      if (game.status !== 'final' || new Date(game.date).getTime() < since) continue;
      for (const point of game.swedishPoints) {
        if (!point.firstNhlGoal || found.has(point.playerId)) continue;
        const teamAbbr = point.playerTeamAbbr || '';
        found.set(point.playerId, {
          playerId: point.playerId,
          playerName: point.playerName,
          teamAbbr,
          opponentAbbr: teamAbbr === game.homeTeamAbbr ? game.awayTeamAbbr : game.homeTeamAbbr,
          gameId: game.id,
          date: game.date,
        });
      }
    }
    // Newest first
    return [...found.values()].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [games]);

  const visible = firstGoals.filter((goal) => !spoilerMode || isGameRevealed(goal.gameId));
  if (visible.length === 0) return null;

  return (
    <section
      aria-labelledby="first-goal-heading"
      className="-mt-4 mb-8 flex flex-col gap-3 rounded-xl bg-first-goal p-4 text-foreground sm:flex-row sm:items-center sm:gap-6 sm:px-6"
    >
      <h2
        id="first-goal-heading"
        className="flex shrink-0 items-center gap-2 text-base font-bold text-first-goal-foreground"
      >
        <MaterialIcon name="celebration" size="lg" />
        {t('firstGoal.heading', { count: visible.length })}
      </h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-3">
        {visible.map((goal) => {
          const date = new Date(goal.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' }).replace('.', '');
          return (
            <li key={goal.playerId}>
              <Link
                to={path(`/player/${goal.playerId}`)}
                aria-label={t('firstGoal.player', { name: goal.playerName, team: goal.opponentAbbr, date })}
                className="group flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PlayerHeadshot
                  playerId={goal.playerId}
                  playerName={goal.playerName}
                  teamAbbr={goal.teamAbbr}
                  size="md"
                  className="ring-2 ring-background"
                />
                <span className="min-w-0">
                  <span className="block font-bold leading-tight transition-colors group-hover:text-primary">
                    {goal.playerName}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <TeamLogo teamAbbr={goal.teamAbbr} size="sm" className="!h-4 !w-4" />
                    {t('firstGoal.against', { team: goal.opponentAbbr })} · {date}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default FirstGoalCard;
