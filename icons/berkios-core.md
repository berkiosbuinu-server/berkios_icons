# Utiliser Berkios Icons dans Berkios Core

Ce guide propose le point d'intégration commun de Berkios Core. Il ne prétend pas documenter une API déjà présente : le code source de Berkios Core n'a pas été fourni avec l'archive Graphic Studio.

## Responsabilités

Berkios Core doit fournir un résolveur neutre vis-à-vis de l'interface :

- charger le manifeste de bibliothèques et le catalogue des icônes ;
- retrouver une icône par identifiant stable ou alias ;
- vérifier la disponibilité de la police ou du fichier ;
- retourner une description de rendu ;
- fournir le libellé accessible et les informations de licence ;
- permettre aux adaptateurs Web, Flutter, Flet, Tauri et autres de rendre cette description.

Le Core ne doit pas imposer React, Flutter, Flet ou un moteur graphique particulier.

## Schéma de données

Chaque icône doit au minimum déclarer :
- identifiant stable ;
- nom et libellé accessible ;
- catégorie et mots-clés ;
- famille et bibliothèque d'origine ;
- mode de rendu ;
- nom exact de la police si elle utilise une police ;
- codepoint seulement s'il a été vérifié dans cette police ;
- chemin du fichier SVG/image s'il s'agit d'un asset ;
- licence, source et version.

## Cycle de résolution

```text
Icon ID
  └─> Registry lookup
       ├─> Font icon: font family + ligature/codepoint
       ├─> SVG icon: asset path
       ├─> Glyph icon: text glyph
       └─> Image icon: raster asset
            └─> Accessible fallback if unavailable
```

## Comportement hors ligne

Les applications doivent pouvoir utiliser le pack déjà installé sans connexion Internet. Le téléchargement se fait lors de l'installation, de la mise à jour ou de la gestion des dépendances, pas au moment de chaque affichage.

Le runtime doit :
- mettre en cache les fichiers versionnés ;
- vérifier le manifeste et les sommes de contrôle lorsqu'elles sont fournies ;
- signaler une ressource absente ;
- ne pas remplacer une icône par un caractère aléatoire ;
- ne jamais empêcher l'affichage du texte ou la navigation si une icône manque.

## API de référence proposée

```ts
interface IconRegistry {
  get(id: string): IconRecord | undefined;
  search(query: string, options?: { category?: string; family?: string }): IconRecord[];
  resolve(id: string): IconRenderDescriptor | undefined;
}
```

Les adaptateurs natifs choisissent la méthode de rendu selon leur plateforme, mais conservent les mêmes identifiants et métadonnées.

Voir le [manifeste](../manifest/libraries.json), le [catalogue initial](../manifest/icons.json) et le [schéma](../manifest/icons.schema.json).
