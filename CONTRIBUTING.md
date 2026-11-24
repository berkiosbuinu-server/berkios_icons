# Contribuer à Berkios Icons

## Ajouter une icône

1. Choisir un identifiant stable en minuscules, avec tirets si nécessaire.
2. Définir un libellé court, traduit si le produit le demande.
3. Choisir une catégorie existante ou proposer une nouvelle catégorie.
4. Déclarer la famille et le mode de rendu.
5. Renseigner le nom du glyphe et le codepoint uniquement si la table de caractères de la police le confirme.
6. Ajouter la ressource ou indiquer le fichier de police déjà présent.
7. Ajouter la licence et la provenance.
8. Ajouter un exemple d'utilisation et vérifier l'accessibilité.

## Ajouter une police

Un pack de police doit contenir :

- les fichiers de police distribuables (`.woff2`, `.woff`, `.ttf` ou `.otf`) ;
- sa licence originale, sans la remplacer par la licence MIT de ce dépôt ;
- une notice de provenance, version amont et date de récupération ;
- le nom CSS `font-family` exact ;
- les styles et poids couverts ;
- le mapping nom d'icône → codepoint ;
- idéalement une page d'aperçu et un fichier de sommes SHA-256.

Ne pas ajouter de fichier binaire si les conditions de redistribution ne sont pas claires.

## Convention d'identifiants

Format recommandé : `<famille>:<nom>`

Exemples :
- `berkios:home`
- `material:home`
- `cupertino:house`
- `custom:company-mark`

L'identifiant ne doit pas changer lorsque le libellé est traduit ou que le glyphe est redessiné.

## Pull requests

Une proposition doit inclure la mise à jour du manifeste, la documentation de catégorie et un exemple. Les suppressions ou changements de codepoint doivent être signalés comme changements incompatibles.
