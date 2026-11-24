# Provenance et licences des polices

Les scripts et la documentation du Studio fourni mentionnent les deux ressources suivantes :

| Police | Source amont | Famille CSS utilisée dans le Studio | Licence indiquée par le script du Studio |
|---|---|---|---|
| Material Symbols Outlined | https://github.com/google/material-design-icons | `BerkiosMaterialSymbols` | Apache License 2.0 |
| Cupertino Icons | https://github.com/flutter/packages/tree/main/third_party/packages/cupertino_icons | `BerkiosCupertinoIcons` | MIT (vérifier le fichier LICENSE du paquet/version exact) |

## État de distribution

Les fichiers binaires ne sont pas présents dans l'archive du Studio fournie et ne sont pas encore présents dans ce dépôt. Le script du Studio les télécharge dans son répertoire local `public/assets/icon-fonts`.

Avant de les ajouter ici :
1. choisir et figer une version amont ;
2. télécharger le fichier officiel correspondant ;
3. conserver la licence exacte de cette version ;
4. calculer et enregistrer son SHA-256 ;
5. confirmer le nom CSS et les paramètres de poids ;
6. valider les noms/ligatures et codepoints de la police ;
7. mettre à jour `manifest/fonts.json` et `manifest/libraries.json`.

La licence MIT appliquée à la documentation du dépôt ne remplace pas les licences des polices tierces.
