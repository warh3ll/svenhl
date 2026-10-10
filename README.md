# SVENHL

Tracks Swedish players in the NHL: recent games, weekly top performers, season statistics and
team-by-team rosters. Live at [svenhl.com](https://svenhl.com).

Built with Vite, React, TypeScript, Tailwind CSS and shadcn-ui. There is no backend: data comes
from the public NHL API and is stored as static JSON files.

## How it works

- `scripts/sync.mjs` fetches Swedish player stats, recent games and highlight videos and writes
  them to `public/data/`.
- `.github/workflows/deploy.yml` runs the sync every hour (and on every push to `main`), builds
  the site and deploys it to GitHub Pages.
- `scripts/prerender-routes.mjs` writes an HTML copy of the app for every route after the build,
  since GitHub Pages has no single-page-app fallback.

## Local development

```sh
npm ci
npm run sync   # optional: refresh public/data/ (set YOUTUBE_API_KEY for highlights)
npm run dev    # http://localhost:8080
```

Resync stats for a past season with `node scripts/sync.mjs --season 20252026`.

## Texts and translations

The site is in English and Swedish (Swedish pages live under `/sv`, e.g. `/sv/lag/VAN`).
All text is in `src/i18n/en.json` and `src/i18n/sv.json`, one `"key": "text"` line per string.
To change wording, edit the text after the colon; leave the key and any `{placeholder}` as they are.
Keys ending in `_one` / `_other` are the singular and plural forms. Swedish URL slugs are in
`src/i18n/routes.json`. `npm run i18n:check` lists English texts that have no Swedish version.

## New season

Bump `CURRENT_SEASON` in `src/lib/season.ts`. The sync script detects the current season from
the NHL API on its own.

## Setup (one time)

1. **GitHub Pages:** Settings → Pages → Source: **GitHub Actions**. Custom domain: `svenhl.com`.
2. **YouTube API key** (for highlight videos and the NHL Sverige carousel): create a key for the
   YouTube Data API v3 in Google Cloud and add it as the repository secret `YOUTUBE_API_KEY`
   (Settings → Secrets and variables → Actions).

`backup/lovable-cloud/` holds an export of the old Lovable Cloud database (October 2026).
