// GitHub Pages has no single-page-app fallback, so after `vite build` this writes dist/index.html
// to an .html file for every route (Pages serves /statistics from statistics.html with status 200).
// Anything else falls through to 404.html, which is also the app and renders the NotFound page.
//
// Every page exists in English and in Swedish (under /sv, slugs from src/i18n/routes.json). Each file
// gets its own language, <title>, description, canonical URL, language alternates and social tags, so
// crawlers and link previews that don't run JavaScript still see the right page. The texts come from
// the same src/i18n/*.json files the app uses. The script also writes dist/sitemap.xml.

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const SITE_URL = "https://svenhl.com";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const dataDir = path.join(root, "public", "data");
const i18nDir = path.join(root, "src", "i18n");

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

const readJson = async (file) => JSON.parse(await readFile(file, "utf8"));
const LANGS = ["en", "sv"];
const OG_LOCALES = { en: "en_US", sv: "sv_SE" };
const texts = { en: await readJson(path.join(i18nDir, "en.json")), sv: await readJson(path.join(i18nDir, "sv.json")) };
const svSlugs = await readJson(path.join(i18nDir, "routes.json"));

// Same lookup as translate() in src/i18n/index.tsx
const t = (lang, key, vars = {}) =>
  (texts[lang][key] ?? texts.en[key] ?? key).replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
const listNames = (lang, names) =>
  names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} ${t(lang, "list.and")} ${names.at(-1)}`;

// "teams/VAN" -> "teams/VAN" (en) or "sv/lag/VAN" (sv)
const localizeRoute = (route, lang) => {
  if (lang === "en") return route;
  const [first, ...rest] = route.split("/");
  return ["sv", svSlugs[first] ?? first, ...rest].filter(Boolean).join("/");
};

const lastTeam = (abbr) => abbr.split(",").pop().trim();

const { seasons, currentSeason, lastSyncedAt } = await readJson(path.join(dataDir, "manifest.json"));
const lastmod = (lastSyncedAt ?? new Date().toISOString()).slice(0, 10);

// Latest season row per player (seasons are listed newest first), skaters before goalies like the player page
const latestRow = new Map();
const currentRows = { players: [], goalies: [] };
for (const kind of ["players", "goalies"]) {
  for (const season of seasons) {
    const rows = await readJson(path.join(dataDir, `${kind}-${season}.json`));
    if (season === currentSeason) currentRows[kind] = rows;
    for (const row of rows) if (!latestRow.has(row.id)) latestRow.set(row.id, row);
  }
}

// Each page: its English route, and title/description per language
const pages = [
  { route: "", seo: "home", priority: "1.0" },
  { route: "statistics", seo: "statistics", priority: "0.9" },
  { route: "teams", seo: "teams", priority: "0.8" },
].map(({ route, seo, priority }) => ({
  route,
  priority,
  title: (lang) => t(lang, `seo.${seo}.title`),
  description: (lang) => t(lang, `seo.${seo}.description`),
}));

for (const [abbr, team] of Object.entries(TEAM_NAMES)) {
  const names = [...currentRows.players, ...currentRows.goalies]
    .filter((row) => lastTeam(row.team_abbr) === abbr)
    .map((row) => row.name);
  pages.push({
    route: `teams/${abbr}`,
    title: (lang) => t(lang, "seo.team.title", { team }),
    // Same wording as the <SEO> description in src/pages/TeamDetail.tsx
    description: (lang) =>
      names.length
        ? t(lang, "seo.team.description", { team, names: listNames(lang, names) })
        : t(lang, "seo.team.descriptionEmpty", { team }),
    // Teams without a Swede this season are still reachable, but not worth pointing search engines at
    priority: names.length ? "0.7" : null,
  });
}

for (const [id, row] of latestRow) {
  pages.push({
    route: `player/${id}`,
    title: (lang) => t(lang, "seo.player.title", { name: row.name }),
    description: (lang) => t(lang, "seo.player.description", { name: row.name, team: row.team }),
    priority: row.season === currentSeason ? "0.8" : "0.5",
  });
}

const escapeAttr = (text) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setTag(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`index.html is missing a tag matching ${pattern}`);
  return html.replace(pattern, replacement);
}

const template = await readFile(path.join(dist, "index.html"), "utf8");
const urlFor = (route, lang) => `${SITE_URL}/${localizeRoute(route, lang)}`;

function renderPage(page, lang) {
  const title = page.title(lang);
  const description = page.description(lang);
  const url = urlFor(page.route, lang);
  const alternates = [
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlFor(page.route, l)}" data-rh="true" />`),
    `<link rel="alternate" hreflang="x-default" href="${urlFor(page.route, "en")}" data-rh="true" />`,
  ];

  let html = setTag(template, /<html lang="[^"]*"/, `<html lang="${lang}"`);
  html = setTag(html, /<title>[^<]*<\/title>/, `<title>${escapeText(title)}</title>`);
  html = setTag(html, /<link rel="canonical" href="[^"]*" data-rh="true" \/>/, `<link rel="canonical" href="${url}" data-rh="true" />\n    ${alternates.join("\n    ")}`);
  html = setTag(html, /<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${url}"`);
  html = setTag(html, /<meta property="og:locale" content="[^"]*"/, `<meta property="og:locale" content="${OG_LOCALES[lang]}"`);
  for (const attr of ['property="og:title"', 'name="twitter:title"']) {
    html = setTag(html, new RegExp(`<meta ${attr} content="[^"]*"`), `<meta ${attr} content="${escapeAttr(title)}"`);
  }
  for (const attr of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
    html = setTag(html, new RegExp(`<meta ${attr} content="[^"]*"`), `<meta ${attr} content="${escapeAttr(description)}"`);
  }
  return html;
}

// The 404 page answers for unknown URLs in both languages, so it claims no canonical URL of its own
function render404() {
  let html = setTag(template, /<title>[^<]*<\/title>/, `<title>${escapeText(t("en", "seo.notFound.title"))}</title>`);
  html = setTag(html, /\s*<link rel="canonical"[^>]*>/, "");
  html = setTag(html, /\s*<meta property="og:url"[^>]*>/, "");
  return html.replace("</head>", `  <meta name="robots" content="noindex" data-rh="true" />\n  </head>`);
}

const write = async (route, html) => {
  const target = path.join(dist, `${route || "index"}.html`);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
};

for (const page of pages) {
  for (const lang of LANGS) await write(localizeRoute(page.route, lang), renderPage(page, lang));
}
// /sv is also a folder (sv/lag.html …), so give it an index too in case the host serves /sv/ instead of sv.html
await write("sv/index", renderPage(pages[0], "sv"));
await write("404", render404());

// Every page in both languages, each listing its other-language version
const sitemapUrls = pages
  .filter((page) => page.priority)
  .flatMap((page) =>
    LANGS.map((lang) =>
      [
        "  <url>",
        `    <loc>${urlFor(page.route, lang)}</loc>`,
        ...LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${urlFor(page.route, l)}" />`),
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${page.priority}</priority>`,
        "  </url>",
      ].join("\n"),
    ),
  );
await writeFile(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${sitemapUrls.join("\n")}\n</urlset>\n`,
);

console.log(`Wrote ${pages.length} pages in ${LANGS.length} languages (${latestRow.size} players), sitemap with ${sitemapUrls.length} URLs`);
