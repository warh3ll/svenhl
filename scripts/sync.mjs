// Fetches Swedish NHL player stats, recent games and highlight videos, and writes them
// as static JSON files to public/data/ for the site to read.
//
// Usage:
//   node scripts/sync.mjs                    # sync the current season, recent games and videos
//   node scripts/sync.mjs --season 20252026  # (re)sync stats for one specific season only
//
// Environment:
//   YOUTUBE_API_KEY  optional; without it highlight search and the NHL Sverige carousel are skipped
//
// Game state (cached highlight video IDs) is carried over from the existing public/data/games.json,
// so the workflow downloads the live copy before running this script.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "data");
const youtubeApiKey = process.env.YOUTUBE_API_KEY;

// Only regular season games (gameTypeId 2) count towards season stats, not playoffs
const REGULAR_SEASON = 2;

// How many days of games to keep in games.json (home feed, weekly top players, player game logs)
const GAME_HISTORY_DAYS = 14;

// YouTube Data API quota is 10,000 units/day and a search costs 100. With hourly syncs,
// 3 searches per run stays under the quota even in the worst case.
const MAX_YOUTUBE_SEARCHES_PER_SYNC = 3;
const MIN_HIGHLIGHT_DURATION_SECONDS = 300;
const EXCLUDE_TITLE_PATTERNS = /\b(#shorts?|short|goal of the|save of the|hit of the|fight|shootout only)\b/i;
const PREFER_TITLE_PATTERNS = /\b(full highlights?|game recap|extended highlights?|nhl highlights?)\b/i;
const NHL_CHANNEL_ID = "UCqFMzb-4AUf6WAIbl132QKA";
const NHL_SVERIGE_PLAYLIST_ID = "PLfsAEO-f92nqOtemyyAvcxpKU6JjiAGqM";

const TEAM_NAMES = {
  ANA: "Anaheim Ducks",
  ARI: "Arizona Coyotes",
  BOS: "Boston Bruins",
  BUF: "Buffalo Sabres",
  CGY: "Calgary Flames",
  CAR: "Carolina Hurricanes",
  CHI: "Chicago Blackhawks",
  COL: "Colorado Avalanche",
  CBJ: "Columbus Blue Jackets",
  DAL: "Dallas Stars",
  DET: "Detroit Red Wings",
  EDM: "Edmonton Oilers",
  FLA: "Florida Panthers",
  LAK: "Los Angeles Kings",
  MIN: "Minnesota Wild",
  MTL: "Montréal Canadiens",
  NSH: "Nashville Predators",
  NJD: "New Jersey Devils",
  NYI: "New York Islanders",
  NYR: "New York Rangers",
  OTT: "Ottawa Senators",
  PHI: "Philadelphia Flyers",
  PIT: "Pittsburgh Penguins",
  SJS: "San Jose Sharks",
  SEA: "Seattle Kraken",
  STL: "St. Louis Blues",
  TBL: "Tampa Bay Lightning",
  TOR: "Toronto Maple Leafs",
  UTA: "Utah Mammoth",
  VAN: "Vancouver Canucks",
  VGK: "Vegas Golden Knights",
  WSH: "Washington Capitals",
  WPG: "Winnipeg Jets",
};

// ---------- helpers ----------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// fetch JSON with a few retries; the NHL API rate limits bursts with HTTP 429
async function fetchJson(url, { retries = 5 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(url);
    if (response.ok) return response.json();
    if (attempt < retries && (response.status === 429 || response.status >= 500)) {
      const retryAfter = Number(response.headers.get("retry-after"));
      await sleep(retryAfter > 0 ? retryAfter * 1000 : 2000 * 2 ** attempt);
      continue;
    }
    throw new Error(`${response.status} ${response.statusText} for ${url.split("?")[0]}`);
  }
}

async function readJson(file, fallback) {
  try {
    return JSON.parse(await readFile(path.join(DATA_DIR, file), "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(file, data) {
  await writeFile(path.join(DATA_DIR, file), JSON.stringify(data) + "\n");
}

// Season ID derived from the date: the NHL season rolls over in September (e.g. Oct 2026 -> "20262027")
function seasonFromDate(date) {
  const year = date.getUTCFullYear();
  const startYear = date.getUTCMonth() >= 8 ? year : year - 1;
  return `${startYear}${startYear + 1}`;
}

// Ask the NHL API for the current season (last entry in its season list), falling back to the date
async function getCurrentSeason() {
  try {
    const seasons = await fetchJson("https://api-web.nhle.com/v1/season");
    if (seasons.length > 0) return String(seasons[seasons.length - 1]);
  } catch (e) {
    console.error("Failed to fetch current season from NHL API:", e.message);
  }
  return seasonFromDate(new Date());
}

// Traded players get a comma-separated team list in chronological order ("MIN,VAN"); the last one is the latest team
const lastTeam = (teamAbbrevs) => teamAbbrevs?.split(",").pop()?.trim() || "UNK";

const formatToi = (seconds) =>
  seconds ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}` : "0:00";

const statsUrl = (kind, season, sortProperty, limit) =>
  `https://api.nhle.com/stats/rest/en/${kind}/summary?isAggregate=false&isGame=false` +
  `&sort=${encodeURIComponent(JSON.stringify([{ property: sortProperty, direction: "DESC" }]))}` +
  `&start=0&limit=${limit}` +
  `&cayenneExp=${encodeURIComponent(`seasonId=${season} and gameTypeId=${REGULAR_SEASON} and nationalityCode="SWE"`)}`;

// Jersey number and current team from the player landing endpoint (the stats API has neither)
async function fetchPlayerDetails(playerIds) {
  const details = new Map();
  for (const id of playerIds) {
    try {
      const player = await fetchJson(`https://api-web.nhle.com/v1/player/${id}/landing`);
      details.set(String(id), {
        sweaterNumber: player.sweaterNumber || 0,
        currentTeam: player.currentTeamAbbrev,
        last5Games: player.last5Games || [],
      });
    } catch (e) {
      console.error(`Failed to fetch details for player ${id}:`, e.message);
    }
    await sleep(100); // stay under the NHL API rate limit
  }
  return details;
}

// Games in a row with at least one point, counting back from the player's latest regular season game
// this season. The landing endpoint only has the last 5 games, so longer streaks need the full game log.
async function fetchPointStreak(id, last5Games, season) {
  const countStreak = (games) => {
    let streak = 0;
    for (const game of games) {
      const thisSeason = game.gameTypeId === REGULAR_SEASON && String(game.gameId).startsWith(season.slice(0, 4));
      if (!thisSeason || !(game.points > 0)) break;
      streak++;
    }
    return streak;
  };

  const streak = countStreak(last5Games);
  if (streak < 5) return streak;
  try {
    const log = await fetchJson(`https://api-web.nhle.com/v1/player/${id}/game-log/${season}/${REGULAR_SEASON}`);
    await sleep(100);
    return Math.max(streak, countStreak(log.gameLog || []));
  } catch (e) {
    console.error(`Failed to fetch game log for player ${id}:`, e.message);
    return streak;
  }
}

// ---------- season stats ----------

async function syncSeasonStats(season, isCurrentSeason) {
  console.log(`Fetching Swedish skater and goalie stats for ${season}...`);
  const skaters = (await fetchJson(statsUrl("skater", season, "points", 200))).data || [];
  const goalies = (await fetchJson(statsUrl("goalie", season, "wins", 50))).data || [];
  console.log(`Found ${skaters.length} skaters and ${goalies.length} goalies`);

  const details = await fetchPlayerDetails([...skaters, ...goalies].map((p) => p.playerId));
  // Only the current season should take players' team from their present roster
  const teamFor = (p) => (isCurrentSeason && details.get(String(p.playerId))?.currentTeam) || lastTeam(p.teamAbbrevs);
  const jerseyFor = (p) => details.get(String(p.playerId))?.sweaterNumber || 0;
  const updatedAt = new Date().toISOString();

  // Point streaks only make sense for the season being played
  const pointStreaks = new Map();
  if (isCurrentSeason) {
    for (const p of skaters) {
      const id = String(p.playerId);
      pointStreaks.set(id, await fetchPointStreak(id, details.get(id)?.last5Games || [], season));
    }
  }

  const players = skaters.map((p) => {
    const team = teamFor(p);
    return {
      id: String(p.playerId),
      name: p.skaterFullName,
      team: TEAM_NAMES[team] || team,
      team_abbr: team,
      position: p.positionCode || "F",
      jersey_number: jerseyFor(p),
      games: p.gamesPlayed || 0,
      goals: p.goals || 0,
      assists: p.assists || 0,
      points: p.points || 0,
      penalty_minutes: p.penaltyMinutes || 0,
      plus_minus: p.plusMinus || 0,
      time_on_ice: formatToi(p.timeOnIcePerGame),
      power_play_goals: p.ppGoals || 0,
      power_play_points: p.ppPoints || 0,
      game_winning_goals: p.gameWinningGoals || 0,
      shots: p.shots || 0,
      shooting_pct: p.shootingPct ? Number((p.shootingPct * 100).toFixed(1)) : 0,
      point_streak: pointStreaks.get(String(p.playerId)) || 0,
      season,
      updated_at: updatedAt,
    };
  });

  const goalieRows = goalies.map((g) => {
    const team = teamFor(g);
    return {
      id: String(g.playerId),
      name: g.goalieFullName,
      team: TEAM_NAMES[team] || team,
      team_abbr: team,
      jersey_number: jerseyFor(g),
      games: g.gamesPlayed || 0,
      games_started: g.gamesStarted || 0,
      wins: g.wins || 0,
      losses: g.losses || 0,
      overtime_losses: g.otLosses || 0,
      save_percentage: g.savePct || 0,
      goals_against_average: g.goalsAgainstAverage || 0,
      shutouts: g.shutouts || 0,
      saves: g.saves || 0,
      shots_against: g.shotsAgainst || 0,
      time_on_ice: g.timeOnIce ? `${Math.floor(g.timeOnIce / 60)}:00` : "0:00",
      season,
      updated_at: updatedAt,
    };
  });

  players.sort((a, b) => b.points - a.points);
  goalieRows.sort((a, b) => b.wins - a.wins);
  await writeJson(`players-${season}.json`, players);
  await writeJson(`goalies-${season}.json`, goalieRows);
  return { players, goalies: goalieRows };
}

// ---------- YouTube ----------

function parseDuration(isoDuration) {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

// NHL videos are titled like "Rangers vs Penguins | NHL Highlights | January 20, 2026"
function extractDateFromTitle(title) {
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const match = title.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)\s+(\d{1,2}),?\s+(\d{4})\b/i,
  );
  if (!match) return null;
  const month = months.indexOf(match[1].slice(0, 3).toLowerCase());
  const day = Number(match[2]);
  const year = Number(match[3]);
  return month >= 0 && day >= 1 && day <= 31 && year >= 2020 ? new Date(year, month, day) : null;
}

// Quota exhausted or key rejected (both HTTP 403): stop calling YouTube for the rest of the run
class YouTubeUnavailableError extends Error {}

async function youtubeGet(url) {
  const response = await fetch(url);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const reason = data.error?.errors?.[0]?.reason;
    const message = `YouTube API ${response.status} ${reason || ""}: ${data.error?.message || "unknown error"}`;
    if (reason === "quotaExceeded" || response.status === 403) throw new YouTubeUnavailableError(message);
    throw new Error(message);
  }
  return data;
}

// STRICT MATCHING: NHL channel only, both teams in title, date in title must match the game.
// Returns null when nothing matches (no video beats a wrong video).
async function searchHighlightVideo(homeAbbr, awayAbbr, gameDate) {
  const shortName = (abbr) => (TEAM_NAMES[abbr] || abbr).split(" ").pop();
  const homeShort = shortName(homeAbbr);
  const awayShort = shortName(awayAbbr);
  const gameDateObj = new Date(gameDate);

  const query = `${awayShort} vs ${homeShort} NHL Highlights`;
  const search = await youtubeGet(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}` +
      `&type=video&channelId=${NHL_CHANNEL_ID}&maxResults=15&order=date&key=${youtubeApiKey}`,
  );
  const items = (search.items || []).filter((item) => item.id?.videoId);
  if (items.length === 0) return null;

  const durations = new Map();
  try {
    const videos = await youtubeGet(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${items.map((i) => i.id.videoId).join(",")}&key=${youtubeApiKey}`,
    );
    for (const video of videos.items || []) durations.set(video.id, parseDuration(video.contentDetails?.duration || ""));
  } catch (e) {
    if (e instanceof YouTubeUnavailableError) throw e;
    console.log("Duration lookup failed, continuing without duration filtering");
  }

  const candidates = [];
  for (const item of items) {
    const title = item.snippet?.title || "";
    const lowerTitle = title.toLowerCase();
    const duration = durations.get(item.id.videoId) || 0;
    const videoDate = extractDateFromTitle(title);

    if (item.snippet?.channelId !== NHL_CHANNEL_ID) continue;
    if (!lowerTitle.includes(homeShort.toLowerCase()) || !lowerTitle.includes(awayShort.toLowerCase())) continue;
    if (!videoDate || Math.abs(videoDate.getTime() - gameDateObj.getTime()) > 36 * 60 * 60 * 1000) continue;
    if (duration > 0 && duration < MIN_HIGHLIGHT_DURATION_SECONDS) continue;
    if (EXCLUDE_TITLE_PATTERNS.test(lowerTitle)) continue;

    let score = 100;
    if (PREFER_TITLE_PATTERNS.test(lowerTitle)) score += 50;
    if (duration > 0) score += Math.min(30, Math.floor(duration / 20));
    candidates.push({ videoId: item.id.videoId, score, title });
  }

  candidates.sort((a, b) => b.score - a.score);
  if (candidates.length > 0) console.log(`  Selected video ${candidates[0].videoId}: "${candidates[0].title}"`);
  return candidates[0]?.videoId ?? null;
}

