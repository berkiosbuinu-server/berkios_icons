# Catalogue Flet Material / Cupertino

L'archive Graphic Studio fournie contient studio/src/model/flet-icon-catalog.ts, un catalogue de 10 147 identifiants (8 825 Material et 1 322 Cupertino).

Le catalogue source n'expose pas ses valeurs numériques comme des codepoints Unicode fiables. Le renderer du Studio exige une police installée et une correspondance validée avant le rendu par police.

## Générer le manifeste central complet

Depuis la racine du dépôt, avec Node.js :

\`\`\`powershell
node scripts/import-studio-catalog.mjs ../BERKIOS_GRAPHIC_STUDIO_2026_v0_7_311_datepicker/studio/src/model/flet-icon-catalog.ts
\`\`\`

Le script lit le catalogue source, classe les icônes dans les 12 catégories fonctionnelles par heuristique de nom (à corriger si nécessaire), puis résout les vrais codepoints à partir :
- de fonts/material/MaterialSymbolsOutlined.codepoints pour Material ;
- de fonts/cupertino/CupertinoIcons.codepoints pour Cupertino (table nom → codepoint déjà versionnée dans ce dépôt).

Il produit manifest/flet-icon-catalog.json.

## Signification des champs

- catalogCode : valeur interne du catalogue Flet ; ce n'est pas un codepoint Unicode.
- fontFamily : nom CSS/runtime de la police.
- glyphName : nom symbolique.
- unicodeCodepoint : présent uniquement quand la correspondance amont a été trouvée.
- mappingStatus : indique si le mapping a été résolu ou non.

Après génération, inspecter les nombres mappedCounts, exécuter les tests de rendu, puis committer le JSON généré. Une icône non mappée ne doit pas utiliser catalogCode comme caractère Unicode.
