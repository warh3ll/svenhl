/*
 * TEAM COLORS
 * ===========
 * One line per NHL team. Edit a hex code here and the whole site follows.
 *
 *   main  The strong team color. Used for the stripe on the left edge of
 *         player rows and team cards, and for the player page hero.
 *   tint  The pale background behind player rows and team card headers.
 *         It is a really light version of the main color: the same hue,
 *         lightened to OKLCH lightness 0.95 with about 13% of the main
 *         color's chroma. That keeps the grey secondary text on top at
 *         APCA Lc 69 or more. If you change a main color, ask Claude to
 *         regenerate its tint the same way (or pick your own light shade).
 */
export const TEAM_COLORS: Record<string, { main: string; tint: string }> = {
  ANA: { main: '#F47A38', tint: '#FCEAE2' }, // Anaheim Ducks
  ARI: { main: '#8C2633', tint: '#FAEAEA' }, // Arizona Coyotes
  BOS: { main: '#000000', tint: '#EEEEEE' }, // Boston Bruins
  BUF: { main: '#002654', tint: '#E9EFF7' }, // Buffalo Sabres
  CAR: { main: '#CC0000', tint: '#FFE8E4' }, // Carolina Hurricanes
  CBJ: { main: '#002654', tint: '#E9EFF7' }, // Columbus Blue Jackets
  CGY: { main: '#C8102E', tint: '#FFE8E6' }, // Calgary Flames
  CHI: { main: '#CF0A2C', tint: '#FFE8E6' }, // Chicago Blackhawks
  COL: { main: '#6F263D', tint: '#F7EBED' }, // Colorado Avalanche
  DAL: { main: '#006847', tint: '#E7F1EC' }, // Dallas Stars
  DET: { main: '#CE1126', tint: '#FFE8E6' }, // Detroit Red Wings
  EDM: { main: '#FF4C00', tint: '#FFE9E2' }, // Edmonton Oilers
  FLA: { main: '#C8102E', tint: '#FFE8E6' }, // Florida Panthers
  LAK: { main: '#A2AAAD', tint: '#EDEFEF' }, // Los Angeles Kings
  MIN: { main: '#024930', tint: '#E9F1EC' }, // Minnesota Wild
  MTL: { main: '#AF1E2D', tint: '#FEE9E7' }, // Montreal Canadiens
  NJD: { main: '#CE1126', tint: '#FFE8E6' }, // New Jersey Devils
  NSH: { main: '#FFB81C', tint: '#F6EDDF' }, // Nashville Predators
  NYI: { main: '#00539B', tint: '#E6F0FA' }, // New York Islanders
  NYR: { main: '#0038A8', tint: '#E6EFFF' }, // New York Rangers
  OTT: { main: '#C52032', tint: '#FFE8E7' }, // Ottawa Senators
  PHI: { main: '#F74902', tint: '#FFE9E2' }, // Philadelphia Flyers
  PIT: { main: '#000000', tint: '#EEEEEE' }, // Pittsburgh Penguins
  SEA: { main: '#99D9D9', tint: '#E8F0F0' }, // Seattle Kraken
  SJS: { main: '#006D75', tint: '#E7F1F2' }, // San Jose Sharks
  STL: { main: '#0072CE', tint: '#E5F0FD' }, // St. Louis Blues
  TBL: { main: '#002868', tint: '#E8EFF9' }, // Tampa Bay Lightning
  TOR: { main: '#00205B', tint: '#E9EFF9' }, // Toronto Maple Leafs
  UTA: { main: '#6CACE4', tint: '#E7F0F7' }, // Utah Mammoth
  VAN: { main: '#00205B', tint: '#E9EFF9' }, // Vancouver Canucks
  VGK: { main: '#B4975A', tint: '#F2EEE6' }, // Vegas Golden Knights
  WPG: { main: '#041E42', tint: '#EAEFF5' }, // Winnipeg Jets
  WSH: { main: '#C8102E', tint: '#FFE8E6' }, // Washington Capitals
}

// Used for unknown teams
export const DEFAULT_TEAM_COLOR = { main: '#6B7280', tint: '#EDEEF0' }
