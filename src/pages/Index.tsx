import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameFeed from '@/components/GameFeed';
import TopPlayersOfWeek from '@/components/TopPlayersOfWeek';
import NHLSverigeCarousel from '@/components/NHLSverigeCarousel';
import UpcomingGamesStrip from '@/components/UpcomingGamesStrip';
import PointStreakBar from '@/components/PointStreakBar';
import SEO from '@/components/SEO';
import { mockGames } from '@/data/mockData';
import MaterialIcon from '@/components/ui/material-icon';
import { Button } from '@/components/ui/button';
import { useNHLGames, useRecentGamesForStats, useUpcomingGames } from '@/hooks/useNHLData';
import { useI18n } from '@/i18n';

// Games in the feed at first, and how many more each "Load more games" click adds
// (multiples of 3 so the desktop grid rows stay full)
const GAMES_PAGE_SIZE = 18;
const GAMES_LOAD_MORE = 12;

const Index = () => {
  const [visibleGames, setVisibleGames] = useState(GAMES_PAGE_SIZE);
  const { data: games, isLoading: gamesLoading } = useNHLGames();
  const { data: recentGames } = useRecentGamesForStats();
  const { data: upcomingGames } = useUpcomingGames();
  const { t } = useI18n();

  // Use database games if available, otherwise fall back to mock data
  const displayGames = games && games.length > 0 ? games : mockGames;
  const statsGames = recentGames && recentGames.length > 0 ? recentGames : displayGames;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        path="/"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: t('seo.home.name'),
          description: t('seo.home.description'),
        }}
      />
      <Header />
      
      <main id="main" tabIndex={-1} className="outline-none container py-8">
        <h1 className="sr-only">{t('home.heading')}</h1>

        {/* Scheduled games, kept out of the results feed */}
        <UpcomingGamesStrip games={upcomingGames ?? []} />

        {/* Swedes with a point in each of their latest games */}
        <PointStreakBar />

        {/* Top 3 of the Week */}
        <TopPlayersOfWeek games={statsGames} />

        {/* Game Feed with NHL Sverige carousel inserted after 6 cards */}
        <div className="space-y-4 min-h-[800px]">
          <h2 className="text-2xl font-bold text-foreground">{t('home.recentGames')}</h2>
          {gamesLoading ? (
            <div className="flex items-center justify-center py-12 min-h-[700px]">
              <MaterialIcon name="progress_activity" size="xl" className="animate-spin text-primary" />
            </div>
          ) : (
            <>
              <GameFeed
                games={displayGames.slice(0, visibleGames)}
                insertAfter={{
                  count: 6,
                  element: <NHLSverigeCarousel />
                }}
              />
              <div className="flex flex-col items-center gap-3 pt-4">
                {/* Announced to screen readers when more games are added */}
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {t('home.showingGames', { shown: Math.min(visibleGames, displayGames.length), total: displayGames.length })}
                </p>
                {visibleGames < displayGames.length && (
                  <Button onClick={() => setVisibleGames((n) => n + GAMES_LOAD_MORE)}>
                    <MaterialIcon name="expand_more" size="sm" />
                    {t('home.loadMoreGames')}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
