import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecordList, { RecordEntry } from '@/components/RecordList';
import SEO from '@/components/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CURRENT_SEASON, formatSeason, seasons } from '@/lib/season';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';
import { useI18n } from '@/i18n';
import { SwedishGoalie, SwedishPlayer } from '@/types/nhl';

interface RecordDef {
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

// Each list's title and description come from records.<key>.title / .description
const GROUPS: { key: string; records: RecordDef[] }[] = [
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

const Records = () => {
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const { t } = useI18n();

  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);
  const isLoading = playersLoading || goaliesLoading;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('seo.records.title')}
        description={t('seo.records.description')}
        path="/records"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t('seo.records.name'),
        }}
      />
      <Header />

      <main id="main" tabIndex={-1} className="outline-none container py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">{t('records.heading')}</h1>
          <p className="text-lg text-muted-foreground">{t('records.intro')}</p>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <label htmlFor="season-select" className="text-sm font-medium text-foreground">{t('statistics.seasonLabel')}</label>
          <Select value={selectedSeason} onValueChange={setSelectedSeason}>
            <SelectTrigger id="season-select" className="w-[140px]">
              <SelectValue placeholder={t('statistics.selectSeason')} />
            </SelectTrigger>
            <SelectContent>
              {seasons.map((season) => (
                <SelectItem key={season.value} value={season.value}>
                  {season.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-10">
          {GROUPS.map((group) => (
            <section key={group.key} aria-labelledby={`records-${group.key}`}>
              <h2 id={`records-${group.key}`} className="mb-4 text-2xl font-bold text-foreground">
                {t(`records.group.${group.key}`)}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.records.map((record) =>
                  isLoading ? (
                    <Skeleton key={record.key} className="h-[340px] rounded-xl" />
                  ) : (
                    <RecordList
                      key={record.key}
                      id={`record-${record.key}`}
                      title={t(`records.${record.key}.title`)}
                      description={t(`records.${record.key}.description`, { season: formatSeason(selectedSeason) })}
                      icon={record.icon}
                      unitKey={record.unitKey}
                      entries={record.entries(players ?? [], goalies ?? [])}
                      season={selectedSeason}
                    />
                  ),
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Records;
