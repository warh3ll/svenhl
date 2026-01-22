import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Known Swedish NHL players (NHL API uses birthCountry for filtering)
const SWEDISH_PLAYER_IDS = new Set([
  // This list would be populated from NHL API roster data
  // For now, we'll fetch all players and filter by birthCountry === 'SWE'
]);

interface NHLPlayer {
  playerId: number;
  firstName: { default: string };
  lastName: { default: string };
  teamAbbrev: string;
  teamName: { default: string };
  position: string;
  sweaterNumber: number;
  birthCountry: string;
  gamesPlayed: number;
  goals: number;
  assists: number;
  points: number;
  penaltyMinutes: number;
  plusMinus: number;
  avgToi: string;
  ppGoals: number;
  ppPoints: number;
  gameWinningGoals: number;
  shots: number;
  shootingPctg: number;
}

interface NHLGoalie {
  playerId: number;
  firstName: { default: string };
  lastName: { default: string };
  teamAbbrev: string;
  teamName: { default: string };
  sweaterNumber: number;
  birthCountry: string;
  gamesPlayed: number;
  gamesStarted: number;
  wins: number;
  losses: number;
  otLosses: number;
  savePctg: number;
  goalsAgainstAverage: number;
  shutouts: number;
  saves: number;
  shotsAgainst: number;
  timeOnIce: number;
}

