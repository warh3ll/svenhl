// Checks that src/i18n/sv.json has every text en.json has, with the same {placeholders}.
// Run with `npm run i18n:check`. Missing Swedish texts fall back to English on the site.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "i18n");
const load = async (lang) => JSON.parse(await readFile(path.join(dir, `${lang}.json`), "utf8"));
const en = await load("en");
const sv = await load("sv");
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

const problems = [];
for (const [key, text] of Object.entries(en)) {
  if (!(key in sv)) problems.push(`missing in sv.json: "${key}" (English: "${text}")`);
  else if (placeholders(text) !== placeholders(sv[key])) {
    problems.push(`"${key}" has {${placeholders(sv[key])}} in sv.json but {${placeholders(text)}} in en.json`);
  }
}
for (const key of Object.keys(sv)) if (!(key in en)) problems.push(`not used (only in sv.json): "${key}"`);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`All ${Object.keys(en).length} texts are translated.`);
