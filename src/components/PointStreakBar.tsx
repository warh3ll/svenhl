import { Link } from 'react-router-dom';
import MaterialIcon from '@/components/ui/material-icon';
import TeamLogo from './TeamLogo';
import { useSwedishPlayers } from '@/hooks/useNHLData';
import { useSpoiler } from '@/contexts/SpoilerContext';
import { useI18n } from '@/i18n';

// Shortest streak worth showing
const MIN_STREAK = 2;

// One-line band of Swedes with a point in each of their latest games, longest streak first
const PointStreakBar = () => {
  const { data: players } = useSwedishPlayers();
  const { spoilerMode } = useSpoiler();
  const { t, path } = useI18n();

  // A streak gives away whether a player scored in the latest games
  if (spoilerMode) return null;

  const streaks = (players ?? [])
    .filter((player) => (player.pointStreak ?? 0) >= MIN_STREAK)
    .sort((a, b) => (b.pointStreak ?? 0) - (a.pointStreak ?? 0) || b.points - a.points);
  if (streaks.length === 0) return null;

  return (
    <section
      aria-labelledby="point-streaks-heading"
      className="relative left-1/2 right-1/2 -mx-[50vw] -mt-4 mb-8 w-screen border-y border-border/50 bg-streak text-foreground"
    >
      <div className="container flex items-center gap-2 py-2 sm:gap-4">
        <h2
          id="point-streaks-heading"
          className="flex shrink-0 items-center gap-1 text-sm font-bold text-streak-foreground"
        >
          <MaterialIcon name="local_fire_department" size="md" />
          {/* Icon only on phones, so a player fits next to it */}
          <span className="sr-only sm:not-sr-only">{t('streak.label')}</span>
        </h2>
        {/* Scrolls sideways, out to the screen edge like the games above */}
        <ul className="-my-1 -mr-8 flex min-w-0 flex-1 gap-1 overflow-x-auto py-1 pr-8">
          {streaks.map((player) => (
            <li key={player.id} className="shrink-0">
              <Link
                to={path(`/player/${player.id}`)}
                aria-label={t('streak.player', { name: player.name, count: player.pointStreak })}
                className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <TeamLogo teamAbbr={player.teamAbbr} size="sm" className="!h-5 !w-5" />
                <span className="font-medium">{player.name}</span>
                <span className="tabular-nums text-streak-foreground">
                  {t('streak.games', { count: player.pointStreak })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PointStreakBar;
