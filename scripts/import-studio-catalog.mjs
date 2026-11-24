#!/usr/bin/env node
/**
 * Imports the Flet icon catalogue embedded in Berkios Graphic Studio.
 *
 * Usage from the repository root:
 * node scripts/import-studio-catalog.mjs ../berkios_graphic/studio/src/model/flet-icon-catalog.ts
 * Optional second argument: path to studio/src/model/cupertino-codepoints.ts
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const repoRoot = process.cwd();
const sourcePath = resolve(process.argv[2] || "../BERKIOS_GRAPHIC_STUDIO_2026_v0_7_311_datepicker/studio/src/model/flet-icon-catalog.ts");
const cupertinoMapPath = resolve(process.argv[3] || "fonts/cupertino/CupertinoIcons.codepoints");
const materialMapPath = resolve(repoRoot, "fonts/material/MaterialSymbolsOutlined.codepoints");
const outputPath = resolve(repoRoot, "manifest/flet-icon-catalog.json");


function inferCategory(name) {
  const rules = [
    ["interface-navigation", /(?:^|_)(HOME|MENU|ARROW|CHEVRON|NAVIGATION|TAB|WINDOW|BACK|FORWARD|CLOSE|EXPAND|COLLAPSE)(?:_|$)/],
    ["actions-edition", /(?:^|_)(ADD|REMOVE|DELETE|EDIT|SEARCH|FILTER|SAVE|UPLOAD|DOWNLOAD|REFRESH|COPY|CUT|PASTE|UNDO|REDO|CHECK|DONE|CLEAR)(?:_|$)/],
    ["utilisateurs-communication", /(?:^|_)(PERSON|PEOPLE|GROUP|ACCOUNT|PROFILE|USER|MAIL|EMAIL|PHONE|CALL|CHAT|MESSAGE|CONTACT|SEND|NOTIFICATION|AVATAR)(?:_|$)/],
    ["fichiers-medias", /(?:^|_)(FILE|FOLDER|DOCUMENT|PDF|IMAGE|PHOTO|CAMERA|VIDEO|MUSIC|AUDIO|PLAY|PAUSE|STOP|MEDIA|PRINT|ATTACHMENT)(?:_|$)/],
    ["donnees-statistiques", /(?:^|_)(CHART|GRAPH|ANALYTICS|TABLE|DATABASE|DATA|STATISTICS|TREND|PIE|BAR|QUERY|STORAGE)(?:_|$)/],
    ["commerce-metiers", /(?:^|_)(CART|SHOP|STORE|PAYMENT|MONEY|WALLET|RECEIPT|DELIVERY|TRUCK|PACKAGE|INVENTORY|COIN|EURO|CURRENCY)(?:_|$)/],
    ["systeme-securite", /(?:^|_)(SETTINGS|CONFIG|LOCK|UNLOCK|KEY|SHIELD|SECURITY|WARNING|ERROR|INFO|HELP|BUG|WIFI|BATTERY|POWER|COMPUTER|DEVICE|NETWORK|SYSTEM)(?:_|$)/],
    ["temps-calendrier", /(?:^|_)(CALENDAR|CLOCK|TIME|DATE|HISTORY|SCHEDULE|TIMER|WATCH|HOURGLASS|ALARM|EVENT)(?:_|$)/],
    ["cartes-localisation", /(?:^|_)(MAP|LOCATION|PLACE|GPS|GLOBE|EARTH|COMPASS|PIN|DIRECTIONS|ROUTE)(?:_|$)/],
    ["developpement-outils", /(?:^|_)(CODE|API|TERMINAL|DEVELOPER|BUILD|WRENCH|TOOL|COMMIT|BRANCH|BUG_REPORT)(?:_|$)/],
    ["design-composants", /(?:^|_)(PALETTE|BRUSH|COLOR|DESIGN|WIDGET|TEXT|FONT|DRAW|LAYOUT|STYLE|SHAPE|SHAPES)(?:_|$)/],
    ["divers-educatif", /(?:^|_)(SCHOOL|BOOK|LEARN|GRADUATION|IDEA|LIGHTBULB|ROCKET|SCIENCE|SPORT|GAME)(?:_|$)/]
  ];
  for (const [category, pattern] of rules) if (pattern.test(name)) return category;
  return "divers-educatif";
}

function parseFletSource(source) {
  const marker = "JSON.parse(String.raw" + String.fromCharCode(96);
  const start = source.indexOf(marker);
  const end = source.indexOf(String.fromCharCode(96) + ")", start);
  if (start < 0 || end < 0) throw new Error("Bloc JSON du catalogue Flet introuvable.");
  const records = JSON.parse(source.slice(start + marker.length, end));
  if (!Array.isArray(records) || records.length < 1000) {
    throw new Error("Catalogue inattendu : " + (records?.length ?? 0) + " entrées. Aucun fichier n'a été écrit.");
  }
  return records;
}

function parseCupertinoMap(source) {
  const entries = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.trim().match(/^([a-zA-Z0-9_]+)\s+([0-9a-fA-F]+)$/);
    if (match) entries[match[1].toLowerCase()] = Number.parseInt(match[2], 16);
  }
  return entries;
}

function parseMaterialMap(source) {
  const entries = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.trim().match(/^([a-z0-9_]+)\s+([0-9a-fA-F]+)$/);
    if (match) entries[match[1]] = Number.parseInt(match[2], 16);
  }
  return entries;
}

const [rawCatalog, rawCupertino, rawMaterial] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readFile(cupertinoMapPath, "utf8").catch(() => ""),
  readFile(materialMapPath, "utf8").catch(() => "")
]);
const records = parseFletSource(rawCatalog);
const cupertinoMap = parseCupertinoMap(rawCupertino);
const materialMap = parseMaterialMap(rawMaterial);

const icons = records.map((record) => {
  const name = String(record.name);
  const normalized = name.toLowerCase();
  const family = record.family;
  if (family !== "material" && family !== "cupertino") {
    throw new Error("Famille non reconnue pour " + name + ": " + family);
  }
  const unicodeCodepoint = family === "material"
    ? materialMap[normalized]
    : cupertinoMap[normalized];
  return {
    id: family + ":" + normalized,
    name,
    label: name.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase()),
    category: inferCategory(name),
    categoryStatus: "inferred-from-name",
    libraryId: family === "material" ? "org.berkios.icons.material" : "org.berkios.icons.cupertino",
    family,
    renderMode: "font",
    fontFamily: family === "material" ? "BerkiosMaterialSymbols" : "BerkiosCupertinoIcons",
    glyphName: normalized,
    ...(unicodeCodepoint === undefined ? {} : { unicodeCodepoint }),
    catalogCode: record.code,
    mappingStatus: unicodeCodepoint === undefined ? "unmapped" : "verified-name-map",
    license: family === "material" ? "Apache-2.0" : "MIT",
    source: family === "material"
      ? "Google Material Symbols codepoints map"
      : "Flutter Cupertino icon constants"
  };
});

const counts = icons.reduce((result, icon) => {
  result[icon.family] = (result[icon.family] || 0) + 1;
  return result;
}, {});
const mappedCounts = icons.reduce((result, icon) => {
  if (icon.mappingStatus === "verified-name-map") result[icon.family] = (result[icon.family] || 0) + 1;
  return result;
}, {});
const output = {
  schemaVersion: "1.0.0",
  source: "Berkios Graphic Studio studio/src/model/flet-icon-catalog.ts",
  generatedAt: new Date().toISOString(),
  total: icons.length,
  counts,
  mappedCounts,
  note: "catalogCode is a framework enum/catalog identifier, not a Unicode codepoint. Only unicodeCodepoint values resolved through a matching upstream mapping are included.",
  icons
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log("Catalogue importé : " + icons.length + " entrées.");
console.log("Familles : " + JSON.stringify(counts));
console.log("Correspondances vérifiées : " + JSON.stringify(mappedCounts));
console.log("Fichier : " + outputPath);
