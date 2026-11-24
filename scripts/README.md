# Synchronisation des fichiers de polices

Depuis la racine clonée du dépôt :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\sync-fonts.ps1
```

Le script télécharge Material Symbols Outlined et Cupertino Icons dans `fonts/`, conserve les licences amont et génère `manifest/font-checksums.json`.

Pour une publication reproductible, passez des références Git amont figées (idéalement un commit SHA validé) :

```powershell
.\scripts\sync-fonts.ps1 -MaterialRef "<commit-google>" -CupertinoRef "<commit-flutter>"
```

Le script ne publie rien lui-même. Après vérification des fichiers, licences et sommes SHA-256 :

```powershell
git add fonts manifest/font-checksums.json
git commit -m "feat: vendor verified icon fonts"
git push
```

Les références par défaut `master` et `main` sont pratiques pour la récupération initiale, mais ne sont pas reproductibles. Ne pas créer une release de production sans références amont figées et vérification des licences.
