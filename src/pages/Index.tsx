import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameFeed from '@/components/GameFeed';
import TopPlayersOfWeek from '@/components/TopPlayersOfWeek';
import NHLSverigeCarousel from '@/components/NHLSverigeCarousel';
import UpcomingGamesStrip from '@/components/UpcomingGamesStrip';
import SEO from '@/components/SEO';
import { mockGames } from '@/data/mockData';
import MaterialIcon from '@/components/ui/material-icon';
import { useNHLGames, useRecentGamesForStats, useUpcomingGames } from '@/hooks/useNHLData';
import { useI18n } from '@/i18n';

const Index = () => {
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
            <GameFeed 
              games={displayGames} 
              insertAfter={{
                count: 6,
                element: <NHLSverigeCarousel />
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
