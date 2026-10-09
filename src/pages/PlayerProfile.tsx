import { useParams, Link } from 'react-router-dom';
import type { CareerSeasonStats, PlayerGameLogEntry } from '@/types/nhl';
import { usePlayer, useGoalie, usePlayerGameLog, usePlayerCareerStats } from '@/hooks/useNHLData';
import { CURRENT_SEASON, formatSeason } from '@/lib/season';
import Header from '@/components/Header';
import { Skeleton } from '@/components/ui/skeleton';
import MaterialIcon from '@/components/ui/material-icon';
import { format } from 'date-fns';
import TeamLogo from '@/components/TeamLogo';
import { getTeamBackgroundColor } from '@/lib/teamColors';
import SEO from '@/components/SEO';
import { Helmet } from 'react-helmet-async';

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  
  const { data: player, isLoading: playerLoading } = usePlayer(playerId || '');
  const { data: goalie, isLoading: goalieLoading } = useGoalie(playerId || '');
  const { data: gameLog, isLoading: gameLogLoading } = usePlayerGameLog(playerId || '');
  const { data: careerStats, isLoading: careerLoading } = usePlayerCareerStats(playerId || '');

  const isLoading = playerLoading && goalieLoading;
  const isGoalie = !player && goalie;
  const currentPlayer = player || goalie;
  // Season of the stats row shown (the player's most recent season on record)
  const playerSeason = currentPlayer?.season ?? CURRENT_SEASON;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>Loading player | SVENHL</title></Helmet>
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
        <Helmet><title>Player Not Found | SVENHL</title></Helmet>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none container py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-foreground mb-2">Player Not Found</h1>
            <p className="text-muted-foreground mb-4">The player you're looking for doesn't exist.</p>
            <Link to="/statistics" className="text-primary hover:underline">
              ← Back to Statistics
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
        title={`${currentPlayer.name} — Swedish NHL Player Stats | SVENHL`}
        description={`Season statistics, career numbers, and recent games for ${currentPlayer.name} of the ${currentPlayer.team}.`}
        path={`/player/${playerId}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: currentPlayer.name,
          nationality: 'Swedish',
          jobTitle: isGoalie ? 'Goaltender' : 'Hockey Player',
          memberOf: { '@type': 'SportsTeam', name: currentPlayer.team },
          url: `https://svenhl.com/player/${playerId}`,
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
              to="/statistics"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MaterialIcon name="arrow_back" size="sm" />
              Statistics
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
                  #{currentPlayer.jerseyNumber} · {POSITION_NAMES[position] ?? position}
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
            <SectionHeading id="season-heading">{formatSeason(playerSeason)} season</SectionHeading>
            {isGoalie && goalie ? (
              <>
                <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x">
                  <HeroStat label="Save %" value={`${(goalie.savePercentage * 100).toFixed(1)}%`} />
                  <HeroStat label="GAA" value={goalie.goalsAgainstAverage.toFixed(2)} />
                  <HeroStat label="Wins" value={goalie.wins} accent="bg-[hsl(var(--positive))]" />
                  <HeroStat label="Shutouts" value={goalie.shutouts} />
                </dl>
                <SplitBar
                  label="Record"
                  segments={[
                    { value: goalie.wins, name: 'win', className: 'bg-[hsl(var(--positive))]' },
                    { value: goalie.losses, name: 'loss', plural: 'losses', className: 'bg-foreground/60' },
                    { value: goalie.overtimeLosses, name: 'overtime loss', plural: 'overtime losses', className: 'bg-foreground/25' },
                  ]}
                />
                <StatStrip
                  stats={[
                    ['Games', goalie.games],
                    ['Starts', goalie.gamesStarted],
                    ['Losses', goalie.losses],
                    ['OT losses', goalie.overtimeLosses],
                    ['Saves', goalie.saves],
                    ['Shots against', goalie.shotsAgainst],
                  ]}
                />
              </>
            ) : player ? (
              <>
                <dl className="grid grid-cols-2 gap-y-6 sm:grid-cols-4 sm:divide-x">
                  <HeroStat label="Points" value={player.points} />
                  <HeroStat label="Goals" value={player.goals} accent="bg-[hsl(var(--goal))]" />
                  <HeroStat label="Assists" value={player.assists} accent="bg-[hsl(var(--assist))]" />
                  <HeroStat
                    label="Plus/minus"
                    value={player.plusMinus > 0 ? `+${player.plusMinus}` : player.plusMinus}
                    accent={player.plusMinus >= 0 ? 'bg-[hsl(var(--positive))]' : 'bg-destructive'}
                  />
                </dl>
                <SplitBar
                  label="Points split"
                  segments={[
                    { value: player.goals, name: 'goal', className: 'bg-[hsl(var(--goal))]' },
                    { value: player.assists, name: 'assist', className: 'bg-[hsl(var(--assist))]' },
                  ]}
                />
                <StatStrip
                  stats={[
                    ['Games', player.games],
                    ['TOI', player.timeOnIce],
                    ['Shots', player.shots],
                    ['Shooting', `${player.shootingPct.toFixed(1)}%`],
                    ['PP goals', player.powerPlayGoals],
                    ['PP points', player.powerPlayPoints],
                    ['GW goals', player.gameWinningGoals],
                    ['PIM', player.penaltyMinutes],
                  ]}
                />
              </>
            ) : null}
          </section>

          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            {/* Game Log */}
            <section aria-labelledby="points-heading">
              <SectionHeading id="points-heading">Recent points</SectionHeading>
              {gameLogLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : gameLog && gameLog.length > 0 ? (
                <PointsByGame entries={gameLog} />
              ) : (
                <p className="py-6 text-muted-foreground">No recorded points this season yet.</p>
              )}
            </section>

            {/* Career Stats */}
            <section aria-labelledby="career-heading">
              <SectionHeading id="career-heading">Career</SectionHeading>
              {careerLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : careerStats && careerStats.length > 0 ? (
                <CareerTable seasons={careerStats} isGoalie={!!isGoalie} currentSeason={playerSeason} />
              ) : (
                <p className="py-6 text-muted-foreground">No career history available.</p>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

const POSITION_NAMES: Record<string, string> = {
  C: 'Center',
  L: 'Left wing',
  R: 'Right wing',
  D: 'Defense',
  G: 'Goalie',
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
type Segment = { value: number; name: string; plural?: string; className: string };
const SplitBar = ({ label, segments }: { label: string; segments: Segment[] }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) return null;
  return (
    <div className="mt-8">
      <div aria-hidden="true" className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {segments.filter((s) => s.value > 0).map((s) => (
          <div key={s.name} className={s.className} style={{ flexGrow: s.value }} />
        ))}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        <span className="sr-only">{label}: </span>
        {segments.map((s) => `${s.value} ${s.value === 1 ? s.name : s.plural ?? `${s.name}s`}`).join(' · ')}
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
  const max = Math.max(1, ...seasons.map((s) => (isGoalie ? s.wins ?? 0 : s.points ?? 0)));
  const th = 'pb-3 text-left text-xs font-medium text-muted-foreground';
  const td = 'py-3 tabular-nums';
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b">
          <th scope="col" className={th}>Season</th>
          <th scope="col" className={`${th} hidden sm:table-cell`}>Team</th>
          <th scope="col" className={`${th} text-right`}>GP</th>
          {isGoalie ? (
            <>
              <th scope="col" className={`${th} pl-4`}>Wins</th>
              <th scope="col" className={`${th} text-right`}>SV%</th>
              <th scope="col" className={`${th} text-right hidden sm:table-cell`}>GAA</th>
            </>
          ) : (
            <>
              <th scope="col" className={`${th} pl-4`}>Points</th>
              <th scope="col" className={`${th} text-right`}>+/-</th>
              <th scope="col" className={`${th} text-right hidden sm:table-cell`}>PIM</th>
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
                      srLabel={`${s.wins ?? 0} wins, ${s.losses ?? 0} losses`}
                    />
                  </td>
                  <td className={`${td} text-right`}>{((s.savePercentage || 0) * 100).toFixed(1)}%</td>
                  <td className={`${td} text-right hidden sm:table-cell`}>{(s.goalsAgainstAverage || 0).toFixed(2)}</td>
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
                      detail={`${s.goals ?? 0} G · ${s.assists ?? 0} A`}
                      srLabel={`${s.points ?? 0} points: ${plural(s.goals ?? 0, 'goal')}, ${plural(s.assists ?? 0, 'assist')}`}
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
const periodLabel = (period: number) => (period >= 4 ? 'OT' : `P${period}`);
const periodName = (period: number) => (period >= 4 ? 'overtime' : `period ${period}`);
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

const PointsByGame = ({ entries }: { entries: PlayerGameLogEntry[] }) => {
  const games: { gameId: string; entries: PlayerGameLogEntry[] }[] = [];
  for (const entry of entries) {
    const game = games.find((g) => g.gameId === entry.gameId);
    if (game) game.entries.push(entry);
    else games.push({ gameId: entry.gameId, entries: [entry] });
  }

  return (
    <ol className="divide-y" aria-label="Points by game">
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
              <span className="text-xl font-bold tabular-nums">{format(new Date(first.gameDate), 'd')}</span>
              <span className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {format(new Date(first.gameDate), 'MMM')}
              </span>
            </time>
            <span className="font-medium">
              {first.awayTeamAbbr} @ {first.homeTeamAbbr}
            </span>
            <ul className="order-last col-span-2 col-start-2 flex flex-wrap gap-2" aria-label="Points">
              {sorted.map((point, i) => (
                <PointChip key={i} point={point} />
              ))}
            </ul>
            <span className="text-right text-sm font-semibold tabular-nums whitespace-nowrap">
              <span aria-hidden="true">
                {[goals > 0 && `${goals} G`, assists > 0 && `${assists} A`].filter(Boolean).join(' · ')}
              </span>
              <span className="sr-only">
                {[goals > 0 && plural(goals, 'goal'), assists > 0 && plural(assists, 'assist')].filter(Boolean).join(', ')}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
};

const PointChip = ({ point }: { point: PlayerGameLogEntry }) => {
  const isGoal = point.type === 'goal';
  return (
    <li className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 py-0.5 pl-0.5 pr-2.5 text-sm">
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold leading-none ${isGoal ? 'bg-[hsl(var(--goal))] text-[hsl(var(--goal-foreground))]' : 'bg-[hsl(var(--assist))] text-[hsl(var(--assist-foreground))]'}`}
      >
        {isGoal ? 'G' : 'A'}
      </span>
      <span aria-hidden="true" className="tabular-nums">
        {periodLabel(point.period)} <span className="text-muted-foreground">{point.time}</span>
      </span>
      <span className="sr-only">
        {isGoal ? 'Goal' : 'Assist'}, {periodName(point.period)}, {point.time}
      </span>
    </li>
  );
};

export default PlayerProfile;
