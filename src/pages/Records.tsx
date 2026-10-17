import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RecordList from '@/components/RecordList';
import ImpactRecordList from '@/components/ImpactRecordList';
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
import { useSwedishPlayers, useSwedishGoalies, useImpactRecords } from '@/hooks/useNHLData';
import { useI18n } from '@/i18n';
import { IMPACT_KEY, RECORD_GROUPS } from '@/lib/records';
import { useRecordUpdates } from '@/hooks/useRecordUpdates';

const Records = () => {
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const { t } = useI18n();

  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);
  const { data: impactGames, isLoading: impactLoading } = useImpactRecords(selectedSeason);
  const isLoading = playersLoading || goaliesLoading;

  // Opening the page clears the badge on the Records tab; the list and entry badges clear on hover
  const { isUpdated, markSeen, markNavSeen } = useRecordUpdates();
  useEffect(markNavSeen, [markNavSeen]);
  const updatesFor = (list: string) =>
    selectedSeason === CURRENT_SEASON
      ? { isUpdated: (id: string) => isUpdated(list, id), markSeen: (id: string) => markSeen(list, id) }
      : undefined;

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
          {RECORD_GROUPS.map((group) => (
            <section key={group.key} aria-labelledby={`records-${group.key}`}>
              <h2 id={`records-${group.key}`} className="mb-4 text-2xl font-bold text-foreground">
                {t(`records.group.${group.key}`)}
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.key === IMPACT_KEY &&
                  (impactLoading ? (
                    <Skeleton className="h-[340px] rounded-xl md:col-span-2" />
                  ) : (
                    <ImpactRecordList games={impactGames ?? []} updates={updatesFor(IMPACT_KEY)} />
                  ))}
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
                      updates={updatesFor(record.key)}
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
