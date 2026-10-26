<#
  Organize-Downloads.ps1
  Sorts your Downloads folder:
    1) Files (and folders) whose NAME contains a project keyword go to that
       project's folder (JobsPlus, Bareeq, Polytechnic, Fonts, Mockups...).
       Inside each project, files are split by type (PDF, Images, ...).
    2) Everything else is sorted by file type.
  - Moves only. Never deletes anything.
  - Skips downloads that are still in progress.
  - If a name already exists, adds (1), (2), ...
  - Keeps an undo log so every run can be reversed with Undo-Organize.bat.

  Usage:
    Organize-Downloads.ps1                 # organize the Downloads folder
    Organize-Downloads.ps1 -Preview        # only show what would happen
    Organize-Downloads.ps1 -ByMonth        # also split by year-month
    Organize-Downloads.ps1 -Path "D:\X"    # organize a different folder
    Organize-Downloads.ps1 -Undo           # reverse the last run
#>
param(
    [string]$Path = "",
    [switch]$Preview,
    [switch]$ByMonth,
    [switch]$Undo
)

# =====================================================================
#  PROJECTS - edit this list freely.
#  Folder name = words to look for in the file name (separated by | ).
#  Matching ignores capital letters, spaces, dashes, dots and underscores,
#  so "jobsplus" also matches "Jobs Plus", "JOBS_PLUS", "jobs-plus".
#  The first project that matches wins, so put specific names first.
# =====================================================================
$Projects = [ordered]@{
    "JobsPlus"    = "jobsplus | jobs plus | jobs+ | jobplus | جوبس بلس | جوبسبلس"
    "Bareeq"      = "bareeq | bareq | bariq | bareeg | بريق"
    "Polytechnic" = "polytechnic | politechnic | بوليتكنك | بوليتيكنك | بولتكنك | بوليتكنيك"
    "Mockups"     = "mockup | mock up | موكب | موك اب | موكاب"
    "Fonts"       = "font | typeface | خطوط"
}

# Inside each project folder, also split files by type (PDF, Images, ...)?
$SplitProjectsByType = $true

# Also move folders (not just files) whose name matches a project?
$MoveMatchingFolders = $true

# =====================================================================
#  FILE TYPES - used for files that match no project.
# =====================================================================
$Categories = [ordered]@{
    "PDF"           = "pdf"
    "Documents"     = "doc docx odt rtf txt md pages wpd"
    "Spreadsheets"  = "xls xlsx xlsm xlsb csv ods numbers"
    "Presentations" = "ppt pptx pps ppsx odp key"
    "Images"        = "jpg jpeg png gif bmp tif tiff webp heic heif svg ico raw cr2 nef"
    "Design"        = "psd ai eps indd idml xd fig sketch afdesign afphoto cdr dwg dxf"
    "Videos"        = "mp4 mov avi mkv wmv flv webm m4v 3gp mpg mpeg"
    "Audio"         = "mp3 wav m4a aac flac ogg wma opus amr"
    "Archives"      = "zip rar 7z tar gz tgz bz2 xz iso"
    "Programs"      = "exe msi msix appx bat cmd ps1 apk dmg jar"
    "Code"          = "html htm css js ts json xml py java c cpp cs php sql sh yml yaml ini cfg log"
    "Email"         = "eml msg pst"
    "Fonts"         = "ttf otf woff woff2 fon fnt"
    "Shortcuts"     = "lnk url"
}
$OtherFolder = "Other"

# =====================================================================
$ErrorActionPreference = "Stop"

