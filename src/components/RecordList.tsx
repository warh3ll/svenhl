import { Link } from 'react-router-dom';
import MaterialIcon from '@/components/ui/material-icon';
import PlayerHeadshot from './PlayerHeadshot';
import UpdateBadge from './UpdateBadge';
import { useI18n } from '@/i18n';
import { RecordEntry, topRows } from '@/lib/records';
import { useSeenOnHover } from '@/hooks/useRecordUpdates';

// Which entries changed since the visitor last hovered them (current season only)
export interface ListUpdates {
  isUpdated: (id: string) => boolean;
  markSeen: (id: string) => void;
}

interface RecordListProps {
  id: string;
  title: string;
  description: string;
  icon: string;
  // Text key for the value with its unit, e.g. "14 games", read by screen readers in place of the bare number
  unitKey: string;
  entries: RecordEntry[];
  season: string;
  updates?: ListUpdates;
}

// Top 5 Swedes in one stat. Tied players share a rank.
const RecordList = ({ id, title, description, icon, unitKey, entries, season, updates }: RecordListProps) => {
  const { t } = useI18n();
  const { rows, moreTied, cutoff, rank } = topRows(entries);
  // The list's badge stays until every updated entry in it has been hovered
  const listUpdated = !!updates && rows.some((entry) => updates.isUpdated(entry.id));

  return (
    <section aria-labelledby={id} className="rounded-xl bg-primary-foreground p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-2">
        <MaterialIcon name={icon} size="lg" className="mt-0.5 shrink-0 text-[hsl(var(--goal))]" />
        <div>
          <h3 id={id} className="flex items-center gap-2 text-lg font-bold leading-tight text-foreground">
            {title}
            {listUpdated && <UpdateBadge label={t('records.updates.list')} />}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t('records.empty')}</p>
      ) : (
        <ol className="space-y-1">
          {rows.map((entry) => (
            <RecordRow
              key={entry.id}
              entry={entry}
              rank={rank(entry.value)}
              unitKey={unitKey}
              season={season}
              updated={!!updates?.isUpdated(entry.id)}
              onSeen={() => updates?.markSeen(entry.id)}
            />
          ))}
        </ol>
      )}

      {moreTied > 0 && (
        <p className="mt-2 px-2 text-sm text-muted-foreground">
          {t('records.moreTied', { count: moreTied, value: cutoff })}
        </p>
      )}
    </section>
  );
};

interface RecordRowProps {
  entry: RecordEntry;
  rank: number;
  unitKey: string;
  season: string;
  updated: boolean;
  onSeen: () => void;
}

const RecordRow = ({ entry, rank, unitKey, season, updated, onSeen }: RecordRowProps) => {
  const { t, path } = useI18n();
  const seenProps = useSeenOnHover<HTMLAnchorElement>(updated, onSeen);

  return (
    <li>
      <Link
        to={path(`/player/${entry.id}`)}
        {...seenProps}
        className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
          {rank}
        </span>
        <PlayerHeadshot
          playerId={entry.id}
          playerName={entry.name}
          teamAbbr={entry.teamAbbr}
          season={season}
          size="sm"
          className="h-9 w-9 shrink-0"
        />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-medium leading-tight text-foreground group-hover:text-primary">
            <span className="truncate">{entry.name}</span>
            {updated && <UpdateBadge label={t('records.updates.entry')} />}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            {entry.teamAbbr}
            {entry.active && (
              <span className="inline-flex items-center gap-0.5 font-medium text-streak-foreground">
                <MaterialIcon name="local_fire_department" size="sm" className="!text-sm" />
                {t('records.active')}
              </span>
            )}
          </span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-2xl font-bold tabular-nums leading-none text-foreground">
          {entry.value}
        </span>
        <span className="sr-only">{t(unitKey, { count: entry.value })}</span>
      </Link>
    </li>
  );
};

export default RecordList;
