<#
  Organize-Downloads.ps1
  Sorts the files in your Downloads folder into category folders.
  - Moves files only. Never deletes anything.
  - Skips downloads that are still in progress.
  - If a name already exists in the target folder, adds (1), (2), ...
  - Writes an undo log so every move can be reversed with Undo-Organize.bat.

  Usage:
    Organize-Downloads.ps1                 # organize the Downloads folder
    Organize-Downloads.ps1 -Preview        # only show what would happen
    Organize-Downloads.ps1 -ByMonth        # also split each category by year-month
    Organize-Downloads.ps1 -Path "D:\X"    # organize a different folder
    Organize-Downloads.ps1 -Undo           # reverse the last run
#>
param(
    [string]$Path = "",
    [switch]$Preview,
    [switch]$ByMonth,
    [switch]$Undo
)

$ErrorActionPreference = "Stop"

# Find the real Downloads folder (works even if it was moved to OneDrive or another drive)
if (-not $Path) {
    try {
        $Path = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path
    } catch { }
    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) {
        $Path = Join-Path $env:USERPROFILE "Downloads"
    }
}
if (-not (Test-Path -LiteralPath $Path)) {
    Write-Host "Folder not found: $Path" -ForegroundColor Red
    exit 1
}

$LogDir = Join-Path $Path "_OrganizeLogs"

# ---------- Undo ----------
if ($Undo) {
    $last = Get-ChildItem -LiteralPath $LogDir -Filter "moves_*.csv" -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending | Select-Object -First 1
    if (-not $last) { Write-Host "Nothing to undo." -ForegroundColor Yellow; exit 0 }
    Write-Host "Undoing: $($last.Name)" -ForegroundColor Cyan
    $rows = @(Import-Csv -LiteralPath $last.FullName)
    [array]::Reverse($rows)
    $ok = 0
    foreach ($r in $rows) {
        if ((Test-Path -LiteralPath $r.To) -and -not (Test-Path -LiteralPath $r.From)) {
            Move-Item -LiteralPath $r.To -Destination $r.From
            $ok++
        } else {
            Write-Host "  Skipped (moved or name taken): $($r.To)" -ForegroundColor Yellow
        }
    }
    Rename-Item -LiteralPath $last.FullName -NewName ($last.Name -replace '^moves_', 'undone_')
    # Remove the now-empty folders this script created (only folders named in the log)
    $dirs = $rows | ForEach-Object { Split-Path -Parent $_.To } | Sort-Object -Unique |
            Sort-Object { $_.Length } -Descending
    foreach ($d in $dirs) {
        foreach ($x in @($d, (Split-Path -Parent $d))) {
            if ($x -ne $Path -and $x.StartsWith($Path) -and (Test-Path -LiteralPath $x) -and
                -not (Get-ChildItem -LiteralPath $x -Force)) {
                Remove-Item -LiteralPath $x -ErrorAction SilentlyContinue
            }
        }
    }
    Write-Host "Restored $ok file(s)." -ForegroundColor Green
    exit 0
}

# ---------- Categories (edit freely) ----------
$Categories = [ordered]@{
    "PDF"           = "pdf"
    "Documents"     = "doc docx odt rtf txt md pages wpd"
    "Spreadsheets"  = "xls xlsx xlsm xlsb csv ods numbers"
    "Presentations" = "ppt pptx pps ppsx odp key"
    "Images"        = "jpg jpeg png gif bmp tif tiff webp heic heif svg ico raw cr2 nef psd ai eps"
    "Videos"        = "mp4 mov avi mkv wmv flv webm m4v 3gp mpg mpeg"
    "Audio"         = "mp3 wav m4a aac flac ogg wma opus amr"
    "Archives"      = "zip rar 7z tar gz tgz bz2 xz iso"
    "Programs"      = "exe msi msix appx bat cmd ps1 apk dmg jar"
    "Code"          = "html htm css js ts json xml py java c cpp cs php sql sh yml yaml ini cfg log"
    "Email"         = "eml msg pst"
    "Design"        = "dwg dxf fig sketch xd indd"
    "Fonts"         = "ttf otf woff woff2"
    "Shortcuts"     = "lnk url"
}
$OtherFolder = "Other"

