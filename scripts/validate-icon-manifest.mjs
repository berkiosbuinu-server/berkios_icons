#!/usr/bin/env node
/**
 * Validate the generated Flet icon manifest against the checked-in glyph maps.
 * Run from the repository root:
 *   node scripts/validate-icon-manifest.mjs
 */
import { readFile, access } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const manifestPath = resolve(root, "manifest/flet-icon-catalog.json");
const materialMapPath = resolve(root, "fonts/material/MaterialSymbolsOutlined.codepoints");
const cupertinoMapPath = resolve(root, "fonts/cupertino/CupertinoIcons.codepoints");

const errors = [];
const warnings = [];
const stats = {
  total: 0,
  mapped: 0,
  unmapped: 0,
  byFamily: {},
  byStatus: {},
  byStyle: {},
  duplicateIds: 0,
  duplicateGlyphs: 0
};

function fail(message) { errors.push(message); }
function warn(message) { warnings.push(message); }

async function readText(path, label) {
  try { return await readFile(path, "utf8"); }
  catch { fail("Fichier introuvable ou illisible : " + label); return ""; }
}

function parseMap(source, label) {
  const map = new Map();
  for (const [index, line] of source.split(/\r?\n/).entries()) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([a-zA-Z0-9_]+)\s+([0-9a-fA-F]+)$/);
    if (!match) {
      warn(label + " : ligne " + (index + 1) + " ignorée (format non reconnu).");
      continue;
    }
    const name = match[1].toLowerCase();
    const codepoint = Number.parseInt(match[2], 16);
    if (map.has(name)) fail(label + " : nom de glyphe dupliqué : " + name);
    map.set(name, codepoint);
  }
  return map;
}

function validCodepoint(value) {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff &&
    !(value >= 0xd800 && value <= 0xdfff);
}

const [manifestText, materialText, cupertinoText] = await Promise.all([
  readText(manifestPath, "manifest/flet-icon-catalog.json"),
  readText(materialMapPath, "fonts/material/MaterialSymbolsOutlined.codepoints"),
  readText(cupertinoMapPath, "fonts/cupertino/CupertinoIcons.codepoints")
]);

let manifest;
try { manifest = JSON.parse(manifestText); }
catch (error) {
  fail("JSON du manifeste invalide : " + error.message);
}

const materialMap = parseMap(materialText, "Material Symbols");
const cupertinoMap = parseMap(cupertinoText, "Cupertino");

