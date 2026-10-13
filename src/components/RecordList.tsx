import { Link } from 'react-router-dom';
import MaterialIcon from '@/components/ui/material-icon';
import PlayerHeadshot from './PlayerHeadshot';
import { useI18n } from '@/i18n';

export interface RecordEntry {
  id: string;
  name: string;
  teamAbbr: string;
  value: number;
  // The streak is still going
  active?: boolean;
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
}

const TOP = 5;
// Everyone tied for 5th is listed, unless the list would get this long; then the rest is summed up in a line
const MAX_ROWS = 7;

// Top 5 Swedes in one stat. Tied players share a rank.
const RecordList = ({ id, title, description, icon, unitKey, entries, season }: RecordListProps) => {
  const { t, path } = useI18n();

  const sorted = entries
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const cutoff = sorted[Math.min(TOP, sorted.length) - 1]?.value ?? 0;
  const qualified = sorted.filter((entry) => entry.value >= cutoff);
  const rows = qualified.length > MAX_ROWS ? qualified.slice(0, TOP) : qualified;
  // Everyone past the 5th row has the 5th place value
  const moreTied = qualified.length - rows.length;
  const rank = (value: number) => 1 + sorted.filter((entry) => entry.value > value).length;

  return (
    <section aria-labelledby={id} className="rounded-xl bg-primary-foreground p-4 sm:p-5">
      <div className="mb-3 flex items-start gap-2">
        <MaterialIcon name={icon} size="lg" className="mt-0.5 shrink-0 text-[hsl(var(--goal))]" />
        <div>
          <h3 id={id} className="text-lg font-bold leading-tight text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t('records.empty')}</p>
      ) : (
        <ol className="space-y-1">
          {rows.map((entry) => (
            <li key={entry.id}>
              <Link
                to={path(`/player/${entry.id}`)}
                className="group flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors hover:bg-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="w-5 shrink-0 text-right text-sm font-semibold tabular-nums text-muted-foreground">
                  {rank(entry.value)}
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
                  <span className="block truncate font-medium leading-tight text-foreground group-hover:text-primary">
                    {entry.name}
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

export default RecordList;
