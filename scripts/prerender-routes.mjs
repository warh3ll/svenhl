// GitHub Pages has no single-page-app fallback, so after `vite build` this writes dist/index.html
// to an .html file for every route (Pages serves /statistics from statistics.html with status 200).
// Anything else falls through to 404.html, which is also the app and renders the NotFound page.
//
// Each route file gets its own <title>, description, canonical URL and social tags, so crawlers and
// link previews that don't run JavaScript still see the right page. Keep the texts in sync with the
// <SEO> props in src/pages. The script also writes dist/sitemap.xml listing every page.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE_URL = "https://svenhl.com";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const dataDir = path.join(root, "public", "data");

const TEAM_NAMES = {
  ANA: "Anaheim Ducks", BOS: "Boston Bruins", BUF: "Buffalo Sabres", CGY: "Calgary Flames",
  CAR: "Carolina Hurricanes", CHI: "Chicago Blackhawks", COL: "Colorado Avalanche", CBJ: "Columbus Blue Jackets",
  DAL: "Dallas Stars", DET: "Detroit Red Wings", EDM: "Edmonton Oilers", FLA: "Florida Panthers",
  LAK: "Los Angeles Kings", MIN: "Minnesota Wild", MTL: "Montreal Canadiens", NSH: "Nashville Predators",
  NJD: "New Jersey Devils", NYI: "New York Islanders", NYR: "New York Rangers", OTT: "Ottawa Senators",
  PHI: "Philadelphia Flyers", PIT: "Pittsburgh Penguins", SJS: "San Jose Sharks", SEA: "Seattle Kraken",
  STL: "St. Louis Blues", TBL: "Tampa Bay Lightning", TOR: "Toronto Maple Leafs", UTA: "Utah Mammoth",
  VAN: "Vancouver Canucks", VGK: "Vegas Golden Knights", WSH: "Washington Capitals", WPG: "Winnipeg Jets",
};

const readJson = async (file) => JSON.parse(await readFile(path.join(dataDir, file), "utf8"));
const lastTeam = (abbr) => abbr.split(",").pop().trim();
const listNames = (names) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);

const { seasons, currentSeason, lastSyncedAt } = await readJson("manifest.json");
const lastmod = (lastSyncedAt ?? new Date().toISOString()).slice(0, 10);

// Latest season row per player (seasons are listed newest first), skaters before goalies like the player page
const latestRow = new Map();
const currentRows = { players: [], goalies: [] };
for (const kind of ["players", "goalies"]) {
  for (const season of seasons) {
    const rows = await readJson(`${kind}-${season}.json`);
    if (season === currentSeason) currentRows[kind] = rows;
    for (const row of rows) if (!latestRow.has(row.id)) latestRow.set(row.id, { ...row, isGoalie: kind === "goalies" });
  }
}

const pages = [
  {
    route: "",
    title: "SVENHL — Swedish NHL Players: Live Games & Stats",
    description: "Track every Swedish player in the NHL. Recent games, weekly top performers, and full season statistics for skaters and goalies.",
    priority: "1.0",
  },
  {
    route: "statistics",
    title: "Swedish NHL Player Statistics — Season Stats | SVENHL",
    description: "Full season statistics for every Swedish skater and goalie in the NHL. Goals, assists, points, save percentage and more, filterable by season.",
    priority: "0.9",
  },
  {
    route: "teams",
    title: "NHL Teams With Swedish Players | SVENHL",
    description: "Every NHL team's roster of Swedish players. Browse by team to see which Swedes are skating where this season.",
    priority: "0.8",
  },
];

for (const [abbr, teamName] of Object.entries(TEAM_NAMES)) {
  const swedes = [...currentRows.players, ...currentRows.goalies].filter((row) => lastTeam(row.team_abbr) === abbr);
  pages.push({
    route: `teams/${abbr}`,
    title: `${teamName} — Swedish Players | SVENHL`,
    description: teamDescription(teamName, swedes.map((row) => row.name)),
    // Teams without a Swede this season are still reachable, but not worth pointing search engines at
    priority: swedes.length ? "0.7" : null,
  });
}

for (const [id, row] of latestRow) {
  pages.push({
    route: `player/${id}`,
    title: `${row.name} — Swedish NHL Player Stats | SVENHL`,
    description: `Season statistics, career numbers, and recent games for ${row.name} of the ${row.team}.`,
    priority: row.season === currentSeason ? "0.8" : "0.5",
  });
}

pages.push({ route: "404", title: "Page Not Found | SVENHL", noindex: true, priority: null });

// Same wording as the description in src/pages/TeamDetail.tsx
function teamDescription(teamName, names) {
  if (!names.length) return `Swedish players on the ${teamName} roster, with season stats and recent games.`;
  return `Swedish players on the ${teamName} this season: ${listNames(names)}. Season stats and recent games.`;
}

const escapeAttr = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`index.html is missing a tag matching ${pattern}`);
  return html.replace(pattern, replacement);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");

function renderPage({ route, title, description, noindex }) {
  const url = `${SITE_URL}/${route}`;
  let html = setTag(template, /<title>[^<]*<\/title>/, `<title>${escapeText(title)}</title>`);
  html = setTag(html, /<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeAttr(title)}"`);
  html = setTag(html, /<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeAttr(title)}"`);
  if (noindex) {
    // The 404 page answers for unknown URLs, so it must not claim a canonical URL of its own
    html = setTag(html, /\s*<link rel="canonical"[^>]*>/, "");
    html = setTag(html, /\s*<meta property="og:url"[^>]*>/, "");
    return html.replace("</head>", `  <meta name="robots" content="noindex" data-rh="true" />\n  </head>`);
  }
  html = setTag(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  html = setTag(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  for (const attr of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    html = setTag(html, new RegExp(`<meta ${attr} content="[^"]*"`), `<meta ${attr} content="${escapeAttr(description)}"`);
  }
  return html;
}

for (const page of pages) {
  const target = path.join(dist, `${page.route || "index"}.html`);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, renderPage(page));
}

const sitemapUrls = pages
  .filter((page) => page.priority)
  .map(
    (page) =>
      `  <url>\n    <loc>${SITE_URL}/${page.route}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${page.priority}</priority>\n  </url>`,
  );
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join("\n")}\n</urlset>\n`,
);

console.log(`Wrote ${pages.length} route pages (${latestRow.size} players), sitemap with ${sitemapUrls.length} URLs`);
