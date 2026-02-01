import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface NHLSverigeVideo {
  id: string;
  title: string;
  thumbnail: string;
  publishedAt: string;
}

interface VideosResponse {
  videos: NHLSverigeVideo[];
  error?: string;
}

const fetchNHLSverigeVideos = async (): Promise<NHLSverigeVideo[]> => {
  const { data, error } = await supabase.functions.invoke<VideosResponse>('nhl-sverige-videos', {
    body: {},
  });

  if (error) {
    console.error('Error fetching NHL Sverige videos:', error);
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.videos || [];
};

export const useNHLSverigeVideos = () => {
  return useQuery({
    queryKey: ['nhl-sverige-videos'],
    queryFn: fetchNHLSverigeVideos,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};
