/*
 * TEAM COLORS
 * ===========
 * One line per NHL team. Edit a hex code here and the whole site follows.
 *
 *   main  The strong team color. Used for the stripe on the left edge of
 *         player rows and team cards, and for the player page hero.
 *   tint  The pale background behind player rows and team card headers.
 *         Keep it very light so the dark text on top stays easy to read
 *         (it is checked at APCA Lc 63 or more for the grey secondary text).
 *
 * Rule of thumb: no two teams should share a main or a tint, so players from
 * similar-colored teams (say Toronto and Tampa Bay) still look different.
 */
export const TEAM_COLORS: Record<string, { main: string; tint: string }> = {
  ANA: { main: '#F47A38', tint: '#F8DEC4' }, // Anaheim Ducks
  ARI: { main: '#8C2633', tint: '#FEE2E3' }, // Arizona Coyotes
  BOS: { main: '#000000', tint: '#FBF5D2' }, // Boston Bruins
  BUF: { main: '#002654', tint: '#E3E8EF' }, // Buffalo Sabres
  CAR: { main: '#CC0000', tint: '#F3EBE9' }, // Carolina Hurricanes
  CBJ: { main: '#002654', tint: '#D3F1FE' }, // Columbus Blue Jackets
  CGY: { main: '#C8102E', tint: '#FAE5D9' }, // Calgary Flames
  CHI: { main: '#CF0A2C', tint: '#F3DEE8' }, // Chicago Blackhawks
  COL: { main: '#6F263D', tint: '#FEDFF4' }, // Colorado Avalanche
  DAL: { main: '#006847', tint: '#D3F1D9' }, // Dallas Stars
  DET: { main: '#CE1126', tint: '#FFE9E6' }, // Detroit Red Wings
  EDM: { main: '#FF4C00', tint: '#FFEFDF' }, // Edmonton Oilers
  FLA: { main: '#C8102E', tint: '#FDDBDE' }, // Florida Panthers
  LAK: { main: '#A2AAAD', tint: '#E3E3E3' }, // Los Angeles Kings
  MIN: { main: '#024930', tint: '#E7F5E4' }, // Minnesota Wild
  MTL: { main: '#AF1E2D', tint: '#EFE5E5' }, // Montreal Canadiens
  NJD: { main: '#CE1126', tint: '#FEDCD1' }, // New Jersey Devils
  NSH: { main: '#FFB81C', tint: '#FFE9CC' }, // Nashville Predators
  NYI: { main: '#00539B', tint: '#E4F5FF' }, // New York Islanders
  NYR: { main: '#0038A8', tint: '#F2F2FE' }, // New York Rangers
  OTT: { main: '#C52032', tint: '#F2DEDB' }, // Ottawa Senators
  PHI: { main: '#F74902', tint: '#F7F2F0' }, // Philadelphia Flyers
  PIT: { main: '#000000', tint: '#EDEAC7' }, // Pittsburgh Penguins
  SEA: { main: '#99D9D9', tint: '#D9F1EC' }, // Seattle Kraken
  SJS: { main: '#006D75', tint: '#C9EBEB' }, // San Jose Sharks
  STL: { main: '#0072CE', tint: '#D9E2FD' }, // St. Louis Blues
  TBL: { main: '#002868', tint: '#E8ECFA' }, // Tampa Bay Lightning
  TOR: { main: '#00205B', tint: '#DDE9FE' }, // Toronto Maple Leafs
  UTA: { main: '#6CACE4', tint: '#C9EAFF' }, // Utah Mammoth
  VAN: { main: '#00205B', tint: '#CCF6FB' }, // Vancouver Canucks
  VGK: { main: '#B4975A', tint: '#EDE4D1' }, // Vegas Golden Knights
  WPG: { main: '#041E42', tint: '#D6E5F2' }, // Winnipeg Jets
  WSH: { main: '#C8102E', tint: '#FEE9F7' }, // Washington Capitals
}

// Used for unknown teams
export const DEFAULT_TEAM_COLOR = { main: '#6B7280', tint: '#F1F2F4' }
