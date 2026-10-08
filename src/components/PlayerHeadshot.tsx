import { useState } from 'react';
import MaterialIcon from '@/components/ui/material-icon';
import { cn } from '@/lib/utils';
import { CURRENT_SEASON } from '@/lib/season';

interface PlayerHeadshotProps {
  playerId: string;
  playerName: string;
  teamAbbr?: string;
  season?: string; // Season the headshot should be taken from (defaults to current)
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  priority?: boolean; // For LCP images - disables lazy loading and adds fetchpriority="high"
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
};

const iconSizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

// The player's name is always shown next to the headshot, so the image is decorative (alt="")
// and screen readers don't hear the name twice. playerName is kept for callers' readability.
const PlayerHeadshot = ({ playerId, teamAbbr, season = CURRENT_SEASON, size = 'md', className, priority = false }: PlayerHeadshotProps) => {
  const [hasError, setHasError] = useState(false);
  
  // Use the team-specific URL format which is more reliable.
  // Traded players can have a comma-separated team list; the last entry is the most recent team.
  const currentTeam = teamAbbr?.split(',').pop()?.trim();
  const headshotUrl = currentTeam
    ? `https://assets.nhle.com/mugs/nhl/${season}/${currentTeam}/${playerId}.png`
    : `https://assets.nhle.com/headshots/current/168x168/${playerId}.png`;

  if (hasError) {
    const iconSize = size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm';
    return (
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center",
        sizeClasses[size],
        className
      )}>
        <MaterialIcon name="person" size={iconSize} className="text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={headshotUrl}
      alt=""
      width={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
      height={size === 'lg' ? 96 : size === 'md' ? 48 : 32}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      className={cn("rounded-full object-cover bg-muted aspect-square", sizeClasses[size], className)}
      onError={() => setHasError(true)}
    />
  );
};

export default PlayerHeadshot;
