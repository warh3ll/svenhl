CREATE POLICY "Public read access for teams bucket" ON storage.objects FOR SELECT USING (bucket_id = 'teams');
CREATE POLICY "Block anonymous writes to teams bucket" ON storage.objects FOR INSERT TO authenticated, anon WITH CHECK (false);
CREATE POLICY "Block anonymous updates to teams bucket" ON storage.objects FOR UPDATE TO authenticated, anon USING (false);
CREATE POLICY "Block anonymous deletes to teams bucket" ON storage.objects FOR DELETE TO authenticated, anon USING (false);