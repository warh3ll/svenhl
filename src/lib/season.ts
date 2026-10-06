// NHL season IDs use the format "YYYYYYYY", e.g. "20262027" for 2026-27.
// Bump CURRENT_SEASON when a new season starts; everything else derives from it.
export const CURRENT_SEASON = '20262027';

// How many seasons (including the current one) to offer in season pickers
const SEASONS_TO_SHOW = 4;

// Format a season ID for display: "20262027" -> "2026-27"
export const formatSeason = (season: string) => `${season.slice(0, 4)}-${season.slice(6, 8)}`;

const startYear = Number(CURRENT_SEASON.slice(0, 4));

export const seasons = Array.from({ length: SEASONS_TO_SHOW }, (_, i) => {
  const value = `${startYear - i}${startYear - i + 1}`;
  return { value, label: formatSeason(value) };
});
