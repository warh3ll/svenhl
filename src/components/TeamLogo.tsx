interface TeamLogoProps {
  teamAbbr: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-10 w-10',
  md: 'h-16 w-16',
  lg: 'h-24 w-24',
};

const sizePixels = {
  sm: 40,
  md: 64,
  lg: 96,
};

// Teams that use light mode logos (better visibility on backgrounds)
const LIGHT_MODE_TEAMS = ['TBL', 'TOR'];

const TeamLogo = ({ teamAbbr, size = 'md', className = '' }: TeamLogoProps) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const logoVariant = LIGHT_MODE_TEAMS.includes(teamAbbr) ? 'light' : 'dark';
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/teams/${teamAbbr}_${logoVariant}.svg`;
  const px = sizePixels[size];

  return (
    <img
      src={logoUrl}
      alt={`${teamAbbr} logo`}
      width={px}
      height={px}
      loading="lazy"
      decoding="async"
      className={`${sizeClasses[size]} object-contain aspect-square ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default TeamLogo;
