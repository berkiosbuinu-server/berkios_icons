# Ressources SVG

Les icônes SVG indépendantes d'une police sont stockées dans ce dossier, organisées par catégorie lorsque le volume le justifie.

Conventions :
- vue `viewBox` explicite ;
- pas de dimensions fixes empêchant le redimensionnement ;
- couleurs pilotables par `currentColor` lorsque possible ;
- identifiant stable correspondant au manifeste ;
- description accessible dans le registre ;
- provenance et licence documentées.

Exemple :

```html
<img src="./svg/interface/home.svg" alt="" aria-hidden="true">
```

Pour une icône informative, fournir un nom accessible dans l'élément qui l'emploie.
