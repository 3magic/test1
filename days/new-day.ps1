<#
.SYNOPSIS
  Scaffold a new daily content directory for momentofzen.art

.USAGE
  # Today:
  .\new-day.ps1

  # Specific date:
  .\new-day.ps1 -Date 2026-06-10

  # With custom Unsplash IDs (hero + 2 gallery):
  .\new-day.ps1 -Date 2026-06-10 -HeroId photo-XXXX -Gallery1Id photo-YYYY -Gallery2Id photo-ZZZZ

  After running, edit days/<date>/data.js to fill in the quote, subtitle, and poems.
#>

param(
  [string]$Date       = (Get-Date -Format 'yyyy-MM-dd'),
  [string]$HeroId     = '',
  [string]$Gallery1Id = '',
  [string]$Gallery2Id = ''
)

$root   = Split-Path $PSScriptRoot -Parent
$dayDir = Join-Path $root "days\$Date"

if (Test-Path $dayDir) {
  Write-Host "Directory already exists: $dayDir" -ForegroundColor Yellow
  exit 1
}

New-Item -ItemType Directory -Path $dayDir | Out-Null
Write-Host "Created: $dayDir" -ForegroundColor Green

# ── Download images ────────────────────────────────────────────────────────────
function Download-Image {
  param([string]$UnsplashId, [string]$FileName, [string]$Size)
  if (-not $UnsplashId) { Write-Host "  Skipped $FileName (no ID provided)" -ForegroundColor DarkGray; return }
  $url  = "https://images.unsplash.com/$UnsplashId`?w=$Size&q=90&auto=format&fit=crop"
  $dest = Join-Path $dayDir $FileName
  try {
    $wc = New-Object System.Net.WebClient
    $wc.Headers.Add('User-Agent', 'Mozilla/5.0')
    $wc.DownloadFile($url, $dest)
    $kb = [math]::Round((Get-Item $dest).Length / 1KB)
    Write-Host "  Downloaded $FileName ($kb KB)" -ForegroundColor Cyan
  } catch {
    Write-Host "  FAILED $FileName : $_" -ForegroundColor Red
  }
}

Download-Image $HeroId     'hero.jpg'      '1920'
Download-Image $Gallery1Id 'gallery-1.jpg' '1280'
Download-Image $Gallery2Id 'gallery-2.jpg' '1280'

# ── Write locale translation scaffolds ───────────────────────────────────────
$langs = @('zh-hans','zh-hant','ja','th','vi')
foreach ($lang in $langs) {
  $locPath = Join-Path $dayDir "data.$lang.js"
  $locJs = @"
(function () {
  window.DAY_CONTENT = window.DAY_CONTENT || {};
  var d = window.DAY_CONTENT['$Date'] = window.DAY_CONTENT['$Date'] || {};
  d.translations = d.translations || {};
  d.translations['$lang'] = {
    subtitle: 'TODO: translate subtitle to $lang',
    quoteText: 'TODO: translate quote to $lang'
  };
}());
"@
  [System.IO.File]::WriteAllText($locPath, $locJs, [System.Text.Encoding]::UTF8)
  Write-Host "  Created data.$lang.js" -ForegroundColor Cyan
}

# ── Write data.js scaffold ─────────────────────────────────────────────────────
$dataJs = @"
/* Day content: $Date
   Edit this file: fill in subtitle, quote, and poems, then commit. */
(function () {
  var date = '$Date';
  window.DAY_CONTENT = window.DAY_CONTENT || {};
  window.DAY_CONTENT[date] = {
    hero: {
      image: 'days/' + date + '/hero.jpg',
      subtitle: 'TODO: daily subtitle goes here.'
    },
    quote: {
      text: '"TODO: daily quote."',
      author: 'Author Name',
      source: 'Source · Year'
    },
    gallery: [
      {
        url: 'days/' + date + '/gallery-1.jpg',
        alt: 'TODO: describe the first image',
        caption: 'TODO Caption 1'
      },
      {
        url: 'days/' + date + '/gallery-2.jpg',
        alt: 'TODO: describe the second image',
        caption: 'TODO Caption 2'
      }
    ],
    east: {
      lines: ['TODO line 1', 'line 2', 'line 3'],
      author: 'Poet Name',
      source: 'Country · Century'
    },
    west: {
      lines: ['"TODO line 1', 'line 2."'],
      author: 'Poet Name',
      source: 'Work · Year'
    }
  };
}());
"@

$dataPath = Join-Path $dayDir 'data.js'
[System.IO.File]::WriteAllText($dataPath, $dataJs, [System.Text.Encoding]::UTF8)
Write-Host "  Created $dataPath" -ForegroundColor Cyan

# ── Update available.js ───────────────────────────────────────────────────────
$availablePath = Join-Path $root "days\available.js"
if (Test-Path $availablePath) {
  $content = Get-Content $availablePath -Raw
  if ($content -notmatch [regex]::Escape("'$Date'")) {
    # Insert the new date before the closing bracket
    $content = $content -replace "(\s*\];\s*$)", (",`n  '$Date'`$1")
    [System.IO.File]::WriteAllText($availablePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "  Updated days\available.js  (+$Date)" -ForegroundColor Cyan
  } else {
    Write-Host "  days\available.js already contains $Date" -ForegroundColor DarkGray
  }
}

Write-Host ""
Write-Host "Done.  Next steps:" -ForegroundColor Green
Write-Host "  1. Edit days\$Date\data.js  — fill in subtitle, quote, poems"
Write-Host "  2. Verify images look correct in a browser"
Write-Host "  3. git add days\$Date days\available.js  &&  git commit"
