import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Game, SwedishPlayer, SwedishGoalie, GamePoint, GoaliePerformance, PlayerGameLogEntry, CareerSeasonStats } from '@/types/nhl';

// Transform database row to frontend type
const transformPlayer = (row: any): SwedishPlayer => ({
  id: row.id,
  name: row.name,
  team: row.team,
  teamAbbr: row.team_abbr,
  position: row.position,
  jerseyNumber: row.jersey_number,
  games: row.games,
  goals: row.goals,
  assists: row.assists,
  points: row.points,
  penaltyMinutes: row.penalty_minutes,
  plusMinus: row.plus_minus,
  timeOnIce: row.time_on_ice || '0:00',
  powerPlayGoals: row.power_play_goals,
  powerPlayPoints: row.power_play_points,
  gameWinningGoals: row.game_winning_goals,
  shots: row.shots,
  shootingPct: Number(row.shooting_pct) || 0,
});

const transformGoalie = (row: any): SwedishGoalie => ({
  id: row.id,
  name: row.name,
  team: row.team,
  teamAbbr: row.team_abbr,
  jerseyNumber: row.jersey_number,
  games: row.games,
  gamesStarted: row.games_started,
  wins: row.wins,
  losses: row.losses,
  overtimeLosses: row.overtime_losses,
  savePercentage: Number(row.save_percentage) || 0,
  goalsAgainstAverage: Number(row.goals_against_average) || 0,
  shutouts: row.shutouts,
  saves: row.saves,
  shotsAgainst: row.shots_against,
  timeOnIce: row.time_on_ice || '0:00',
});

const transformGame = (row: any): Game => ({
  id: row.id,
  date: row.game_date,
  homeTeam: row.home_team,
  homeTeamAbbr: row.home_team_abbr,
  awayTeam: row.away_team,
  awayTeamAbbr: row.away_team_abbr,
  homeScore: row.home_score,
  awayScore: row.away_score,
  status: row.status as 'final' | 'live' | 'scheduled',
  swedishPoints: (row.swedish_points as GamePoint[]) || [],
  swedishGoalies: (row.swedish_goalies as GoaliePerformance[]) || [],
  highlightUrl: row.highlight_url,
  highlightVideoId: row.highlight_video_id || undefined,
  period: row.period,
  timeRemaining: row.time_remaining,
});

export function useSwedishPlayers(season: string = '20252026') {
  return useQuery({
    queryKey: ['swedish-players', season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swedish_players')
        .select('*')
        .eq('season', season)
        .order('points', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformPlayer);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useSwedishGoalies(season: string = '20252026') {
  return useQuery({
    queryKey: ['swedish-goalies', season],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swedish_goalies')
        .select('*')
        .eq('season', season)
        .order('wins', { ascending: false });

      if (error) throw error;
      return (data || []).map(transformGoalie);
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useNHLGames() {
  return useQuery({
    queryKey: ['nhl-games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_games')
        .select('*')
        .order('game_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      return (data || []).map(transformGame);
    },
    staleTime: 1000 * 60 * 5, // 5 minutes for games (more frequent updates)
  });
}

export function useSyncStatus() {
  return useQuery({
    queryKey: ['sync-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_sync_status')
        .select('*')
        .eq('id', 'main')
        .single();

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useSyncNHLData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (season?: string) => {
      const { data, error } = await supabase.functions.invoke('sync-nhl-data', {
        body: { season: season || '20252026' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate all NHL data queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['swedish-players'] });
      queryClient.invalidateQueries({ queryKey: ['swedish-goalies'] });
      queryClient.invalidateQueries({ queryKey: ['nhl-games'] });
      queryClient.invalidateQueries({ queryKey: ['sync-status'] });
    },
  });
}

// Get a single player by ID (tries current season first)
export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swedish_players')
        .select('*')
        .eq('id', playerId)
        .order('season', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? transformPlayer(data) : null;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 30,
  });
}

// Get a single goalie by ID
export function useGoalie(goalieId: string) {
  return useQuery({
    queryKey: ['goalie', goalieId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('swedish_goalies')
        .select('*')
        .eq('id', goalieId)
        .order('season', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data ? transformGoalie(data) : null;
    },
    enabled: !!goalieId,
    staleTime: 1000 * 60 * 30,
  });
}

// Get game log for a player (games where they recorded points)
export function usePlayerGameLog(playerId: string) {
  return useQuery({
    queryKey: ['player-game-log', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nhl_games')
        .select('*')
        .order('game_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Filter games where this player recorded points
      const gameLog: PlayerGameLogEntry[] = [];
      
      for (const game of data || []) {
        const points = (game.swedish_points as unknown as GamePoint[]) || [];
        const playerPoints = points.filter(p => p.playerId === playerId);
        
        for (const point of playerPoints) {
          gameLog.push({
            gameId: game.id,
            gameDate: game.game_date,
            homeTeamAbbr: game.home_team_abbr,
            awayTeamAbbr: game.away_team_abbr,
            type: point.type,
            period: point.period,
            time: point.time,
            description: point.description,
          });
        }
      }
      
      return gameLog;
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 5,
  });
}

// Get career stats across all seasons
export function usePlayerCareerStats(playerId: string) {
  return useQuery({
    queryKey: ['player-career', playerId],
    queryFn: async () => {
      // Try players table first
      const { data: playerData } = await supabase
        .from('swedish_players')
        .select('*')
        .eq('id', playerId)
        .order('season', { ascending: false });

      if (playerData && playerData.length > 0) {
        return playerData.map((row): CareerSeasonStats => ({
          season: row.season,
          team: row.team,
          teamAbbr: row.team_abbr,
          games: row.games || 0,
          goals: row.goals || 0,
          assists: row.assists || 0,
          points: row.points || 0,
          plusMinus: row.plus_minus || 0,
          penaltyMinutes: row.penalty_minutes || 0,
        }));
      }

      // Try goalies table
      const { data: goalieData } = await supabase
        .from('swedish_goalies')
        .select('*')
        .eq('id', playerId)
        .order('season', { ascending: false });

      if (goalieData && goalieData.length > 0) {
        return goalieData.map((row): CareerSeasonStats => ({
          season: row.season,
          team: row.team,
          teamAbbr: row.team_abbr,
          games: row.games || 0,
          wins: row.wins || 0,
          losses: row.losses || 0,
          savePercentage: Number(row.save_percentage) || 0,
          goalsAgainstAverage: Number(row.goals_against_average) || 0,
          shutouts: row.shutouts || 0,
        }));
      }

      return [];
    },
    enabled: !!playerId,
    staleTime: 1000 * 60 * 30,
  });
}
