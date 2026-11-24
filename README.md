# Berkios Icons

Bibliothèque centralisée des icônes et des polices d'icônes de l'écosystème **Berkios**.

Dépôt : https://github.com/berkiosbuinu-server/berkios_icons  
Page d'accueil : [index.html](index.html)

## Objectifs

- Fournir une source commune d'identifiants et de métadonnées pour les icônes.
- Distribuer les polices et les ressources graphiques depuis Git.
- Regrouper les icônes par catégories cohérentes.
- Documenter séparément l'intégration dans Berkios Graphic Studio, Berkios Code et Berkios Core.
- Éviter les catalogues divergents et les copies non versionnées dans chaque application.
- Tracer la version, la licence et la provenance de chaque famille.

## Structure

```text
manifest/             Métadonnées et schéma du registre
icons/                Guides d'intégration et catégories
fonts/material/       Licence et mapping Material ; binaire en attente
fonts/cupertino/      Police, licence et mapping Cupertino versionnés
fonts/berkios/        Polices et glyphes propres à Berkios
svg/                  Icônes vectorielles indépendantes d'une police
scripts/              Synchronisation des polices et import du catalogue Studio
examples/             Exemples HTML, CSS, TypeScript et Berkios
```

## Familles et formats

Le système distingue le **catalogue** de ses **ressources de rendu** :

| Famille | Identifiant de famille | Mode de rendu | Ressource |
|---|---|---|---|
| Berkios | `berkios` | Glyphe, SVG ou ressource dédiée | Dépend de l'icône |
| Material | `material` | Police d'icônes | WOFF2/TTF selon manifeste |
| Cupertino | `cupertino` | Police d'icônes | WOFF2/TTF selon manifeste |
| SVG | `svg` | Fichier vectoriel | `.svg` |
| Personnalisée | `custom` | SVG ou image | Ressource du projet ou du pack |

Les polices ne sont pas interchangeables : chaque famille doit déclarer son nom CSS exact, ses fichiers, son poids/style, son mapping de glyphes et sa licence.

## Démarrage

1. Lire [l'architecture des polices](fonts/README.md).
2. Lire le guide adapté à l'environnement dans [icons/](icons/).
3. Consulter [le manifeste des bibliothèques](manifest/libraries.json).
4. Consulter le [catalogue initial des icônes](manifest/icons.json) et les [métadonnées par icône](icons/icon-metadata.md).
5. Pour importer le catalogue Flet complet (10 147 entrées observées dans le Studio), suivre le [guide d'import](icons/flet-catalogue.md).
6. Télécharger le dépôt ou une version publiée.
7. Charger uniquement les familles réellement utilisées par l'application.

Téléchargement direct :

- ZIP : https://github.com/berkiosbuinu-server/berkios_icons/archive/refs/heads/main.zip
- Clonage : `git clone https://github.com/berkiosbuinu-server/berkios_icons.git`

## Règles importantes

- Ne jamais inventer un codepoint Unicode : le codepoint doit être fourni par la police et vérifié.
- Ne jamais déduire que les codes d'un catalogue de framework sont des codepoints de police.
- Une police absente doit déclencher un rendu de repli, pas un caractère arbitraire.
- Chaque icône possède un identifiant stable, une catégorie, un libellé accessible et une famille.
- Chaque famille de police possède un fichier de licence et une provenance documentée.
- Les fichiers provenant de bibliothèques tierces doivent respecter leurs licences et marques.

## Guides

- [Berkios Graphic Studio](icons/graphic-studio.md)
- [Berkios Code](icons/berkios-code.md)
- [Berkios Core](icons/berkios-core.md)
- [Catégories](icons/categories/)

## État initial

Ce dépôt pose l'architecture et les conventions du référentiel. Une famille de police n'est considérée comme distribuable que lorsque ses fichiers binaires, sa licence, sa version, ses empreintes et son mapping de glyphes sont effectivement ajoutés et validés. Le manifeste distingue donc explicitement les catalogues documentés des fichiers disponibles.
