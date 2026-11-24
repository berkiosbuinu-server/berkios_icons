# Synchronisation des fichiers de polices

Depuis la racine clonée du dépôt :

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\sync-fonts.ps1
```

Le script utilise des références amont figées :
- Material Design Icons : `10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7`
- Flutter Cupertino Icons : `3c6ce5905441d9f060ab2b43147f765ef170d2bf`

Il conserve les polices déjà présentes (notamment Cupertino Icons déjà inclus), récupère les fichiers manquants, les licences amont et génère `manifest/font-checksums.json`.

Pour forcer une nouvelle récupération depuis ces mêmes révisions :

```powershell
.\scripts\sync-fonts.ps1 -Force
```

Pour une mise à jour future, remplacez les deux références par des commits amont vérifiés et mettez à jour les manifestes.

Après vérification :

```powershell
git add fonts manifest/font-checksums.json
git commit -m "feat: vendor verified icon fonts"
git push
```
