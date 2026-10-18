// Team colors live in src/team-colors.ts; these helpers just look them up.
import { TEAM_COLORS, DEFAULT_TEAM_COLOR } from '@/team-colors';

export { TEAM_COLORS };

/**
 * Get team colors by abbreviation
 * Handles edge cases like traded players (e.g., "COL,ANA" -> uses first team)
 */
export function getTeamColor(teamAbbr: string): { main: string; tint: string } {
  if (!teamAbbr) return DEFAULT_TEAM_COLOR;

  // Handle traded players - use first team
  const abbr = teamAbbr.split(',')[0].trim();

  return TEAM_COLORS[abbr] || DEFAULT_TEAM_COLOR;
}

/**
 * The team's main color at a given opacity, for soft gradients (player page hero)
 */
export function getTeamBackgroundColor(teamAbbr: string, opacity: number = 0.1): string {
  const { main } = getTeamColor(teamAbbr);

  // Convert hex to RGB
  const hex = main.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
