

## Implementation: NHL Sverige YouTube Playlist Carousel

I have the playlist ID: **PLfsAEO-f92nqOtemyyAvcxpKU6JjiAGqM**

### Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/nhl-sverige-videos/index.ts` | Edge function to fetch playlist videos from YouTube API |
| `src/hooks/useNHLSverigeVideos.ts` | React Query hook to fetch and cache video data |
| `src/components/NHLSverigeCarousel.tsx` | Full-width carousel component for displaying videos |

### Files to Modify

| File | Change |
|------|--------|
| `supabase/config.toml` | Add config for the new edge function |
| `src/components/GameFeed.tsx` | Add support for inserting content after N cards |
| `src/pages/Index.tsx` | Integrate the carousel between game sections |

---

### Technical Details

#### 1. Edge Function: `nhl-sverige-videos`

```typescript
// Uses existing YOUTUBE_API_KEY secret
// Calls YouTube playlistItems.list API with playlist ID
// Returns array of: { id, title, thumbnail, publishedAt }
// Ordered by position (newest first based on playlist order)
```

#### 2. React Hook: `useNHLSverigeVideos`

```typescript
// Uses supabase.functions.invoke('nhl-sverige-videos')
// React Query with 5-minute stale time
// Returns { data: Video[], isLoading, error }
```

#### 3. Carousel Component

- Full-width section (breaks out of container using negative margins)
- Dark themed background with Swedish yellow accent
- Section header with "NHL Sverige" title
- Uses existing Embla Carousel components
- Responsive: 1 video mobile, 2 tablet, 4 desktop
- Previous/Next navigation buttons
- Swipe support on touch devices
- Lazy-loaded video thumbnails with play button overlay
- Clicking opens video in embedded player or new tab

#### 4. Layout Changes

GameFeed will split the games into two sections:
- First 6 game cards in a grid
- NHL Sverige carousel (full-width)
- Remaining game cards in a grid

---

### Implementation will proceed immediately since the plan was already approved.

