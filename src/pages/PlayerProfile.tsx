import { useParams, Link } from 'react-router-dom';
import type { CareerSeasonStats, PlayerGameLogEntry } from '@/types/nhl';
import { usePlayer, useGoalie, usePlayerGameLog, usePlayerCareerStats } from '@/hooks/useNHLData';
import { CURRENT_SEASON, formatSeason } from '@/lib/season';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import MaterialIcon from '@/components/ui/material-icon';
import TeamLogo from '@/components/TeamLogo';
import { getTeamBackgroundColor } from '@/lib/teamColors';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';
import { useI18n } from '@/i18n';

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  
  const { data: player, isLoading: playerLoading } = usePlayer(playerId || '');
  const { data: goalie, isLoading: goalieLoading } = useGoalie(playerId || '');
  const { data: gameLog, isLoading: gameLogLoading } = usePlayerGameLog(playerId || '');
  const { data: careerStats, isLoading: careerLoading } = usePlayerCareerStats(playerId || '');
  const { t, path, decimal, percent } = useI18n();

  const isLoading = playerLoading && goalieLoading;
  const isGoalie = !player && goalie;
  const currentPlayer = player || goalie;
  // Season of the stats row shown (the player's most recent season on record)
  const playerSeason = currentPlayer?.season ?? CURRENT_SEASON;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>{t('player.loadingTitle')}</title></Helmet>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none container py-8 space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-60 w-full" />
        </main>
      </div>
    );
  }

  if (!currentPlayer) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>{t('player.notFoundTitle')}</title></Helmet>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">{t('player.notFound')}</h1>
            <p className="text-muted-foreground mb-4">{t('player.notFoundText')}</p>
            <Link to={path('/statistics')} className="text-primary hover:underline">
              {t('player.backToStatistics')}
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const currentTeam = currentPlayer.teamAbbr.split(',').pop() || currentPlayer.teamAbbr;
  const position = isGoalie ? 'G' : player?.position ?? '';

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('seo.player.title', { name: currentPlayer.name })}
        description={t('seo.player.description', { name: currentPlayer.name, team: currentPlayer.team })}
        path={`/player/${playerId}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: currentPlayer.name,
          nationality: 'Swedish',
          jobTitle: isGoalie ? t('seo.player.jobTitleGoalie') : t('seo.player.jobTitle'),
          memberOf: { '@type': 'SportsTeam', name: currentPlayer.team },
        }}
      />
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero: team-tinted band with an oversized jersey number behind the headshot */}
        <section
          className="relative overflow-hidden border-b"
          style={{
            backgroundImage: `linear-gradient(120deg, ${getTeamBackgroundColor(currentTeam, 0.16)}, ${getTeamBackgroundColor(currentTeam, 0.03)} 70%)`,
          }}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 top-1/2 -translate-y-1/2 select-none text-[12rem] font-black leading-none tracking-tighter tabular-nums sm:right-8 sm:text-[20rem]"
            style={{ color: getTeamBackgroundColor(currentTeam, 0.1) }}
          >
            {currentPlayer.jerseyNumber}
          </span>
          <div className="container relative pt-6">
            <Link
              to={path('/statistics')}
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MaterialIcon name="arrow_back" size="sm" />
              {t('player.statistics')}
            </Link>
            <div className="mt-2 flex items-end gap-4 sm:gap-8">
              <div className="relative h-32 w-32 shrink-0 sm:h-52 sm:w-52">
                <img
                  src={`https://assets.nhle.com/mugs/nhl/${playerSeason}/${currentTeam}/${playerId}.png`}
                  alt=""
                  className="h-full w-full object-contain object-bottom"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  <MaterialIcon name={isGoalie ? 'sports' : 'person'} size="xl" className="text-muted-foreground" />
                </div>
              </div>
              <div className="min-w-0 pb-6 sm:pb-10">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                  #{currentPlayer.jerseyNumber} · {position ? t(`position.${position}`) : ''}
                </p>
                <h1 className="mt-1 text-3xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
                  {currentPlayer.name}
                </h1>
                <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
                  <TeamLogo teamAbbr={currentTeam} size="sm" />
                  {currentPlayer.team}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container space-y-12 py-10 sm:space-y-16">
          {/* Current season: a few big numbers, the rest as a quiet strip */}
          <section aria-labelledby="season-heading">
            <SectionHeading id="season-heading">{t('player.season', { season: formatSeason(playerSeason) })}</SectionHeading>
            {isGoalie && goalie ? (
              <>
                <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x">
                  <HeroStat label={t('player.savePct')} value={percent(goalie.savePercentage)} />
                  <HeroStat label={t('player.gaa')} value={decimal(goalie.goalsAgainstAverage, 2)} />
                  <HeroStat label={t('player.wins')} value={goalie.wins} accent="bg-[hsl(var(--positive))]" />
                  <HeroStat label={t('player.shutouts')} value={goalie.shutouts} />
                </dl>
                <SplitBar
                  label={t('player.record')}
                  segments={[
                    { value: goalie.wins, text: t('count.wins', { count: goalie.wins }), className: 'bg-[hsl(var(--positive))]' },
                    { value: goalie.losses, text: t('count.losses', { count: goalie.losses }), className: 'bg-foreground/60' },
                    { value: goalie.overtimeLosses, text: t('count.otLosses', { count: goalie.overtimeLosses }), className: 'bg-foreground/25' },
                  ]}
                />
                <StatStrip
                  stats={[
                    [t('player.games'), goalie.games],
                    [t('player.starts'), goalie.gamesStarted],
                    [t('player.losses'), goalie.losses],
                    [t('player.otLosses'), goalie.overtimeLosses],
                    [t('player.saves'), goalie.saves],
                    [t('player.shotsAgainst'), goalie.shotsAgainst],
                  ]}
                />
              </>
            ) : player ? (
              <>
                <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x">
                  <HeroStat label={t('player.points')} value={player.points} />
                  <HeroStat label={t('player.goals')} value={player.goals} accent="bg-[hsl(var(--goal))]" />
                  <HeroStat label={t('player.assists')} value={player.assists} accent="bg-[hsl(var(--assist))]" />
                  <HeroStat
                    label={t('player.plusMinus')}
                    value={player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                    accent={player.plusMinus >= 0 ? 'bg-[hsl(var(--positive))]' : 'bg-destructive'}
                  />
                </dl>
                <SplitBar
                  label={t('player.pointsSplit')}
                  segments={[
                    { value: player.goals, text: t('count.goals', { count: player.goals }), className: 'bg-[hsl(var(--goal))]' },
                    { value: player.assists, text: t('count.assists', { count: player.assists }), className: 'bg-[hsl(var(--assist))]' },
                  ]}
                />
                <StatStrip
                  stats={[
                    [t('player.games'), player.games],
                    [t('player.toi'), player.timeOnIce],
                    [t('player.shots'), player.shots],
                    [t('player.shooting'), percent(player.shootingPct / 100)],
                    [t('player.ppGoals'), player.powerPlayGoals],
                    [t('player.ppPoints'), player.powerPlayPoints],
                    [t('player.gwGoals'), player.gameWinningGoals],
                    [t('player.pim'), player.penaltyMinutes],
                  ]}
                />
              </>
            ) : null}
          </section>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            {/* Game Log */}
            <section aria-labelledby="points-heading">
              <SectionHeading id="points-heading">{t('player.recentPoints')}</SectionHeading>
              {gameLogLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : gameLog && gameLog.length > 0 ? (
                <PointsByGame entries={gameLog} />
              ) : (
                <p className="py-6 text-muted-foreground">{t('player.noPoints')}</p>
              )}
            </section>

            {/* Career Stats */}
            <section aria-labelledby="career-heading">
              <SectionHeading id="career-heading">{t('player.career')}</SectionHeading>
              {careerLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : careerStats && careerStats.length > 0 ? (
                <CareerTable seasons={careerStats} isGoalie={!!isGoalie} currentSeason={playerSeason} />
              ) : (
                <p className="py-6 text-muted-foreground">{t('player.noCareer')}</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const SectionHeading = ({ id, children }: { id: string; children: React.ReactNode }) => (
  <div className="mb-6 flex items-center gap-4">
    <h2 id={id} className="shrink-0 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
      {children}
    </h2>
    <div aria-hidden="true" className="h-px flex-1 bg-border" />
  </div>
);

// One of the season's headline numbers; the short colored rule ties it to the site's goal/assist colors
const HeroStat = ({ label, value, accent }: { label: string; value: string | number; accent?: string }) => (
  <div className="flex flex-col-reverse sm:px-6 sm:first:pl-0">
    <dt className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
      {accent && <span aria-hidden="true" className={`h-1 w-4 rounded-full ${accent}`} />}
      {label}
    </dt>
    <dd className="text-5xl font-bold leading-none tracking-tight tabular-nums text-foreground sm:text-6xl">{value}</dd>
  </div>
);

// Proportional bar (goals vs assists, or a goalie's record), written out as text below
type Segment = { value: number; text: string; className: string };
const SplitBar = ({ label, segments }: { label: string; segments: Segment[] }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;
  return (
    <div className="mt-8">
      <div aria-hidden="true" className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {segments.filter((s) => s.value > 0).map((s) => (
          <div key={s.className} className={s.className} style={{ flexGrow: s.value }} />
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="sr-only">{label}: </span>
        {segments.map((s) => s.text).join(' · ')}
      </p>
    </div>
  );
};

const StatStrip = ({ stats }: { stats: [string, string | number][] }) => (
  <dl className="mt-8 grid grid-cols-4 gap-x-4 gap-y-5 border-t pt-6 sm:grid-cols-8">
    {stats.map(([label, value]) => (
      <div key={label} className="flex flex-col-reverse">
        <dt className="mt-1 text-xs text-muted-foreground">{label}</dt>
        <dd className="text-lg font-semibold tabular-nums text-foreground">{value}</dd>
      </div>
    ))}
  </dl>
);

// Career seasons as a table, with an inline bar per season (goals/assists, or wins) scaled to the best season
const CareerTable = ({
  seasons,
  isGoalie,
  currentSeason,
}: {
  seasons: CareerSeasonStats[];
  isGoalie: boolean;
  currentSeason: string;
}) => {
  const { t, decimal, percent } = useI18n();
  const max = Math.max(1, ...seasons.map((s) => (isGoalie ? s.wins ?? 0 : s.points ?? 0)));
  const th = 'pb-3 text-left text-xs font-medium text-muted-foreground';
  const td = 'py-3 tabular-nums';
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th scope="col" className={th}>{t('player.careerSeason')}</th>
          <th scope="col" className={`${th} hidden sm:table-cell`}>{t('table.team')}</th>
          <th scope="col" className={`${th} text-right`}>{t('stat.gp')}</th>
          {isGoalie ? (
            <>
              <th scope="col" className={`${th} pl-4`}>{t('player.wins')}</th>
              <th scope="col" className={`${th} text-right`}>{t('stat.svPct')}</th>
              <th scope="col" className={`${th} text-right hidden sm:table-cell`}>{t('stat.gaa')}</th>
            </>
          ) : (
            <>
              <th scope="col" className={`${th} pl-4`}>{t('player.points')}</th>
              <th scope="col" className={`${th} text-right`}>{t('stat.plusMinus')}</th>
              <th scope="col" className={`${th} text-right hidden sm:table-cell`}>{t('stat.pim')}</th>
            </>
          )}
        </tr>
      </thead>
      <tbody className="divide-y">
        {seasons.map((s) => {
          const isCurrent = s.season === currentSeason;
          return (
            <tr key={s.season} className={isCurrent ? 'font-semibold' : undefined}>
              <th scope="row" className={`${td} text-left font-medium`}>
                {formatSeason(s.season)}
                <span className="ml-1.5 text-muted-foreground sm:hidden">{s.teamAbbr}</span>
              </th>
              <td className={`${td} hidden sm:table-cell`}>{s.teamAbbr}</td>
              <td className={`${td} text-right`}>{s.games}</td>
              {isGoalie ? (
                <>
                  <td className={`${td} w-1/2 pl-4`}>
                    <BarCell
                      total={s.wins ?? 0}
                      max={max}
                      segments={[{ value: s.wins ?? 0, className: 'bg-[hsl(var(--positive))]' }]}
                      label={`${s.wins ?? 0}`}
                      srLabel={`${t('count.wins', { count: s.wins ?? 0 })}, ${t('count.losses', { count: s.losses ?? 0 })}`}
                    />
                  </td>
                  <td className={`${td} text-right`}>{percent(s.savePercentage || 0)}</td>
                  <td className={`${td} text-right hidden sm:table-cell`}>{decimal(s.goalsAgainstAverage || 0, 2)}</td>
                </>
              ) : (
                <>
                  <td className={`${td} w-1/2 pl-4`}>
                    <BarCell
                      total={s.points ?? 0}
                      max={max}
                      segments={[
                        { value: s.goals ?? 0, className: 'bg-[hsl(var(--goal))]' },
                        { value: s.assists ?? 0, className: 'bg-[hsl(var(--assist))]' },
                      ]}
                      label={`${s.points ?? 0}`}
                      detail={`${s.goals ?? 0} ${t('game.goalLetter')} · ${s.assists ?? 0} ${t('game.assistLetter')}`}
                      srLabel={`${t('count.points', { count: s.points ?? 0 })}: ${t('count.goals', { count: s.goals ?? 0 })}, ${t('count.assists', { count: s.assists ?? 0 })}`}
                    />
                  </td>
                  <td className={`${td} text-right`}>
                    {(s.plusMinus ?? 0) > 0 ? '+' : ''}
                    {s.plusMinus ?? 0}
                  </td>
                  <td className={`${td} text-right hidden sm:table-cell`}>{s.penaltyMinutes ?? 0}</td>
                </>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const BarCell = ({
  total,
  max,
  segments,
  label,
  detail,
  srLabel,
}: {
  total: number;
  max: number;
  segments: { value: number; className: string }[];
  label: string;
  detail?: string;
  srLabel: string;
}) => (
  <div className="flex items-center gap-3">
    <span aria-hidden="true" className="w-7 shrink-0 text-right font-semibold">{label}</span>
    <div aria-hidden="true" className="flex h-2 flex-1 overflow-hidden rounded-full bg-muted">
      <div className="flex gap-px" style={{ width: `${(total / max) * 100}%` }}>
        {segments.filter((s) => s.value > 0).map((s, i) => (
          <div key={i} className={s.className} style={{ flexGrow: s.value }} />
        ))}
      </div>
    </div>
    {detail && <span aria-hidden="true" className="hidden w-20 shrink-0 text-xs font-normal text-muted-foreground md:inline">{detail}</span>}
    <span className="sr-only">{srLabel}</span>
  </div>
);

// Recent points grouped into one row per game: date, matchup, a chip per point and a G/A summary.
// Goal/assist is spelled out for screen readers and shown as a G/A letter, not by color alone.
const PointsByGame = ({ entries }: { entries: PlayerGameLogEntry[] }) => {
  const { t, locale } = useI18n();
  const games: { gameId: string; entries: PlayerGameLogEntry[] }[] = [];
  for (const entry of entries) {
    const game = games.find((g) => g.gameId === entry.gameId);
    if (game) game.entries.push(entry);
    else games.push({ gameId: entry.gameId, entries: [entry] });
  }

  return (
    <ol className="divide-y" aria-label={t('player.pointsByGame')}>
      {games.map(({ gameId, entries: points }) => {
        const first = points[0];
        const sorted = [...points].sort((a, b) => a.period - b.period || a.time.localeCompare(b.time));
        const goals = points.filter((p) => p.type === 'goal').length;
        const assists = points.length - goals;
        return (
          <li
            key={gameId}
            className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-2 py-3 first:pt-0"
          >
            <time dateTime={first.gameDate} className="row-span-2 flex flex-col items-center leading-none">
              <span className="text-xl font-bold tabular-nums">{new Date(first.gameDate).toLocaleDateString(locale, { day: 'numeric' })}</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {new Date(first.gameDate).toLocaleDateString(locale, { month: 'short' }).replace('.', '')}
              </span>
            </time>
            <span className="font-medium">
              {first.awayTeamAbbr} @ {first.homeTeamAbbr}
            </span>
            <ul className="order-last col-span-2 col-start-2 flex flex-wrap gap-2" aria-label={t('player.pointsInGame')}>
              {sorted.map((point, i) => (
                <PointChip key={i} point={point} />
              ))}
            </ul>
            <span className="text-right text-sm font-semibold tabular-nums whitespace-nowrap">
              <span aria-hidden="true">
                {[goals > 0 && `${goals} ${t('game.goalLetter')}`, assists > 0 && `${assists} ${t('game.assistLetter')}`].filter(Boolean).join(' · ')}
              </span>
              <span className="sr-only">
                {[goals > 0 && t('count.goals', { count: goals }), assists > 0 && t('count.assists', { count: assists })].filter(Boolean).join(', ')}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

const PointChip = ({ point }: { point: PlayerGameLogEntry }) => {
  const { t } = useI18n();
  const isGoal = point.type === 'goal';
  const overtime = point.period >= 4;
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-0.5 pl-0.5 pr-2.5 text-sm">
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold leading-none ${isGoal ? 'bg-[hsl(var(--goal))] text-[hsl(var(--goal-foreground))]' : 'bg-[hsl(var(--assist))] text-[hsl(var(--assist-foreground))]'}`}
      >
        {isGoal ? t('game.goalLetter') : t('game.assistLetter')}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {overtime ? t('period.overtimeShort') : t('period.short', { period: point.period })} <span className="text-muted-foreground">{point.time}</span>
      </span>
      <span className="sr-only">
        {isGoal ? t('player.goal') : t('player.assist')}, {overtime ? t('period.overtimeName') : t('period.name', { period: point.period })}, {point.time}
      </span>
    </li>
  );
};

export default PlayerProfile;
