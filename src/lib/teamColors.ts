// NHL Team Colors - Official primary and secondary colors
export const TEAM_COLORS: Record<string, { primary: string; secondary: string }> = {
  ANA: { primary: '#fc4c02', secondary: '#b5985a' },
  ARI: { primary: '#8c2633', secondary: '#e2d6b5' },
  BOS: { primary: '#ffb81c', secondary: '#000000' },
  BUF: { primary: '#002654', secondary: '#fcb514' },
  CGY: { primary: '#d2001c', secondary: '#faaf19' },
  CAR: { primary: '#cc0000', secondary: '#000000' },
  CHI: { primary: '#cf0a2c', secondary: '#000000' },
  COL: { primary: '#6f263d', secondary: '#236192' },
  CBJ: { primary: '#002654', secondary: '#ce1126' },
  DAL: { primary: '#006847', secondary: '#8f8f8c' },
  DET: { primary: '#ce1126', secondary: '#ffffff' },
  EDM: { primary: '#cf4520', secondary: '#041e42' },
  FLA: { primary: '#c8102e', secondary: '#041e42' },
  LAK: { primary: '#111111', secondary: '#a2aaad' },
  MIN: { primary: '#154734', secondary: '#a6192e' },
  MTL: { primary: '#af1e2d', secondary: '#192168' },
  NSH: { primary: '#ffb81c', secondary: '#041e42' },
  NJD: { primary: '#ce1126', secondary: '#000000' },
  NYI: { primary: '#00539b', secondary: '#f47d30' },
  NYR: { primary: '#0038a8', secondary: '#ce1126' },
  OTT: { primary: '#c52032', secondary: '#c69214' },
  PHI: { primary: '#f74902', secondary: '#000000' },
  PIT: { primary: '#fcb514', secondary: '#000000' },
  SJS: { primary: '#006d75', secondary: '#ea7200' },
  SEA: { primary: '#001628', secondary: '#99d9d9' },
  STL: { primary: '#002f87', secondary: '#fcb514' },
  TBL: { primary: '#002868', secondary: '#ffffff' },
  TOR: { primary: '#00205b', secondary: '#ffffff' },
  UTA: { primary: '#6cace4', secondary: '#010101' },
  VAN: { primary: '#00205b', secondary: '#00843d' },
  VGK: { primary: '#b4975a', secondary: '#333f42' },
  WSH: { primary: '#c8102e', secondary: '#041e42' },
  WPG: { primary: '#041e42', secondary: '#004c97' },
};

// Default color for unknown teams
const DEFAULT_COLOR = { primary: '#6b7280', secondary: '#374151' };

/**
 * Get team colors by abbreviation
 * Handles edge cases like traded players (e.g., "COL,ANA" -> uses first team)
 */
export function getTeamColor(teamAbbr: string): { primary: string; secondary: string } {
  if (!teamAbbr) return DEFAULT_COLOR;
  
  // Handle traded players - use first team
  const abbr = teamAbbr.split(',')[0].trim();
  
  return TEAM_COLORS[abbr] || DEFAULT_COLOR;
}