async function syncNHLSverigeVideos() {
  const data = await youtubeGet(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${NHL_SVERIGE_PLAYLIST_ID}&maxResults=10&key=${youtubeApiKey}`,
  );
  const videos = (data.items || []).map((item) => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    thumbnail:
      item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || "",
    publishedAt: item.snippet.publishedAt,
  }));
  await writeJson("videos.json", videos);
  console.log(`Saved ${videos.length} NHL Sverige videos`);
}

// ---------- games ----------

// Scoring plays and goalie performances by Swedes in a finished game
async function fetchSwedishGameStats(game, swedishPlayers, swedishGoalies) {
  const points = [];
  const goalies = [];
  // Goals + assists by everyone vs. by Swedes, for the impact meter.
  // Shootout goals count on the scoreboard but are not points, so they are left out.
  const impact = { goals: 0, assists: 0, total: 0 };

  const landing = await fetchJson(`https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`);
  for (const period of landing.summary?.scoring || []) {
    const periodNumber = period.periodDescriptor?.number || 0;
    const isShootout = period.periodDescriptor?.periodType === "SO";
    for (const goal of period.goals || []) {
      if (!isShootout) {
        impact.total += 1 + (goal.assists || []).length;
        if (swedishPlayers.has(String(goal.playerId))) impact.goals++;
        impact.assists += (goal.assists || []).filter((a) => swedishPlayers.has(String(a.playerId))).length;
      }
      const scorer = swedishPlayers.get(String(goal.playerId));
      if (scorer) {
        points.push({
          playerId: String(goal.playerId),
          playerName: scorer.name,
          playerTeamAbbr: scorer.teamAbbr,
          type: "goal",
          period: periodNumber,
          time: goal.timeInPeriod || "",
          description: `${scorer.name} - Goal`,
        });
      }
      for (const assist of goal.assists || []) {
        const assister = swedishPlayers.get(String(assist.playerId));
        if (assister) {
          points.push({
            playerId: String(assist.playerId),
            playerName: assister.name,
            playerTeamAbbr: assister.teamAbbr,
            type: "assist",
            period: periodNumber,
            time: goal.timeInPeriod || "",
            description: `${assister.name} - Assist`,
          });
        }
      }
    }
  }

  // The boxscore has per-goalie stats (the landing endpoint does not)
  const boxscore = await fetchJson(`https://api-web.nhle.com/v1/gamecenter/${game.id}/boxscore`);
  for (const [side, teamAbbr] of [
    ["homeTeam", game.homeTeam?.abbrev],
    ["awayTeam", game.awayTeam?.abbrev],
  ]) {
    for (const goalie of boxscore.playerByGameStats?.[side]?.goalies || []) {
      const info = swedishGoalies.get(String(goalie.playerId));
      if (!info) continue;
      const saves = goalie.saves || 0;
      const shotsAgainst = goalie.shotsAgainst || 0;
      goalies.push({
        goalieId: String(goalie.playerId),
        goalieName: info.name,
        team: teamAbbr,
        teamAbbr: info.teamAbbr,
        saves,
        shotsAgainst,
        savePercentage: shotsAgainst > 0 ? saves / shotsAgainst : 0,
        result: goalie.decision === "W" ? "W" : goalie.decision === "L" ? "L" : "OT",
      });
    }
  }

  return { points, goalies, impact };
}

async function syncGames({ players, goalies }) {
  console.log("Fetching recent games...");
  const now = new Date();
  // The schedule endpoint returns 7 days from the given date, so start 6 days back to include today
  const startDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const schedule = await fetchJson(`https://api-web.nhle.com/v1/schedule/${startDate}`);
  const scheduledGames = (schedule.gameWeek || []).flatMap((day) => day.games || []);

  const swedishPlayers = new Map(players.map((p) => [p.id, { name: p.name, teamAbbr: p.team_abbr }]));
  const swedishGoalies = new Map(goalies.map((g) => [g.id, { name: g.name, teamAbbr: g.team_abbr }]));

  const existing = new Map((await readJson("games.json", [])).map((g) => [g.id, g]));
  console.log(`Loaded ${existing.size} existing games`);

  const fortyEightHoursAgo = now.getTime() - 48 * 60 * 60 * 1000;
  const fourHoursAgo = now.getTime() - 4 * 60 * 60 * 1000;
  let youtubeSearches = 0;
  let youtubeUnavailable = !youtubeApiKey;

  // Newest games first so the YouTube search budget goes to the most recent ones
  scheduledGames.sort((a, b) => new Date(b.startTimeUTC) - new Date(a.startTimeUTC));

  for (const game of scheduledGames) {
    const id = String(game.id);
    const previous = existing.get(id);
    const isFinal = game.gameState === "OFF" || game.gameState === "FINAL";

    let swedishPoints = previous?.swedish_points || [];
    let swedishGoaliePerformances = previous?.swedish_goalies || [];
    let impact = previous?.impact || null;
    if (isFinal) {
      try {
        ({ points: swedishPoints, goalies: swedishGoaliePerformances, impact } = await fetchSwedishGameStats(
          game,
          swedishPlayers,
          swedishGoalies,
        ));
      } catch (e) {
        console.error(`Failed to fetch stats for game ${id}:`, e.message);
      }
    }

    let highlightVideoId = previous?.highlight_video_id || null;
    let highlightCheckedAt = previous?.highlight_checked_at || null;
    const gameTime = new Date(game.startTimeUTC).getTime();
    const checkedRecently = highlightCheckedAt && new Date(highlightCheckedAt).getTime() > fourHoursAgo;
    if (
      isFinal &&
      !highlightVideoId &&
      gameTime > fortyEightHoursAgo &&
      !checkedRecently &&
      !youtubeUnavailable &&
      youtubeSearches < MAX_YOUTUBE_SEARCHES_PER_SYNC
    ) {
      console.log(`Searching YouTube for game ${id} (${youtubeSearches + 1}/${MAX_YOUTUBE_SEARCHES_PER_SYNC})`);
      youtubeSearches++;
      try {
        highlightVideoId = await searchHighlightVideo(game.homeTeam?.abbrev, game.awayTeam?.abbrev, game.startTimeUTC);
        highlightCheckedAt = now.toISOString();
      } catch (e) {
        if (e instanceof YouTubeUnavailableError) {
          console.error(`${e.message} (skipping remaining searches)`);
          youtubeUnavailable = true;
        } else {
          console.error(`YouTube search failed for game ${id}:`, e.message);
        }
      }
    }

    const teamName = (team) =>
      team?.placeName?.default && team?.commonName?.default ? `${team.placeName.default} ${team.commonName.default}` : "Unknown";

    existing.set(id, {
      id,
      game_date: game.startTimeUTC,
      home_team: teamName(game.homeTeam),
      home_team_abbr: game.homeTeam?.abbrev || "UNK",
      away_team: teamName(game.awayTeam),
      away_team_abbr: game.awayTeam?.abbrev || "UNK",
      home_score: game.homeTeam?.score || 0,
      away_score: game.awayTeam?.score || 0,
      status: isFinal ? "final" : game.gameState === "LIVE" || game.gameState === "CRIT" ? "live" : "scheduled",
      swedish_points: swedishPoints,
      swedish_goalies: swedishGoaliePerformances,
      impact,
      highlight_video_id: highlightVideoId && /^[a-zA-Z0-9_-]{11}$/.test(highlightVideoId) ? highlightVideoId : null,
      highlight_checked_at: highlightCheckedAt,
      period: game.periodDescriptor?.number ? `P${game.periodDescriptor.number}` : null,
      time_remaining: game.clock?.timeRemaining || null,
    });
  }

  const cutoff = now.getTime() - GAME_HISTORY_DAYS * 24 * 60 * 60 * 1000;

  // One-time backfill: finished games older than this week's schedule, saved before impact was tracked
  for (const row of existing.values()) {
    if (row.status !== "final" || row.impact || new Date(row.game_date).getTime() < cutoff) continue;
    try {
      const game = { id: row.id, homeTeam: { abbrev: row.home_team_abbr }, awayTeam: { abbrev: row.away_team_abbr } };
      // Swedes saved on the game also count (e.g. preseason scorers not yet in this season's stats)
      const players = new Map(swedishPlayers);
      for (const point of row.swedish_points || []) players.set(point.playerId, { name: point.playerName });
      row.impact = (await fetchSwedishGameStats(game, players, swedishGoalies)).impact;
    } catch (e) {
      console.error(`Failed to backfill impact for game ${row.id}:`, e.message);
    }
  }

  const games = [...existing.values()]
    .filter((g) => new Date(g.game_date).getTime() >= cutoff)
    .sort((a, b) => new Date(b.game_date) - new Date(a.game_date));
  await writeJson("games.json", games);
  console.log(`Saved ${games.length} games (${scheduledGames.length} from this week's schedule)`);
}

// ---------- main ----------

async function updateManifest(currentSeason) {
  const manifest = await readJson("manifest.json", { seasons: [] });
  manifest.currentSeason = currentSeason;
  manifest.lastSyncedAt = new Date().toISOString();
  manifest.seasons = [...new Set([...manifest.seasons, currentSeason])].sort().reverse();
  await writeJson("manifest.json", manifest);
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  const seasonArg = process.argv.indexOf("--season");
  const currentSeason = await getCurrentSeason();

  // One-off resync of a specific season: stats only
  if (seasonArg !== -1) {
    const season = process.argv[seasonArg + 1];
    if (!/^\d{8}$/.test(season ?? "")) throw new Error("--season expects an ID like 20252026");
    await syncSeasonStats(season, season === currentSeason);
    const manifest = await readJson("manifest.json", { seasons: [] });
    manifest.seasons = [...new Set([...manifest.seasons, season])].sort().reverse();
    await writeJson("manifest.json", manifest);
    return;
  }

  console.log(`Syncing current season ${currentSeason}`);
  const stats = await syncSeasonStats(currentSeason, true);
  await syncGames(stats);

  if (youtubeApiKey) {
    try {
      await syncNHLSverigeVideos();
    } catch (e) {
      console.error("Failed to sync NHL Sverige videos:", e.message);
    }
  } else {
    console.log("YOUTUBE_API_KEY not set, skipping highlight search and NHL Sverige videos");
  }

  await updateManifest(currentSeason);
  console.log("Sync complete");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
