import { useState } from 'react';
import MaterialIcon from '@/components/ui/material-icon';

interface LazyYouTubeEmbedProps {
  videoId: string;
  title: string;
}

// Validate YouTube video ID format (11 characters: alphanumeric, hyphen, underscore)
const isValidYouTubeId = (id: string): boolean => {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

const LazyYouTubeEmbed = ({ videoId, title }: LazyYouTubeEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Validate video ID format before rendering
  if (!isValidYouTubeId(videoId)) {
    console.error('Invalid YouTube video ID format');
    return null;
  }

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
          <MaterialIcon name="play_arrow" size="xl" />
        </div>
      </div>
    </button>
  );
};

export default LazyYouTubeEmbed;
