interface TeamLogoProps {
  teamAbbr: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-5 w-5',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
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