# Find the real Downloads folder (works even if it was moved to OneDrive or another drive)
if (-not $Path) {
    try { $Path = (New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path } catch { }
    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) { $Path = Join-Path $env:USERPROFILE "Downloads" }
}
if (-not (Test-Path -LiteralPath $Path)) { Write-Host "Folder not found: $Path" -ForegroundColor Red; exit 1 }
$Path = $Path.TrimEnd('\')
if ($Path -match '^[A-Za-z]:$') { $Path += '\' }

$LogDir = Join-Path $Path "_OrganizeLogs"

function Remove-EmptyUp([string]$Dir) {
    # Delete empty folders, walking up, but never the root folder itself
    while ($Dir -and $Dir.Length -gt $Path.Length -and $Dir.StartsWith($Path, [StringComparison]::OrdinalIgnoreCase) -and
           (Test-Path -LiteralPath $Dir) -and -not (Get-ChildItem -LiteralPath $Dir -Force)) {
        Remove-Item -LiteralPath $Dir -ErrorAction SilentlyContinue
        $Dir = Split-Path -Parent $Dir
    }
}

# ---------- Undo ----------
if ($Undo) {
    $last = Get-ChildItem -LiteralPath $LogDir -Filter "moves_*.csv" -ErrorAction SilentlyContinue |
            Sort-Object Name -Descending | Select-Object -First 1
    if (-not $last) { Write-Host "Nothing to undo." -ForegroundColor Yellow; exit 0 }
    Write-Host "Undoing: $($last.Name)" -ForegroundColor Cyan
    $rows = @(Import-Csv -LiteralPath $last.FullName -Encoding UTF8)
    [array]::Reverse($rows)
    $ok = 0
    foreach ($r in $rows) {
        if ((Test-Path -LiteralPath $r.To) -and -not (Test-Path -LiteralPath $r.From)) {
            Move-Item -LiteralPath $r.To -Destination $r.From
            $ok++
        } else {
            Write-Host "  Skipped (already moved or name taken): $($r.To)" -ForegroundColor Yellow
        }
    }
    Rename-Item -LiteralPath $last.FullName -NewName ($last.Name -replace '^moves_', 'undone_')
    $rows | ForEach-Object { Split-Path -Parent $_.To } | Sort-Object -Unique | ForEach-Object { Remove-EmptyUp $_ }
    Write-Host "Restored $ok item(s)." -ForegroundColor Green
    exit 0
}

# ---------- Build lookups ----------
function Normalize([string]$s) { return ($s.ToLowerInvariant() -replace '[\s_\-\.\(\)\[\]]', '') }

$ProjectRules = foreach ($p in $Projects.Keys) {
    $words = $Projects[$p] -split '\|' | ForEach-Object { Normalize $_ } | Where-Object { $_ }
    [pscustomobject]@{ Name = $p; Words = $words }
}
function Get-Project([string]$Name) {
    $n = Normalize $Name
    foreach ($r in $ProjectRules) { foreach ($w in $r.Words) { if ($n.Contains($w)) { return $r.Name } } }
    return $null
}

$ExtMap = @{}
foreach ($cat in $Categories.Keys) { foreach ($e in ($Categories[$cat] -split '\s+')) { if ($e) { $ExtMap[".$e"] = $cat } } }
function Get-TypeFolder([IO.FileInfo]$f) {
    $c = $ExtMap[$f.Extension.ToLower()]; if ($c) { return $c } else { return $OtherFolder }
}

$SkipExt  = @(".crdownload", ".part", ".partial", ".download", ".tmp", ".opdownload")
$SkipName = @("desktop.ini", "thumbs.db")
$OwnFiles = @("organize-downloads.ps1", "organize-downloads.bat", "preview-organize.bat", "undo-organize.bat")

# Folders the organizer itself owns - never moved
$Reserved = @("_OrganizeLogs", $OtherFolder) + @($Projects.Keys) + @($Categories.Keys)

function Get-FreeName([string]$Folder, [string]$Name, [bool]$IsDir) {
    $target = Join-Path $Folder $Name
    if (-not (Test-Path -LiteralPath $target)) { return $target }
    if ($IsDir) { $base = $Name; $ext = "" }
    else { $base = [IO.Path]::GetFileNameWithoutExtension($Name); $ext = [IO.Path]::GetExtension($Name) }
    $i = 1
    do { $target = Join-Path $Folder ("{0} ({1}){2}" -f $base, $i, $ext); $i++ } while (Test-Path -LiteralPath $target)
    return $target
}

# ---------- Collect items ----------
$items = @(Get-ChildItem -LiteralPath $Path -File -Force | Where-Object {
    -not ($_.Attributes -band [IO.FileAttributes]::Hidden) -and
    ($SkipExt  -notcontains $_.Extension.ToLower()) -and
    ($SkipName -notcontains $_.Name.ToLower()) -and
    ($OwnFiles -notcontains $_.Name.ToLower())
})
if ($MoveMatchingFolders) {
    $items += @(Get-ChildItem -LiteralPath $Path -Directory -Force | Where-Object {
        -not ($_.Attributes -band [IO.FileAttributes]::Hidden) -and
        ($Reserved -notcontains $_.Name) -and (Get-Project $_.Name)
    })
}

if ($items.Count -eq 0) { Write-Host "Already tidy. Nothing to move." -ForegroundColor Green; exit 0 }

Write-Host ""
Write-Host "Folder: $Path" -ForegroundColor Cyan
Write-Host ("Items to organize: {0}" -f $items.Count) -ForegroundColor Cyan
if ($Preview) { Write-Host "PREVIEW MODE - nothing will be moved." -ForegroundColor Yellow }
Write-Host ""

$log = New-Object System.Collections.Generic.List[object]
$counts = @{}
$failed = 0

foreach ($it in $items) {
    $isDir = $it.PSIsContainer
    $project = Get-Project $it.Name

    if ($project) {
        $destFolder = Join-Path $Path $project
        $label = $project
        if (-not $isDir -and $SplitProjectsByType) {
            $t = Get-TypeFolder $it
            if ($t -ne $project) { $destFolder = Join-Path $destFolder $t }
        }
    } else {
        $label = Get-TypeFolder $it
        $destFolder = Join-Path $Path $label
    }
    if ($ByMonth -and -not $isDir) { $destFolder = Join-Path $destFolder $it.LastWriteTime.ToString("yyyy-MM") }

    if ($Preview) {
        $shown = $it.Name; if ($isDir) { $shown = "[folder] " + $shown }
        Write-Host ("  {0,-50} -> {1}" -f $shown, $destFolder.Substring($Path.Length).TrimStart('\'))
        $counts[$label] = 1 + [int]$counts[$label]
        continue
    }

    try {
        if (-not (Test-Path -LiteralPath $destFolder)) { New-Item -ItemType Directory -Path $destFolder | Out-Null }
        $dest = Get-FreeName $destFolder $it.Name $isDir
        Move-Item -LiteralPath $it.FullName -Destination $dest
        $log.Add([pscustomobject]@{ From = $it.FullName; To = $dest })
        $counts[$label] = 1 + [int]$counts[$label]
    } catch {
        $failed++
        Write-Host "  Could not move (maybe open in another program): $($it.Name)" -ForegroundColor Yellow
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
