import MaterialIcon from '@/components/ui/material-icon';
import TeamLogo from './TeamLogo';
import UpdateBadge from './UpdateBadge';
import { ListUpdates } from './RecordList';
import { useI18n } from '@/i18n';
import { byImpact, impactShare as share, swedishPoints, topImpactGames } from '@/lib/records';
import { useSeenOnHover } from '@/hooks/useRecordUpdates';
import { ImpactRecord } from '@/types/nhl';

// The season's games where Swedes had the biggest share of the points, like the Impact meter on game cards.
// Only games with at least 3 Swedish points are kept (MIN_IMPACT_POINTS in scripts/sync.mjs).
// Stays visible in spoiler mode (Hide Scores): it looks back at the season, like the point streak band.
const ImpactRecordList = ({ games, updates }: { games: ImpactRecord[]; updates?: ListUpdates }) => {
  const { t } = useI18n();

  const rows = topImpactGames(games);
  // Games with the same share and the same Swedish points share a rank
  const rank = (game: ImpactRecord) => 1 + rows.filter((other) => byImpact(other, game) < 0).length;
  const listUpdated = !!updates && rows.some((game) => updates.isUpdated(game.id));

  return (
    <section aria-labelledby="record-impact" className="rounded-xl bg-primary-foreground p-4 sm:p-5 md:col-span-2">
      <div className="mb-3 flex items-start gap-2">
        <MaterialIcon name="flag" size="lg" className="mt-0.5 shrink-0 text-[hsl(var(--goal))]" />
        <div>
          <h3 id="record-impact" className="flex items-center gap-2 text-lg font-bold leading-tight text-foreground">
            {t('records.impact.title')}
            {listUpdated && <UpdateBadge label={t('records.updates.list')} />}
          </h3>
          <p className="text-sm text-muted-foreground">{t('records.impact.description')}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t('records.empty')}</p>
      ) : (
        <ol className="space-y-1">
          {rows.map((game) => (
            <ImpactRow
              key={game.id}
              game={game}
              rank={rank(game)}
              updated={!!updates?.isUpdated(game.id)}
              onSeen={() => updates?.markSeen(game.id)}
            />
          ))}
        </ol>
      )}
    </section>
  );
};

interface ImpactRowProps {
  game: ImpactRecord;
  rank: number;
  updated: boolean;
  onSeen: () => void;
}

const ImpactRow = ({ game, rank, updated, onSeen }: ImpactRowProps) => {
  const { t, locale } = useI18n();
  const seenProps = useSeenOnHover<HTMLLIElement>(updated, onSeen);
  const percent = Math.round(share(game) * 100);
  const width = (count: number) => `${(count / game.total) * 100}%`;

  return (
    <li {...seenProps} className="flex items-center gap-3 rounded-lg px-2 py-2">
      <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <TeamLogo teamAbbr={game.awayTeamAbbr} size="sm" className="!h-6 !w-6" />
            <span className="tabular-nums">
              {game.awayTeamAbbr} {game.awayScore}–{game.homeScore} {game.homeTeamAbbr}
            </span>
            <TeamLogo teamAbbr={game.homeTeamAbbr} size="sm" className="!h-6 !w-6" />
            {game.overtimeType && (
              <span className="text-xs text-muted-foreground">{t(`game.overtime.${game.overtimeType}`)}</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(game.date).toLocaleDateString(locale, { dateStyle: 'medium' })}
          </span>
          {updated && <UpdateBadge label={t('records.updates.entry')} />}
        </div>
        {/* Goals blue, assists yellow, the rest of the game's points grey, as on the game cards */}
        <div className="mt-1.5 flex h-1.5 max-w-xs overflow-hidden rounded-full bg-muted" aria-hidden="true">
          <div className="h-full bg-[hsl(var(--goal))]" style={{ width: width(game.goals) }} />
          <div className="h-full bg-[hsl(var(--assist))]" style={{ width: width(game.assists) }} />
        </div>
        <span className="mt-1 block text-xs text-muted-foreground">
          {t('game.impactSummary', { swedish: swedishPoints(game), total: game.total })} ·{' '}
          {t('count.goals', { count: game.goals })}, {t('count.assists', { count: game.assists })}
        </span>
      </div>
      <span className="shrink-0 text-2xl font-bold tabular-nums leading-none text-foreground">{percent}%</span>
    </li>
  );
};

export default ImpactRecordList;
