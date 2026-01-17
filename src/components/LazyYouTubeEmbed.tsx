import { useState } from 'react';
import { Play } from 'lucide-react';

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
}

const LazyYouTubeEmbed = ({ videoId, title }: LazyYouTubeEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Use high-quality thumbnail from YouTube
  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsLoaded(true)}
      className="relative w-full h-full group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`Play video: ${title}`}
    >
      <img
        src={thumbnailUrl}
        alt={title}
        loading="lazy"
        decoding="async"
        className="w-full h-full object-cover"
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
          <Play className="h-8 w-8 ml-1" fill="currentColor" />
        </div>
      </div>
    </button>
  );
};

export default LazyYouTubeEmbed;
