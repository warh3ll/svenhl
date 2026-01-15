-- Add column to track when we last attempted to find a highlight video
ALTER TABLE public.nhl_games ADD COLUMN highlight_checked_at timestamptz NULL;