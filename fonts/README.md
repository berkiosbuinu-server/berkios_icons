# Polices d'icônes

Ce dossier héberge les fichiers de polices réellement distribuables.

## Arborescence

```text
fonts/
├── material/
│   ├── LICENSE.txt
│   ├── README.md
│   └── *.woff2 / *.ttf
├── cupertino/
│   ├── LICENSE.txt
│   ├── README.md
│   └── *.woff2 / *.ttf
└── berkios/
    ├── LICENSE.txt
    ├── README.md
    └── *.woff2 / *.ttf
```

## Règle de nommage

Le nom déclaré dans `@font-face` doit correspondre exactement au champ `fontFamily` du manifeste. Ne pas réutiliser un nom de famille pour deux polices différentes.

Exemple de déclaration (adapter le chemin et le nom aux fichiers réellement présents) :

```css
@font-face {
  font-family: "BerkiosIcons";
  src: url("./berkios/berkios-icons.woff2") format("woff2");
  font-style: normal;
  font-weight: 400;
  font-display: swap;
}
```

## Contenu obligatoire pour chaque pack

- Police(s) autorisée(s) à la redistribution.
- Licence originale complète.
- Version amont et provenance.
- Mapping des noms, alias et codepoints.
- Format, poids, style et sous-ensemble linguistique éventuel.
- Vérification du rendu et somme SHA-256.

**État initial :** les dossiers sont des emplacements documentaires. Aucun fichier binaire de police tierce n'est annoncé comme disponible tant qu'il n'a pas été ajouté et vérifié.
