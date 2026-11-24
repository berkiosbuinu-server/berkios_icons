# Utiliser Berkios Icons dans Graphic Studio

Ce guide décrit l'intégration du registre central dans Berkios Graphic Studio. Les détails de cette section ont été vérifiés dans l'archive du Studio fournie pour cette tâche.

## Ce que le Studio contient déjà

Le Studio possède actuellement deux ensembles distincts dans `studio/src/model/icon-library.ts` :

1. Un catalogue Berkios interne avec des noms tels que `home`, `menu`, `save`, `settings`, `dashboard`, `folder`, `cart`, `palette` et `widgets`. Les éléments de ce catalogue ont un libellé, un glyphe texte et une catégorie.
2. Un catalogue Flet importé par `FLET_ICON_CATALOG`, dont les entrées sont exposées avec des identifiants préfixés `material:` ou `cupertino:`.

Le rendu actuel suit une priorité :
- fichier SVG renseigné → rendu SVG ;
- nom de glyphe + codepoint validé + police disponible → rendu par police ;
- glyphe texte → rendu texte ;
- aucune ressource exploitable → placeholder accessible.

Les icônes personnalisées importées dans un projet peuvent être des SVG, PNG, ICO, JPEG, GIF, WebP ou BMP. Le Studio les stocke dans le projet sous forme d'URL de données.

## Polices et téléchargement hors ligne

Le Studio fourni contient :
- `studio/src/icon-fonts.css` ;
- `studio/scripts/download-icon-fonts.ps1` ;
- `studio/ICON_FONTS_OFFLINE_SETUP.md` ;
- `studio/ICON_CUPERTINO_MAP.md`.

Le script PowerShell télécharge les polices vers `studio/public/assets/icon-fonts/` :
- `MaterialSymbolsOutlined.ttf` depuis le dépôt Google Material Design Icons ;
- `CupertinoIcons.ttf` depuis le dépôt Flutter packages.

Il génère également une table de correspondance Cupertino à partir du code source Flutter. Les valeurs du catalogue Flet sont des identifiants de catalogue et ne doivent pas être traitées directement comme des codepoints Unicode.

**État du dépôt central au 24 novembre 2026 :** les deux polices binaires sont versionnées dans `fonts/`, avec leurs licences, mappings et empreintes SHA-256. Avant une release, vérifier l'état réel des fichiers binaires et des checksums dans le dépôt. Les applications doivent distribuer ces ressources depuis une version immuable du dépôt.

## Contrat recommandé pour le Studio

Le Studio doit charger le registre central plutôt que maintenir une liste indépendante :

```ts
export interface BerkiosIconRecord {
  id: string;               // ex. "material:home"
  name: string;             // nom stable
  label: string;            // libellé affichable et accessible
  category: string;
  libraryId: string;
  family: "berkios" | "material" | "cupertino" | "svg" | "custom";
  renderMode: "font" | "svg" | "glyph" | "image";
  fontFamily?: string;      // obligatoire si renderMode === "font"
  glyphName?: string;       // ligature ou nom du glyphe
  unicodeCodepoint?: number;// seulement si vérifié dans la police exacte
  asset?: string;           // chemin relatif au dépôt ou au projet
  license: string;
}
```

Le registre JSON de référence est [`../manifest/icons.json`](../manifest/icons.json) et son format est décrit par [`../manifest/icons.schema.json`](../manifest/icons.schema.json).

## Afficher une Material Symbol

Le fichier CSS actuel du Studio déclare la famille `BerkiosMaterialSymbols` et utilise les ligatures :

```css
.material-symbols-outlined {
  font-family: "BerkiosMaterialSymbols";
  font-feature-settings: "liga";
  font-weight: 400;
  font-style: normal;
}
```

```html
<span class="material-symbols-outlined" aria-hidden="true">home</span>
```

Le nom CSS doit correspondre exactement au manifeste. Attention : dans l'archive étudiée, `icon-renderer.ts` construit aussi le nom `BerkiosMaterialIcons`, alors que `icon-fonts.css` déclare `BerkiosMaterialSymbols`. Il faut harmoniser ces deux noms ou ajouter un alias CSS explicite avant d'activer ce rendu dans toutes les vues.

## Afficher une icône Cupertino

Utiliser uniquement le codepoint obtenu depuis la table de correspondance correspondant à la version exacte de la police :

```css
.berkios-cupertino-icon {
  font-family: "BerkiosCupertinoIcons";
  font-style: normal;
}
```

Ne jamais calculer un caractère avec la valeur brute d'un enum Flet. Si la correspondance nom → codepoint n'existe pas, garder le fallback au lieu d'afficher un mauvais symbole.

## Catégories UI

Les catégories communes sont documentées dans [`categories/`](categories/). Le sélecteur d'icônes du Studio doit permettre :
- recherche par nom, libellé et mots-clés ;
- filtre par catégorie et famille ;
- aperçu du glyphe dans la vraie police ;
- indication de la famille et de la licence ;
- indication claire lorsqu'une police manque ;
- copie de l'identifiant stable ;
- sélection des icônes SVG et des icônes de police avec la même API.

## Chargement depuis Git

Pour une version publiée, utiliser une version/tag immuable du dépôt ou un ZIP GitHub. Éviter de dépendre de la branche `main` dans une application de production, car son contenu peut changer.

URL du dépôt : https://github.com/berkiosbuinu-server/berkios_icons  
ZIP de la branche principale : https://github.com/berkiosbuinu-server/berkios_icons/archive/refs/heads/main.zip
