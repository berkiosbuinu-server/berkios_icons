#!/usr/bin/env node
/**
 * Imports the Flet icon catalogue embedded in Berkios Graphic Studio.
 *
 * Usage from the repository root:
 * node scripts/import-studio-catalog.mjs <path-to-flet-icon-catalog.ts> [path-to-cupertino-codepoints.ts]
 *
 * Material style suffixes are metadata. The current MaterialSymbolsOutlined
 * font supplies the outlined glyph; rounded/sharp variants are not silently
 * represented as separate font glyphs.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const repoRoot = process.cwd();
const sourcePath = resolve(
  process.argv[2] || "../BERKIOS_GRAPHIC_STUDIO_2026_v0_7_311_datepicker/studio/src/model/flet-icon-catalog.ts"
);
const cupertinoMapPath = resolve(process.argv[3] || "fonts/cupertino/CupertinoIcons.codepoints");
const materialMapPath = resolve(repoRoot, "fonts/material/MaterialSymbolsOutlined.codepoints");
const outputPath = resolve(repoRoot, "manifest/flet-icon-catalog.json");

// Only aliases with an established Material naming relationship belong here.
// Each alias is used only when its target exists in the checked-in codepoint map.
const MATERIAL_ALIASES = Object.freeze({
  class_: "class",
  confirmation_num: "confirmation_number",
  directions_train: "train",
  door_back_door: "door_back",
  door_front_door: "door_front",
  exposure_minus_1: "exposure_neg_1",
  exposure_minus_2: "exposure_neg_2",
  favorite_outline: "favorite",
  fire_hydrant_alt: "fire_hydrant",
  no_meals_ouline: "no_meals",
  outbond: "outbound",
  person_remove_alt_1: "person_remove",
  signal_wifi_statusbar_connected_no_internet_4: "signal_wifi_connected_no_internet_4",
  trending_neutral: "trending_flat",
  wb_twighlight: "wb_twilight",
  panorama_horizontal_select: "panorama_horizontal",
  panorama_photosphere_select: "panorama_photosphere",
  panorama_vertical_select: "panorama_vertical",
  panorama_wide_angle_select: "panorama_wide_angle",
  airplanemode_off: "airplanemode_inactive",
  airplanemode_on: "airplanemode_active",
  bookmark_outline: "bookmark_border",
  copy: "content_copy",
  directions_ferry: "directions_boat",
  format_underline: "format_underlined",
  highlight_remove: "highlight_off",
  info_outline: "info",
  invert_colors_on: "invert_colors",
  local_attraction: "attractions",
  local_print_shop: "print",
  local_restaurant: "restaurant",
  location_history: "edit_location",
  my_library_add: "playlist_add",
  my_library_books: "library_books",
  my_library_music: "library_music",
  notifications_on: "notifications_active",
  now_wallpaper: "wallpaper",
  now_widgets: "widgets",
  paste: "content_paste",
  perm_contact_cal: "perm_contact_calendar",
  perm_device_info: "perm_device_information",
  person_add_alt_1: "person_add_alt",
  play_circle_fill: "play_circle",
  play_circle_filled: "play_circle",
  play_circle_outline: "play_circle",
  quick_contacts_dialer: "contact_phone",
  quick_contacts_mail: "contact_mail",
  radio_button_off: "radio_button_unchecked",
  radio_button_on: "radio_button_checked",
  settings_display: "display_settings",
  swap_vert_circle: "swap_vert",
  system_update_tv: "system_update",
  video_collection: "video_library",
  view_comfortable: "view_comfy",
  wallet_giftcard: "card_giftcard",
  wallet_membership: "card_membership",
  wallet_travel: "card_travel",
  wifi_tethering_error_rounded: "wifi_tethering_error",
  workspaces_filled: "workspaces"
});


const MATERIAL_BRAND_CANDIDATES = new Set([
  "adobe", "apple", "discord", "facebook", "fitbit", "messenger", "messenger_outline",
  "paypal", "pix", "quora", "reddit", "shopify", "snapchat",
  "telegram", "tiktok", "wechat", "woo_commerce", "wordpress"
]);

// Convert only well-formed number words in Flet identifiers. A candidate is
// accepted only if the resulting name exists in the checked-in Symbols map.
const NUMBER_WORDS = Object.freeze({
  one: "1", two: "2", three: "3", four: "4", five: "5",
  six: "6", seven: "7", eight: "8", nine: "9", ten: "10",
  eleven: "11", twelve: "12", thirteen: "13", fourteen: "14",
  fifteen: "15", sixteen: "16", seventeen: "17", eighteen: "18",
  nineteen: "19", twenty: "20", thirty: "30", sixty: "60"
});
const COMPOUND_NUMBERS = Object.freeze({
  twenty_one: "21", twenty_two: "22", twenty_three: "23",
  twenty_four: "24"
});

function normalizeSpelledMaterialName(name) {
  if (name === "onetwothree") return "123";
  if (name === "threesixty") return "360";
  if (name.startsWith("threed_")) return "3d_" + name.slice("threed_".length);

  const tokens = name.split("_");
  const normalized = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const pair = tokens[i] + "_" + (tokens[i + 1] || "");
    if (COMPOUND_NUMBERS[pair]) {
      normalized.push(COMPOUND_NUMBERS[pair]);
      i += 1;
    } else {
      normalized.push(NUMBER_WORDS[tokens[i]] || tokens[i]);
    }
  }
  const joined = normalized.join("_");
  // Material Symbols spell these technical suffixes without a separator.
  return joined.replace(/^(\d+)_(k|mp|g|p|fps|x)(?=_|$)/, "$1$2");
}

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

function parseCodepointMap(source, caseInsensitive = false) {
  const entries = {};
  for (const line of source.split(/\r?\n/)) {
    const match = line.trim().match(/^([a-zA-Z0-9_]+)\s+([0-9a-fA-F]+)$/);
    if (!match) continue;
    const key = caseInsensitive ? match[1].toLowerCase() : match[1];
    entries[key] = Number.parseInt(match[2], 16);
  }
  return entries;
}

function splitMaterialStyle(name) {
  const normalized = name.toLowerCase();
  const match = normalized.match(/_(outlined|rounded|sharp)$/);
  if (!match) return { baseName: normalized, style: "outlined", hadStyleSuffix: false };
  return {
    baseName: normalized.slice(0, -match[0].length),
    style: match[1],
    hadStyleSuffix: true
  };
}

function resolveMaterialGlyph(name, materialMap) {
  const { baseName, style, hadStyleSuffix } = splitMaterialStyle(name);
  if (materialMap[baseName] !== undefined) {
    return {
      glyphName: baseName,
      unicodeCodepoint: materialMap[baseName],
      mappingStatus: "verified-name-map",
      mappingSource: "MaterialSymbolsOutlined.codepoints",
      style,
      hadStyleSuffix
    };
  }

  const aliasTarget = MATERIAL_ALIASES[baseName];
  if (aliasTarget && materialMap[aliasTarget] !== undefined) {
    return {
      glyphName: aliasTarget,
      unicodeCodepoint: materialMap[aliasTarget],
      mappingStatus: "verified-alias",
      mappingSource: "MaterialSymbolsOutlined.codepoints via MATERIAL_ALIASES",
      style,
      hadStyleSuffix
    };
  }

  const normalizedName = normalizeSpelledMaterialName(baseName);
  if (normalizedName !== baseName && materialMap[normalizedName] !== undefined) {
    return {
      glyphName: normalizedName,
      unicodeCodepoint: materialMap[normalizedName],
      mappingStatus: "verified-normalized-name",
      mappingSource: "MaterialSymbolsOutlined.codepoints via spelled-number normalization",
      style,
      hadStyleSuffix
    };
  }

  return {
    glyphName: baseName,
    mappingStatus: "unmapped",
    mappingSource: null,
    style,
    hadStyleSuffix
  };
}

const [rawCatalog, rawCupertino, rawMaterial] = await Promise.all([
  readFile(sourcePath, "utf8"),
  readFile(cupertinoMapPath, "utf8").catch(() => ""),
  readFile(materialMapPath, "utf8").catch(() => "")
]);

const records = parseFletSource(rawCatalog);
const cupertinoMap = parseCodepointMap(rawCupertino, true);
const materialMap = parseCodepointMap(rawMaterial, true);
if (!Object.keys(materialMap).length) throw new Error("Mapping Material vide ou illisible.");
if (!Object.keys(cupertinoMap).length) throw new Error("Mapping Cupertino vide ou illisible.");

const icons = records.map((record) => {
  const name = String(record.name);
  const normalized = name.toLowerCase();
  const family = record.family;
  if (family !== "material" && family !== "cupertino") {
    throw new Error("Famille non reconnue pour " + name + ": " + family);
  }

  let resolution;
  if (family === "material") {
    resolution = resolveMaterialGlyph(name, materialMap);
  } else {
    const glyphName = normalized;
    const codepoint = cupertinoMap[glyphName];
    resolution = codepoint === undefined
      ? { glyphName, mappingStatus: "unmapped", mappingSource: null, style: null }
      : {
          glyphName,
          unicodeCodepoint: codepoint,
          mappingStatus: "verified-name-map",
          mappingSource: "CupertinoIcons.codepoints",
          style: null
        };
  }

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
    glyphName: resolution.glyphName,
    ...(resolution.unicodeCodepoint === undefined ? {} : { unicodeCodepoint: resolution.unicodeCodepoint }),
    ...(resolution.style ? { style: resolution.style } : {}),
    ...(family === "material" && resolution.style
      ? { styleRenderStatus: resolution.style === "outlined" ? "native-outlined-font" : "outlined-font-fallback" }
      : {}),
    catalogCode: record.code,
    mappingStatus: resolution.mappingStatus,
    ...(family === "material" && resolution.mappingStatus === "unmapped" && MATERIAL_BRAND_CANDIDATES.has(normalized)
      ? { classification: "brand-candidate", recommendedLibraryId: "org.berkios.icons.brands" }
      : {}),
    ...(resolution.mappingSource ? { mappingSource: resolution.mappingSource } : {}),
    license: family === "material" ? "Apache-2.0" : "MIT",
    source: family === "material"
      ? "Google Material Symbols codepoints map"
      : "Flutter Cupertino icon constants"
  };
});

const counts = {};
const mappedCounts = {};
const aliasCounts = {};
const normalizedNameCounts = {};
const brandCandidateCounts = {};
const styleCounts = {};
for (const icon of icons) {
  counts[icon.family] = (counts[icon.family] || 0) + 1;
  if (icon.unicodeCodepoint !== undefined) {
    mappedCounts[icon.family] = (mappedCounts[icon.family] || 0) + 1;
  }
  if (icon.mappingStatus === "verified-alias") {
    aliasCounts[icon.family] = (aliasCounts[icon.family] || 0) + 1;
  }
  if (icon.mappingStatus === "verified-normalized-name") {
    normalizedNameCounts[icon.family] = (normalizedNameCounts[icon.family] || 0) + 1;
  }
  if (icon.classification === "brand-candidate") {
    brandCandidateCounts[icon.family] = (brandCandidateCounts[icon.family] || 0) + 1;
  }
  if (icon.family === "material") {
    styleCounts[icon.style] = (styleCounts[icon.style] || 0) + 1;
  }
}

const unmappedByFamily = {};
for (const icon of icons) {
  if (icon.mappingStatus === "unmapped") {
    unmappedByFamily[icon.family] = (unmappedByFamily[icon.family] || 0) + 1;
  }
}

const output = {
  schemaVersion: "1.1.0",
  source: "Berkios Graphic Studio studio/src/model/flet-icon-catalog.ts",
  generatedAt: new Date().toISOString(),
  total: icons.length,
  counts,
  mappedCounts,
  aliasCounts,
  normalizedNameCounts,
  brandCandidateCounts,
  unmappedCounts: unmappedByFamily,
  materialStyleCounts: styleCounts,
  note: "catalogCode is a framework enum/catalog identifier, not a Unicode codepoint. unicodeCodepoint values are resolved only through checked-in codepoint maps. rounded/sharp style metadata currently falls back to the checked-in Material Symbols Outlined font.",
  icons
};

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");

console.log("Catalogue importé : " + icons.length + " entrées.");
console.log("Familles : " + JSON.stringify(counts));
console.log("Correspondances vérifiées : " + JSON.stringify(mappedCounts));
console.log("Alias vérifiés : " + JSON.stringify(aliasCounts));
console.log("Noms normalisés vérifiés : " + JSON.stringify(normalizedNameCounts));
console.log("Candidats marques (non mappés) : " + JSON.stringify(brandCandidateCounts));
console.log("Non mappées : " + JSON.stringify(unmappedByFamily));
console.log("Styles Material : " + JSON.stringify(styleCounts));
console.log("Fichier : " + outputPath);
