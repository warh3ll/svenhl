import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerHeadshotProps {
  playerId: string;
  playerName: string;
  teamAbbr?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
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

const PlayerHeadshot = ({ playerId, playerName, teamAbbr, size = 'md', className }: PlayerHeadshotProps) => {
  const [hasError, setHasError] = useState(false);
  
  // Use the team-specific URL format which is more reliable
  const headshotUrl = teamAbbr 
    ? `https://assets.nhle.com/mugs/nhl/20252026/${teamAbbr}/${playerId}.png`
    : `https://assets.nhle.com/headshots/current/168x168/${playerId}.png`;

  if (hasError) {
    return (
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center",
        sizeClasses[size],
        className
      )}>
        <User className={cn("text-muted-foreground", iconSizeClasses[size])} />
      </div>
    );
  }

  return (
    <img
      src={headshotUrl}
      alt={playerName}
      className={cn("rounded-full object-cover bg-muted", sizeClasses[size], className)}
      onError={() => setHasError(true)}
    />
  );
};

export default PlayerHeadshot;
