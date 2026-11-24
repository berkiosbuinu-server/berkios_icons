# Métadonnées obligatoires de chaque icône

Chaque entrée du registre doit décrire suffisamment l'icône pour qu'un outil puisse la rendre sans deviner sa provenance.

## Champs

| Champ | Obligatoire | Rôle |
|---|---:|---|
| `id` | Oui | Identifiant stable, indépendant du libellé traduit |
| `name` | Oui | Nom symbolique |
| `label` | Oui | Libellé accessible |
| `category` | Oui | Catégorie fonctionnelle |
| `libraryId` | Oui | Bibliothèque/famille source |
| `family` | Oui | `berkios`, `material`, `cupertino`, `svg` ou `custom` |
| `renderMode` | Oui | `font`, `svg`, `glyph` ou `image` |
| `fontFamily` | Pour une police | Nom exact de la famille CSS/runtime |
| `glyphName` | Selon la police | Ligature ou nom de glyphe |
| `unicodeCodepoint` | Si vérifié | Vrai codepoint de la police retenue |
| `asset` | Pour SVG/image | Chemin relatif de la ressource |
| `license` | Oui | Licence ou référence de licence |
| `source` | Recommandé | Dépôt/source d'origine |
| `version` | Recommandé | Version du pack ou de la famille |
| `checksumSha256` | Pour les binaires | Somme de contrôle SHA-256 |

Le format JSON est validé par [`manifest/icons.schema.json`](../manifest/icons.schema.json).

## Exemples de rendu par police

Material Symbols utilise des noms de ligature :

```json
{
  "id": "material:home",
  "name": "HOME",
  "label": "Accueil",
  "category": "interface-navigation",
  "libraryId": "org.berkios.icons.material",
  "family": "material",
  "renderMode": "font",
  "fontFamily": "BerkiosMaterialSymbols",
  "glyphName": "home",
  "unicodeCodepoint": 0xe9b2,
  "license": "Apache-2.0"
}
```

Cupertino utilise un mapping nom → codepoint lié à la police :

```json
{
  "id": "cupertino:home",
  "name": "HOUSE",
  "label": "Maison",
  "category": "interface-navigation",
  "libraryId": "org.berkios.icons.cupertino",
  "family": "cupertino",
  "renderMode": "font",
  "fontFamily": "BerkiosCupertinoIcons",
  "glyphName": "house",
  "unicodeCodepoint": 0xf447,
  "license": "MIT"
}
```

Les exemples montrent la forme attendue. Avant d'ajouter une entrée en production, vérifier que le nom et le codepoint appartiennent bien au fichier de police indiqué dans `manifest/fonts.json`.

## Cas particuliers

- Un glyphe Berkios en texte peut déclarer `renderMode: "glyph"` sans `fontFamily` propriétaire.
- Une icône SVG déclare `renderMode: "svg"` et un chemin `asset`.
- Une image raster déclare `renderMode: "image"` et un chemin `asset`.
- Un identifiant numérique Flet (`catalogCode`) n'est jamais utilisé comme codepoint.
- Chaque police possède sa licence et sa provenance ; la licence du dépôt ne les remplace pas.
