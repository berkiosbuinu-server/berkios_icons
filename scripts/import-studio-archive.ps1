param(
  [Parameter(Mandatory = $true, Position = 0)]
  [string]$StudioArchive,
  [switch]$StrictMappings
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$archive = (Resolve-Path $StudioArchive).Path
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("berkios-icons-studio-" + [guid]::NewGuid().ToString("N"))
$extractRoot = Join-Path $tempRoot "source"

try {
  New-Item -ItemType Directory -Path $extractRoot -Force | Out-Null
  Expand-Archive -LiteralPath $archive -DestinationPath $extractRoot -Force

  $catalogFiles = @(Get-ChildItem -Path $extractRoot -Filter "flet-icon-catalog.ts" -Recurse -File)
  if ($catalogFiles.Count -ne 1) {
    throw "Attendu un seul flet-icon-catalog.ts dans l'archive ; trouvé : $($catalogFiles.Count)."
  }

  $importScript = Join-Path $repoRoot "scripts/import-studio-catalog.mjs"
  $manifestPath = Join-Path $repoRoot "manifest/flet-icon-catalog.json"
  if (-not (Test-Path $importScript)) { throw "Script d'import absent : $importScript" }
  if (-not (Test-Path (Join-Path $repoRoot "fonts/material/MaterialSymbolsOutlined.codepoints"))) {
    throw "Mapping Material absent du dépôt."
  }
  if (-not (Test-Path (Join-Path $repoRoot "fonts/cupertino/CupertinoIcons.codepoints"))) {
    throw "Mapping Cupertino absent du dépôt."
  }

  Push-Location $repoRoot
  try {
    node $importScript $catalogFiles[0].FullName
    if ($LASTEXITCODE -ne 0) { throw "L'import Node.js a échoué (code $LASTEXITCODE)." }
  } finally {
    Pop-Location
  }

  if (-not (Test-Path $manifestPath)) { throw "Le manifeste n'a pas été créé." }
  $manifest = Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
  if ($manifest.total -lt 1000) { throw "Catalogue incomplet : $($manifest.total) entrées." }

  Write-Host ""
  Write-Host "Import terminé : $($manifest.total) icônes"
  Write-Host "Material : $($manifest.counts.material) / mappées : $($manifest.mappedCounts.material)"
  Write-Host "Cupertino : $($manifest.counts.cupertino) / mappées : $($manifest.mappedCounts.cupertino)"
  Write-Host "Manifeste : $manifestPath"

  if ($StrictMappings) {
    foreach ($family in @("material", "cupertino")) {
      if ([int]$manifest.counts.$family -ne [int]$manifest.mappedCounts.$family) {
        throw "Mapping incomplet pour $family. Le manifeste a été généré, mais il n'est pas validé pour publication stricte."
      }
    }
  }
} finally {
  if (Test-Path $tempRoot) { Remove-Item -LiteralPath $tempRoot -Recurse -Force }
}
