-- Add highlight_video_id column to store YouTube video IDs for embedding
ALTER TABLE public.nhl_games 
ADD COLUMN IF NOT EXISTS highlight_video_id text;