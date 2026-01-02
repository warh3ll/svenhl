-- Drop existing primary key and add composite primary key for multi-season storage
-- For swedish_players table
ALTER TABLE public.swedish_players DROP CONSTRAINT swedish_players_pkey;
ALTER TABLE public.swedish_players ADD PRIMARY KEY (id, season);

-- For swedish_goalies table
ALTER TABLE public.swedish_goalies DROP CONSTRAINT swedish_goalies_pkey;
ALTER TABLE public.swedish_goalies ADD PRIMARY KEY (id, season);