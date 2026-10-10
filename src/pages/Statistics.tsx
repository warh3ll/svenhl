import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlayerTable from '@/components/PlayerTable';
import GoalieTable from '@/components/GoalieTable';
import PlayerTableSkeleton from '@/components/PlayerTableSkeleton';
import GoalieTableSkeleton from '@/components/GoalieTableSkeleton';
import { CURRENT_SEASON, formatSeason, seasons } from '@/lib/season';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MaterialIcon from '@/components/ui/material-icon';
import SEO from '@/components/SEO';
import { useSwedishPlayers, useSwedishGoalies } from '@/hooks/useNHLData';
import { useI18n } from '@/i18n';

// Abbreviations explained under the tables
const LEGEND = ['gp', 'g', 'a', 'pts', 'plusMinus', 'pim', 'ppg', 'gwg', 'sPct', 'svPct', 'gaa', 'so'];

const Statistics = () => {
  const [selectedSeason, setSelectedSeason] = useState(CURRENT_SEASON);
  const { t } = useI18n();
  const season = formatSeason(selectedSeason);
  
  const { data: players, isLoading: playersLoading } = useSwedishPlayers(selectedSeason);
  const { data: goalies, isLoading: goaliesLoading } = useSwedishGoalies(selectedSeason);

  const displayPlayers = players ?? [];
  const displayGoalies = goalies ?? [];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('seo.statistics.title')}
        description={t('seo.statistics.description')}
        path="/statistics"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t('seo.statistics.name'),
        }}
      />
      <Header />
      
      
      <main id="main" tabIndex={-1} className="outline-none container py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-foreground">
            {t('statistics.heading')}
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('statistics.intro')}
          </p>
        </div>

        {/* Season Filter */}
        <div className="mb-6 flex items-center gap-4">
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

        {/* Stats Tabs */}
        <Tabs defaultValue="skaters" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="skaters" className="flex items-center gap-2">
              <MaterialIcon name="group" size="sm" />
              {t('statistics.skaters', { count: displayPlayers.length })}
            </TabsTrigger>
            <TabsTrigger value="goalies" className="flex items-center gap-2">
              <MaterialIcon name="sports" size="sm" />
              {t('statistics.goalies', { count: displayGoalies.length })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="skaters" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('statistics.sortHint', { season })}
              </p>
            </div>
            {playersLoading ? (
              <PlayerTableSkeleton />
            ) : displayPlayers.length === 0 ? (
              <p className="rounded-lg border bg-card py-12 text-center text-muted-foreground">
                {t('statistics.noSkaters', { season })}
              </p>
            ) : (
              <PlayerTable players={displayPlayers} />
            )}
          </TabsContent>

          <TabsContent value="goalies" className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {t('statistics.sortHint', { season })}
              </p>
            </div>
            {goaliesLoading ? (
              <GoalieTableSkeleton />
            ) : displayGoalies.length === 0 ? (
              <p className="rounded-lg border bg-card py-12 text-center text-muted-foreground">
                {t('statistics.noGoalies', { season })}
              </p>
            ) : (
              <GoalieTable goalies={displayGoalies} />
            )}
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <div className="mt-8 rounded-lg border bg-card p-4">
          <h2 className="mb-2 font-semibold text-foreground">{t('legend.heading')}</h2>
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 lg:grid-cols-4">
            {LEGEND.map((key) => (
              <div key={key}><strong>{t(`stat.${key}`)}:</strong> {t(`legend.${key}`)}</div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Statistics;
