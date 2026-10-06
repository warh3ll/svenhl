// GitHub Pages has no single-page-app fallback, so after `vite build` this copies dist/index.html
// to an .html file for every route (Pages serves /statistics from statistics.html with status 200).
// Anything else falls through to 404.html, which is also the app and renders the NotFound page.

import { copyFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const dataDir = path.join(root, "public", "data");

const TEAMS = [
  "ANA", "BOS", "BUF", "CGY", "CAR", "CHI", "COL", "CBJ", "DAL", "DET", "EDM", "FLA", "LAK", "MIN", "MTL", "NSH",
  "NJD", "NYI", "NYR", "OTT", "PHI", "PIT", "SJS", "SEA", "STL", "TBL", "TOR", "UTA", "VAN", "VGK", "WSH", "WPG",
];

const readJson = async (file) => JSON.parse(await readFile(path.join(dataDir, file), "utf8"));

const { seasons } = await readJson("manifest.json");
const playerIds = new Set();
for (const season of seasons) {
  for (const kind of ["players", "goalies"]) {
    for (const row of await readJson(`${kind}-${season}.json`)) playerIds.add(row.id);
  }
}

const routes = [
  "404",
  "statistics",
  "teams",
  ...TEAMS.map((team) => `teams/${team}`),
  ...[...playerIds].map((id) => `player/${id}`),
];

const indexHtml = path.join(dist, "index.html");
for (const route of routes) {
  const target = path.join(dist, `${route}.html`);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(indexHtml, target);
}

console.log(`Wrote ${routes.length} route pages (${playerIds.size} players)`);
