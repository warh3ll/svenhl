-- Add column to track when a video was reported as incorrect
ALTER TABLE public.nhl_games ADD COLUMN video_reported_at timestamptz;