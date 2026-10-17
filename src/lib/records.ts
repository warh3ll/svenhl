import { ImpactRecord, SwedishGoalie, SwedishPlayer } from '@/types/nhl';

export interface RecordEntry {
  id: string;
  name: string;
  teamAbbr: string;
  value: number;
  // The streak is still going
  active?: boolean;
}

export interface RecordDef {
  key: string;
  icon: string;
  unitKey: string;
  entries: (players: SwedishPlayer[], goalies: SwedishGoalie[]) => RecordEntry[];
}

const skater = (value: (p: SwedishPlayer) => number | undefined, active?: (p: SwedishPlayer) => boolean) =>
  (players: SwedishPlayer[]) =>
    players.map((p) => ({ id: p.id, name: p.name, teamAbbr: p.teamAbbr, value: value(p) ?? 0, active: active?.(p) }));

const goalie = (value: (g: SwedishGoalie) => number | undefined, active?: (g: SwedishGoalie) => boolean) =>
  (_: SwedishPlayer[], goalies: SwedishGoalie[]) =>
    goalies.map((g) => ({ id: g.id, name: g.name, teamAbbr: g.teamAbbr, value: value(g) ?? 0, active: active?.(g) }));

// A season best that's still going: the current streak is as long as the longest one
const ongoing = (current = 0, longest = 0) => current > 0 && current === longest;

// The impact list's key; its one list (games, not players) is drawn by ImpactRecordList
export const IMPACT_KEY = 'impact';

// Each list's title and description come from records.<key>.title / .description
export const RECORD_GROUPS: { key: string; records: RecordDef[] }[] = [
  {
    key: 'streaks',
    records: [
      {
        key: 'pointStreak',
        icon: 'local_fire_department',
        unitKey: 'records.unit.games',
        entries: skater((p) => p.longestPointStreak, (p) => ongoing(p.pointStreak, p.longestPointStreak)),
      },
      {
        key: 'goalStreak',
        icon: 'sports_hockey',
        unitKey: 'records.unit.games',
        entries: skater((p) => p.longestGoalStreak, (p) => ongoing(p.goalStreak, p.longestGoalStreak)),
      },
      {
        key: 'winStreak',
        icon: 'trending_up',
        unitKey: 'records.unit.wins',
        entries: goalie((g) => g.longestWinStreak, (g) => ongoing(g.winStreak, g.longestWinStreak)),
      },
    ],
  },
  { key: IMPACT_KEY, records: [] },
  {
    key: 'scoring',
    records: [
      { key: 'hatTricks', icon: 'military_tech', unitKey: 'records.unit.hatTricks', entries: skater((p) => p.hatTricks) },
      { key: 'threePointGames', icon: 'star', unitKey: 'records.unit.games', entries: skater((p) => p.threePointGames) },
      { key: 'shots', icon: 'target', unitKey: 'records.unit.shots', entries: skater((p) => p.shots) },
      { key: 'ppGoals', icon: 'bolt', unitKey: 'records.unit.goals', entries: skater((p) => p.powerPlayGoals) },
      { key: 'gwGoals', icon: 'emoji_events', unitKey: 'records.unit.goals', entries: skater((p) => p.gameWinningGoals) },
    ],
  },
  {
    key: 'defense',
    records: [
      { key: 'shutouts', icon: 'block', unitKey: 'records.unit.shutouts', entries: goalie((g) => g.shutouts) },
      { key: 'hits', icon: 'sports_mma', unitKey: 'records.unit.hits', entries: skater((p) => p.hits) },
      { key: 'blocks', icon: 'shield', unitKey: 'records.unit.blocks', entries: skater((p) => p.blockedShots) },
    ],
  },
];

export const TOP = 5;
// Everyone tied for 5th is listed, unless the list would get this long; then the rest is summed up in a line
const MAX_ROWS = 7;

// The rows a list shows: the top 5, with everyone tied for 5th when that fits
export const topRows = (entries: RecordEntry[]) => {
  const sorted = entries
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
  const cutoff = sorted[Math.min(TOP, sorted.length) - 1]?.value ?? 0;
  const qualified = sorted.filter((entry) => entry.value >= cutoff);
  const rows = qualified.length > MAX_ROWS ? qualified.slice(0, TOP) : qualified;
  // Everyone past the 5th row has the 5th place value
  const moreTied = qualified.length - rows.length;
  const rank = (value: number) => 1 + sorted.filter((entry) => entry.value > value).length;
  return { rows, moreTied, cutoff, rank };
};

export const swedishPoints = (game: ImpactRecord) => game.goals + game.assists;
export const impactShare = (game: ImpactRecord) => swedishPoints(game) / game.total;
// Highest share first; with the same share, more Swedish points first (3 of 3 beats 1 of 1)
export const byImpact = (a: ImpactRecord, b: ImpactRecord) =>
  impactShare(b) - impactShare(a) || swedishPoints(b) - swedishPoints(a);

export const topImpactGames = (games: ImpactRecord[]) => [...games].sort(byImpact).slice(0, TOP);

// What each list shows right now, as list key -> entry id -> value. Used to spot updated entries.
export type RecordSnapshot = Record<string, Record<string, string>>;

export const recordSnapshot = (
  players: SwedishPlayer[],
  goalies: SwedishGoalie[],
  impactGames: ImpactRecord[],
): RecordSnapshot => {
  const snapshot: RecordSnapshot = {};
  for (const group of RECORD_GROUPS) {
    for (const record of group.records) {
      const { rows } = topRows(record.entries(players, goalies));
      snapshot[record.key] = Object.fromEntries(rows.map((entry) => [entry.id, String(entry.value)]));
    }
  }
  snapshot[IMPACT_KEY] = Object.fromEntries(
    topImpactGames(impactGames).map((game) => [game.id, `${game.goals}/${game.assists}/${game.total}`]),
  );
  return snapshot;
};
