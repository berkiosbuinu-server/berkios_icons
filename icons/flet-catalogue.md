# Catalogue Flet Material / Cupertino

L'archive Graphic Studio fournie contient studio/src/model/flet-icon-catalog.ts, un catalogue de 10 147 identifiants (8 825 Material et 1 322 Cupertino).

Le catalogue source n'expose pas ses valeurs numériques comme des codepoints Unicode fiables. Le renderer du Studio exige une police installée et une correspondance validée avant le rendu par police.

## Générer le manifeste central complet

Depuis la racine du dépôt, avec Node.js :

\`\`\`powershell
node scripts/import-studio-catalog.mjs ..\\berkios_graphic\\studio\\src\\model\\flet-icon-catalog.ts
\`\`\`

Le script lit le catalogue source, puis tente de résoudre les vrais codepoints à partir :
- de fonts/material/MaterialSymbolsOutlined.codepoints pour Material ;
- de studio/src/model/cupertino-codepoints.ts pour Cupertino, si ce fichier a déjà été généré depuis la bonne version Flutter.

Il produit manifest/flet-icon-catalog.json.

## Signification des champs

- catalogCode : valeur interne du catalogue Flet ; ce n'est pas un codepoint Unicode.
- fontFamily : nom CSS/runtime de la police.
- glyphName : nom symbolique.
- unicodeCodepoint : présent uniquement quand la correspondance amont a été trouvée.
- mappingStatus : indique si le mapping a été résolu ou non.

Après génération, inspecter les nombres mappedCounts, exécuter les tests de rendu, puis committer le JSON généré. Une icône non mappée ne doit pas utiliser catalogCode comme caractère Unicode.
