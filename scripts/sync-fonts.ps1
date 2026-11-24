[CmdletBinding()]
param(
  [string]$MaterialRef = "10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7",
  [string]$CupertinoRef = "3c6ce5905441d9f060ab2b43147f765ef170d2bf",
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

$packs = @(
  @{
    Name = "MaterialSymbolsOutlined.ttf"
    Destination = Join-Path $repoRoot "fonts/material/MaterialSymbolsOutlined.ttf"
    Url = "https://raw.githubusercontent.com/google/material-design-icons/$MaterialRef/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.ttf"
    LicenseUrl = "https://raw.githubusercontent.com/google/material-design-icons/$MaterialRef/LICENSE"
    LicenseDestination = Join-Path $repoRoot "fonts/material/LICENSE.txt"
  },
  @{
    Name = "CupertinoIcons.ttf"
    Destination = Join-Path $repoRoot "fonts/cupertino/CupertinoIcons.ttf"
    Url = "https://raw.githubusercontent.com/flutter/packages/$CupertinoRef/third_party/packages/cupertino_icons/assets/CupertinoIcons.ttf"
    LicenseUrl = "https://raw.githubusercontent.com/flutter/packages/$CupertinoRef/third_party/packages/cupertino_icons/LICENSE"
    LicenseDestination = Join-Path $repoRoot "fonts/cupertino/LICENSE.txt"
  }
)

foreach ($pack in $packs) {
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $pack.Destination) | Out-Null
  if ($Force -or !(Test-Path $pack.Destination) -or (Get-Item $pack.Destination).Length -lt 10000) {
    Write-Host "Téléchargement de $($pack.Name)"
    Invoke-WebRequest -Uri $pack.Url -OutFile $pack.Destination
  } else {
    Write-Host "Police déjà présente, conservée : $($pack.Name)"
  }
  if (!(Test-Path $pack.Destination) -or (Get-Item $pack.Destination).Length -lt 10000) {
    throw "Le fichier reçu est absent ou trop petit : $($pack.Destination)"
  }
  if ($Force -or !(Test-Path $pack.LicenseDestination)) {
    Invoke-WebRequest -Uri $pack.LicenseUrl -OutFile $pack.LicenseDestination
  }
  if (!(Test-Path $pack.LicenseDestination) -or (Get-Item $pack.LicenseDestination).Length -lt 100) {
    throw "La licence amont n'a pas été récupérée : $($pack.LicenseDestination)"
  }
  $hash = (Get-FileHash -Algorithm SHA256 -Path $pack.Destination).Hash
  Write-Host "$($pack.Name) SHA256: $($hash.ToLowerInvariant())"
}

$report = [ordered]@{
  generatedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
  materialRef = $MaterialRef
  cupertinoRef = $CupertinoRef
  files = @(
    Get-ChildItem (Join-Path $repoRoot "fonts") -Recurse -File |
      Where-Object { $_.Extension -in @(".ttf", ".woff", ".woff2", ".otf") } |
      ForEach-Object {
        [ordered]@{
          path = $_.FullName.Substring($repoRoot.Length + 1).Replace("\", "/")
          size = $_.Length
          sha256 = (Get-FileHash -Algorithm SHA256 -Path $_.FullName).Hash.ToLowerInvariant()
        }
      }
  )
}
$report | ConvertTo-Json -Depth 8 | Set-Content -Encoding UTF8 (Join-Path $repoRoot "manifest/font-checksums.json")
Write-Host ""
Write-Host "Polices et licences vérifiées. Inspectez les fichiers et mettez à jour le manifeste avant commit."
Write-Host "Ajoutez les fichiers au dépôt : git add fonts manifest/font-checksums.json"
