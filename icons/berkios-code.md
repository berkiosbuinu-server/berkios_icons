# Utiliser Berkios Icons dans Berkios Code

Ce guide définit le contrat d'intégration recommandé pour Berkios Code. L'archive Graphic Studio fournie ne permet pas de confirmer une API d'icônes déjà implémentée dans Berkios Code ; les exemples ci-dessous sont donc une proposition de contrat commun et non une description d'une API existante.

## Principe

Le langage et ses outils doivent référencer une icône par identifiant stable, sans incorporer le dessin ou un codepoint arbitraire dans chaque projet.

Exemples d'identifiants :
- `berkios:home`
- `material:home`
- `cupertino:house`
- `svg:brand-mark`

## Exemple déclaratif

La syntaxe exacte dépendra de la grammaire retenue par Berkios Code. L'intention de l'API peut être représentée ainsi :

```text
Icon(
  name: "material:home",
  size: 24,
  color: "#EAF1FF",
  label: "Accueil"
)
```

Le compilateur ou runtime doit résoudre `name` à partir du registre central, vérifier la famille et le mode de rendu, puis sélectionner le backend approprié (police, SVG ou image).

## Contrat de résolution

```ts
type IconReference = {
  id: string;
  size?: number;
  color?: string;
  label?: string;
};

type ResolvedIcon = {
  id: string;
  family: string;
  renderMode: "font" | "svg" | "glyph" | "image";
  fontFamily?: string;
  glyphName?: string;
  unicodeCodepoint?: number;
  asset?: string;
  accessibleLabel: string;
};
```

Le manifeste de référence est [`../manifest/icons.json`](../manifest/icons.json). Le schéma se trouve dans [`../manifest/icons.schema.json`](../manifest/icons.schema.json).

## Règles pour le compilateur

1. Vérifier l'existence de l'identifiant au moment de la validation du projet.
2. Ne pas convertir automatiquement un nom en codepoint Unicode.
3. Préserver l'identifiant dans le fichier source compilé afin de faciliter le diagnostic.
4. Vérifier que le pack de police ou le fichier asset est disponible pour la cible demandée.
5. Signaler les dépendances de police manquantes lors de la compilation/export.
6. Prévoir un fallback cohérent sans silencieusement substituer une icône de sens différent.

## Distribution

Le paquet d'icônes doit être une dépendance versionnée. Berkios Code peut utiliser :
- le dossier cloné du dépôt en développement ;
- une archive ZIP ou release versionnée en distribution ;
- un sous-ensemble généré au build pour réduire la taille de l'application.

Ne pas télécharger des fichiers depuis `main` à chaque exécution du programme.