// Team abbreviation to full name mapping
const TEAM_NAMES: Record<string, string> = {
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Note: This function is called by internal cron job only
  // Protected by obscurity (unique function URL) and Supabase infrastructure

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Helper function to parse ISO 8601 duration (e.g., "PT10M59S") to seconds
  function parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Minimum duration for a valid highlight video (5 minutes = 300 seconds)
  const MIN_HIGHLIGHT_DURATION_SECONDS = 300;

  // Title patterns to exclude (shorts, single plays)
  const EXCLUDE_TITLE_PATTERNS = /\b(#shorts?|short|goal of the|save of the|hit of the|fight|shootout only)\b/i;

  // Title patterns to prefer (full highlights)
  const PREFER_TITLE_PATTERNS = /\b(full highlights?|game recap|extended highlights?|nhl highlights?)\b/i;

  // Function to search for highlight video on official NHL YouTube channel
  // Returns { videoId: string | null, quotaExceeded: boolean }
  async function searchHighlightVideo(
    homeTeamAbbr: string,
    awayTeamAbbr: string,
    gameDate: string,
  ): Promise<{ videoId: string | null; quotaExceeded: boolean }> {
    if (!youtubeApiKey) {
      console.log("YouTube API key not configured, skipping video search");
      return { videoId: null, quotaExceeded: false };
    }

    try {
      // Use full team names for better YouTube search results
      const homeTeamFull = TEAM_NAMES[homeTeamAbbr] || homeTeamAbbr;
      const awayTeamFull = TEAM_NAMES[awayTeamAbbr] || awayTeamAbbr;

      // Extract just the team name (e.g., "Penguins" from "Pittsburgh Penguins")
      const getShortName = (fullName: string) => fullName.split(" ").pop() || fullName;
      const homeShort = getShortName(homeTeamFull);
      const awayShort = getShortName(awayTeamFull);

      // NHL videos are titled like "Rangers vs Penguins | NHL Highlights"
      const searchQuery = `${awayShort} vs ${homeShort} NHL Highlights`;

      // Search without channel filter first (more flexible), then verify channel
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&order=date&key=${youtubeApiKey}`;

      console.log(`Searching YouTube for: ${searchQuery}`);
      console.log(`Full URL (without key): ${url.replace(youtubeApiKey, "REDACTED")}`);

      const response = await fetch(url);
      const responseText = await response.text();

      if (!response.ok) {
        console.error(`YouTube API error: ${response.status}`);
        console.error(`YouTube API error response: ${responseText}`);

        // Parse error details if possible
        try {
          const errorData = JSON.parse(responseText);
          const errorReason = errorData.error?.errors?.[0]?.reason || "unknown";
          const errorMessage = errorData.error?.message || "No message";
          console.error(`YouTube error reason: ${errorReason}`);
          console.error(`YouTube error message: ${errorMessage}`);

          // Check for quota exceeded error
          if (errorReason === "quotaExceeded" || response.status === 403) {
            console.error("YouTube quota exceeded - triggering circuit breaker");
            return { videoId: null, quotaExceeded: true };
          }
        } catch {
          console.error("Could not parse error response as JSON");
        }
        return { videoId: null, quotaExceeded: false };
      }

      const data = JSON.parse(responseText);
      console.log(`YouTube search returned ${data.items?.length || 0} results`);

      if (!data.items || data.items.length === 0) {
        console.log("No YouTube results found");
        return { videoId: null, quotaExceeded: false };
      }

      // Extract video IDs for duration lookup
      const videoIds = data.items.map((item: any) => item.id?.videoId).filter(Boolean);
      if (videoIds.length === 0) {
        console.log("No valid video IDs in search results");
        return { videoId: null, quotaExceeded: false };
      }

      // Fetch video details including duration (costs 1 quota unit per call, regardless of how many IDs)
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(",")}&key=${youtubeApiKey}`;
      const videosResponse = await fetch(videosUrl);
      const videosText = await videosResponse.text();

      if (!videosResponse.ok) {
        console.error(`YouTube videos API error: ${videosResponse.status}`);
        try {
          const errorData = JSON.parse(videosText);
          if (errorData.error?.errors?.[0]?.reason === "quotaExceeded" || videosResponse.status === 403) {
            console.error("YouTube quota exceeded on videos lookup");
            return { videoId: null, quotaExceeded: true };
          }
        } catch {
          // Ignore parse error
        }
        // Fall back to search results without duration filtering
        console.log("Falling back to search results without duration filtering");
      }

      // Create a map of video ID to duration (in seconds)
      const videoDurations = new Map<string, number>();
      try {
        const videosData = JSON.parse(videosText);
        for (const video of videosData.items || []) {
          const duration = parseDuration(video.contentDetails?.duration || "");
          videoDurations.set(video.id, duration);
          console.log(`Video ${video.id}: duration ${duration}s (${video.contentDetails?.duration})`);
        }
      } catch (e) {
        console.error("Failed to parse videos response:", e);
      }

      // Filter and score candidates
      const nhlChannelId = "UCqFMzb-4AUf6WAIbl132QKA";
      const candidates: Array<{ item: any; score: number; duration: number }> = [];

      for (const item of data.items) {
        const videoId = item.id?.videoId;
        if (!videoId) continue;

        const title = item.snippet?.title?.toLowerCase() || "";
        const channelId = item.snippet?.channelId;
        const duration = videoDurations.get(videoId) || 0;

        // Skip videos that are too short (likely Shorts or single plays)
        if (duration > 0 && duration < MIN_HIGHLIGHT_DURATION_SECONDS) {
          console.log(`Skipping ${videoId} - too short (${duration}s < ${MIN_HIGHLIGHT_DURATION_SECONDS}s): "${item.snippet?.title}"`);
          continue;
        }

        // Skip videos with excluded title patterns
        if (EXCLUDE_TITLE_PATTERNS.test(title)) {
          console.log(`Skipping ${videoId} - excluded title pattern: "${item.snippet?.title}"`);
          continue;
        }

        // Calculate score
        let score = 0;

        // Prefer NHL channel (+100)
        if (channelId === nhlChannelId) {
          score += 100;
        }

        // Prefer titles with highlight keywords (+50)
        if (PREFER_TITLE_PATTERNS.test(title)) {
          score += 50;
        }

        // Prefer longer videos (up to +30 for 10+ minute videos)
        if (duration > 0) {
          score += Math.min(30, Math.floor(duration / 20));
        }

        // Bonus for containing "nhl" in title (+10)
        if (title.includes("nhl")) {
          score += 10;
        }

        candidates.push({ item, score, duration });
        console.log(`Candidate ${videoId}: score=${score}, duration=${duration}s, title="${item.snippet?.title}"`);
      }

      // Sort by score (descending) and pick the best
      candidates.sort((a, b) => b.score - a.score);

      if (candidates.length === 0) {
        console.log("No suitable highlight video found after filtering");
        return { videoId: null, quotaExceeded: false };
      }

      const bestMatch = candidates[0];
      const videoId = bestMatch.item.id?.videoId;

      console.log(`Selected highlight video: ${videoId} (score=${bestMatch.score}, duration=${bestMatch.duration}s) - "${bestMatch.item.snippet?.title}"`);
      console.log(`Channel: ${bestMatch.item.snippet?.channelTitle} (${bestMatch.item.snippet?.channelId})`);

      return { videoId, quotaExceeded: false };
    } catch (error) {
      console.error("Error searching YouTube:", error);
      return { videoId: null, quotaExceeded: false };
    }
  }

  try {
    console.log("Starting NHL data sync...");

    // Update sync status
    await supabase
      .from("nhl_sync_status")
      .upsert({ id: "main", sync_status: "syncing", last_synced_at: new Date().toISOString() });

    // Parse request body for optional parameters
    let season = "20252026"; // Current NHL season
    try {
      const body = await req.json();
      if (body.season) season = body.season;
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Fetch Swedish skaters from NHL API using nationalityCode filter
    console.log(`Fetching Swedish skater stats for season ${season}...`);
    const skaterUrl = `https://api.nhle.com/stats/rest/en/skater/summary?isAggregate=false&isGame=false&sort=%5B%7B%22property%22:%22points%22,%22direction%22:%22DESC%22%7D%5D&start=0&limit=100&cayenneExp=seasonId=${season} and nationalityCode="SWE"`;
    console.log("Skater URL:", skaterUrl);

    const skatersResponse = await fetch(skaterUrl);

    if (!skatersResponse.ok) {
      const errorText = await skatersResponse.text();
      console.error("NHL API skaters error response:", errorText);
      throw new Error(`NHL API skaters error: ${skatersResponse.status}`);
    }

    const skatersData = await skatersResponse.json();
    console.log("Skaters API response total:", skatersData.total);
    const swedishSkaters = skatersData.data || [];
    console.log(`Found ${swedishSkaters.length} Swedish skaters`);

    // Log first player to debug field names
    if (swedishSkaters.length > 0) {
      console.log("Sample skater fields:", JSON.stringify(Object.keys(swedishSkaters[0])));
    }

    // Fetch jersey numbers from player landing endpoint (stats API doesn't include them)
    const playerJerseyNumbers = new Map<string, number>();
    console.log("Fetching jersey numbers from player landing endpoints...");

    for (const player of swedishSkaters) {
      try {
        const playerResponse = await fetch(`https://api-web.nhle.com/v1/player/${player.playerId}/landing`);
        if (playerResponse.ok) {
          const playerData = await playerResponse.json();
          playerJerseyNumbers.set(String(player.playerId), playerData.sweaterNumber || 0);
        }
      } catch (e) {
        console.error(`Failed to fetch jersey for player ${player.playerId}:`, e);
      }
    }

    // Upsert Swedish skaters
    for (const player of swedishSkaters) {
      const teamAbbr = player.teamAbbrevs || "UNK";
      const jerseyNumber = playerJerseyNumbers.get(String(player.playerId)) || 0;
      await supabase.from("swedish_players").upsert({
        id: String(player.playerId),
        name: `${player.skaterFullName}`,
        team: TEAM_NAMES[teamAbbr] || teamAbbr,
        team_abbr: teamAbbr,
        position: player.positionCode || "F",
        jersey_number: jerseyNumber,
        games: player.gamesPlayed || 0,
        goals: player.goals || 0,
        assists: player.assists || 0,
        points: player.points || 0,
        penalty_minutes: player.penaltyMinutes || 0,
        plus_minus: player.plusMinus || 0,
        time_on_ice: player.timeOnIcePerGame
          ? String(Math.floor(player.timeOnIcePerGame / 60)) +
            ":" +
            String(Math.floor(player.timeOnIcePerGame % 60)).padStart(2, "0")
          : "0:00",
        power_play_goals: player.ppGoals || 0,
        power_play_points: player.ppPoints || 0,
        game_winning_goals: player.gameWinningGoals || 0,
        shots: player.shots || 0,
        shooting_pct: player.shootingPct ? (player.shootingPct * 100).toFixed(1) : 0,
        season: season,
        updated_at: new Date().toISOString(),
      });
    }

    // Fetch Swedish goalies from NHL API using nationalityCode filter
    console.log(`Fetching Swedish goalie stats for season ${season}...`);
    const goalieUrl = `https://api.nhle.com/stats/rest/en/goalie/summary?isAggregate=false&isGame=false&sort=%5B%7B%22property%22:%22wins%22,%22direction%22:%22DESC%22%7D%5D&start=0&limit=50&cayenneExp=seasonId=${season} and nationalityCode="SWE"`;
    console.log("Goalie URL:", goalieUrl);

    const goaliesResponse = await fetch(goalieUrl);

    if (!goaliesResponse.ok) {
      const errorText = await goaliesResponse.text();
      console.error("NHL API goalies error response:", errorText);
      throw new Error(`NHL API goalies error: ${goaliesResponse.status}`);
    }

    const goaliesData = await goaliesResponse.json();
    console.log("Goalies API response total:", goaliesData.total);
    const swedishGoalies = goaliesData.data || [];
    console.log(`Found ${swedishGoalies.length} Swedish goalies`);

    // Fetch jersey numbers for goalies
    const goalieJerseyNumbers = new Map<string, number>();
    console.log("Fetching jersey numbers for goalies...");

    for (const goalie of swedishGoalies) {
      try {
        const playerResponse = await fetch(`https://api-web.nhle.com/v1/player/${goalie.playerId}/landing`);
        if (playerResponse.ok) {
          const playerData = await playerResponse.json();
          goalieJerseyNumbers.set(String(goalie.playerId), playerData.sweaterNumber || 0);
        }
      } catch (e) {
        console.error(`Failed to fetch jersey for goalie ${goalie.playerId}:`, e);
      }
    }

    // Upsert Swedish goalies
    for (const goalie of swedishGoalies) {
      const teamAbbr = goalie.teamAbbrevs || "UNK";
      const jerseyNumber = goalieJerseyNumbers.get(String(goalie.playerId)) || 0;
      await supabase.from("swedish_goalies").upsert({
        id: String(goalie.playerId),
        name: goalie.goalieFullName,
        team: TEAM_NAMES[teamAbbr] || teamAbbr,
        team_abbr: teamAbbr,
        jersey_number: jerseyNumber,
        games: goalie.gamesPlayed || 0,
        games_started: goalie.gamesStarted || 0,
        wins: goalie.wins || 0,
        losses: goalie.losses || 0,
        overtime_losses: goalie.otLosses || 0,
        save_percentage: goalie.savePct || 0,
        goals_against_average: goalie.goalsAgainstAverage || 0,
        shutouts: goalie.shutouts || 0,
        saves: goalie.saves || 0,
        shots_against: goalie.shotsAgainst || 0,
        time_on_ice: goalie.timeOnIce ? String(Math.floor(goalie.timeOnIce / 60)) + ":00" : "0:00",
        season: season,
        updated_at: new Date().toISOString(),
      });
    }

    // Fetch recent games (last 7 days)
    console.log("Fetching recent games...");
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startDate = weekAgo.toISOString().split("T")[0];
    const endDate = today.toISOString().split("T")[0];

    const scheduleResponse = await fetch(`https://api-web.nhle.com/v1/schedule/${startDate}`);

    if (scheduleResponse.ok) {
      const scheduleData = await scheduleResponse.json();
      const gameWeek = scheduleData.gameWeek || [];

      // Get set of Swedish player IDs for quick lookup (from current season)
      const { data: swedishPlayerData } = await supabase
        .from("swedish_players")
        .select("id, name, team_abbr")
        .eq("season", season);
      const swedishPlayerMap = new Map(
        (swedishPlayerData || []).map((p) => [p.id, { name: p.name, teamAbbr: p.team_abbr }]),
      );
      console.log(`Loaded ${swedishPlayerMap.size} Swedish players for game matching`);

      const { data: swedishGoalieData } = await supabase
        .from("swedish_goalies")
        .select("id, name, team_abbr")
        .eq("season", season);
      const swedishGoalieMap = new Map(
        (swedishGoalieData || []).map((g) => [g.id, { name: g.name, teamAbbr: g.team_abbr }]),
      );
      console.log(`Loaded ${swedishGoalieMap.size} Swedish goalies for game matching`);

      // Fetch existing games to check for cached video IDs and highlight_checked_at
      const allGameIds: string[] = [];
      for (const day of gameWeek) {
        for (const game of day.games || []) {
          allGameIds.push(String(game.id));
        }
      }

      const { data: existingGames } = await supabase
        .from("nhl_games")
        .select("id, highlight_video_id, highlight_checked_at, video_reported_at")
        .in("id", allGameIds);

      const existingVideoIds = new Map<string, string | null>(
        (existingGames || []).map((g) => [g.id, g.highlight_video_id]),
      );
      const existingCheckedAt = new Map<string, string | null>(
        (existingGames || []).map((g) => [g.id, g.highlight_checked_at]),
      );
      const existingReportedAt = new Map<string, string | null>(
        (existingGames || []).map((g) => [g.id, g.video_reported_at]),
      );
      console.log(
        `Loaded ${existingVideoIds.size} existing games, ${[...existingVideoIds.values()].filter((v) => v).length} already have video IDs, ${[...existingReportedAt.values()].filter((v) => v).length} reported`,
      );

      // Circuit breaker for YouTube quota
      let youtubeQuotaExceeded = false;

      // Limit YouTube searches per sync run to preserve quota
      const MAX_YOUTUBE_SEARCHES_PER_SYNC = 5;
      let youtubeSearchesThisSync = 0;

      // Only search for videos from games in the last 48 hours
      const now = new Date();
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
      const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

      for (const day of gameWeek) {
        for (const game of day.games || []) {
          const gameId = String(game.id);

          // Fetch game details including plays/scoring
          let swedishPoints: any[] = [];
          let swedishGoaliePerformances: any[] = [];

          if (game.gameState === "OFF" || game.gameState === "FINAL") {
            try {
              // Fetch LANDING endpoint for scoring data (boxscore has empty summary!)
              const landingResponse = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game.id}/landing`);

              if (landingResponse.ok) {
                const landing = await landingResponse.json();

                // Landing endpoint has scoring data in summary.scoring[]
                const scoringPeriods = landing.summary?.scoring || [];
                console.log(`Game ${gameId}: Found ${scoringPeriods.length} scoring periods`);

                for (const period of scoringPeriods) {
                  const goals = period.goals || [];
                  console.log(`  Period ${period.periodDescriptor?.number}: ${goals.length} goals`);

                  for (const goal of goals) {
                    // In landing endpoint, scorer ID is directly in playerId field
                    const scorerId = String(goal.playerId);
                    const scorerName = goal.name?.default || goal.firstName?.default + " " + goal.lastName?.default;

                    console.log(`    Goal by player ID: ${scorerId}, name: ${scorerName}`);

                    // Check if scorer is Swedish
                    if (swedishPlayerMap.has(scorerId)) {
                      const playerInfo = swedishPlayerMap.get(scorerId)!;
                      console.log(`      -> Swedish player GOAL: ${playerInfo.name}`);
                      swedishPoints.push({
                        playerId: scorerId,
                        playerName: playerInfo.name,
                        playerTeamAbbr: playerInfo.teamAbbr,
                        type: "goal",
                        period: period.periodDescriptor?.number || 0,
                        time: goal.timeInPeriod || "",
                        description: `${playerInfo.name} - Goal`,
                      });
                    }

                    // Check assists - in landing endpoint, assists array has playerId
                    const assists = goal.assists || [];
                    for (const assist of assists) {
                      const assistId = String(assist.playerId);
                      console.log(`    Assist by player ID: ${assistId}, name: ${assist.name?.default}`);

                      if (swedishPlayerMap.has(assistId)) {
                        const playerInfo = swedishPlayerMap.get(assistId)!;
                        console.log(`      -> Swedish player ASSIST: ${playerInfo.name}`);
                        swedishPoints.push({
                          playerId: assistId,
                          playerName: playerInfo.name,
                          playerTeamAbbr: playerInfo.teamAbbr,
                          type: "assist",
                          period: period.periodDescriptor?.number || 0,
                          time: goal.timeInPeriod || "",
                          description: `${playerInfo.name} - Assist`,
                        });
                      }
                    }
                  }
                }

                console.log(`Game ${gameId}: Total Swedish points found: ${swedishPoints.length}`);
              }

              // Fetch BOXSCORE separately for goalie stats (it has playerByGameStats)
              const boxscoreResponse = await fetch(`https://api-web.nhle.com/v1/gamecenter/${game.id}/boxscore`);

              if (boxscoreResponse.ok) {
                const boxscore = await boxscoreResponse.json();

                // Check for Swedish goalies
                const checkGoalies = (teamData: any, teamAbbr: string) => {
                  if (!teamData?.goalies) return;
                  for (const goalie of teamData.goalies) {
                    const goalieInfo = swedishGoalieMap.get(String(goalie.playerId));
                    if (goalieInfo) {
                      const saves = goalie.saves || 0;
                      const shotsAgainst = goalie.shotsAgainst || 0;
                      const savePct = shotsAgainst > 0 ? saves / shotsAgainst : 0;

                      swedishGoaliePerformances.push({
                        goalieId: String(goalie.playerId),
                        goalieName: goalieInfo.name,
                        team: teamAbbr,
                        teamAbbr: goalieInfo.teamAbbr,
                        saves: saves,
                        shotsAgainst: shotsAgainst,
                        savePercentage: savePct,
                        result: goalie.decision === "W" ? "W" : goalie.decision === "L" ? "L" : "OT",
                      });
                    }
                  }
                };

                checkGoalies(boxscore.playerByGameStats?.homeTeam, game.homeTeam?.abbrev);
                checkGoalies(boxscore.playerByGameStats?.awayTeam, game.awayTeam?.abbrev);
              }
            } catch (e) {
              console.error(`Error fetching boxscore for game ${game.id}:`, e);
            }
          }

          // Construct highlight URL (NHL official YouTube format)
          const highlightUrl = `https://www.youtube.com/results?search_query=NHL+${game.homeTeam?.abbrev}+vs+${game.awayTeam?.abbrev}+${day.date}+highlights`;

          // Search for actual highlight video ID (only for completed games)
          let highlightVideoId: string | null = null;
          let shouldUpdateCheckedAt = false;

          if (game.gameState === "OFF" || game.gameState === "FINAL") {
            // Check if we already have a cached video ID
            const cachedVideoId = existingVideoIds.get(gameId);
            
            // Check if video was reported (force re-search)
            const wasReported = existingReportedAt.get(gameId);
            
            if (cachedVideoId && !wasReported) {
              console.log(`Using cached video ID for game ${gameId}: ${cachedVideoId}`);
              highlightVideoId = cachedVideoId;
            } else {
              // Check if we've already searched recently (within 4 hours)
              const lastChecked = existingCheckedAt.get(gameId);
              const lastCheckedDate = lastChecked ? new Date(lastChecked) : null;
              const wasCheckedRecently = lastCheckedDate && lastCheckedDate > fourHoursAgo;

              // Check if game is recent enough to search (within 48 hours) OR was reported
              const gameDate = new Date(game.startTimeUTC);
              const isRecentGame = gameDate > fortyEightHoursAgo;

              // Only search if: 
              // - (game is recent OR was reported)
              // - AND (not checked recently OR was reported - reported bypasses cooldown)
              // - AND quota not exceeded
              // - AND under search limit
              if (
                (isRecentGame || wasReported) &&
                (!wasCheckedRecently || wasReported) &&
                !youtubeQuotaExceeded &&
                youtubeSearchesThisSync < MAX_YOUTUBE_SEARCHES_PER_SYNC
              ) {
                if (wasReported) {
                  console.log(`Searching YouTube for REPORTED game ${gameId} (search ${youtubeSearchesThisSync + 1}/${MAX_YOUTUBE_SEARCHES_PER_SYNC})`);
                } else {
                  console.log(
                    `Searching YouTube for game ${gameId} (search ${youtubeSearchesThisSync + 1}/${MAX_YOUTUBE_SEARCHES_PER_SYNC})`,
                  );
                }

                const searchResult = await searchHighlightVideo(
                  game.homeTeam?.abbrev || "",
                  game.awayTeam?.abbrev || "",
                  game.startTimeUTC,
                );

                highlightVideoId = searchResult.videoId;
                youtubeSearchesThisSync++;
                shouldUpdateCheckedAt = true;

                // Check if quota was exceeded - trigger circuit breaker
                if (searchResult.quotaExceeded) {
                  youtubeQuotaExceeded = true;
                  console.log("YouTube quota exceeded - circuit breaker activated, skipping remaining searches");
                }

                // Small delay to avoid hitting YouTube API rate limits
                await new Promise((resolve) => setTimeout(resolve, 200));
              } else if (!isRecentGame) {
                console.log(`Skipping YouTube search for game ${gameId} - game older than 48 hours`);
              } else if (wasCheckedRecently) {
                console.log(`Skipping YouTube search for game ${gameId} - checked within last 24 hours`);
              } else if (youtubeSearchesThisSync >= MAX_YOUTUBE_SEARCHES_PER_SYNC) {
                console.log(
                  `Skipping YouTube search for game ${gameId} - reached max ${MAX_YOUTUBE_SEARCHES_PER_SYNC} searches this sync`,
                );
              } else {
                console.log(`Skipping YouTube search for game ${gameId} - quota exceeded`);
              }
            }
          }

          // Validate YouTube video ID format before storing (11 chars: alphanumeric, hyphen, underscore)
          const validatedVideoId =
            highlightVideoId && /^[a-zA-Z0-9_-]{11}$/.test(highlightVideoId) ? highlightVideoId : null;

          const gameUpsertData: any = {
            id: gameId,
            game_date: game.startTimeUTC,
            home_team: game.homeTeam?.placeName?.default + " " + game.homeTeam?.commonName?.default || "Unknown",
            home_team_abbr: game.homeTeam?.abbrev || "UNK",
            away_team: game.awayTeam?.placeName?.default + " " + game.awayTeam?.commonName?.default || "Unknown",
            away_team_abbr: game.awayTeam?.abbrev || "UNK",
            home_score: game.homeTeam?.score || 0,
            away_score: game.awayTeam?.score || 0,
            status:
              game.gameState === "OFF" || game.gameState === "FINAL"
                ? "final"
                : game.gameState === "LIVE" || game.gameState === "CRIT"
                  ? "live"
                  : "scheduled",
            swedish_points: swedishPoints,
            swedish_goalies: swedishGoaliePerformances,
            highlight_url: highlightUrl,
            highlight_video_id: validatedVideoId,
            period: game.periodDescriptor?.number ? `P${game.periodDescriptor.number}` : null,
            time_remaining: game.clock?.timeRemaining || null,
            updated_at: new Date().toISOString(),
          };

          // Only update highlight_checked_at if we actually searched YouTube
          if (shouldUpdateCheckedAt) {
            gameUpsertData.highlight_checked_at = new Date().toISOString();
            // Clear video_reported_at after a successful search (whether we found a video or not)
            gameUpsertData.video_reported_at = null;
          }

          await supabase.from("nhl_games").upsert(gameUpsertData);
        }
      }
    }

    // Update sync status to complete
    await supabase
      .from("nhl_sync_status")
      .upsert({ id: "main", sync_status: "complete", last_synced_at: new Date().toISOString(), error_message: null });

    console.log("NHL data sync complete!");

    return new Response(
      JSON.stringify({
        success: true,
        message: "NHL data synced successfully",
        stats: {
          swedishSkaters: swedishSkaters.length,
          swedishGoalies: swedishGoalies.length,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error syncing NHL data:", errorMessage);

    // Update sync status with error
    await supabase.from("nhl_sync_status").upsert({
      id: "main",
      sync_status: "error",
      error_message: errorMessage,
    });

    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
