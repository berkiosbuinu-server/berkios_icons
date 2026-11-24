# Catalogue Flet Material / Cupertino

## Source validée : Berkios Graphic Studio v0.7.312

L'archive fournie le 24 novembre 2026 contient `studio/src/model/flet-icon-catalog.ts` avec **10 147 identifiants** :
- **8 825** entrées Material ;
- **1 322** entrées Cupertino.

Le catalogue a été relu directement depuis l'archive Studio. Le dossier racine de l'archive porte encore le nom `BERKIOS_GRAPHIC_STUDIO_2026_v0_7_311_datepicker`, mais le fichier transmis est nommé v0.7.312. Le catalogue contient des identifiants Flet et des codes internes ; ceux-ci ne sont pas des codepoints Unicode.

Le fichier `cupertino-codepoints.ts` de cette archive est vide. Pour l'import central, le dépôt utilise la table Cupertino versionnée dans `fonts/cupertino/CupertinoIcons.codepoints`, et non le fichier vide de l'archive.

## Générer le manifeste central complet

Depuis la racine du dépôt, avec Node.js, en indiquant le chemin réel vers le fichier extrait de l'archive :

```powershell
node scripts/import-studio-catalog.mjs "CHEMIN_VERS_LE_STUDIO/studio/src/model/flet-icon-catalog.ts"
```

Le script lit les mappings versionnés :
- `fonts/material/MaterialSymbolsOutlined.codepoints` ;
- `fonts/cupertino/CupertinoIcons.codepoints`.

Il produit `manifest/flet-icon-catalog.json`. Les nombres `mappedCounts` doivent être vérifiés avant publication. Toute icône non mappée reste explicitement signalée comme telle.

## Polices centralisées

Les polices Material Symbols Outlined et Cupertino Icons sont présentes dans ce dépôt avec licences, mappings et sommes SHA-256. Le workflow GitHub Actions de synchronisation des polices a réussi le 24 novembre 2026.

## Signification des champs

- `catalogCode` : valeur interne du catalogue Flet ; ce n'est pas un codepoint Unicode.
- `fontFamily` : nom CSS/runtime de la police.
- `glyphName` : nom symbolique.
- `unicodeCodepoint` : présent uniquement quand la correspondance amont a été trouvée.
- `mappingStatus` : indique si le mapping a été résolu.

Ne jamais utiliser `catalogCode` comme caractère Unicode.
