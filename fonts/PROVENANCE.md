# Provenance et licences des polices

Les scripts et la documentation du Studio fourni mentionnent les deux ressources suivantes :

| Police | Source amont | Famille CSS utilisée dans le Studio | Licence indiquée par le script du Studio |
|---|---|---|---|
| Material Symbols Outlined | https://github.com/google/material-design-icons/tree/10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7 | `BerkiosMaterialSymbols` | Apache License 2.0 — licence incluse, binaire en attente |
| Cupertino Icons | https://github.com/flutter/packages/tree/3c6ce5905441d9f060ab2b43147f765ef170d2bf/third_party/packages/cupertino_icons | `BerkiosCupertinoIcons` | MIT — version 2.0.0, licence incluse dans le dépôt |

## État de distribution

Le fichier Cupertino Icons 2.0.0 et sa licence sont présents dans ce dépôt. Material Symbols Outlined n'est pas encore intégré. L'archive du Studio fournie ne contenait pas ces binaires ; son script les télécharge normalement dans `public/assets/icon-fonts`.

Avant de les ajouter ici :
1. choisir et figer une version amont ;
2. télécharger le fichier officiel correspondant ;
3. conserver la licence exacte de cette version ;
4. calculer et enregistrer son SHA-256 ;
5. confirmer le nom CSS et les paramètres de poids ;
6. valider les noms/ligatures et codepoints de la police ;
7. mettre à jour `manifest/fonts.json` et `manifest/libraries.json`.

La licence MIT appliquée à la documentation du dépôt ne remplace pas les licences des polices tierces.
