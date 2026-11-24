# Audit de la source — Berkios Graphic Studio v0.7.312

## Archive examinée

- Archive fournie : `BERKIOS_GRAPHIC_STUDIO_2026_v0_7_312(1).zip`
- Dossier interne : `BERKIOS_GRAPHIC_STUDIO_2026_v0_7_311_datepicker/`
- Fichier catalogue : `studio/src/model/flet-icon-catalog.ts`

Le dossier interne porte encore le nom v0.7.311, mais l’archive transmise est nommée v0.7.312. La version de référence de cet audit est celle du fichier reçu : v0.7.312.

## Résultat du comptage

Le tableau JSON embarqué dans `flet-icon-catalog.ts` a été extrait et analysé :

| Famille | Nombre d’identifiants |
|---|---:|
| Material | 8 825 |
| Cupertino | 1 322 |
| **Total** | **10 147** |

Aucun doublon de couple famille/nom normalisé n’a été détecté.

## Fichiers du Studio observés

- `studio/src/model/flet-icon-catalog.ts` : catalogue Flet, avec `name`, `code` et `family`.
- `studio/src/model/cupertino-codepoints.ts` : table vide dans l’archive reçue.
- `studio/src/model/icon-library.ts` : catalogue symbolique Berkios et exposition du catalogue Flet.
- `studio/src/model/icon-library-manager.ts` et `icon-library-store.ts` : gestion et stockage des bibliothèques installées.
- `studio/src/icon-fonts.css` : déclaration des familles CSS Material et Cupertino.
- `studio/scripts/download-icon-fonts.ps1` : script de téléchargement des polices.

## Règle impérative sur les codes

Le champ `code` des enregistrements Flet est un identifiant interne au catalogue/framework. Il ne doit jamais être converti directement en caractère Unicode.

Le manifeste central doit utiliser les tables de correspondance versionnées du dépôt :

- `fonts/material/MaterialSymbolsOutlined.codepoints`
- `fonts/cupertino/CupertinoIcons.codepoints`

Le script `scripts/import-studio-catalog.mjs` effectue la correspondance par nom. Si un nom n’existe pas dans la table de sa famille, l’entrée reste marquée `mappingStatus: "unmapped"`, sans codepoint inventé.

## Commande d’import

Après extraction de l’archive à côté du dépôt, lancer depuis la racine de `berkios_icons` :

```powershell
node scripts/import-studio-catalog.mjs "..\BERKIOS_GRAPHIC_STUDIO_2026_v0_7_311_datepicker\studio\src\model\flet-icon-catalog.ts"
```

Le script produit `manifest/flet-icon-catalog.json`. Avant de publier ce fichier, contrôler les totaux `total`, `counts` et `mappedCounts`, ainsi que les entrées non mappées.

## Limite de cet audit

Cet audit confirme le contenu du catalogue source et les fichiers de gestion des icônes présents dans le Studio. Il ne prétend pas que le manifeste complet a déjà été généré ou publié dans le dépôt central.
