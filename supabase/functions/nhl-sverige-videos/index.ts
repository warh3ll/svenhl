import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PLAYLIST_ID = 'PLfsAEO-f92nqOtemyyAvcxpKU6JjiAGqM';

interface YouTubePlaylistItem {
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    publishedAt: string;
    resourceId: {
      videoId: string;
    };
  };
}

interface YouTubeResponse {
  items: YouTubePlaylistItem[];
  error?: {
    message: string;
    code: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('YOUTUBE_API_KEY');
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY not configured');
    }

    const url = new URL(req.url);
    const maxResults = url.searchParams.get('maxResults') || '10';

    // Fetch playlist items from YouTube API
    const youtubeUrl = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    youtubeUrl.searchParams.set('part', 'snippet');
    youtubeUrl.searchParams.set('playlistId', PLAYLIST_ID);
    youtubeUrl.searchParams.set('maxResults', maxResults);
    youtubeUrl.searchParams.set('key', apiKey);

    const response = await fetch(youtubeUrl.toString());
    const data: YouTubeResponse = await response.json();

    if (data.error) {
      console.error('YouTube API error:', data.error);
      throw new Error(data.error.message);
    }

    // Transform the response to our video format
    const videos = data.items.map((item) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || 
                 item.snippet.thumbnails.medium?.url || 
                 item.snippet.thumbnails.default?.url || '',
      publishedAt: item.snippet.publishedAt,
    }));

    return new Response(JSON.stringify({ videos }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching NHL Sverige videos:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
