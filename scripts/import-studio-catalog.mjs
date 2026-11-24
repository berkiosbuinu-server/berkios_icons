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
const sourcePath = resolve(process.argv[2] || "../berkios_graphic/studio/src/model/flet-icon-catalog.ts");
const cupertinoMapPath = resolve(process.argv[3] || "../berkios_graphic/studio/src/model/cupertino-codepoints.ts");
const materialMapPath = resolve(repoRoot, "fonts/material/MaterialSymbolsOutlined.codepoints");
const outputPath = resolve(repoRoot, "manifest/flet-icon-catalog.json");

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
  const start = source.indexOf("CUPERTINO_CODEPOINTS");
  if (start < 0) return entries;
  const bodyStart = source.indexOf("{", start);
  const bodyEnd = source.indexOf("};", bodyStart);
  if (bodyStart < 0 || bodyEnd < 0) return entries;
  const body = source.slice(bodyStart + 1, bodyEnd);
  const pattern = /["']?([a-zA-Z0-9_]+)["']?\\s*:\\s*(0x[\\da-fA-F]+|\\d+)/g;
  for (const match of body.matchAll(pattern)) entries[match[1].toLowerCase()] = Number(match[2]);
  return entries;
}

function parseMaterialMap(source) {
  const entries = {};
  for (const line of source.split(/\\r?\\n/)) {
    const match = line.trim().match(/^([a-z0-9_]+)\\s+([0-9a-fA-F]+)$/);
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
    label: name.toLowerCase().replaceAll("_", " ").replace(/\\b\\w/g, c => c.toUpperCase()),
    category: "framework",
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
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\\n", "utf8");
console.log("Catalogue importé : " + icons.length + " entrées.");
console.log("Familles : " + JSON.stringify(counts));
console.log("Correspondances vérifiées : " + JSON.stringify(mappedCounts));
console.log("Fichier : " + outputPath);
