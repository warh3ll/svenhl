-- Enable required extensions for cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create table for caching Swedish players
CREATE TABLE public.swedish_players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  team_abbr TEXT NOT NULL,
  position TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  games INTEGER DEFAULT 0,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  penalty_minutes INTEGER DEFAULT 0,
  plus_minus INTEGER DEFAULT 0,
  time_on_ice TEXT,
  power_play_goals INTEGER DEFAULT 0,
  power_play_points INTEGER DEFAULT 0,
  game_winning_goals INTEGER DEFAULT 0,
  shots INTEGER DEFAULT 0,
  shooting_pct NUMERIC(5,2) DEFAULT 0,
  season TEXT NOT NULL DEFAULT '20252026',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for caching Swedish goalies
CREATE TABLE public.swedish_goalies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team TEXT NOT NULL,
  team_abbr TEXT NOT NULL,
  jersey_number INTEGER NOT NULL,
  games INTEGER DEFAULT 0,
  games_started INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  overtime_losses INTEGER DEFAULT 0,
  save_percentage NUMERIC(5,3) DEFAULT 0,
  goals_against_average NUMERIC(4,2) DEFAULT 0,
  shutouts INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shots_against INTEGER DEFAULT 0,
  time_on_ice TEXT,
  season TEXT NOT NULL DEFAULT '20252026',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for caching games with Swedish involvement
CREATE TABLE public.nhl_games (
  id TEXT PRIMARY KEY,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  home_team TEXT NOT NULL,
  home_team_abbr TEXT NOT NULL,
  away_team TEXT NOT NULL,
  away_team_abbr TEXT NOT NULL,
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  swedish_points JSONB DEFAULT '[]'::jsonb,
  swedish_goalies JSONB DEFAULT '[]'::jsonb,
  highlight_url TEXT,
  period TEXT,
  time_remaining TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table to track last sync time
CREATE TABLE public.nhl_sync_status (
  id TEXT PRIMARY KEY DEFAULT 'main',
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle',
  error_message TEXT
);

-- Insert initial sync status
INSERT INTO public.nhl_sync_status (id, sync_status) VALUES ('main', 'idle');

-- Enable RLS but allow public read access (this is public sports data)
ALTER TABLE public.swedish_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swedish_goalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhl_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nhl_sync_status ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for swedish_players" ON public.swedish_players FOR SELECT USING (true);
CREATE POLICY "Public read access for swedish_goalies" ON public.swedish_goalies FOR SELECT USING (true);
CREATE POLICY "Public read access for nhl_games" ON public.nhl_games FOR SELECT USING (true);
CREATE POLICY "Public read access for nhl_sync_status" ON public.nhl_sync_status FOR SELECT USING (true);

-- Create indexes for common queries
CREATE INDEX idx_swedish_players_season ON public.swedish_players(season);
CREATE INDEX idx_swedish_players_points ON public.swedish_players(points DESC);
CREATE INDEX idx_swedish_goalies_season ON public.swedish_goalies(season);
CREATE INDEX idx_nhl_games_date ON public.nhl_games(game_date DESC);
CREATE INDEX idx_nhl_games_status ON public.nhl_games(status);