$ExtMap = @{}
foreach ($cat in $Categories.Keys) {
    foreach ($e in ($Categories[$cat] -split '\s+')) { $ExtMap[".$e"] = $cat }
}

# Files to leave alone: unfinished downloads and system files
$SkipExt  = @(".crdownload", ".part", ".partial", ".download", ".tmp", ".opdownload")
$SkipName = @("desktop.ini", "thumbs.db")
# Never move this tool's own files if they sit in the folder being organized
$OwnFiles = @("organize-downloads.ps1", "organize-downloads.bat", "preview-organize.bat", "undo-organize.bat")

function Get-FreeName([string]$Folder, [string]$Name) {
    $target = Join-Path $Folder $Name
    if (-not (Test-Path -LiteralPath $target)) { return $target }
    $base = [IO.Path]::GetFileNameWithoutExtension($Name)
    $ext  = [IO.Path]::GetExtension($Name)
    $i = 1
    do {
        $target = Join-Path $Folder ("{0} ({1}){2}" -f $base, $i, $ext)
        $i++
    } while (Test-Path -LiteralPath $target)
    return $target
}

$files = Get-ChildItem -LiteralPath $Path -File -Force | Where-Object {
    -not ($_.Attributes -band [IO.FileAttributes]::Hidden) -and
    ($SkipExt -notcontains $_.Extension.ToLower()) -and
    ($SkipName -notcontains $_.Name.ToLower()) -and
    ($OwnFiles -notcontains $_.Name.ToLower())
}

if (-not $files) { Write-Host "Downloads is already tidy. Nothing to move." -ForegroundColor Green; exit 0 }

Write-Host ""
Write-Host "Folder: $Path" -ForegroundColor Cyan
Write-Host ("Files to organize: {0}" -f @($files).Count) -ForegroundColor Cyan
if ($Preview) { Write-Host "PREVIEW MODE - nothing will be moved." -ForegroundColor Yellow }
Write-Host ""

$log = New-Object System.Collections.Generic.List[object]
$counts = @{}
$failed = 0

foreach ($f in $files) {
    $cat = $ExtMap[$f.Extension.ToLower()]
    if (-not $cat) { $cat = $OtherFolder }
    $destFolder = Join-Path $Path $cat
    if ($ByMonth) { $destFolder = Join-Path $destFolder $f.LastWriteTime.ToString("yyyy-MM") }

    if ($Preview) {
        Write-Host ("  {0,-45} -> {1}" -f $f.Name, $destFolder.Substring($Path.Length).TrimStart('\'))
        $counts[$cat] = 1 + [int]$counts[$cat]
        continue
    }

    try {
        if (-not (Test-Path -LiteralPath $destFolder)) { New-Item -ItemType Directory -Path $destFolder | Out-Null }
        $dest = Get-FreeName $destFolder $f.Name
        Move-Item -LiteralPath $f.FullName -Destination $dest
        $log.Add([pscustomobject]@{ From = $f.FullName; To = $dest })
        $counts[$cat] = 1 + [int]$counts[$cat]
    } catch {
        $failed++
        Write-Host "  Could not move (maybe open in another program): $($f.Name)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
foreach ($k in ($counts.Keys | Sort-Object)) { Write-Host ("  {0,-15} {1}" -f $k, $counts[$k]) }
if ($failed) { Write-Host ("  Not moved:      {0}" -f $failed) -ForegroundColor Yellow }

if (-not $Preview -and $log.Count -gt 0) {
    if (-not (Test-Path -LiteralPath $LogDir)) {
        $d = New-Item -ItemType Directory -Path $LogDir
        $d.Attributes = $d.Attributes -bor [IO.FileAttributes]::Hidden
    }
    $logFile = Join-Path $LogDir ("moves_{0}.csv" -f (Get-Date -Format "yyyyMMdd_HHmmss"))
    $log | Export-Csv -LiteralPath $logFile -NoTypeInformation -Encoding UTF8
    Write-Host ""
    Write-Host "Done. To reverse this run, double-click Undo-Organize.bat" -ForegroundColor Green
}
