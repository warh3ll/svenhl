import { useState } from 'react';
import { useNHLSverigeVideos, NHLSverigeVideo } from '@/hooks/useNHLSverigeVideos';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Skeleton } from '@/components/ui/skeleton';
import MaterialIcon from '@/components/ui/material-icon';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';
import { useI18n } from '@/i18n';
interface VideoCardProps {
  video: NHLSverigeVideo;
}
const VideoCard = ({
  video
}: VideoCardProps) => {
  const { lang, t } = useI18n();
  const [isPlaying, setIsPlaying] = useState(false);
  const handlePlay = () => {
    setIsPlaying(true);
  };
  return <div className="group cursor-pointer">
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg bg-muted">
        {isPlaying ? <iframe src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`} title={video.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" /> : <button type="button" onClick={handlePlay} className="relative w-full h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label={t('video.play', { title: video.title })}>
            <img src={video.thumbnail} alt={video.title} width={480} height={270} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                <MaterialIcon name="play_arrow" size="lg" />
              </div>
            </div>
          </button>}
      </AspectRatio>
      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(video.publishedAt), {
          addSuffix: true,
          locale: lang === 'sv' ? sv : undefined
        })}
        </p>
      </div>
    </div>;
};
const CarouselSkeleton = () => <div className="flex gap-4 px-4">
    {[1, 2, 3, 4].map(i => <div key={i} className="flex-shrink-0 w-[280px] md:w-[320px]">
        <Skeleton className="aspect-video rounded-lg" />
        <Skeleton className="h-4 w-3/4 mt-3" />
        <Skeleton className="h-3 w-1/2 mt-2" />
      </div>)}
  </div>;
const NHLSverigeCarousel = () => {
  const {
    data: videos,
    isLoading,
    error
  } = useNHLSverigeVideos();
  if (error) {
    console.error('Failed to load NHL Sverige videos:', error);
    return null; // Silently fail - don't break the page
  }
  return <section className="w-screen relative left-1/2 right-1/2 -mx-[50vw] py-8 my-8 border-y border-border/50 bg-amber-100">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 px-4 md:px-0">
          <div className="flex items-center gap-3">
            
            <div>
              <h2 className="text-xl font-bold text-slate-900">NHL Sverige</h2>
              <p lang="sv" className="text-sm text-slate-700">Senaste videor från @nhleurope</p>
            </div>
          </div>
          <a href="https://www.youtube.com/playlist?list=PLfsAEO-f92nqOtemyyAvcxpKU6JjiAGqM" target="_blank" rel="noopener noreferrer" lang="sv" className="text-sm text-primary hover:underline flex items-center gap-1">
            Visa alla
            <MaterialIcon name="open_in_new" size="sm" />
          </a>
        </div>

        {/* Carousel */}
        {isLoading ? <CarouselSkeleton /> : videos && videos.length > 0 ? <Carousel opts={{
        align: 'start',
        loop: false
      }} className="w-full px-4 md:px-0">
            <CarouselContent className="-ml-4">
              {videos.map(video => <CarouselItem key={video.id} className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <VideoCard video={video} />
                </CarouselItem>)}
            </CarouselContent>
            <CarouselPrevious className="left-2 md:-left-4" />
            <CarouselNext className="right-2 md:-right-4" />
          </Carousel> : <p lang="sv" className="text-center text-slate-700 py-8">Inga videor tillgängliga</p>}
      </div>
    </section>;
};
export default NHLSverigeCarousel;