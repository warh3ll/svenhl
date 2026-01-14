import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');
  
  if (!youtubeApiKey) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'YOUTUBE_API_KEY not configured',
        hint: 'Add YOUTUBE_API_KEY secret in Lovable Cloud settings'
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const query = body.query || 'NHL highlights';
    
    console.log(`Testing YouTube search with query: ${query}`);
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=3&key=${youtubeApiKey}`;
    
    const response = await fetch(url);
    const responseText = await response.text();
    
    console.log(`YouTube API response status: ${response.status}`);
    
    if (!response.ok) {
      console.error(`YouTube API error response: ${responseText}`);
      
      let errorDetails: Record<string, any> = { raw: responseText };
      try {
        const parsed = JSON.parse(responseText);
        errorDetails = {
          raw: responseText,
          code: parsed.error?.code,
          message: parsed.error?.message,
          reason: parsed.error?.errors?.[0]?.reason,
          domain: parsed.error?.errors?.[0]?.domain,
        };
      } catch {
        // Keep raw response
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          status: response.status,
          error: errorDetails,
          hint: response.status === 403 
            ? 'Check: 1) YouTube Data API v3 enabled, 2) API key restrictions allow this API, 3) Billing enabled'
            : 'Check API key and quota'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const data = JSON.parse(responseText);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        query,
        totalResults: data.pageInfo?.totalResults || 0,
        results: data.items?.map((item: any) => ({
          videoId: item.id?.videoId,
          title: item.snippet?.title,
          channelTitle: item.snippet?.channelTitle,
          channelId: item.snippet?.channelId,
          publishedAt: item.snippet?.publishedAt
        })) || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in youtube-search-test:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