if (manifest) {
  if (!Array.isArray(manifest.icons)) fail("Le champ icons doit être un tableau.");
  if (manifest.schemaVersion !== "1.1.0") warn("schemaVersion inattendue : " + manifest.schemaVersion);

  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  stats.total = icons.length;
  if (manifest.total !== icons.length) {
    fail("manifest.total (" + manifest.total + ") ne correspond pas au nombre d'entrées (" + icons.length + ").");
  }

  const ids = new Set();
  const glyphKeys = new Set();

  for (const [index, icon] of icons.entries()) {
    const where = "icons[" + index + "] (" + (icon?.name ?? "sans nom") + ")";
    if (!icon || typeof icon !== "object") { fail(where + " : entrée invalide."); continue; }

    if (!icon.id || !icon.name) fail(where + " : id ou name manquant.");
    if (ids.has(icon.id)) { stats.duplicateIds += 1; fail(where + " : id dupliqué " + icon.id); }
    ids.add(icon.id);

    if (!["material", "cupertino"].includes(icon.family)) {
      fail(where + " : famille inconnue " + icon.family);
      continue;
    }

    stats.byFamily[icon.family] = (stats.byFamily[icon.family] || 0) + 1;
    stats.byStatus[icon.mappingStatus] = (stats.byStatus[icon.mappingStatus] || 0) + 1;

    const expectedLibrary = icon.family === "material"
      ? "org.berkios.icons.material" : "org.berkios.icons.cupertino";
    const expectedFont = icon.family === "material"
      ? "BerkiosMaterialSymbols" : "BerkiosCupertinoIcons";
    const glyphMap = icon.family === "material" ? materialMap : cupertinoMap;

    if (icon.libraryId !== expectedLibrary) fail(where + " : libraryId incohérent.");
    if (icon.fontFamily !== expectedFont) fail(where + " : fontFamily incohérente.");
    if (icon.renderMode !== "font") fail(where + " : renderMode doit être font.");
    if (!icon.glyphName) fail(where + " : glyphName manquant.");

    if (icon.family === "material") {
      if (!["outlined", "rounded", "sharp"].includes(icon.style)) {
        fail(where + " : style Material invalide ou absent.");
      } else {
        stats.byStyle[icon.style] = (stats.byStyle[icon.style] || 0) + 1;
      }
      const expectedStyleStatus = icon.style === "outlined"
        ? "native-outlined-font" : "outlined-font-fallback";
      if (icon.styleRenderStatus !== expectedStyleStatus) {
        fail(where + " : styleRenderStatus incohérent pour " + icon.style + ".");
      }
    } else if (icon.style !== undefined || icon.styleRenderStatus !== undefined) {
      fail(where + " : une entrée Cupertino ne doit pas déclarer un style Material.");
    }

    if (icon.mappingStatus === "unmapped") {
      stats.unmapped += 1;
      if (icon.unicodeCodepoint !== undefined) fail(where + " : entrée unmapped avec unicodeCodepoint.");
      if (icon.mappingSource !== undefined) fail(where + " : entrée unmapped avec mappingSource.");
      if (icon.classification === "brand-candidate" &&
          icon.recommendedLibraryId !== "org.berkios.icons.brands") {
        fail(where + " : recommendedLibraryId incorrect pour une marque.");
      }
      continue;
    }

    if (!["verified-name-map", "verified-alias", "verified-normalized-name"].includes(icon.mappingStatus)) {
      fail(where + " : mappingStatus inconnu " + icon.mappingStatus);
      continue;
    }

    stats.mapped += 1;
    if (!validCodepoint(icon.unicodeCodepoint)) {
      fail(where + " : unicodeCodepoint absent ou invalide.");
      continue;
    }

    const mappedCodepoint = glyphMap.get(String(icon.glyphName).toLowerCase());
    if (mappedCodepoint === undefined) {
      fail(where + " : glyphe " + icon.glyphName + " absent du fichier codepoints.");
    } else if (mappedCodepoint !== icon.unicodeCodepoint) {
      fail(where + " : codepoint du manifeste différent du mapping officiel.");
    }

    if (!icon.mappingSource) fail(where + " : mappingSource manquant.");
    const glyphKey = icon.family + ":" + icon.glyphName + ":" + icon.style;
    if (glyphKeys.has(glyphKey)) stats.duplicateGlyphs += 1;
    glyphKeys.add(glyphKey);
  }

  if (manifest.counts) {
    for (const family of ["material", "cupertino"]) {
      if (manifest.counts[family] !== stats.byFamily[family]) {
        fail("manifest.counts." + family + " ne correspond pas au contenu réel.");
      }
    }
  }
  if (manifest.mappedCounts) {
    for (const family of ["material", "cupertino"]) {
      const actual = icons.filter(icon => icon.family === family && icon.mappingStatus !== "unmapped").length;
      if (manifest.mappedCounts[family] !== actual) fail("manifest.mappedCounts." + family + " est incohérent.");
    }
  }
  if (manifest.unmappedCounts) {
    for (const family of ["material", "cupertino"]) {
      const actual = icons.filter(icon => icon.family === family && icon.mappingStatus === "unmapped").length;
      if ((manifest.unmappedCounts[family] || 0) !== actual) fail("manifest.unmappedCounts." + family + " est incohérent.");
    }
  }
}

const fontFiles = [
  "fonts/material/MaterialSymbolsOutlined.ttf",
  "fonts/cupertino/CupertinoIcons.ttf"
];
for (const file of fontFiles) {
  try { await access(resolve(root, file)); }
  catch { warn("Fichier de police absent localement : " + file); }
}

if (stats.unmapped > 0) {
  warn(stats.unmapped + " entrée(s) non mappée(s) : elles sont signalées mais ne bloquent pas la validation.");
}

console.log("\n=== VALIDATION DU CATALOGUE BERKIOS ICONS ===");
console.log("Manifeste :", manifestPath);
console.log("Entrées :", stats.total);
console.log("Mappées :", stats.mapped);
console.log("Non mappées :", stats.unmapped);
console.log("Familles :", JSON.stringify(stats.byFamily));
console.log("Statuts :", JSON.stringify(stats.byStatus));
console.log("Styles Material :", JSON.stringify(stats.byStyle));
console.log("IDs dupliqués :", stats.duplicateIds);
console.log("Glyphes répétés (variantes/styles) :", stats.duplicateGlyphs);

for (const message of warnings) console.warn("AVERTISSEMENT :", message);
for (const message of errors) console.error("ERREUR :", message);

if (errors.length) {
  console.error("\nÉCHEC : " + errors.length + " erreur(s), " + warnings.length + " avertissement(s).");
  process.exitCode = 1;
} else {
  console.log("\nSUCCÈS : aucune incohérence bloquante détectée.");
}
