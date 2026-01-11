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

const TeamLogo = ({ teamAbbr, size = 'md', className = '' }: TeamLogoProps) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const logoUrl = `${supabaseUrl}/storage/v1/object/public/teams/${teamAbbr}_dark.svg`;

  return (
    <img
      src={logoUrl}
      alt={`${teamAbbr} logo`}
      className={`${sizeClasses[size]} object-contain ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
};

export default TeamLogo;
